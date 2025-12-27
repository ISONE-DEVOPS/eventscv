/**
 * Transcript Management
 * Handle transcript retrieval, editing, and export
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import type {
  TranscriptSegment,
  TranslationSession,
  LanguageCode,
} from '../shared-types';

const db = getFirestore();
const storage = getStorage();

/**
 * Get transcript for a translation session
 */
export const getSessionTranscript = onCall<{
  sessionId: string;
  language?: LanguageCode;
  limit?: number;
  startAfter?: number;
}>(async (request) => {
  const { sessionId, language, limit = 100, startAfter } = request.data;

  // Verify session exists
  const sessionRef = db.collection('translations').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new HttpsError('not-found', 'Translation session not found');
  }

  const session = sessionDoc.data() as TranslationSession;

  // Build query
  let query = sessionRef.collection('segments').orderBy('timestamp', 'asc');

  if (startAfter) {
    query = query.where('timestamp', '>', startAfter);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const segmentsSnapshot = await query.get();

  const segments = segmentsSnapshot.docs.map((doc) => {
    const segment = doc.data() as TranscriptSegment;

    // If language is specified, only return that translation
    if (language) {
      return {
        id: doc.id,
        timestamp: segment.timestamp,
        speaker: segment.speaker,
        text:
          language === session.config.sourceLanguage
            ? segment.original.text
            : segment.translations[language],
        language,
        metadata: segment.metadata,
      };
    }

    // Return full segment
    return {
      id: doc.id,
      ...segment,
    };
  });

  return {
    sessionId,
    segments,
    hasMore: segments.length === limit,
    session: {
      eventId: session.eventId,
      config: session.config,
      status: session.status,
    },
  };
});

/**
 * Download transcript in various formats
 */
export const downloadTranscript = onCall<{
  sessionId: string;
  language: LanguageCode;
  format: 'txt' | 'json' | 'vtt' | 'srt';
}>(async (request) => {
  const { sessionId, language, format } = request.data;
  const userId = request.auth?.uid;

  // Verify session exists
  const sessionRef = db.collection('translations').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new HttpsError('not-found', 'Translation session not found');
  }

  const session = sessionDoc.data() as TranslationSession;

  // Get all segments
  const segmentsSnapshot = await sessionRef
    .collection('segments')
    .orderBy('timestamp', 'asc')
    .get();

  const segments = segmentsSnapshot.docs.map(
    (doc) => doc.data() as TranscriptSegment
  );

  if (segments.length === 0) {
    throw new HttpsError('not-found', 'No transcript segments found');
  }

  // Generate transcript content based on format
  let content: string;
  let contentType: string;
  let filename: string;

  switch (format) {
    case 'txt':
      content = generatePlainTextTranscript(segments, language, session);
      contentType = 'text/plain';
      filename = `transcript-${sessionId}-${language}.txt`;
      break;

    case 'json':
      content = JSON.stringify(
        {
          sessionId,
          eventId: session.eventId,
          language,
          generatedAt: new Date().toISOString(),
          segments: segments.map((seg) => ({
            timestamp: seg.timestamp,
            speaker: seg.speaker,
            text:
              language === session.config.sourceLanguage
                ? seg.original.text
                : seg.translations[language],
          })),
        },
        null,
        2
      );
      contentType = 'application/json';
      filename = `transcript-${sessionId}-${language}.json`;
      break;

    case 'vtt':
      content = generateWebVTT(segments, language, session);
      contentType = 'text/vtt';
      filename = `transcript-${sessionId}-${language}.vtt`;
      break;

    case 'srt':
      content = generateSRT(segments, language, session);
      contentType = 'text/srt';
      filename = `transcript-${sessionId}-${language}.srt`;
      break;

    default:
      throw new HttpsError('invalid-argument', 'Invalid format');
  }

  // Upload to Cloud Storage
  const bucket = storage.bucket();
  const file = bucket.file(`transcripts/${filename}`);

  await file.save(content, {
    contentType,
    metadata: {
      sessionId,
      language,
      format,
      generatedAt: new Date().toISOString(),
      generatedBy: userId,
    },
  });

  // Generate signed URL (valid for 1 hour)
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 3600 * 1000,
  });

  return {
    url,
    filename,
    format,
    size: Buffer.byteLength(content),
  };
});

/**
 * Edit a transcript segment (for corrections)
 */
export const editTranscriptSegment = onCall<{
  sessionId: string;
  segmentId: string;
  language: LanguageCode;
  newText: string;
}>(async (request) => {
  const { sessionId, segmentId, language, newText } = request.data;
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Verify session exists and user has permission
  const sessionRef = db.collection('translations').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new HttpsError('not-found', 'Translation session not found');
  }

  const session = sessionDoc.data() as TranslationSession;

  if (session.organizerId !== userId) {
    throw new HttpsError(
      'permission-denied',
      'Only the session organizer can edit transcripts'
    );
  }

  // Update the segment
  const segmentRef = sessionRef.collection('segments').doc(segmentId);
  const segmentDoc = await segmentRef.get();

  if (!segmentDoc.exists) {
    throw new HttpsError('not-found', 'Transcript segment not found');
  }

  const updateData: any = {
    'metadata.edited': true,
    'metadata.editedAt': new Date().toISOString(),
    'metadata.editedBy': userId,
  };

  // Update the appropriate field based on language
  if (language === session.config.sourceLanguage) {
    updateData['original.text'] = newText;
  } else {
    updateData[`translations.${language}`] = newText;
  }

  await segmentRef.update(updateData);

  return { success: true };
});

/**
 * Search within transcript
 */
export const searchTranscript = onCall<{
  sessionId: string;
  query: string;
  language: LanguageCode;
}>(async (request) => {
  const { sessionId, query, language } = request.data;

  if (!query || query.length < 2) {
    throw new HttpsError('invalid-argument', 'Query must be at least 2 characters');
  }

  const sessionRef = db.collection('translations').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new HttpsError('not-found', 'Translation session not found');
  }

  const session = sessionDoc.data() as TranslationSession;

  // Get all segments
  const segmentsSnapshot = await sessionRef
    .collection('segments')
    .orderBy('timestamp', 'asc')
    .get();

  const queryLower = query.toLowerCase();
  const matchingSegments: any[] = [];

  segmentsSnapshot.forEach((doc) => {
    const segment = doc.data() as TranscriptSegment;

    let text: string;
    if (language === session.config.sourceLanguage) {
      text = segment.original.text;
    } else {
      const translation = segment.translations[language];
      text = typeof translation === 'string'
        ? translation
        : (translation?.text || '');
    }

    if (text.toLowerCase().includes(queryLower)) {
      matchingSegments.push({
        id: doc.id,
        timestamp: segment.timestamp,
        speaker: segment.speaker,
        text,
        // Include context (highlight the matching part)
        matchContext: highlightMatch(text, query),
      });
    }
  });

  return {
    sessionId,
    query,
    language,
    results: matchingSegments,
    count: matchingSegments.length,
  };
});

// Helper Functions

/**
 * Generate plain text transcript
 */
function generatePlainTextTranscript(
  segments: TranscriptSegment[],
  language: LanguageCode,
  session: TranslationSession
): string {
  const header = `Translation Transcript
Event ID: ${session.eventId}
Language: ${language}
Generated: ${new Date().toISOString()}
----------------------------------------

`;

  const content = segments
    .map((seg) => {
      const timestamp = new Date(seg.timestamp).toISOString();
      const text =
        language === session.config.sourceLanguage
          ? seg.original.text
          : seg.translations[language];

      return `[${timestamp}] ${seg.speaker}: ${text}`;
    })
    .join('\n\n');

  return header + content;
}

/**
 * Generate WebVTT subtitle file
 */
function generateWebVTT(
  segments: TranscriptSegment[],
  language: LanguageCode,
  session: TranslationSession
): string {
  let vtt = 'WEBVTT\n\n';

  segments.forEach((seg, index) => {
    const timestamp = typeof seg.timestamp === 'number' ? seg.timestamp : seg.timestamp.getTime();
    const start = formatVTTTime(timestamp);
    // Assume 5 second duration per segment (or until next segment)
    const nextSegTimestamp = index < segments.length - 1
      ? segments[index + 1].timestamp
      : null;
    const nextTimestamp = nextSegTimestamp
      ? (typeof nextSegTimestamp === 'number' ? nextSegTimestamp : nextSegTimestamp.getTime())
      : timestamp + 5000;
    const end = formatVTTTime(nextTimestamp);

    const text =
      language === session.config.sourceLanguage
        ? seg.original.text
        : seg.translations[language];

    vtt += `${index + 1}\n${start} --> ${end}\n${text}\n\n`;
  });

  return vtt;
}

/**
 * Generate SRT subtitle file
 */
function generateSRT(
  segments: TranscriptSegment[],
  language: LanguageCode,
  session: TranslationSession
): string {
  let srt = '';

  segments.forEach((seg, index) => {
    const timestamp = typeof seg.timestamp === 'number' ? seg.timestamp : seg.timestamp.getTime();
    const start = formatSRTTime(timestamp);
    const nextSegTimestamp = index < segments.length - 1
      ? segments[index + 1].timestamp
      : null;
    const nextTimestamp = nextSegTimestamp
      ? (typeof nextSegTimestamp === 'number' ? nextSegTimestamp : nextSegTimestamp.getTime())
      : timestamp + 5000;
    const end = formatSRTTime(nextTimestamp);

    const text =
      language === session.config.sourceLanguage
        ? seg.original.text
        : seg.translations[language];

    srt += `${index + 1}\n${start} --> ${end}\n${text}\n\n`;
  });

  return srt;
}

/**
 * Format timestamp for WebVTT (HH:MM:SS.mmm)
 */
function formatVTTTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Format timestamp for SRT (HH:MM:SS,mmm)
 */
function formatSRTTime(timestamp: number): string {
  return formatVTTTime(timestamp).replace('.', ',');
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text: string, query: string): string {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '**$1**');
}
