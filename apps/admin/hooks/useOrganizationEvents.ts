'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Event } from '@eventscv/shared-types';

export interface EventWithStats extends Event {
  ticketsSold: number;
  totalCapacity: number;
}

export function useOrganizationEvents(
  organizationId: string | undefined,
  options?: {
    upcomingOnly?: boolean;
    limit?: number;
  }
) {
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const eventsRef = collection(db, 'events');
    let eventsQuery = query(
      eventsRef,
      where('organizationId', '==', organizationId)
    );

    // Add upcoming filter if requested
    if (options?.upcomingOnly) {
      eventsQuery = query(
        eventsQuery,
        where('startDate', '>=', Timestamp.now()),
        orderBy('startDate', 'asc')
      );
    } else {
      eventsQuery = query(eventsQuery, orderBy('startDate', 'desc'));
    }

    // Add limit if specified
    if (options?.limit) {
      eventsQuery = query(eventsQuery, limit(options.limit));
    }

    // Setup real-time listener
    const unsubscribe = onSnapshot(
      eventsQuery,
      async (snapshot) => {
        try {
          // Fetch events with ticket counts
          const eventsWithStats = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const eventData = doc.data();

              // Count sold tickets for this event
              const ticketsRef = collection(db, 'tickets');
              const ticketsQuery = query(
                ticketsRef,
                where('eventId', '==', doc.id),
                where('status', '==', 'confirmed')
              );

              // Use a promise to get ticket count
              const ticketsSnapshot = await new Promise<number>((resolve) => {
                const unsubTickets = onSnapshot(ticketsQuery, (snapshot) => {
                  unsubTickets();
                  resolve(snapshot.size);
                });
              });

              // Convert Firestore Timestamps to Dates
              const convertTimestamps = (data: any) => {
                const converted = { ...data };
                if (converted.startDate?.toDate) converted.startDate = converted.startDate.toDate();
                if (converted.endDate?.toDate) converted.endDate = converted.endDate.toDate();
                if (converted.doorsOpen?.toDate) converted.doorsOpen = converted.doorsOpen.toDate();
                if (converted.publishedAt?.toDate) converted.publishedAt = converted.publishedAt.toDate();
                if (converted.featuredUntil?.toDate) converted.featuredUntil = converted.featuredUntil.toDate();
                if (converted.createdAt?.toDate) converted.createdAt = converted.createdAt.toDate();
                if (converted.updatedAt?.toDate) converted.updatedAt = converted.updatedAt.toDate();
                return converted;
              };

              return {
                id: doc.id,
                ...convertTimestamps(eventData),
                ticketsSold: ticketsSnapshot,
                totalCapacity: eventData.capacity || 0,
              } as EventWithStats;
            })
          );

          setEvents(eventsWithStats);
          setLoading(false);
        } catch (err) {
          console.error('Error processing events:', err);
          setError(err as Error);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to events:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [organizationId, options?.upcomingOnly, options?.limit]);

  return { events, loading, error };
}
