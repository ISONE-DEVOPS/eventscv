/**
 * Translation Session Management
 * Manages real-time translation sessions for events
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type {
  TranslationSession,
  TranslationConfig,
  TranslationStatus,
} from '../shared-types';

const db = getFirestore();

/**
 * Start a new translation session for an event
 */
export const startTranslationSession = onCall<{
  eventId: string;
  config: TranslationConfig;
}>(async (request) => {
  const { eventId, config } = request.data;
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Validate event exists and user is the organizer
  const eventRef = db.collection('events').doc(eventId);
  const eventDoc = await eventRef.get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const eventData = eventDoc.data();
  if (eventData?.organizerId !== userId) {
    throw new HttpsError(
      'permission-denied',
      'Only event organizer can start translation session'
    );
  }

  // Check if there's already an active session for this event
  const existingSessions = await db
    .collection('translations')
    .where('eventId', '==', eventId)
    .where('status', 'in', ['scheduled', 'live', 'paused'])
    .get();

  if (!existingSessions.empty) {
    throw new HttpsError(
      'already-exists',
      'There is already an active translation session for this event'
    );
  }

  // Validate configuration
  if (!config.sourceLanguage || !config.targetLanguages || config.targetLanguages.length === 0) {
    throw new HttpsError('invalid-argument', 'Invalid translation configuration');
  }

  // Calculate initial pricing
  const basePrice = calculateSessionPrice(config, eventData.expectedAttendees || 0);

  // Create translation session
  const sessionData: Partial<TranslationSession> = {
    eventId,
    organizerId: userId,
    config,
    status: 'scheduled' as TranslationStatus,
    metrics: {
      totalDuration: 0,
      segmentsTranslated: 0,
      languagesActive: config.targetLanguages.length,
      peakListeners: 0,
      averageLatency: 0,
      accuracyScore: 0,
    },
    equipment: {
      softwareOnly: config.equipmentNeeded ? false : true,
      receivers: config.equipmentNeeded?.receivers || 0,
      transmitters: config.equipmentNeeded?.transmitters || 0,
      booths: config.equipmentNeeded?.booths || 0,
      technician: config.equipmentNeeded?.technician || false,
    },
    billing: {
      plan: config.plan || 'starter',
      softwareFee: basePrice,
      equipmentFee: 0,
      setupFee: config.equipmentNeeded?.technician ? 50 : 0,
      totalCost: basePrice + (config.equipmentNeeded?.technician ? 50 : 0),
      paid: false,
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const sessionRef = await db.collection('translations').add(sessionData);

  // Generate WebSocket stream URLs for each target language
  const streamUrls: { [key: string]: string } = {};
  for (const lang of config.targetLanguages) {
    streamUrls[lang] = `wss://events-cv.web.app/translation/${sessionRef.id}/stream/${lang}`;
  }

  // Update session with stream URLs
  await sessionRef.update({ streamUrls });

  return {
    sessionId: sessionRef.id,
    streamUrls,
    billing: sessionData.billing,
  };
});

/**
 * End a translation session
 */
export const endTranslationSession = onCall<{
  sessionId: string;
}>(async (request) => {
  const { sessionId } = request.data;
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const sessionRef = db.collection('translations').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new HttpsError('not-found', 'Translation session not found');
  }

  const sessionData = sessionDoc.data() as TranslationSession;

  if (sessionData.organizerId !== userId) {
    throw new HttpsError(
      'permission-denied',
      'Only the session organizer can end it'
    );
  }

  if (sessionData.status === 'ended') {
    throw new HttpsError('failed-precondition', 'Session already ended');
  }

  // Calculate final metrics
  const endTime = Date.now();
  const startTime = sessionData.startedAt
    ? (sessionData.startedAt as any).toMillis()
    : endTime;
  const totalDuration = Math.floor((endTime - startTime) / 1000); // in seconds

  await sessionRef.update({
    status: 'ended',
    endedAt: FieldValue.serverTimestamp(),
    'metrics.totalDuration': totalDuration,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Generate final transcript
  const transcriptRef = await generateFinalTranscript(sessionId);

  return {
    success: true,
    sessionId,
    transcriptId: transcriptRef?.id,
    metrics: {
      ...sessionData.metrics,
      totalDuration,
    },
  };
});

/**
 * Update translation session status
 */
export const updateSessionStatus = onCall<{
  sessionId: string;
  status: TranslationStatus;
}>(async (request) => {
  const { sessionId, status } = request.data;
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const sessionRef = db.collection('translations').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new HttpsError('not-found', 'Translation session not found');
  }

  const sessionData = sessionDoc.data() as TranslationSession;

  if (sessionData.organizerId !== userId) {
    throw new HttpsError(
      'permission-denied',
      'Only the session organizer can update status'
    );
  }

  const updateData: any = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Track when session actually starts
  if (status === 'live' && !sessionData.startedAt) {
    updateData.startedAt = FieldValue.serverTimestamp();
  }

  await sessionRef.update(updateData);

  return { success: true, status };
});

/**
 * Get translation session details
 */
export const getTranslationSession = onCall<{
  sessionId: string;
}>(async (request) => {
  const { sessionId } = request.data;
  const userId = request.auth?.uid;

  const sessionRef = db.collection('translations').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new HttpsError('not-found', 'Translation session not found');
  }

  const sessionData = sessionDoc.data() as TranslationSession;

  // Allow access to organizer or event participants
  if (userId && sessionData.organizerId === userId) {
    // Organizer gets full access
    return sessionData;
  }

  // Participants get limited access
  return {
    id: sessionId,
    eventId: sessionData.eventId,
    config: {
      sourceLanguage: sessionData.config.sourceLanguage,
      targetLanguages: sessionData.config.targetLanguages,
      mode: sessionData.config.mode,
    },
    status: sessionData.status,
    streamUrls: sessionData.streamUrls,
  };
});

/**
 * Track active listeners for a session
 */
export const trackListener = onCall<{
  sessionId: string;
  language: string;
  action: 'join' | 'leave';
}>(async (request) => {
  const { sessionId, language, action } = request.data;

  const sessionRef = db.collection('translations').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new HttpsError('not-found', 'Translation session not found');
  }

  const sessionData = sessionDoc.data() as TranslationSession;
  const currentListeners = sessionData.activeListeners || {};
  const langListeners = currentListeners[language] || 0;

  const newCount = action === 'join' ? langListeners + 1 : Math.max(0, langListeners - 1);
  currentListeners[language] = newCount;

  // Calculate total listeners
  const totalListeners = (Object.values(currentListeners) as number[]).reduce((a, b) => a + b, 0);

  // Update peak listeners if needed
  const peakListeners = Math.max(
    sessionData.metrics.peakListeners || 0,
    totalListeners as number
  );

  await sessionRef.update({
    activeListeners: currentListeners,
    'metrics.peakListeners': peakListeners,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, listeners: totalListeners };
});

// Helper Functions

/**
 * Calculate session price based on plan and attendees
 */
function calculateSessionPrice(config: TranslationConfig, attendees: number): number {
  const plan = config.plan || 'starter';

  const basePrices: Record<string, number> = {
    starter: 50,
    business: 150,
    enterprise: 400,
  };

  let price = basePrices[plan] || 50;

  // Add per-language fees for enterprise
  if (plan === 'enterprise') {
    const extraLanguages = Math.max(0, config.targetLanguages.length - 4);
    price += extraLanguages * 50;
  }

  return price;
}

/**
 * Generate final transcript document
 */
async function generateFinalTranscript(sessionId: string) {
  const segments = await db
    .collection('translations')
    .doc(sessionId)
    .collection('segments')
    .orderBy('timestamp', 'asc')
    .get();

  if (segments.empty) {
    return null;
  }

  const transcriptData = {
    sessionId,
    segments: segments.docs.map((doc) => doc.data()),
    generatedAt: FieldValue.serverTimestamp(),
  };

  return db.collection('transcripts').add(transcriptData);
}
