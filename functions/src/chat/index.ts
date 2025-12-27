/**
 * Event Chat System
 * Real-time messaging for event attendees
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import type {
  ChatRoom,
  EventChatMessage,
  ChatParticipant,
  MessageFlag,
  MessageType,
  MessageStatus,
} from '../shared-types/chat';

const db = getFirestore();


// ============================================
// CHAT ROOM MANAGEMENT
// ============================================

/**
 * Create a chat room for an event
 */
export const createChatRoom = onCall<{
  eventId: string;
  name: string;
  description?: string;
  type?: 'public' | 'vip' | 'backstage' | 'private';
  allowedTicketTypes?: string[];
  moderationEnabled?: boolean;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const {
    eventId,
    name,
    description,
    type = 'public',
    allowedTicketTypes,
    moderationEnabled = true,
  } = request.data;

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
        'Only event organizers can create chat rooms'
      );
    }
  }

  // Create chat room
  const roomData: Partial<ChatRoom> = {
    eventId,
    name,
    description,
    type,
    allowedTicketTypes,
    requiresApproval: type === 'private',
    allowImages: true,
    allowReactions: true,
    allowReplies: true,
    moderationEnabled,
    moderatorIds: [userId], // Creator is default moderator
    messageCount: 0,
    participantCount: 0,
    isActive: true,
    createdBy: userId,
    createdAt: FieldValue.serverTimestamp(),
  };

  const roomRef = await db.collection('chat-rooms').add(roomData);

  return {
    roomId: roomRef.id,
    success: true,
  };
});

/**
 * Join a chat room
 */
export const joinChatRoom = onCall<{
  roomId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { roomId } = request.data;

  // Get room
  const roomDoc = await db.collection('chat-rooms').doc(roomId).get();

  if (!roomDoc.exists) {
    throw new HttpsError('not-found', 'Chat room not found');
  }

  const room = roomDoc.data() as ChatRoom;

  // Check if user has access
  if (room.type === 'private' && room.allowedUserIds && !room.allowedUserIds.includes(userId)) {
    throw new HttpsError('permission-denied', 'You do not have access to this room');
  }

  // Check if already a participant
  const existing = await db
    .collection('chat-participants')
    .where('roomId', '==', roomId)
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (!existing.empty) {
    // Update online status
    await existing.docs[0].ref.update({
      isOnline: true,
      lastSeen: FieldValue.serverTimestamp(),
    });

    return { success: true, participantId: existing.docs[0].id };
  }

  // Get user info
  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.data();

  // Check ticket access if required
  let role: 'guest' | 'attendee' | 'organizer' | 'staff' | 'moderator' = 'guest';

  if (room.allowedTicketTypes && room.allowedTicketTypes.length > 0) {
    const ticket = await db
      .collection('tickets')
      .where('eventId', '==', room.eventId)
      .where('userId', '==', userId)
      .where('status', 'in', ['valid', 'active'])
      .limit(1)
      .get();

    if (ticket.empty) {
      throw new HttpsError('permission-denied', 'You need a ticket to join this room');
    }

    role = 'attendee';
  }

  // Check if moderator
  if (room.moderatorIds.includes(userId)) {
    role = 'moderator';
  }

  // Create participant
  const participantData: Partial<ChatParticipant> = {
    roomId,
    eventId: room.eventId,
    userId,
    userName: user?.name || 'Guest',
    userAvatar: user?.avatarUrl,
    role,
    canSendMessages: true,
    canSendImages: room.allowImages,
    canModerate: role === 'moderator',
    isOnline: true,
    isMuted: false,
    isBanned: false,
    messagesSent: 0,
    joinedAt: FieldValue.serverTimestamp(),
  };

  const participantRef = await db.collection('chat-participants').add(participantData);

  // Increment participant count
  await roomDoc.ref.update({
    participantCount: FieldValue.increment(1),
  });

  return {
    success: true,
    participantId: participantRef.id,
    role,
  };
});

/**
 * Leave a chat room
 */
export const leaveChatRoom = onCall<{
  roomId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { roomId } = request.data;

  // Find participant
  const participant = await db
    .collection('chat-participants')
    .where('roomId', '==', roomId)
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (participant.empty) {
    return { success: true }; // Already not in room
  }

  // Update status
  await participant.docs[0].ref.update({
    isOnline: false,
    leftAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});

// ============================================
// MESSAGE SENDING & MANAGEMENT
// ============================================

/**
 * Send a message to chat room
 */
export const sendChatMessage = onCall<{
  roomId: string;
  content: string;
  type?: MessageType;
  imageUrl?: string;
  replyTo?: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { roomId, content, type = 'text', imageUrl, replyTo } = request.data;

  // Get room
  const roomDoc = await db.collection('chat-rooms').doc(roomId).get();

  if (!roomDoc.exists) {
    throw new HttpsError('not-found', 'Chat room not found');
  }

  const room = roomDoc.data() as ChatRoom;

  // Get participant
  const participantSnapshot = await db
    .collection('chat-participants')
    .where('roomId', '==', roomId)
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (participantSnapshot.empty) {
    throw new HttpsError('permission-denied', 'You must join the room first');
  }

  const participant = participantSnapshot.docs[0].data() as ChatParticipant;

  // Check permissions
  if (!participant.canSendMessages) {
    throw new HttpsError('permission-denied', 'You do not have permission to send messages');
  }

  if (participant.isMuted) {
    throw new HttpsError('permission-denied', 'You are muted in this room');
  }

  if (participant.isBanned) {
    throw new HttpsError('permission-denied', 'You are banned from this room');
  }

  // Check slow mode
  if (room.slowMode && participant.lastMessageAt) {
    const lastMessageTime = (participant.lastMessageAt as Timestamp).toMillis();
    const now = Date.now();
    const timeSince = (now - lastMessageTime) / 1000;

    if (timeSince < room.slowMode) {
      const waitTime = Math.ceil(room.slowMode - timeSince);
      throw new HttpsError(
        'resource-exhausted',
        `Slow mode: wait ${waitTime} seconds before sending another message`
      );
    }
  }

  // Auto-moderation
  let flagged = false;
  if (room.moderationEnabled && room.autoModerateKeywords) {
    const lowerContent = content.toLowerCase();
    flagged = room.autoModerateKeywords.some((keyword) =>
      lowerContent.includes(keyword.toLowerCase())
    );
  }

  // Get reply preview if replying
  let replyPreview: { senderName: string; content: string } | undefined;
  if (replyTo) {
    const replyDoc = await db.collection('chat-messages').doc(replyTo).get();
    if (replyDoc.exists) {
      const replyData = replyDoc.data() as EventChatMessage;
      replyPreview = {
        senderName: replyData.senderName,
        content: replyData.content.substring(0, 100), // Preview first 100 chars
      };
    }
  }

  // Create message
  const messageData: Partial<EventChatMessage> = {
    eventId: room.eventId,
    roomId,
    senderId: userId,
    senderName: participant.userName,
    senderAvatar: participant.userAvatar,
    senderRole: participant.role,
    type,
    content,
    imageUrl,
    status: 'sent' as MessageStatus,
    edited: false,
    replyTo,
    replyPreview,
    flagged,
    flagCount: 0,
    createdAt: FieldValue.serverTimestamp(),
  };

  const messageRef = await db.collection('chat-messages').add(messageData);

  // Update room and participant stats
  await roomDoc.ref.update({
    messageCount: FieldValue.increment(1),
  });

  await participantSnapshot.docs[0].ref.update({
    messagesSent: FieldValue.increment(1),
    lastMessageAt: FieldValue.serverTimestamp(),
  });

  return {
    messageId: messageRef.id,
    success: true,
  };
});

/**
 * Edit a message
 */
export const editChatMessage = onCall<{
  messageId: string;
  newContent: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { messageId, newContent } = request.data;

  const messageDoc = await db.collection('chat-messages').doc(messageId).get();

  if (!messageDoc.exists) {
    throw new HttpsError('not-found', 'Message not found');
  }

  const message = messageDoc.data() as EventChatMessage;

  // Only sender can edit
  if (message.senderId !== userId) {
    throw new HttpsError('permission-denied', 'You can only edit your own messages');
  }

  // Update message
  await messageDoc.ref.update({
    content: newContent,
    edited: true,
    editedAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * Delete a message
 */
export const deleteChatMessage = onCall<{
  messageId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { messageId } = request.data;

  const messageDoc = await db.collection('chat-messages').doc(messageId).get();

  if (!messageDoc.exists) {
    throw new HttpsError('not-found', 'Message not found');
  }

  const message = messageDoc.data() as EventChatMessage;

  // Check if user is sender or moderator
  const isSender = message.senderId === userId;
  let isModerator = false;

  if (!isSender) {
    const participantSnapshot = await db
      .collection('chat-participants')
      .where('roomId', '==', message.roomId)
      .where('userId', '==', userId)
      .where('canModerate', '==', true)
      .limit(1)
      .get();

    isModerator = !participantSnapshot.empty;
  }

  if (!isSender && !isModerator) {
    throw new HttpsError(
      'permission-denied',
      'You can only delete your own messages or messages as a moderator'
    );
  }

  // Soft delete
  await messageDoc.ref.update({
    status: 'deleted',
    content: '[Message deleted]',
    moderatedBy: isModerator ? userId : undefined,
    moderatedAt: isModerator ? FieldValue.serverTimestamp() : undefined,
  });

  return { success: true };
});

/**
 * React to a message
 */
export const reactToMessage = onCall<{
  messageId: string;
  emoji: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { messageId, emoji } = request.data;

  const messageDoc = await db.collection('chat-messages').doc(messageId).get();

  if (!messageDoc.exists) {
    throw new HttpsError('not-found', 'Message not found');
  }

  const message = messageDoc.data() as EventChatMessage;
  const reactions = message.reactions || {};

  if (reactions[emoji]) {
    // Toggle reaction
    if (reactions[emoji].users.includes(userId)) {
      // Remove reaction
      reactions[emoji].users = reactions[emoji].users.filter((id) => id !== userId);
      reactions[emoji].count = reactions[emoji].users.length;

      if (reactions[emoji].count === 0) {
        delete reactions[emoji];
      }
    } else {
      // Add reaction
      reactions[emoji].users.push(userId);
      reactions[emoji].count = reactions[emoji].users.length;
    }
  } else {
    // New reaction
    reactions[emoji] = {
      count: 1,
      users: [userId],
    };
  }

  await messageDoc.ref.update({ reactions });

  return { success: true };
});

/**
 * Flag a message
 */
export const flagMessage = onCall<{
  messageId: string;
  reason: 'spam' | 'harassment' | 'offensive' | 'inappropriate' | 'other';
  details?: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { messageId, reason, details } = request.data;

  const messageDoc = await db.collection('chat-messages').doc(messageId).get();

  if (!messageDoc.exists) {
    throw new HttpsError('not-found', 'Message not found');
  }

  const message = messageDoc.data() as EventChatMessage;

  // Get reporter info
  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.data();

  // Create flag
  const flagData: Partial<MessageFlag> = {
    messageId,
    eventId: message.eventId,
    roomId: message.roomId,
    reportedBy: userId,
    reporterName: user?.name || 'Anonymous',
    reason,
    details,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
  };

  await db.collection('message-flags').add(flagData);

  // Increment flag count on message
  await messageDoc.ref.update({
    flagged: true,
    flagCount: FieldValue.increment(1),
  });

  return { success: true };
});

// ============================================
// MODERATION
// ============================================

/**
 * Mute a user in a room
 */
export const muteUser = onCall<{
  roomId: string;
  targetUserId: string;
  durationMinutes?: number;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { roomId, targetUserId, durationMinutes } = request.data;

  // Check moderator permission
  const moderator = await db
    .collection('chat-participants')
    .where('roomId', '==', roomId)
    .where('userId', '==', userId)
    .where('canModerate', '==', true)
    .limit(1)
    .get();

  if (moderator.empty) {
    throw new HttpsError('permission-denied', 'Only moderators can mute users');
  }

  // Find target user
  const targetParticipant = await db
    .collection('chat-participants')
    .where('roomId', '==', roomId)
    .where('userId', '==', targetUserId)
    .limit(1)
    .get();

  if (targetParticipant.empty) {
    throw new HttpsError('not-found', 'User not found in room');
  }

  const mutedUntil = durationMinutes
    ? new Date(Date.now() + durationMinutes * 60 * 1000)
    : null;

  await targetParticipant.docs[0].ref.update({
    isMuted: true,
    mutedUntil,
  });

  return { success: true };
});

/**
 * Unmute a user
 */
export const unmuteUser = onCall<{
  roomId: string;
  targetUserId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { roomId, targetUserId } = request.data;

  // Check moderator permission
  const moderator = await db
    .collection('chat-participants')
    .where('roomId', '==', roomId)
    .where('userId', '==', userId)
    .where('canModerate', '==', true)
    .limit(1)
    .get();

  if (moderator.empty) {
    throw new HttpsError('permission-denied', 'Only moderators can unmute users');
  }

  // Find target user
  const targetParticipant = await db
    .collection('chat-participants')
    .where('roomId', '==', roomId)
    .where('userId', '==', targetUserId)
    .limit(1)
    .get();

  if (targetParticipant.empty) {
    throw new HttpsError('not-found', 'User not found in room');
  }

  await targetParticipant.docs[0].ref.update({
    isMuted: false,
    mutedUntil: null,
  });

  return { success: true };
});

// ============================================
// FIRESTORE TRIGGERS
// ============================================

/**
 * Auto-create default chat room when event is published
 */
export const onEventPublished = onDocumentWritten('events/{eventId}', async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();

  // Check if event was just published
  if (beforeData?.status !== 'published' && afterData?.status === 'published') {
    const eventId = event.params.eventId;

    // Check if main chat room already exists
    const existing = await db
      .collection('chat-rooms')
      .where('eventId', '==', eventId)
      .where('type', '==', 'public')
      .where('name', '==', 'General Chat')
      .limit(1)
      .get();

    if (existing.empty) {
      // Create default public chat room
      await db.collection('chat-rooms').add({
        eventId,
        name: 'General Chat',
        description: 'Main chat for all attendees',
        type: 'public',
        requiresApproval: false,
        allowImages: true,
        allowReactions: true,
        allowReplies: true,
        moderationEnabled: true,
        moderatorIds: [afterData?.createdBy],
        messageCount: 0,
        participantCount: 0,
        isActive: true,
        createdBy: 'system',
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }
});
