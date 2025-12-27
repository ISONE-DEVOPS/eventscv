/**
 * Audio Processing Pipeline for Real-time Translation
 * Handles: Speech-to-Text → Translation → Text-to-Speech
 */

import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createClient } from '@deepgram/sdk';
import Anthropic from '@anthropic-ai/sdk';
import type {
  TranslationSession,
  LanguageCode,
  TranscriptSegment,
} from '../shared-types';

const db = getFirestore();

// Lazy initialization for API clients
let deepgramClient: ReturnType<typeof createClient> | null = null;
let anthropicClient: Anthropic | null = null;

function getDeepgram() {
  if (!deepgramClient) {
    deepgramClient = createClient(process.env.DEEPGRAM_API_KEY || '');
  }
  return deepgramClient;
}

function getAnthropic() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

/**
 * Process audio chunk and return translations
 * This is the core real-time translation pipeline
 */
export const processAudioChunk = onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { sessionId, audioData, format = 'base64' } = req.body;

    if (!sessionId || !audioData) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Get session configuration
    const sessionRef = db.collection('translations').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const session = sessionDoc.data() as TranslationSession;

    if (session.status !== 'live') {
      res.status(400).json({ error: 'Session is not live' });
      return;
    }

    // Convert base64 audio to buffer if needed
    const audioBuffer =
      format === 'base64' ? Buffer.from(audioData, 'base64') : audioData;

    // Step 1: Speech-to-Text using Deepgram
    const startTime = Date.now();
    const transcription = await speechToText(
      audioBuffer,
      session.config.sourceLanguage
    );

    if (!transcription || transcription.trim().length === 0) {
      // No speech detected
      res.json({ success: true, silent: true });
      return;
    }

    const sttLatency = Date.now() - startTime;

    // Step 2: Translate to all target languages
    const translationStart = Date.now();
    const translations: { [key: string]: string } = {};

    for (const targetLang of session.config.targetLanguages) {
      if (targetLang !== session.config.sourceLanguage) {
        translations[targetLang] = await translateText(
          transcription,
          session.config.sourceLanguage,
          targetLang,
          session.config.mode
        );
      } else {
        // Same language - no translation needed
        translations[targetLang] = transcription;
      }
    }

    const translationLatency = Date.now() - translationStart;

    // Step 3: Text-to-Speech for each translation (if needed for simultaneous mode)
    const ttsStart = Date.now();
    const audioOutputs: { [key: string]: string } = {};

    if (session.config.mode === 'simultaneous' || session.config.mode === 'hybrid') {
      for (const [lang, text] of Object.entries(translations)) {
        audioOutputs[lang] = await textToSpeech(text, lang as LanguageCode);
      }
    }

    const ttsLatency = Date.now() - ttsStart;

    // Calculate total latency
    const totalLatency = Date.now() - startTime;

    // Step 4: Save transcript segment
    const segmentRef = await saveTranscriptSegment(sessionId, {
      original: {
        language: session.config.sourceLanguage,
        text: transcription,
      },
      translations,
      timestamp: Date.now(),
      speaker: 'main', // TODO: Add speaker identification
      latency: totalLatency,
    });

    // Step 5: Update session metrics
    await updateSessionMetrics(sessionId, {
      latency: totalLatency,
      segmentCount: 1,
    });

    // Step 6: Return results (broadcasting would be done via WebSocket separately)
    res.json({
      success: true,
      segmentId: segmentRef.id,
      original: {
        language: session.config.sourceLanguage,
        text: transcription,
      },
      translations,
      audioOutputs,
      metrics: {
        sttLatency,
        translationLatency,
        ttsLatency,
        totalLatency,
      },
    });
  } catch (error) {
    console.error('Error processing audio chunk:', error);
    res.status(500).json({
      error: 'Failed to process audio',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Convert speech to text using Deepgram
 */
async function speechToText(
  audioBuffer: Buffer,
  language: LanguageCode
): Promise<string> {
  try {
    const deepgram = getDeepgram();

    // Map our language codes to Deepgram's language codes
    const deepgramLangMap: { [key: string]: string } = {
      pt: 'pt',
      'pt-br': 'pt-BR',
      en: 'en-US',
      'en-gb': 'en-GB',
      fr: 'fr',
      es: 'es',
      it: 'it',
      de: 'de',
      zh: 'zh',
      ar: 'ar',
      ru: 'ru',
      ja: 'ja',
      cv: 'pt', // Cape Verdean Creole - use Portuguese as base
    };

    const deepgramLang = deepgramLangMap[language] || 'en-US';

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: deepgramLang,
        smart_format: true,
        punctuate: true,
        utterances: true,
      }
    );

    if (error) {
      throw error;
    }

    const transcript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    return transcript;
  } catch (error) {
    console.error('Deepgram STT error:', error);
    throw new Error('Speech-to-text failed');
  }
}

/**
 * Translate text using Claude (Anthropic)
 */
async function translateText(
  text: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode,
  mode: string
): Promise<string> {
  try {
    const anthropic = getAnthropic();

    // Language names for better context
    const languageNames: { [key: string]: string } = {
      pt: 'Portuguese (Portugal)',
      'pt-br': 'Portuguese (Brazil)',
      en: 'English (US)',
      'en-gb': 'English (UK)',
      fr: 'French',
      es: 'Spanish',
      it: 'Italian',
      de: 'German',
      zh: 'Chinese (Mandarin)',
      ar: 'Arabic',
      ru: 'Russian',
      ja: 'Japanese',
      cv: 'Cape Verdean Creole (Santiago variant)',
    };

    const sourceLanguageName = languageNames[sourceLang] || sourceLang;
    const targetLanguageName = languageNames[targetLang] || targetLang;

    // Adjust system prompt based on translation mode
    let systemPrompt = `You are a professional simultaneous interpreter translating from ${sourceLanguageName} to ${targetLanguageName}.

CRITICAL RULES:
1. Translate ONLY the meaning - do not add explanations or notes
2. Maintain the speaker's tone, emphasis, and intent
3. Be concise and natural - this is real-time interpretation
4. Preserve technical terms and proper nouns appropriately
5. For Cape Verdean Creole, use Santiago variant (most common)
6. Return ONLY the translated text, nothing else`;

    if (mode === 'consecutive') {
      systemPrompt += '\n7. You may slightly expand for clarity since this is consecutive (not simultaneous) interpretation';
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.3, // Lower temperature for more consistent translations
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: text,
        },
      ],
    });

    const translatedText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return translatedText.trim();
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Translation failed');
  }
}

/**
 * Convert text to speech using ElevenLabs
 * For now, returns a placeholder - full implementation requires ElevenLabs setup
 */
async function textToSpeech(
  text: string,
  language: LanguageCode
): Promise<string> {
  try {
    // TODO: Implement ElevenLabs TTS
    // For now, return a placeholder URL
    // In production, this would:
    // 1. Call ElevenLabs API with appropriate voice for the language
    // 2. Upload audio to Firebase Storage
    // 3. Return public URL

    // Voice mapping for different languages (for future ElevenLabs implementation)
    // const voiceMap: { [key: string]: string } = {
    //   pt: 'voice-pt-male-1',
    //   'pt-br': 'voice-pt-br-female-1',
    //   en: 'voice-en-male-1',
    //   'en-gb': 'voice-en-gb-female-1',
    //   fr: 'voice-fr-male-1',
    //   es: 'voice-es-female-1',
    //   it: 'voice-it-male-1',
    //   de: 'voice-de-female-1',
    //   zh: 'voice-zh-female-1',
    //   ar: 'voice-ar-male-1',
    //   ru: 'voice-ru-female-1',
    //   ja: 'voice-ja-female-1',
    //   cv: 'voice-pt-male-1', // Use Portuguese voice for CV
    // };

    // Placeholder - will be implemented with actual ElevenLabs integration
    return `https://storage.googleapis.com/events-cv.appspot.com/tts/${Date.now()}-${language}.mp3`;
  } catch (error) {
    console.error('TTS error:', error);
    // Return empty string if TTS fails - translation text is still available
    return '';
  }
}

/**
 * Save transcript segment to Firestore
 */
async function saveTranscriptSegment(
  sessionId: string,
  segmentData: {
    original: { language: LanguageCode; text: string };
    translations: { [key: string]: string };
    timestamp: number;
    speaker: string;
    latency: number;
  }
) {
  const segment: Partial<TranscriptSegment> = {
    sessionId,
    timestamp: segmentData.timestamp,
    speaker: segmentData.speaker,
    original: segmentData.original,
    translations: segmentData.translations,
    metadata: {
      latency: segmentData.latency,
      confidence: 0.95, // TODO: Get actual confidence from Deepgram
      edited: false,
    },
    createdAt: FieldValue.serverTimestamp(),
  };

  return db
    .collection('translations')
    .doc(sessionId)
    .collection('segments')
    .add(segment);
}

/**
 * Update session metrics
 */
async function updateSessionMetrics(
  sessionId: string,
  updates: {
    latency?: number;
    segmentCount?: number;
  }
) {
  const sessionRef = db.collection('translations').doc(sessionId);
  const sessionDoc = await sessionRef.get();
  const session = sessionDoc.data() as TranslationSession;

  const currentMetrics = session.metrics;
  const newSegmentCount =
    currentMetrics.segmentsTranslated + (updates.segmentCount || 0);

  // Calculate running average for latency
  let newAverageLatency = currentMetrics.averageLatency;
  if (updates.latency) {
    newAverageLatency =
      (currentMetrics.averageLatency * currentMetrics.segmentsTranslated +
        updates.latency) /
      newSegmentCount;
  }

  await sessionRef.update({
    'metrics.segmentsTranslated': newSegmentCount,
    'metrics.averageLatency': Math.round(newAverageLatency),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
