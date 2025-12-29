'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Users,
  Bell,
  BellOff,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Sparkles,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth, functions } from '@/lib/firebase';
import type { Calendar, CalendarSubscriber } from '@eventscv/shared-types';

export default function CalendarPage() {
  const params = useParams();
  const router = useRouter();
  const [user, loadingAuth] = useAuthState(auth);

  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<CalendarSubscriber | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (params.slug) {
      loadCalendar(params.slug as string);
    }
  }, [params.slug]);

  useEffect(() => {
    if (calendar && user) {
      checkSubscription();
    }
  }, [calendar, user]);

  const loadCalendar = async (slug: string) => {
    try {
      setIsLoading(true);

      // Get calendar by slug
      const calendarsQuery = query(
        collection(db, 'calendars'),
        where('slug', '==', slug),
        limit(1)
      );

      const snapshot = await getDocs(calendarsQuery);

      if (snapshot.empty) {
        router.push('/404');
        return;
      }

      const calendarData = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as Calendar;

      setCalendar(calendarData);

      // Load events for this calendar
      await loadEvents(calendarData.id);
    } catch (error) {
      console.error('Error loading calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async (calendarId: string) => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('calendarId', '==', calendarId),
        where('status', '==', 'published'),
        orderBy('startDate', 'asc'),
        limit(12)
      );

      const snapshot = await getDocs(eventsQuery);

      const eventsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvents(eventsList);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const checkSubscription = async () => {
    if (!calendar || !user) return;

    try {
      const subsQuery = query(
        collection(db, 'calendar-subscribers'),
        where('calendarId', '==', calendar.id),
        where('userId', '==', user.uid),
        limit(1)
      );

      const snapshot = await getDocs(subsQuery);

      if (!snapshot.empty) {
        const subData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        } as CalendarSubscriber;

        setIsSubscribed(!subData.unsubscribedAt);
        setSubscription(subData);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/calendars/${params.slug}`);
      return;
    }

    if (!calendar) return;

    setIsSubscribing(true);

    try {
      const subscribeFn = httpsCallable<
        { calendarId: string },
        { success: boolean }
      >(functions, 'subscribeToCalendar');

      await subscribeFn({ calendarId: calendar.id });

      setIsSubscribed(true);
      await checkSubscription();
    } catch (error: any) {
      console.error('Error subscribing:', error);
      alert(error.message || 'Erro ao subscrever. Tente novamente.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!calendar) return;

    setIsSubscribing(true);

    try {
      const unsubscribeFn = httpsCallable<
        { calendarId: string },
        { success: boolean }
      >(functions, 'unsubscribeFromCalendar');

      await unsubscribeFn({ calendarId: calendar.id });

      setIsSubscribed(false);
      setSubscription(null);
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      alert(error.message || 'Erro ao cancelar subscrição. Tente novamente.');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">A carregar calendário...</p>
        </div>
      </div>
    );
  }

  if (!calendar) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative">
        {/* Banner Image */}
        <div className="h-80 bg-gradient-to-br from-purple-900 to-zinc-900 relative overflow-hidden">
          {calendar.bannerImage ? (
            <img
              src={calendar.bannerImage}
              alt={calendar.name}
              className="w-full h-full object-cover opacity-40"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <CalendarIcon className="w-32 h-32 text-white/10" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        {/* Calendar Info */}
        <div className="max-w-5xl mx-auto px-6 -mt-40 relative z-10">
          <div className="flex items-start gap-6">
            {/* Cover Image */}
            {calendar.coverImage && (
              <div className="flex-shrink-0">
                <img
                  src={calendar.coverImage}
                  alt={calendar.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-black shadow-2xl"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 pt-8">
              <h1 className="text-4xl font-bold text-white mb-3">{calendar.name}</h1>
              <p className="text-lg text-zinc-300 mb-6 max-w-3xl">{calendar.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">
                    {calendar.subscriberCount || 0} subscritores
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <CalendarIcon className="w-5 h-5" />
                  <span className="font-medium">{calendar.eventCount || 0} eventos</span>
                </div>
              </div>

              {/* Subscribe Button */}
              {isSubscribed ? (
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-green-500">Subscrito</span>
                  </div>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={isSubscribing}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    {isSubscribing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <BellOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-purple-500 hover:bg-purple-600 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      A subscrever...
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5" />
                      Subscrever Calendário
                    </>
                  )}
                </button>
              )}

              {/* Social Links */}
              {(calendar.website ||
                calendar.instagram ||
                calendar.facebook ||
                calendar.twitter) && (
                <div className="flex items-center gap-3 mt-6">
                  {calendar.website && (
                    <a
                      href={calendar.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg transition-colors"
                    >
                      <Globe className="w-5 h-5 text-zinc-400" />
                    </a>
                  )}
                  {calendar.instagram && (
                    <a
                      href={`https://instagram.com/${calendar.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg transition-colors"
                    >
                      <Instagram className="w-5 h-5 text-zinc-400" />
                    </a>
                  )}
                  {calendar.facebook && (
                    <a
                      href={`https://facebook.com/${calendar.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg transition-colors"
                    >
                      <Facebook className="w-5 h-5 text-zinc-400" />
                    </a>
                  )}
                  {calendar.twitter && (
                    <a
                      href={`https://twitter.com/${calendar.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg transition-colors"
                    >
                      <Twitter className="w-5 h-5 text-zinc-400" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-8">Próximos Eventos</h2>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <CalendarIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400">Nenhum evento agendado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => router.push(`/events/${event.id}`)}
                className="group bg-zinc-900 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer"
              >
                {/* Event Image */}
                <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                  {event.coverImage && (
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>

                {/* Event Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-500 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                    {event.shortDescription || event.description}
                  </p>
                  <div className="text-sm text-zinc-500">
                    {event.startDate && new Date(event.startDate.seconds * 1000).toLocaleDateString('pt-PT')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Benefits */}
      {!isSubscribed && (
        <div className="max-w-5xl mx-auto px-6 py-16 border-t border-white/10">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Sparkles className="w-8 h-8 text-purple-500 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Subscreve para receber notificações
                </h3>
                <p className="text-zinc-300 mb-6">
                  Recebe avisos sobre novos eventos, early access a bilhetes e conteúdo exclusivo
                  diretamente no teu email.
                </p>
                <ul className="space-y-2 text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-500" />
                    <span>Notificações de novos eventos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-500" />
                    <span>Early access a bilhetes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span>Conteúdo exclusivo da comunidade</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
