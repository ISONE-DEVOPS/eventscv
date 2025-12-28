'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface RecentSale {
  id: string;
  eventId: string;
  eventTitle: string;
  buyerEmail: string;
  ticketCount: number;
  amount: number;
  createdAt: Date;
  timeAgo: string;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

export function useRecentSales(
  organizationId: string | undefined,
  limitCount: number = 10,
  onNewSale?: (sale: RecentSale) => void
) {
  const [sales, setSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const previousSalesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Query tickets (orders)
    const ticketsRef = collection(db, 'tickets');
    const ticketsQuery = query(
      ticketsRef,
      where('organizationId', '==', organizationId),
      where('status', '==', 'confirmed'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Setup real-time listener
    const unsubscribe = onSnapshot(
      ticketsQuery,
      async (snapshot) => {
        try {
          // Fetch event titles
          const salesData = await Promise.all(
            snapshot.docs.map(async (ticketDoc) => {
              const ticket = ticketDoc.data();

              // Get event title
              let eventTitle = 'Evento Desconhecido';
              try {
                const eventRef = doc(db, 'events', ticket.eventId);
                const eventDoc = await getDoc(eventRef);
                if (eventDoc.exists()) {
                  eventTitle = eventDoc.data().title || eventTitle;
                }
              } catch (err) {
                console.error('Error fetching event:', err);
              }

              return {
                id: ticketDoc.id,
                eventId: ticket.eventId,
                eventTitle,
                buyerEmail: ticket.buyerEmail || 'Email desconhecido',
                ticketCount: ticket.quantity || 1,
                amount: ticket.amount || 0,
                createdAt: ticket.createdAt?.toDate() || new Date(),
                timeAgo: getTimeAgo(ticket.createdAt?.toDate() || new Date()),
              } as RecentSale;
            })
          );

          // Detect new sales and trigger callback
          if (!loading && onNewSale) {
            salesData.forEach((sale) => {
              if (!previousSalesRef.current.has(sale.id)) {
                onNewSale(sale);
              }
            });
          }

          // Update previous sales reference
          previousSalesRef.current = new Set(salesData.map((sale) => sale.id));

          setSales(salesData);
          setLoading(false);
        } catch (err) {
          console.error('Error processing sales:', err);
          setError(err as Error);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to sales:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [organizationId, limitCount]);

  return { sales, loading, error };
}
