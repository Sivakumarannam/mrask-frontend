from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from .models import ContactMessage, Project


class PortfolioAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.project = Project.objects.create(
            slug='test-project',
            title='Test Project',
            tagline='A test project',
            role='Solo',
            summary='Testing summary',
            highlights=['Point 1', 'Point 2'],
            stack=['Python', 'Django'],
            steps=['Step 1', 'Step 2'],
            github_url='https://github.com/example/test',
            demo_url='',
            demo_kind='',
            is_published=True,
            order=1,
        )

    def test_project_list(self):
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(isinstance(data, list))
        self.assertGreaterEqual(len(data), 1)
        self.assertEqual(data[0]['slug'], 'test-project')

    def test_project_detail(self):
        response = self.client.get('/api/projects/test-project/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['title'], 'Test Project')

    def test_project_detail_not_found(self):
        response = self.client.get('/api/projects/non-existent-project/')
        self.assertEqual(response.status_code, 404)

    def test_weather_endpoint_validation(self):
        response = self.client.get('/api/weather/')
        self.assertEqual(response.status_code, 400)

    def test_contact_create_validation(self):
        response = self.client.post('/api/contact/', {}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_contact_create_success(self):
        payload = {
            'name': 'Test User',
            'email': 'user@example.com',
            'message': 'This is a test message for contact endpoint.',
        }
        response = self.client.post('/api/contact/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(ContactMessage.objects.filter(email='user@example.com').exists())

    def test_contact_honeypot_blocks_spam(self):
        payload = {
            'name': 'Spam Bot',
            'email': 'bot@spammer.com',
            'message': 'Buy cheap crypto now',
            'website': 'https://spamlink.com',
        }
        response = self.client.post('/api/contact/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.json()['email_sent'])
        # Verify spam message was not saved to database
        self.assertFalse(ContactMessage.objects.filter(email='bot@spammer.com').exists())

    def test_rag_ask_requires_file_and_question(self):
        response = self.client.post('/api/rag/ask/', {})
        self.assertEqual(response.status_code, 400)

    def test_rag_ask_with_text_file(self):
        test_file = SimpleUploadedFile('sample.txt', b'Siva is a software engineer.', content_type='text/plain')
        response = self.client.post(
            '/api/rag/ask/',
            {'question': 'Who is Siva?', 'file': test_file},
            format='multipart',
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('answer', data)
        self.assertIn('chunks_used', data)

    def test_health_check(self):
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['database'], 'connected')

    def test_api_docs(self):
        response = self.client.get('/api/docs/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('endpoints', data)
        self.assertGreaterEqual(len(data['endpoints']), 5)

