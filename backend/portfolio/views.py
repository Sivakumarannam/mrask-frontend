import os
import re
import logging
import smtplib
import threading
from functools import lru_cache
from io import BytesIO

import requests
from django.core.mail import EmailMessage
from django.core.mail.message import BadHeaderError
from pypdf import PdfReader
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

try:
    import faiss  # noqa: F401
except ModuleNotFoundError:  # pragma: no cover - optional for RAG-only features
    faiss = None

try:
    import numpy as np
except ModuleNotFoundError:  # pragma: no cover - optional for RAG-only features
    np = None

try:
    from sentence_transformers import SentenceTransformer
except ModuleNotFoundError:  # pragma: no cover - optional for RAG-only features
    SentenceTransformer = None

from .models import Project
from .serializers import ContactMessageSerializer, ProjectSerializer

GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
logger = logging.getLogger(__name__)

# WMO weather codes -> (description, emoji)
WEATHER_CODES = {
    0: ('Clear sky', '\u2600\ufe0f'),
    1: ('Mainly clear', '\U0001F324\ufe0f'),
    2: ('Partly cloudy', '\u26c5'),
    3: ('Overcast', '\u2601\ufe0f'),
    45: ('Fog', '\U0001F32B\ufe0f'),
    48: ('Fog', '\U0001F32B\ufe0f'),
    51: ('Light drizzle', '\U0001F326\ufe0f'),
    53: ('Drizzle', '\U0001F326\ufe0f'),
    55: ('Heavy drizzle', '\U0001F326\ufe0f'),
    61: ('Light rain', '\U0001F327\ufe0f'),
    63: ('Rain', '\U0001F327\ufe0f'),
    65: ('Heavy rain', '\U0001F327\ufe0f'),
    71: ('Light snow', '\u2744\ufe0f'),
    73: ('Snow', '\u2744\ufe0f'),
    75: ('Heavy snow', '\u2744\ufe0f'),
    80: ('Rain showers', '\U0001F326\ufe0f'),
    81: ('Rain showers', '\U0001F326\ufe0f'),
    82: ('Violent rain showers', '\U0001F327\ufe0f'),
    95: ('Thunderstorm', '\u26c8\ufe0f'),
    96: ('Thunderstorm with hail', '\u26c8\ufe0f'),
    99: ('Thunderstorm with hail', '\u26c8\ufe0f'),
}


def describe(code):
    return WEATHER_CODES.get(code, ('Unknown', '\U0001F321\ufe0f'))


def extract_text(file_obj):
    name = getattr(file_obj, 'name', '').lower()
    file_obj.seek(0)
    data = file_obj.read()
    if not data:
        return ''

    if name.endswith('.pdf'):
        try:
            reader = PdfReader(BytesIO(data))
            pages = []
            for page in reader.pages:
                page_text = page.extract_text() or ''
                pages.append(page_text)
            return '\n'.join(pages)
        except Exception:
            return data.decode('utf-8', errors='replace')

    if name.endswith('.txt'):
        return data.decode('utf-8', errors='replace')

    if name.endswith('.docx'):
        try:
            from docx import Document
            doc = Document(BytesIO(data))
            return '\n'.join(paragraph.text for paragraph in doc.paragraphs)
        except Exception:
            return data.decode('utf-8', errors='replace')

    return data.decode('utf-8', errors='replace')


def split_into_chunks(text, chunk_size=220, overlap=40):
    clean_text = re.sub(r'\s+', ' ', text).strip()
    if not clean_text:
        return []
    sentences = re.split(r'(?<=[.!?])\s+', clean_text)
    chunks = []
    current = ''
    for sentence in sentences:
        if not sentence:
            continue
        if len(current) + len(sentence) <= chunk_size:
            current = f'{current} {sentence}'.strip()
        else:
            if current:
                chunks.append(current)
            overflow = sentence
            while len(overflow) > chunk_size:
                chunks.append(overflow[:chunk_size].strip())
                overflow = overflow[chunk_size - overlap :].strip()
            current = overflow.strip()
    if current:
        chunks.append(current)
    return [chunk for chunk in chunks if chunk][:5]


@lru_cache(maxsize=1)
def _get_embed_model():
    if SentenceTransformer is None:
        raise ModuleNotFoundError('sentence-transformers is not installed')
    model_name = os.environ.get('RAG_EMBED_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
    return SentenceTransformer(model_name)


def _build_semantic_context(question, chunks):
    if np is None or SentenceTransformer is None:
        return chunks[:3]

    try:
        model = _get_embed_model()
        chunks_with_query = [question, *chunks]
        embeddings = model.encode(chunks_with_query, convert_to_numpy=True)
        query_vector = embeddings[0]
        chunk_vectors = embeddings[1:]
        norms = np.linalg.norm(chunk_vectors, axis=1) * np.linalg.norm(query_vector)
        sims = np.divide(
            np.dot(chunk_vectors, query_vector),
            norms,
            out=np.zeros_like(np.dot(chunk_vectors, query_vector)),
            where=(norms != 0),
        )
        ranked_indices = np.argsort(sims)[::-1]
        selected = [chunks[idx] for idx in ranked_indices[:3] if sims[idx] > 0.0]
        if not selected:
            return chunks[:3]
        return selected
    except Exception:
        return chunks[:3]


OLLAMA_BASE_URL = os.environ.get('OLLAMA_BASE_URL', 'http://localhost:11434')


def normalize_question(question):
    q = (question or '').strip()
    if not q:
        return q

    lower = q.lower()
    vague_patterns = [
        'above pdf',
        'above document',
        'this pdf',
        'this document',
        'the above pdf',
        'uploaded pdf',
        'uploaded document',
        'this resume',
        'above resume',
    ]

    if any(pattern in lower for pattern in vague_patterns):
        return 'Summarize the uploaded document in a concise but useful way. Include the main skills, experience, responsibilities, and key highlights.'

    if lower.startswith('tell me about') and ('pdf' in lower or 'document' in lower or 'resume' in lower):
        return 'Summarize the uploaded document in a concise but useful way. Include the main skills, experience, responsibilities, and key highlights.'

    return q


def _generate_with_ollama(question, chunks, full_text=''):
    if not chunks and not full_text:
        return None

    model_name = os.environ.get('OLLAMA_MODEL', 'qwen2.5:3b')
    context = (full_text or '\n\n'.join(chunks)).strip()
    if not context:
        return None
    context = context[:8000]
    prompt = (
        'Answer the user question using only the document text below. '
        'Base your answer on the actual content in the document. '
        'If the answer is partly present, provide the most correct factual summary. '
        'Do not refuse just because the question is generic.\n\n'
        f'Question: {question}\n\nDocument text:\n{context}'
    )

    try:
        response = requests.post(
            f'{OLLAMA_BASE_URL.rstrip("/")}/api/generate',
            json={
                'model': model_name,
                'prompt': prompt,
                'stream': False,
                'options': {'temperature': 0.2},
            },
            timeout=90,
        )
        response.raise_for_status()
        payload = response.json()
        answer = (payload.get('response') or '').strip()
        if answer:
            return answer
    except (requests.RequestException, ValueError, TypeError):
        return None

    return None


def answer_from_chunks(question, chunks, full_text=''):
    if not chunks and not full_text:
        return 'I could not find relevant content in the uploaded document. Please try a different PDF or ask a more specific question.'

    selected = _build_semantic_context(question, chunks) if chunks else []
    context_text = full_text.strip() if full_text else '\n\n'.join(selected)
    generated = _generate_with_ollama(question, selected, full_text=context_text)
    if generated:
        return generated

    fallback = context_text[:600].strip()
    if len(fallback) >= 550:
        fallback = fallback + '...'
    return fallback or 'I could not find relevant content in the uploaded document. Please try a different PDF or ask a more specific question.'


class ProjectList(generics.ListAPIView):
    queryset = Project.objects.filter(is_published=True)
    serializer_class = ProjectSerializer
    pagination_class = None


class ProjectDetail(generics.RetrieveAPIView):
    queryset = Project.objects.filter(is_published=True)
    serializer_class = ProjectSerializer
    lookup_field = 'slug'


def _do_send_email(instance):
    """Internal: performs the actual SMTP call — runs in a background thread."""
    recipient = os.environ.get('CONTACT_EMAIL_TO', 'sivakumarannam143@gmail.com')
    from_email = (
        os.environ.get('DEFAULT_FROM_EMAIL')
        or os.environ.get('EMAIL_HOST_USER')
        or 'noreply@example.com'
    )
    subject = f'New portfolio message from {instance.name}'
    body = (
        f'Name: {instance.name}\n'
        f'Email: {instance.email}\n\n'
        'Message:\n'
        f'{instance.message}'
    )
    try:
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_email,
            to=[recipient],
            reply_to=[instance.email],
        )
        sent = email.send(fail_silently=False) == 1
        if sent:
            logger.info('Email delivered for contact message %s', instance.pk)
        else:
            logger.warning('Email.send() returned 0 for contact message %s', instance.pk)
    except (BadHeaderError, OSError, smtplib.SMTPException):
        logger.exception('Async email delivery failed for contact message %s', instance.pk)


def send_contact_email_async(instance):
    """Fire-and-forget: dispatch email in a daemon thread so the API
    returns immediately without blocking on Gmail SMTP (3–8 s)."""
    thread = threading.Thread(
        target=_do_send_email,
        args=(instance,),
        daemon=True,
        name=f'email-{instance.pk}',
    )
    thread.start()
    logger.debug('Email thread started for contact message %s', instance.pk)


class ContactCreate(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'contact'

    def create(self, request, *args, **kwargs):
        # Honeypot spam check: automated bots will fill this hidden field
        honeypot = request.data.get('website', '').strip()
        if honeypot:
            logger.warning('Spam bot blocked via honeypot field: %s', honeypot)
            return Response(
                {
                    'detail': 'Your message was received.',
                    'email_sent': False,
                },
                status=status.HTTP_201_CREATED,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        # Fire email in background — API returns instantly (<200 ms)
        send_contact_email_async(instance)

        return Response(
            {
                'detail': 'Your message was received.',
                'email_sent': True,
            },
            status=status.HTTP_201_CREATED,
        )


class WeatherView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'weather'

    def get(self, request):
        city = request.query_params.get('city', '').strip()
        if not city or len(city) > 80:
            return Response({'detail': 'Please provide a city name.'}, status=400)

        try:
            geo = requests.get(
                GEOCODE_URL,
                params={'name': city, 'count': 1, 'language': 'en', 'format': 'json'},
                timeout=8,
            )
            geo.raise_for_status()
            results = geo.json().get('results') or []
            if not results:
                return Response({'detail': f'City "{city}" was not found.'}, status=404)
            place = results[0]

            forecast = requests.get(
                FORECAST_URL,
                params={
                    'latitude': place['latitude'],
                    'longitude': place['longitude'],
                    'current': 'temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code',
                    'daily': 'weather_code,temperature_2m_max,temperature_2m_min',
                    'timezone': 'auto',
                    'forecast_days': 5,
                },
                timeout=8,
            )
            forecast.raise_for_status()
            data = forecast.json()
        except (requests.RequestException, ValueError, KeyError):
            return Response({'detail': 'The weather service is unavailable right now.'}, status=502)

        current = data.get('current', {})
        daily = data.get('daily', {})
        description, icon = describe(current.get('weather_code'))

        days = []
        for i, date in enumerate(daily.get('time', [])):
            d_desc, d_icon = describe(daily['weather_code'][i])
            days.append({
                'date': date,
                'min': daily['temperature_2m_min'][i],
                'max': daily['temperature_2m_max'][i],
                'description': d_desc,
                'icon': d_icon,
            })

        return Response({
            'city': place.get('name', city),
            'country': place.get('country', ''),
            'temperature': current.get('temperature_2m'),
            'feels_like': current.get('apparent_temperature'),
            'humidity': current.get('relative_humidity_2m'),
            'wind_speed': current.get('wind_speed_10m'),
            'description': description,
            'icon': icon,
            'daily': days,
        })


class RAGAskView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        raw_question = (request.POST.get('question') or '').strip()
        uploaded_file = request.FILES.get('file')
        if not raw_question:
            return Response({'detail': 'Please provide a question to ask.'}, status=status.HTTP_400_BAD_REQUEST)
        if uploaded_file is None:
            return Response({'detail': 'Please upload a PDF or text document.'}, status=status.HTTP_400_BAD_REQUEST)

        question = normalize_question(raw_question)

        try:
            text = extract_text(uploaded_file)
        except Exception:
            return Response({'detail': 'The uploaded file could not be processed. Please try a PDF or text file.'}, status=status.HTTP_400_BAD_REQUEST)

        cleaned = re.sub(r'\s+', ' ', text).strip()
        if not cleaned:
            return Response({'detail': 'The uploaded file is empty or unreadable.'}, status=status.HTTP_400_BAD_REQUEST)

        chunks = split_into_chunks(cleaned)
        selected = _build_semantic_context(question, chunks) if chunks else []
        answer = answer_from_chunks(question, chunks, full_text=cleaned)

        return Response({
            'answer': answer,
            'file': uploaded_file.name,
            'chunks_used': selected or chunks[:3],
            'question': raw_question,
            'normalized_question': question,
            'context_used': selected or chunks[:3],
        })
