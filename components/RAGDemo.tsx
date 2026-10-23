import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';

import { Button, Chip } from '@/components/ui';
import { useTheme } from '@/constants/theme';
import { streamRagQuestion } from '@/lib/api';

const sampleDocumentText = `
Siva Kumar Annam (Mr.A.S.K) is a full-stack engineer and AI developer.
Core competencies include React Native, Expo, Django REST Framework, PostgreSQL, and Python.
The portfolio features an on-premise RAG Chatbot that ingests PDF documents, splits text into 500-token chunks,
generates embeddings using Sentence-Transformers, indexes dense vectors in FAISS, and uses local Ollama Qwen2.5 for grounded Q&A.
This guarantees 100% privacy with zero data leakage to cloud providers.
`.trim();

const examplePrompts = [
  'Summarize this document and list key points.',
  'What are the core technical skills mentioned?',
  'How does the RAG pipeline protect privacy?',
  'Give me a 3-point summary of this file.',
];

export function RAGDemo() {
  const t = useTheme();
  const [question, setQuestion] = useState('Summarize this document and list key points.');
  const [answer, setAnswer] = useState(
    'Upload any PDF or use the default document. Ask a question to see real-time streaming RAG inference with grounded document citations.'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('sample-document.pdf');
  const [showPreview, setShowPreview] = useState(false);
  const [contextUsed, setContextUsed] = useState<string[]>([
    'Siva Kumar Annam is a full-stack engineer and AI developer.',
    'Core competencies include React Native, Expo, Django REST Framework, PostgreSQL, and Python.',
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Clean up object URL when file changes or unmounts
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const matches = useMemo(
    () => ['⚡ Live SSE Streaming', '📄 In-Browser Preview', '🧠 Semantic Retrieval', '🔒 Anti-Hallucination'],
    []
  );

  const pickDocument = () => {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.txt';
      input.onchange = (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setUploadedFileName(file.name);

        if (fileUrl) {
          URL.revokeObjectURL(fileUrl);
        }
        const newUrl = URL.createObjectURL(file);
        setFileUrl(newUrl);
        setShowPreview(true);
      };
      input.click();
      return;
    }

    setSelectedFile(null);
    setUploadedFileName('sample-document.pdf');
  };

  const runStreamingRAG = async () => {
    const q = question.trim();
    if (!q) {
      setAnswer('Please enter a question to query the document.');
      return;
    }

    setIsStreaming(true);
    setAnswer(''); // Clear for streaming tokens

    try {
      // Create a Blob from the sample text if no file was uploaded
      let fileToUpload: File | Blob = selectedFile as File;
      if (!fileToUpload) {
        fileToUpload = new Blob([sampleDocumentText], { type: 'text/plain' });
      }

      await streamRagQuestion(
        fileToUpload,
        q,
        (token: string) => {
          setAnswer((prev) => prev + token);
        },
        (chunks: string[]) => {
          setContextUsed(chunks);
        }
      );
    } catch (error) {
      setAnswer(
        error instanceof Error && !error.message.includes('fetch') && !error.message.includes('NetworkError')
          ? error.message
          : 'The backend API is waking up (free-tier cold start — ~30s). Please wait a moment and try again.'
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <View>
      {/* File Ingestion & PDF Preview Bar */}
      <View
        style={{
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: 16,
          backgroundColor: t.cardAlt,
          padding: 16,
          marginBottom: 14,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <View style={{ flex: 1, minWidth: 200 }}>
            <Text style={{ color: t.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>INGESTED DOCUMENT</Text>
            <Text style={{ color: t.text, fontSize: 16, fontWeight: '800', marginTop: 4 }}>{uploadedFileName}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Upload PDF / File" onPress={pickDocument} />
            <Button
              label={showPreview ? 'Hide Preview ✕' : 'Preview Document 👁'}
              variant="secondary"
              onPress={() => setShowPreview(!showPreview)}
            />
          </View>
        </View>

        {/* In-Browser PDF / Document Previewer */}
        {showPreview && (
          <View
            style={{
              marginTop: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: t.border,
              backgroundColor: t.card,
              overflow: 'hidden',
            }}>
            <View
              style={{
                backgroundColor: t.chip,
                paddingHorizontal: 14,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={{ color: t.chipText, fontSize: 12, fontWeight: '700' }}>
                {fileUrl ? '📄 Live PDF Document Viewer' : '📄 Parsed Sample Document Preview'}
              </Text>
              <Text style={{ color: t.muted, fontSize: 11 }}>In-browser preview</Text>
            </View>

            {fileUrl && Platform.OS === 'web' && selectedFile?.type === 'application/pdf' ? (
              <iframe
                src={fileUrl}
                style={{
                  width: '100%',
                  height: 380,
                  border: 'none',
                }}
                title="PDF Document Preview"
              />
            ) : (
              <View style={{ padding: 16, maxHeight: 240 }}>
                <Text style={{ color: t.text, fontSize: 14, lineHeight: 22 }}>
                  {sampleDocumentText}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Question Input */}
      <TextInput
        value={question}
        onChangeText={setQuestion}
        placeholder="Ask a question about this document..."
        placeholderTextColor={t.muted}
        style={{
          backgroundColor: t.cardAlt,
          color: t.text,
          borderColor: t.border,
          borderWidth: 1.5,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 13,
          fontSize: 16,
          marginBottom: 12,
        }}
      />

      {/* Feature Badges */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {matches.map((m) => (
          <Chip key={m} label={m} />
        ))}
      </View>

      {/* Example Prompt Chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {examplePrompts.map((prompt) => (
          <Chip key={prompt} label={prompt} onPress={() => setQuestion(prompt)} />
        ))}
      </View>

      {/* Action Button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button
          label={isStreaming ? 'Streaming Answer...' : 'Ask question with Streaming RAG'}
          onPress={runStreamingRAG}
        />
        {isStreaming && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
            <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '700' }}>Receiving SSE Tokens</Text>
          </View>
        )}
      </View>

      {/* Real-time Streaming Answer Card */}
      <View
        style={{
          backgroundColor: t.cardAlt,
          borderColor: t.border,
          borderWidth: 1,
          borderRadius: 18,
          padding: 20,
          marginBottom: 18,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ color: t.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>
            STREAMED RAG ANSWER
          </Text>
          <View style={{ backgroundColor: t.navActive, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
            <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700' }}>Local LLM Grounded</Text>
          </View>
        </View>

        <Text style={{ color: t.text, fontSize: 17, fontWeight: '600', lineHeight: 28 }}>
          {answer}
          {isStreaming && <Text style={{ color: t.accent, fontWeight: '900' }}> ▌</Text>}
        </Text>
      </View>

      {/* Source Excerpts Card */}
      <View
        style={{
          backgroundColor: t.cardAlt,
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: 14,
          padding: 16,
        }}>
        <Text style={{ color: t.muted, fontWeight: '800', fontSize: 13, marginBottom: 10, letterSpacing: 0.4 }}>
          SOURCE EXCERPTS (Grounded Context)
        </Text>
        {contextUsed.map((chunk, index) => (
          <View
            key={`${chunk.slice(0, 16)}-${index}`}
            style={{
              backgroundColor: t.card,
              borderWidth: 1,
              borderColor: t.border,
              borderRadius: 10,
              padding: 12,
              marginBottom: 8,
            }}>
            <Text style={{ color: t.text, fontSize: 14, lineHeight: 22 }}>{chunk}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
