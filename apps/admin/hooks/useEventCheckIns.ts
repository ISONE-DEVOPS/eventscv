'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CheckInRecord {
  id: string;
  ticketId: string;
  buyerName?: string;
  buyerEmail: string;
  ticketTypeName: string;
  qrCode: string;
  checkedInAt: Date;
  checkedInBy: string;
  status: 'success' | 'duplicate';
}

export interface CheckInStats {
  totalCheckIns: number;
  totalTickets: number;
  checkInRate: number;
  recentCheckIns: CheckInRecord[];
}

export function useEventCheckIns(eventId: string | undefined) {
  const [stats, setStats] = useState<CheckInStats>({
    totalCheckIns: 0,
    totalTickets: 0,
    checkInRate: 0,
    recentCheckIns: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Query tickets for this event
    const ticketsRef = collection(db, 'tickets');
    const ticketsQuery = query(
      ticketsRef,
      where('eventId', '==', eventId),
      where('status', 'in', ['confirmed', 'used'])
    );

    // Setup real-time listener
    const unsubscribe = onSnapshot(
      ticketsQuery,
      (snapshot) => {
        try {
          let totalTickets = 0;
          let totalCheckIns = 0;
          const recentCheckIns: CheckInRecord[] = [];

          snapshot.docs.forEach((doc) => {
            const ticket = doc.data();
            totalTickets += ticket.quantity || 1;

            if (ticket.status === 'used') {
              totalCheckIns += ticket.quantity || 1;

              // Add to recent check-ins
              recentCheckIns.push({
                id: doc.id,
                ticketId: doc.id,
                buyerName: ticket.buyerName,
                buyerEmail: ticket.buyerEmail || 'Email desconhecido',
                ticketTypeName: ticket.ticketTypeName || 'Bilhete',
                qrCode: ticket.qrCode || doc.id,
                checkedInAt: ticket.checkedInAt?.toDate() || new Date(),
                checkedInBy: ticket.checkedInBy || '',
                status: 'success',
              });
            }
          });

          // Sort recent check-ins by date (most recent first)
          recentCheckIns.sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime());

          const checkInRate = totalTickets > 0 ? (totalCheckIns / totalTickets) * 100 : 0;

          setStats({
            totalCheckIns,
            totalTickets,
            checkInRate,
            recentCheckIns: recentCheckIns.slice(0, 10), // Keep last 10
          });

          setLoading(false);
        } catch (err) {
          console.error('Error processing check-ins:', err);
          setError(err as Error);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to check-ins:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [eventId]);

  return { stats, loading, error };
}
