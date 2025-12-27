/**
 * Event Blasts System
 * Multi-channel messaging for event organizers
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue, Query } from 'firebase-admin/firestore';
import type {
  EventBlast,
  BlastRecipient,
  BlastChannel,
  BlastStatus,
  BlastRecipientFilter,
  BlastDeliveryStats,
  CreateBlastRequest,
  CreateBlastResponse,
} from '../shared-types/blasts';

const db = getFirestore();

// ============================================
// BLAST CREATION & MANAGEMENT
// ============================================

/**
 * Calculate number of recipients based on filter
 */
export const calculateBlastRecipients = onCall<{
  eventId: string;
  recipientFilter: BlastRecipientFilter;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, recipientFilter } = request.data;

  // Verify user is event organizer
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();
  if (event?.createdBy !== userId && event?.organizationId) {
    // Check if user is organization admin
    const orgMember = await db
      .collection('organization-members')
      .where('organizationId', '==', event.organizationId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (orgMember.empty) {
      throw new HttpsError(
        'permission-denied',
        'Only event organizers can calculate recipients'
      );
    }
  }

  // Build query based on filters
  let query: Query = db
    .collection('tickets')
    .where('eventId', '==', eventId);

  // Apply filters
  if (recipientFilter.ticketTypes && recipientFilter.ticketTypes.length > 0) {
    query = query.where('ticketTypeId', 'in', recipientFilter.ticketTypes);
  }

  if (recipientFilter.ticketStatus && recipientFilter.ticketStatus.length > 0) {
    query = query.where('status', 'in', recipientFilter.ticketStatus);
  }

  if (recipientFilter.purchasedAfter) {
    query = query.where('purchasedAt', '>=', recipientFilter.purchasedAfter);
  }

  if (recipientFilter.purchasedBefore) {
    query = query.where('purchasedAt', '<=', recipientFilter.purchasedBefore);
  }

  // Execute query
  const ticketsSnapshot = await query.get();

  let recipients = ticketsSnapshot.docs.map((doc) => ({
    ticketId: doc.id,
    ...doc.data(),
  }));

  // Apply additional filters (not supported by Firestore query)
  if (recipientFilter.hasAttended !== undefined) {
    recipients = recipients.filter((ticket: any) =>
      recipientFilter.hasAttended
        ? ticket.checkedInAt !== undefined
        : ticket.checkedInAt === undefined
    );
  }

  if (recipientFilter.excludeUserIds && recipientFilter.excludeUserIds.length > 0) {
    recipients = recipients.filter(
      (ticket: any) => !recipientFilter.excludeUserIds!.includes(ticket.userId)
    );
  }

  if (recipientFilter.excludeTicketIds && recipientFilter.excludeTicketIds.length > 0) {
    recipients = recipients.filter(
      (ticket: any) => !recipientFilter.excludeTicketIds!.includes(ticket.id)
    );
  }

  // Get unique users (in case multiple tickets per user)
  const uniqueUserIds = [...new Set(recipients.map((ticket: any) => ticket.userId))];

  return {
    totalRecipients: uniqueUserIds.length,
    totalTickets: recipients.length,
    breakdown: {
      withEmail: recipients.filter((t: any) => t.buyerEmail).length,
      withPhone: recipients.filter((t: any) => t.buyerPhone).length,
    },
  };
});

/**
 * Create a new blast
 */
export const createBlast = onCall<CreateBlastRequest>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, name, description, type, channels, template, recipientFilter, schedule } =
    request.data;

  // Verify user is event organizer
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();
  if (event?.createdBy !== userId && event?.organizationId) {
    const orgMember = await db
      .collection('organization-members')
      .where('organizationId', '==', event.organizationId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (orgMember.empty) {
      throw new HttpsError('permission-denied', 'Only event organizers can create blasts');
    }
  }

  // Validate channels and templates
  for (const channel of channels) {
    if (channel === 'email' && !template.email) {
      throw new HttpsError('invalid-argument', 'Email template is required for email channel');
    }
    if (channel === 'sms' && !template.sms) {
      throw new HttpsError('invalid-argument', 'SMS template is required for SMS channel');
    }
    if (channel === 'push' && !template.push) {
      throw new HttpsError('invalid-argument', 'Push template is required for push channel');
    }
  }

  // Calculate recipients
  let recipientCount = 0;
  try {
    // Build query based on filters
    let query: Query = db.collection('tickets').where('eventId', '==', eventId);

    if (recipientFilter.ticketTypes && recipientFilter.ticketTypes.length > 0) {
      query = query.where('ticketTypeId', 'in', recipientFilter.ticketTypes);
    }

    if (recipientFilter.ticketStatus && recipientFilter.ticketStatus.length > 0) {
      query = query.where('status', 'in', recipientFilter.ticketStatus);
    }

    const ticketsSnapshot = await query.get();
    let recipients = ticketsSnapshot.docs.map((doc) => doc.data());

    // Apply filters
    if (recipientFilter.hasAttended !== undefined) {
      recipients = recipients.filter((ticket: any) =>
        recipientFilter.hasAttended
          ? ticket.checkedInAt !== undefined
          : ticket.checkedInAt === undefined
      );
    }

    if (recipientFilter.excludeUserIds && recipientFilter.excludeUserIds.length > 0) {
      recipients = recipients.filter(
        (ticket: any) => !recipientFilter.excludeUserIds!.includes(ticket.userId)
      );
    }

    // Get unique users
    const uniqueUserIds = [...new Set(recipients.map((ticket: any) => ticket.userId))];
    recipientCount = uniqueUserIds.length;
  } catch (error) {
    console.error('Error calculating recipients:', error);
  }

  if (recipientCount === 0) {
    throw new HttpsError('invalid-argument', 'No recipients match the filter criteria');
  }

  // Determine status
  const status: BlastStatus = schedule.sendImmediately ? 'sending' : 'scheduled';

  // Create blast
  const blastData: Partial<EventBlast> = {
    eventId,
    organizationId: event?.organizationId || '',
    name,
    description,
    type,
    channels,
    template,
    recipientFilter,
    recipientCount,
    schedule,
    status,
    createdBy: userId,
    createdAt: FieldValue.serverTimestamp(),
  };

  const blastRef = await db.collection('event-blasts').add(blastData);

  // If send immediately, trigger sending
  if (schedule.sendImmediately) {
    // In production, this would trigger a Cloud Task or Pub/Sub message
    // For now, we'll call sendBlast directly
    await sendBlastInternal(blastRef.id);
  }

  return {
    blastId: blastRef.id,
    estimatedRecipients: recipientCount,
    scheduledFor: schedule.sendImmediately ? undefined : schedule.sendAt,
  } as CreateBlastResponse;
});

/**
 * Send a blast (internal function)
 */
async function sendBlastInternal(blastId: string): Promise<void> {
  const blastDoc = await db.collection('event-blasts').doc(blastId).get();

  if (!blastDoc.exists) {
    throw new Error('Blast not found');
  }

  const blast = blastDoc.data() as EventBlast;

  // Update status to sending
  await blastDoc.ref.update({
    status: 'sending',
    sentAt: FieldValue.serverTimestamp(),
  });

  // Get recipients
  const recipientsQuery = db
    .collection('tickets')
    .where('eventId', '==', blast.eventId);

  const ticketsSnapshot = await recipientsQuery.get();

  let recipients = ticketsSnapshot.docs;

  // Apply filters (simplified for now)
  if (blast.recipientFilter.ticketTypes && blast.recipientFilter.ticketTypes.length > 0) {
    recipients = recipients.filter((doc) =>
      blast.recipientFilter.ticketTypes!.includes(doc.data().ticketTypeId)
    );
  }

  // Get unique users
  const uniqueUsers = new Map();
  for (const ticketDoc of recipients) {
    const ticket = ticketDoc.data();
    if (!uniqueUsers.has(ticket.userId)) {
      uniqueUsers.set(ticket.userId, {
        userId: ticket.userId,
        userEmail: ticket.buyerEmail,
        userPhone: ticket.buyerPhone,
        userName: ticket.buyerName,
        ticketId: ticketDoc.id,
      });
    }
  }

  // Create blast recipient records
  const batch = db.batch();
  const deliveryStats: BlastDeliveryStats = {
    totalRecipients: uniqueUsers.size,
    totalSent: 0,
    totalFailed: 0,
    totalPending: uniqueUsers.size,
    byChannel: {},
  };

  for (const [, recipientInfo] of uniqueUsers) {
    const recipientData: Partial<BlastRecipient> = {
      blastId,
      eventId: blast.eventId,
      userId: recipientInfo.userId,
      userEmail: recipientInfo.userEmail,
      userPhone: recipientInfo.userPhone,
      userName: recipientInfo.userName,
      ticketId: recipientInfo.ticketId,
      deliveryStatus: {},
      createdAt: FieldValue.serverTimestamp(),
    };

    // Initialize delivery status for each channel
    for (const channel of blast.channels) {
      recipientData.deliveryStatus![channel] = {
        status: 'pending',
      };
    }

    const recipientRef = db.collection('blast-recipients').doc();
    batch.set(recipientRef, recipientData);

    // In production, trigger actual sending via:
    // - SendGrid/Mailgun for email
    // - Twilio/MessageBird for SMS
    // - Firebase Cloud Messaging for push
    // For now, we'll just mark as sent
    deliveryStats.totalSent++;
    deliveryStats.totalPending--;
  }

  // Initialize channel stats
  for (const channel of blast.channels) {
    deliveryStats.byChannel[channel] = {
      sent: uniqueUsers.size,
      delivered: 0,
      failed: 0,
    };
  }

  await batch.commit();

  // Update blast with delivery stats
  await blastDoc.ref.update({
    status: 'sent',
    deliveryStats,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Send blast (callable function)
 */
export const sendBlast = onCall<{
  blastId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { blastId } = request.data;

  const blastDoc = await db.collection('event-blasts').doc(blastId).get();

  if (!blastDoc.exists) {
    throw new HttpsError('not-found', 'Blast not found');
  }

  const blast = blastDoc.data() as EventBlast;

  // Verify permissions
  if (blast.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Only the blast creator can send it');
  }

  if (blast.status !== 'draft' && blast.status !== 'scheduled') {
    throw new HttpsError('failed-precondition', `Cannot send blast with status: ${blast.status}`);
  }

  await sendBlastInternal(blastId);

  return { success: true };
});

/**
 * Cancel a scheduled blast
 */
export const cancelBlast = onCall<{
  blastId: string;
  reason?: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { blastId, reason } = request.data;

  const blastDoc = await db.collection('event-blasts').doc(blastId).get();

  if (!blastDoc.exists) {
    throw new HttpsError('not-found', 'Blast not found');
  }

  const blast = blastDoc.data() as EventBlast;

  // Verify permissions
  if (blast.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Only the blast creator can cancel it');
  }

  if (blast.status !== 'scheduled' && blast.status !== 'draft') {
    throw new HttpsError(
      'failed-precondition',
      `Cannot cancel blast with status: ${blast.status}`
    );
  }

  await blastDoc.ref.update({
    status: 'cancelled',
    cancelledAt: FieldValue.serverTimestamp(),
    cancelledBy: userId,
    cancellationReason: reason,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * Get blast status and delivery statistics
 */
export const getBlastStatus = onCall<{
  blastId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { blastId } = request.data;

  const blastDoc = await db.collection('event-blasts').doc(blastId).get();

  if (!blastDoc.exists) {
    throw new HttpsError('not-found', 'Blast not found');
  }

  const blast = blastDoc.data() as EventBlast;

  // Verify permissions
  if (blast.createdBy !== userId) {
    const eventDoc = await db.collection('events').doc(blast.eventId).get();
    const event = eventDoc.data();

    if (event?.createdBy !== userId) {
      throw new HttpsError('permission-denied', 'Access denied');
    }
  }

  // Get recent delivery stats from recipients
  const recipientsSnapshot = await db
    .collection('blast-recipients')
    .where('blastId', '==', blastId)
    .limit(100)
    .get();

  // Calculate real-time stats
  const deliveryStats: BlastDeliveryStats = {
    totalRecipients: blast.recipientCount || 0,
    totalSent: 0,
    totalFailed: 0,
    totalPending: 0,
    byChannel: {},
  };

  recipientsSnapshot.docs.forEach((doc) => {
    const recipient = doc.data() as BlastRecipient;

    for (const [channel, status] of Object.entries(recipient.deliveryStatus)) {
      if (!deliveryStats.byChannel[channel as BlastChannel]) {
        deliveryStats.byChannel[channel as BlastChannel] = {
          sent: 0,
          delivered: 0,
          failed: 0,
        };
      }

      const channelStats = deliveryStats.byChannel[channel as BlastChannel]!;

      if (status.status === 'sent' || status.status === 'delivered') {
        channelStats.sent++;
        deliveryStats.totalSent++;
      }

      if (status.status === 'delivered') {
        channelStats.delivered++;
      }

      if (status.status === 'failed' || status.status === 'bounced') {
        channelStats.failed++;
        deliveryStats.totalFailed++;
      }

      if (status.status === 'pending') {
        deliveryStats.totalPending++;
      }

      if (status.status === 'opened' && channel === 'email') {
        channelStats.opened = (channelStats.opened || 0) + 1;
      }

      if (status.status === 'clicked') {
        channelStats.clicked = (channelStats.clicked || 0) + 1;
      }
    }
  });

  return {
    blast: {
      ...blast,
      id: blastId,
    },
    deliveryStats,
  };
});

/**
 * Send test blast to specific recipients
 */
export const sendTestBlast = onCall<{
  blastId: string;
  testRecipients: {
    email?: string;
    phone?: string;
  }[];
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { blastId, testRecipients } = request.data;

  const blastDoc = await db.collection('event-blasts').doc(blastId).get();

  if (!blastDoc.exists) {
    throw new HttpsError('not-found', 'Blast not found');
  }

  const blast = blastDoc.data() as EventBlast;

  // Verify permissions
  if (blast.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Only the blast creator can send test blasts');
  }

  // In production, send test messages via actual providers
  // For now, just log that we would send

  console.log(`Would send test blast to ${testRecipients.length} recipients:`, {
    blastId,
    template: blast.template,
    testRecipients,
  });

  return {
    success: true,
    testsSent: testRecipients.length,
  };
});

/**
 * Scheduled function to send scheduled blasts
 * Runs every minute to check for blasts that need to be sent
 */
export const processScheduledBlasts = onSchedule('every 1 minutes', async (event) => {
  const now = new Date();

  // Find blasts scheduled to be sent
  const scheduledBlasts = await db
    .collection('event-blasts')
    .where('status', '==', 'scheduled')
    .where('schedule.sendAt', '<=', now)
    .limit(10)
    .get();

  console.log(`Found ${scheduledBlasts.size} blasts to send`);

  for (const blastDoc of scheduledBlasts.docs) {
    try {
      await sendBlastInternal(blastDoc.id);
      console.log(`Successfully sent blast: ${blastDoc.id}`);
    } catch (error) {
      console.error(`Failed to send blast ${blastDoc.id}:`, error);

      // Update blast with error
      await blastDoc.ref.update({
        status: 'failed',
        errors: FieldValue.arrayUnion({
          channel: 'system',
          error: (error as Error).message,
          count: 1,
        }),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
});

/**
 * Get blasts for an event
 */
export const getEventBlasts = onCall<{
  eventId: string;
  limit?: number;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, limit = 50 } = request.data;

  // Verify user has access to event
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  if (event?.createdBy !== userId && event?.organizationId) {
    const orgMember = await db
      .collection('organization-members')
      .where('organizationId', '==', event.organizationId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (orgMember.empty) {
      throw new HttpsError('permission-denied', 'Access denied');
    }
  }

  const blastsSnapshot = await db
    .collection('event-blasts')
    .where('eventId', '==', eventId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  const blasts = blastsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { blasts };
});
