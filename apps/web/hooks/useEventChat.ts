import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import type { EventChatMessage } from '@eventscv/shared-types';

interface UseEventChatOptions {
  eventId: string;
  roomId?: string;
  userId?: string;
  messageLimit?: number;
}

interface UseEventChatReturn {
  messages: EventChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, imageUrl?: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  flagMessage: (messageId: string, reason: string) => Promise<void>;
  muteUser: (targetUserId: string, durationMinutes: number, reason: string) => Promise<void>;
  unmuteUser: (targetUserId: string) => Promise<void>;
  joinRoom: () => Promise<void>;
  leaveRoom: () => Promise<void>;
}

export function useEventChat({
  eventId,
  roomId,
  userId,
  messageLimit = 100,
}: UseEventChatOptions): UseEventChatReturn {
  const [messages, setMessages] = useState<EventChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Real-time listener for messages
  useEffect(() => {
    if (!eventId) return;

    setIsLoading(true);
    setError(null);

    // Build query
    let messagesQuery = query(
      collection(db, 'chat-messages'),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc'),
      limit(messageLimit)
    );

    // Filter by room if specified
    if (roomId) {
      messagesQuery = query(
        collection(db, 'chat-messages'),
        where('eventId', '==', eventId),
        where('roomId', '==', roomId),
        orderBy('createdAt', 'desc'),
        limit(messageLimit)
      );
    }

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        if (!isMountedRef.current) return;

        const messagesList: EventChatMessage[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            editedAt: data.editedAt instanceof Timestamp ? data.editedAt.toDate() : data.editedAt,
          } as EventChatMessage;
        });

        // Reverse to show oldest first
        setMessages(messagesList.reverse());
        setIsLoading(false);
      },
      (err) => {
        console.error('Error loading messages:', err);
        if (isMountedRef.current) {
          setError('Erro ao carregar mensagens');
          setIsLoading(false);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [eventId, roomId, messageLimit]);

  // Join chat room
  const joinRoom = useCallback(async () => {
    if (!userId || hasJoined) return;

    try {
      const joinFn = httpsCallable<
        { eventId: string; roomId?: string },
        { success: boolean; participantId: string }
      >(functions, 'joinChatRoom');

      await joinFn({ eventId, roomId });
      setHasJoined(true);
    } catch (err: any) {
      console.error('Error joining room:', err);
      setError(err.message || 'Erro ao entrar no chat');
    }
  }, [eventId, roomId, userId, hasJoined]);

  // Leave chat room
  const leaveRoom = useCallback(async () => {
    if (!userId || !hasJoined) return;

    try {
      const leaveFn = httpsCallable<
        { eventId: string; roomId?: string },
        { success: boolean }
      >(functions, 'leaveChatRoom');

      await leaveFn({ eventId, roomId });
      setHasJoined(false);
    } catch (err: any) {
      console.error('Error leaving room:', err);
    }
  }, [eventId, roomId, userId, hasJoined]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, imageUrl?: string) => {
      if (!content.trim() && !imageUrl) return;
      if (!userId) {
        setError('Precisas de fazer login para enviar mensagens');
        return;
      }

      try {
        const sendFn = httpsCallable<
          {
            eventId: string;
            roomId?: string;
            content: string;
            imageUrl?: string;
            type?: 'text' | 'image';
          },
          { messageId: string; success: boolean }
        >(functions, 'sendChatMessage');

        await sendFn({
          eventId,
          roomId,
          content: content.trim(),
          imageUrl,
          type: imageUrl ? 'image' : 'text',
        });

        // Message will appear automatically via real-time listener
      } catch (err: any) {
        console.error('Error sending message:', err);
        setError(err.message || 'Erro ao enviar mensagem');
        throw err;
      }
    },
    [eventId, roomId, userId]
  );

  // Edit message
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!newContent.trim()) return;
      if (!userId) return;

      try {
        const editFn = httpsCallable<
          { messageId: string; newContent: string },
          { success: boolean }
        >(functions, 'editChatMessage');

        await editFn({ messageId, newContent: newContent.trim() });

        // Update will appear automatically via real-time listener
      } catch (err: any) {
        console.error('Error editing message:', err);
        setError(err.message || 'Erro ao editar mensagem');
        throw err;
      }
    },
    [userId]
  );

  // Delete message
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!userId) return;

      try {
        const deleteFn = httpsCallable<
          { messageId: string },
          { success: boolean }
        >(functions, 'deleteChatMessage');

        await deleteFn({ messageId });

        // Update will appear automatically via real-time listener
      } catch (err: any) {
        console.error('Error deleting message:', err);
        setError(err.message || 'Erro ao apagar mensagem');
        throw err;
      }
    },
    [userId]
  );

  // React to message
  const reactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      if (!userId) return;

      try {
        const reactFn = httpsCallable<
          { messageId: string; emoji: string },
          { success: boolean }
        >(functions, 'reactToMessage');

        await reactFn({ messageId, emoji });

        // Update will appear automatically via real-time listener
      } catch (err: any) {
        console.error('Error reacting to message:', err);
        setError(err.message || 'Erro ao reagir');
        throw err;
      }
    },
    [userId]
  );

  // Flag message
  const flagMessage = useCallback(
    async (messageId: string, reason: string) => {
      if (!userId) return;

      try {
        const flagFn = httpsCallable<
          { messageId: string; reason: string },
          { success: boolean }
        >(functions, 'flagMessage');

        await flagFn({ messageId, reason });
      } catch (err: any) {
        console.error('Error flagging message:', err);
        setError(err.message || 'Erro ao denunciar mensagem');
        throw err;
      }
    },
    [userId]
  );

  // Mute user (organizer only)
  const muteUser = useCallback(
    async (targetUserId: string, durationMinutes: number, reason: string) => {
      if (!userId) return;

      try {
        const muteFn = httpsCallable<
          { eventId: string; userId: string; durationMinutes: number; reason: string },
          { success: boolean }
        >(functions, 'muteUser');

        await muteFn({ eventId, userId: targetUserId, durationMinutes, reason });
      } catch (err: any) {
        console.error('Error muting user:', err);
        setError(err.message || 'Erro ao silenciar utilizador');
        throw err;
      }
    },
    [userId, eventId]
  );

  // Unmute user (organizer only)
  const unmuteUser = useCallback(
    async (targetUserId: string) => {
      if (!userId) return;

      try {
        const unmuteFn = httpsCallable<
          { eventId: string; userId: string },
          { success: boolean }
        >(functions, 'unmuteUser');

        await unmuteFn({ eventId, userId: targetUserId });
      } catch (err: any) {
        console.error('Error unmuting user:', err);
        setError(err.message || 'Erro ao remover silêncio');
        throw err;
      }
    },
    [userId, eventId]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    flagMessage,
    muteUser,
    unmuteUser,
    joinRoom,
    leaveRoom,
  };
}
