'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Smile,
  MoreVertical,
  Flag,
  Edit,
  Trash2,
  Reply,
  X,
  Loader2,
  Users,
  Ban,
  Shield,
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEventChat } from '@/hooks/useEventChat';
import type { EventChatMessage } from '@eventscv/shared-types';

interface EventChatWindowProps {
  eventId: string;
  roomId?: string;
  isOrganizer?: boolean;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '🎉', '🔥'];

export function EventChatWindow({ eventId, roomId, isOrganizer }: EventChatWindowProps) {
  const [user] = useAuthState(auth);
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState<EventChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<EventChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useEventChat({
    eventId,
    roomId,
    userId: user?.uid,
    messageLimit: 100,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Join room on mount
  useEffect(() => {
    if (user) {
      joinRoom();
    }
  }, [user, joinRoom]);

  // Focus input when replying or editing
  useEffect(() => {
    if ((replyingTo || editingMessage) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo, editingMessage]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);

    try {
      if (editingMessage) {
        await editMessage(editingMessage.id, inputValue);
        setEditingMessage(null);
      } else {
        await sendMessage(inputValue);
      }

      setInputValue('');
      setReplyingTo(null);
    } catch (err) {
      // Error is already handled in the hook
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    await reactToMessage(messageId, emoji);
    setShowEmojiPicker(null);
  };

  const handleDelete = async (messageId: string) => {
    if (confirm('Tens a certeza que queres apagar esta mensagem?')) {
      await deleteMessage(messageId);
    }
  };

  const handleFlag = async (messageId: string) => {
    const reason = prompt('Motivo da denúncia:');
    if (reason) {
      await flagMessage(messageId, reason);
      alert('Mensagem denunciada. Obrigado pelo reporte.');
    }
  };

  const handleMute = async (targetUserId: string, senderName: string) => {
    const durationStr = prompt(`Silenciar ${senderName} por quantos minutos? (ex: 5, 30, 60)`);
    if (!durationStr) return;

    const duration = parseInt(durationStr);
    if (isNaN(duration) || duration <= 0) {
      alert('Duração inválida');
      return;
    }

    const reason = prompt('Motivo do silenciamento:');
    if (!reason) return;

    try {
      await muteUser(targetUserId, duration, reason);
      alert(`${senderName} foi silenciado por ${duration} minutos.`);
    } catch (err) {
      alert('Erro ao silenciar utilizador. Tente novamente.');
    }
  };

  const formatTime = (date: Date | any) => {
    if (!date) return '';

    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);

    return d.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canModerateMessage = (message: EventChatMessage) => {
    return isOrganizer || message.senderId === user?.uid;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-800/50">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-purple-500" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Chat do Evento</h3>
              {isOrganizer && (
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-semibold rounded flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Moderador
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {messages.length} {messages.length === 1 ? 'mensagem' : 'mensagens'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Users className="w-4 h-4" />
          <span>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">Nenhuma mensagem ainda</p>
            <p className="text-xs text-zinc-500 mt-1">Sê o primeiro a começar a conversa!</p>
          </div>
        )}

        {messages.map((message) => {
          const isOwnMessage = message.senderId === user?.uid;
          const isDeleted = message.status === 'deleted';

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.senderAvatar ? (
                  <img
                    src={message.senderAvatar}
                    alt={message.senderName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-purple-500">
                      {message.senderName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Sender Name & Role */}
                <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs font-medium text-white">{message.senderName}</span>
                  {message.senderRole && message.senderRole !== 'attendee' && (
                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-500 text-[10px] font-semibold rounded">
                      {message.senderRole === 'organizer' && 'Organizador'}
                      {message.senderRole === 'moderator' && 'Moderador'}
                      {message.senderRole === 'staff' && 'Staff'}
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-md rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-purple-500 text-white'
                      : 'bg-zinc-800 text-zinc-100'
                  } ${isDeleted ? 'opacity-50 italic' : ''}`}
                >
                  {/* Reply Preview */}
                  {message.replyTo && message.replyPreview && (
                    <div className="mb-2 pb-2 border-b border-white/10">
                      <div className="flex items-center gap-1 text-xs opacity-75">
                        <Reply className="w-3 h-3" />
                        <span>{message.replyPreview.senderName}</span>
                      </div>
                      <p className="text-xs opacity-75 mt-1 line-clamp-1">
                        {message.replyPreview.content}
                      </p>
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {isDeleted ? 'Mensagem apagada' : message.content}
                  </p>

                  {/* Image */}
                  {message.imageUrl && !isDeleted && (
                    <img
                      src={message.imageUrl}
                      alt="Image"
                      className="mt-2 rounded-lg max-w-full"
                    />
                  )}

                  {/* Reactions */}
                  {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(message.reactions).map(([emoji, data]) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(message.id, emoji)}
                          className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 transition-colors ${
                            data.users.includes(user?.uid || '')
                              ? 'bg-purple-500/30 border border-purple-500/50'
                              : 'bg-zinc-700/50 border border-white/5 hover:bg-zinc-700'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px]">{data.count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & Status */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] opacity-60">{formatTime(message.createdAt)}</span>
                    {message.edited && (
                      <span className="text-[10px] opacity-60">(editado)</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!isDeleted && (
                  <div className="flex items-center gap-1 mt-1">
                    {/* Emoji Reaction */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)
                        }
                        className="p-1 hover:bg-zinc-800 rounded transition-colors"
                      >
                        <Smile className="w-3 h-3 text-zinc-400" />
                      </button>

                      {showEmojiPicker === message.id && (
                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-zinc-800 border border-white/10 rounded-lg shadow-xl flex gap-1 z-10">
                          {EMOJI_REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(message.id, emoji)}
                              className="hover:scale-125 transition-transform text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* More Actions */}
                    {canModerateMessage(message) && (
                      <div className="flex items-center gap-1">
                        {isOwnMessage && (
                          <>
                            <button
                              onClick={() => {
                                setEditingMessage(message);
                                setInputValue(message.content);
                              }}
                              className="p-1 hover:bg-zinc-800 rounded transition-colors"
                            >
                              <Edit className="w-3 h-3 text-zinc-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(message.id)}
                              className="p-1 hover:bg-zinc-800 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-zinc-400" />
                            </button>
                          </>
                        )}
                        {!isOwnMessage && !isOrganizer && (
                          <button
                            onClick={() => handleFlag(message.id)}
                            className="p-1 hover:bg-zinc-800 rounded transition-colors"
                          >
                            <Flag className="w-3 h-3 text-zinc-400" />
                          </button>
                        )}
                        {isOrganizer && !isOwnMessage && (
                          <>
                            <button
                              onClick={() => handleDelete(message.id)}
                              className="p-1 hover:bg-zinc-800 rounded transition-colors"
                              title="Apagar mensagem"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                            <button
                              onClick={() => handleMute(message.senderId, message.senderName)}
                              className="p-1 hover:bg-zinc-800 rounded transition-colors"
                              title="Silenciar utilizador"
                            >
                              <Ban className="w-3 h-3 text-orange-400" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-zinc-800/50">
        {/* Replying/Editing Banner */}
        {(replyingTo || editingMessage) && (
          <div className="mb-3 p-2 bg-zinc-700/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              {editingMessage ? (
                <>
                  <Edit className="w-4 h-4 text-purple-500" />
                  <span className="text-zinc-300">A editar mensagem</span>
                </>
              ) : (
                <>
                  <Reply className="w-4 h-4 text-purple-500" />
                  <span className="text-zinc-300">
                    A responder a <strong>{replyingTo?.senderName}</strong>
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => {
                setReplyingTo(null);
                setEditingMessage(null);
                setInputValue('');
              }}
              className="p-1 hover:bg-zinc-600 rounded transition-colors"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        )}

        {/* Input Field */}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={user ? 'Escreve uma mensagem...' : 'Faz login para participar...'}
            disabled={!user || isSending}
            className="flex-1 bg-zinc-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={500}
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !user || isSending}
            className="p-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Character Count */}
        <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
          <span>{inputValue.length}/500</span>
          {!user && (
            <a href="/auth/login" className="text-purple-500 hover:underline">
              Faz login para participar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
