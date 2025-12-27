/**
 * Event Calendars & Subscribers
 * CRUD operations for calendars and subscription management
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type {
  Calendar,
  CalendarSubscriber,
  CalendarVisibility,
  SubscriptionTier,
} from '../shared-types/calendar';

const db = getFirestore();

// ============================================
// CALENDAR CRUD OPERATIONS
// ============================================

/**
 * Create a new calendar
 */
export const createCalendar = onCall<{
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  visibility?: CalendarVisibility;
  settings?: Partial<Calendar['settings']>;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const {
    organizationId,
    name,
    slug,
    description,
    coverImage,
    visibility = 'public',
    settings,
  } = request.data;

  // Validate required fields
  if (!organizationId || !name || !slug || !description) {
    throw new HttpsError(
      'invalid-argument',
      'organizationId, name, slug, and description are required'
    );
  }

  // Check if slug already exists
  const existingCalendar = await db
    .collection('calendars')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (!existingCalendar.empty) {
    throw new HttpsError('already-exists', 'A calendar with this slug already exists');
  }

  // Verify user owns the organization
  const orgDoc = await db.collection('organizations').doc(organizationId).get();

  if (!orgDoc.exists) {
    throw new HttpsError('not-found', 'Organization not found');
  }

  const orgData = orgDoc.data();
  if (orgData?.ownerId !== userId) {
    throw new HttpsError(
      'permission-denied',
      'Only the organization owner can create calendars'
    );
  }

  // Create calendar
  const calendarData: Partial<Calendar> = {
    organizationId,
    name,
    slug,
    description,
    coverImage,
    visibility,
    settings: {
      allowMemberEvents: settings?.allowMemberEvents ?? false,
      requireApproval: settings?.requireApproval ?? true,
      allowDiscussions: settings?.allowDiscussions ?? true,
      membershipRequired: settings?.membershipRequired ?? false,
    },
    subscriberCount: 0,
    eventCount: 0,
    totalAttendees: 0,
    membershipEnabled: false,
    createdBy: userId,
    createdAt: FieldValue.serverTimestamp() as any,
    updatedAt: FieldValue.serverTimestamp() as any,
  };

  const calendarRef = await db.collection('calendars').add(calendarData);

  return {
    calendarId: calendarRef.id,
    success: true,
  };
});

/**
 * Update calendar
 */
export const updateCalendar = onCall<{
  calendarId: string;
  updates: {
    name?: string;
    description?: string;
    coverImage?: string;
    bannerImage?: string;
    visibility?: CalendarVisibility;
    settings?: Partial<Calendar['settings']>;
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { calendarId, updates } = request.data;

  if (!calendarId) {
    throw new HttpsError('invalid-argument', 'calendarId is required');
  }

  const calendarRef = db.collection('calendars').doc(calendarId);
  const calendarDoc = await calendarRef.get();

  if (!calendarDoc.exists) {
    throw new HttpsError('not-found', 'Calendar not found');
  }

  const calendar = calendarDoc.data() as Calendar;

  // Check permissions
  const orgDoc = await db.collection('organizations').doc(calendar.organizationId).get();
  const orgData = orgDoc.data();

  if (orgData?.ownerId !== userId && calendar.createdBy !== userId) {
    throw new HttpsError(
      'permission-denied',
      'Only the calendar creator or organization owner can update calendars'
    );
  }

  // Update calendar
  const updateData: any = {
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // If settings are being updated, merge with existing settings
  if (updates.settings) {
    updateData.settings = {
      ...calendar.settings,
      ...updates.settings,
    };
  }

  await calendarRef.update(updateData);

  return { success: true };
});

/**
 * Delete calendar
 */
export const deleteCalendar = onCall<{
  calendarId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { calendarId } = request.data;

  if (!calendarId) {
    throw new HttpsError('invalid-argument', 'calendarId is required');
  }

  const calendarRef = db.collection('calendars').doc(calendarId);
  const calendarDoc = await calendarRef.get();

  if (!calendarDoc.exists) {
    throw new HttpsError('not-found', 'Calendar not found');
  }

  const calendar = calendarDoc.data() as Calendar;

  // Check permissions - only creator or org owner can delete
  const orgDoc = await db.collection('organizations').doc(calendar.organizationId).get();
  const orgData = orgDoc.data();

  if (orgData?.ownerId !== userId && calendar.createdBy !== userId) {
    throw new HttpsError(
      'permission-denied',
      'Only the calendar creator or organization owner can delete calendars'
    );
  }

  // Delete calendar
  await calendarRef.delete();

  // Note: In production, you might want to:
  // 1. Delete all subscribers
  // 2. Unlink all events
  // 3. Delete all discussions
  // This could be done in a batch or scheduled function

  return { success: true };
});

/**
 * Get calendar by ID
 */
export const getCalendar = onCall<{
  calendarId: string;
}>(async (request) => {
  const { calendarId } = request.data;

  if (!calendarId) {
    throw new HttpsError('invalid-argument', 'calendarId is required');
  }

  const calendarDoc = await db.collection('calendars').doc(calendarId).get();

  if (!calendarDoc.exists) {
    throw new HttpsError('not-found', 'Calendar not found');
  }

  const calendar = calendarDoc.data() as Calendar;

  // Check visibility
  if (calendar.visibility === 'private') {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new HttpsError('permission-denied', 'This calendar is private');
    }

    // Check if user is organization owner or calendar creator
    const orgDoc = await db.collection('organizations').doc(calendar.organizationId).get();
    const orgData = orgDoc.data();

    if (orgData?.ownerId !== userId && calendar.createdBy !== userId) {
      throw new HttpsError('permission-denied', 'This calendar is private');
    }
  }

  return {
    ...calendar,
    id: calendarDoc.id,
  } as Calendar;
});

/**
 * Get calendar by slug
 */
export const getCalendarBySlug = onCall<{
  slug: string;
}>(async (request) => {
  const { slug } = request.data;

  if (!slug) {
    throw new HttpsError('invalid-argument', 'slug is required');
  }

  const snapshot = await db.collection('calendars').where('slug', '==', slug).limit(1).get();

  if (snapshot.empty) {
    throw new HttpsError('not-found', 'Calendar not found');
  }

  const calendarDoc = snapshot.docs[0];
  const calendar = calendarDoc.data() as Calendar;

  // Check visibility
  if (calendar.visibility === 'private') {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new HttpsError('permission-denied', 'This calendar is private');
    }

    const orgDoc = await db.collection('organizations').doc(calendar.organizationId).get();
    const orgData = orgDoc.data();

    if (orgData?.ownerId !== userId && calendar.createdBy !== userId) {
      throw new HttpsError('permission-denied', 'This calendar is private');
    }
  }

  return {
    ...calendar,
    id: calendarDoc.id,
  } as Calendar;
});

/**
 * List calendars for organization
 */
export const listOrganizationCalendars = onCall<{
  organizationId: string;
  includePrivate?: boolean;
}>(async (request) => {
  const { organizationId, includePrivate = false } = request.data;

  if (!organizationId) {
    throw new HttpsError('invalid-argument', 'organizationId is required');
  }

  let query = db.collection('calendars').where('organizationId', '==', organizationId);

  if (!includePrivate) {
    query = query.where('visibility', 'in', ['public', 'unlisted']);
  }

  const snapshot = await query.get();

  const calendars = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { calendars };
});

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Subscribe to calendar
 */
export const subscribeToCalendar = onCall<{
  calendarId: string;
  tier?: SubscriptionTier;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const {
    calendarId,
    tier = 'free',
    emailNotifications = true,
    pushNotifications = true,
  } = request.data;

  if (!calendarId) {
    throw new HttpsError('invalid-argument', 'calendarId is required');
  }

  // Check if calendar exists
  const calendarDoc = await db.collection('calendars').doc(calendarId).get();

  if (!calendarDoc.exists) {
    throw new HttpsError('not-found', 'Calendar not found');
  }

  // Check if already subscribed
  const existingSubscription = await db
    .collection('calendar-subscribers')
    .where('calendarId', '==', calendarId)
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (!existingSubscription.empty) {
    throw new HttpsError('already-exists', 'Already subscribed to this calendar');
  }

  // Create subscription
  const subscriberData: Partial<CalendarSubscriber> = {
    calendarId,
    userId,
    tier,
    emailNotifications,
    pushNotifications,
    smsNotifications: false,
    notificationFrequency: 'all',
    isMember: false,
    eventsAttended: 0,
    subscribedAt: FieldValue.serverTimestamp() as any,
  };

  await db.collection('calendar-subscribers').add(subscriberData);

  // Increment subscriber count
  await db
    .collection('calendars')
    .doc(calendarId)
    .update({
      subscriberCount: FieldValue.increment(1),
    });

  return { success: true };
});

/**
 * Unsubscribe from calendar
 */
export const unsubscribeFromCalendar = onCall<{
  calendarId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { calendarId } = request.data;

  if (!calendarId) {
    throw new HttpsError('invalid-argument', 'calendarId is required');
  }

  // Find subscription
  const snapshot = await db
    .collection('calendar-subscribers')
    .where('calendarId', '==', calendarId)
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new HttpsError('not-found', 'Subscription not found');
  }

  const subscriptionDoc = snapshot.docs[0];

  // Mark as unsubscribed
  await subscriptionDoc.ref.update({
    unsubscribedAt: FieldValue.serverTimestamp(),
  });

  // Alternatively, delete the subscription entirely:
  // await subscriptionDoc.ref.delete();

  // Decrement subscriber count
  await db
    .collection('calendars')
    .doc(calendarId)
    .update({
      subscriberCount: FieldValue.increment(-1),
    });

  return { success: true };
});

/**
 * Update subscription preferences
 */
export const updateSubscriptionPreferences = onCall<{
  calendarId: string;
  preferences: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    notificationFrequency?: 'all' | 'daily' | 'weekly' | 'monthly';
  };
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { calendarId, preferences } = request.data;

  if (!calendarId) {
    throw new HttpsError('invalid-argument', 'calendarId is required');
  }

  // Find subscription
  const snapshot = await db
    .collection('calendar-subscribers')
    .where('calendarId', '==', calendarId)
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new HttpsError('not-found', 'Subscription not found');
  }

  const subscriptionDoc = snapshot.docs[0];

  // Update preferences
  await subscriptionDoc.ref.update(preferences);

  return { success: true };
});

/**
 * Get user's calendar subscriptions
 */
export const getUserSubscriptions = onCall(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const snapshot = await db
    .collection('calendar-subscribers')
    .where('userId', '==', userId)
    .where('unsubscribedAt', '==', null)
    .get();

  const subscriptions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { subscriptions };
});

/**
 * Get calendar subscribers (admin only)
 */
export const getCalendarSubscribers = onCall<{
  calendarId: string;
  limit?: number;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { calendarId, limit: limitCount = 100 } = request.data;

  if (!calendarId) {
    throw new HttpsError('invalid-argument', 'calendarId is required');
  }

  // Verify user has permission (calendar creator or org owner)
  const calendarDoc = await db.collection('calendars').doc(calendarId).get();

  if (!calendarDoc.exists) {
    throw new HttpsError('not-found', 'Calendar not found');
  }

  const calendar = calendarDoc.data() as Calendar;

  const orgDoc = await db.collection('organizations').doc(calendar.organizationId).get();
  const orgData = orgDoc.data();

  if (orgData?.ownerId !== userId && calendar.createdBy !== userId) {
    throw new HttpsError(
      'permission-denied',
      'Only calendar creators or organization owners can view subscribers'
    );
  }

  // Get subscribers
  const snapshot = await db
    .collection('calendar-subscribers')
    .where('calendarId', '==', calendarId)
    .where('unsubscribedAt', '==', null)
    .limit(limitCount)
    .get();

  const subscribers = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    subscribers,
    total: subscribers.length,
  };
});

// ============================================
// FIRESTORE TRIGGERS
// ============================================

/**
 * Send notification when new event is added to subscribed calendar
 */
export const onCalendarEventCreated = onDocumentCreated(
  'calendar-events/{eventId}',
  async (event) => {
    const eventData = event.data?.data();

    if (!eventData) {
      return;
    }

    const calendarId = eventData.calendarId;

    // Get all subscribers who want notifications
    const subscribersSnapshot = await db
      .collection('calendar-subscribers')
      .where('calendarId', '==', calendarId)
      .where('emailNotifications', '==', true)
      .where('unsubscribedAt', '==', null)
      .get();

    if (subscribersSnapshot.empty) {
      console.log('No subscribers to notify');
      return;
    }

    // Get event details
    const eventDoc = await db.collection('events').doc(eventData.eventId).get();

    if (!eventDoc.exists) {
      console.log('Event not found');
      return;
    }

    const fullEvent = eventDoc.data();

    // Get calendar details
    const calendarDoc = await db.collection('calendars').doc(calendarId).get();
    const calendar = calendarDoc.data();

    // Batch notifications (in production, use a queue like Cloud Tasks)
    const notifications: any[] = [];

    subscribersSnapshot.docs.forEach((doc) => {
      const subscriber = doc.data();

      notifications.push({
        type: 'new_calendar_event',
        userId: subscriber.userId,
        calendarId,
        eventId: eventData.eventId,
        data: {
          calendarName: calendar?.name,
          eventTitle: fullEvent?.title,
          eventDate: fullEvent?.startDate,
        },
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    // Store notifications (in production, trigger email sending here)
    const batch = db.batch();
    notifications.forEach((notification) => {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, notification);
    });

    await batch.commit();

    console.log(`Sent ${notifications.length} notifications for new event`);
  }
);
