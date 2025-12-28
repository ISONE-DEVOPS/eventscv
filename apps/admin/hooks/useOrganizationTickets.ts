'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface TicketWithDetails {
  id: string;
  eventId: string;
  eventName: string;
  ticketTypeId: string;
  ticketTypeName: string;
  qrCode: string;
  buyerEmail: string;
  buyerName?: string;
  buyerPhone?: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'used';
  quantity: number;
  amount: number;
  purchasedAt: Date;
  usedAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
}

export interface TicketStats {
  totalSold: number;
  totalRevenue: number;
  checkedIn: number;
  pending: number;
  cancelled: number;
  refunded: number;
}

export function useOrganizationTickets(
  organizationId: string | undefined,
  options?: {
    status?: string;
    eventId?: string;
    limit?: number;
  }
) {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    totalSold: 0,
    totalRevenue: 0,
    checkedIn: 0,
    pending: 0,
    cancelled: 0,
    refunded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const ticketsRef = collection(db, 'tickets');
    let ticketsQuery = query(
      ticketsRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );

    // Add status filter if specified
    if (options?.status) {
      ticketsQuery = query(ticketsQuery, where('status', '==', options.status));
    }

    // Add event filter if specified
    if (options?.eventId) {
      ticketsQuery = query(ticketsQuery, where('eventId', '==', options.eventId));
    }

    // Add limit if specified
    if (options?.limit) {
      ticketsQuery = query(ticketsQuery, limit(options.limit));
    }

    // Setup real-time listener
    const unsubscribe = onSnapshot(
      ticketsQuery,
      async (snapshot) => {
        try {
          // Fetch tickets with event details
          const ticketsWithDetails = await Promise.all(
            snapshot.docs.map(async (ticketDoc) => {
              const ticket = ticketDoc.data();

              // Get event name
              let eventName = 'Evento Desconhecido';
              try {
                const eventRef = doc(db, 'events', ticket.eventId);
                const eventDoc = await getDoc(eventRef);
                if (eventDoc.exists()) {
                  eventName = eventDoc.data().title || eventName;
                }
              } catch (err) {
                console.error('Error fetching event:', err);
              }

              return {
                id: ticketDoc.id,
                eventId: ticket.eventId,
                eventName,
                ticketTypeId: ticket.ticketTypeId || '',
                ticketTypeName: ticket.ticketTypeName || 'Bilhete',
                qrCode: ticket.qrCode || ticketDoc.id,
                buyerEmail: ticket.buyerEmail || 'Email desconhecido',
                buyerName: ticket.buyerName,
                buyerPhone: ticket.buyerPhone,
                price: ticket.price || ticket.amount || 0,
                status: ticket.status || 'pending',
                quantity: ticket.quantity || 1,
                amount: ticket.amount || 0,
                purchasedAt: ticket.createdAt?.toDate() || new Date(),
                usedAt: ticket.usedAt?.toDate(),
                cancelledAt: ticket.cancelledAt?.toDate(),
                refundedAt: ticket.refundedAt?.toDate(),
              } as TicketWithDetails;
            })
          );

          // Calculate stats
          const newStats: TicketStats = {
            totalSold: 0,
            totalRevenue: 0,
            checkedIn: 0,
            pending: 0,
            cancelled: 0,
            refunded: 0,
          };

          ticketsWithDetails.forEach((ticket) => {
            if (ticket.status === 'confirmed' || ticket.status === 'used') {
              newStats.totalSold += ticket.quantity;
              newStats.totalRevenue += ticket.amount;
            }
            if (ticket.status === 'used') {
              newStats.checkedIn += ticket.quantity;
            }
            if (ticket.status === 'pending') {
              newStats.pending += ticket.quantity;
            }
            if (ticket.status === 'cancelled') {
              newStats.cancelled += ticket.quantity;
            }
            if (ticket.status === 'refunded') {
              newStats.refunded += ticket.quantity;
            }
          });

          setTickets(ticketsWithDetails);
          setStats(newStats);
          setLoading(false);
        } catch (err) {
          console.error('Error processing tickets:', err);
          setError(err as Error);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to tickets:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [organizationId, options?.status, options?.eventId, options?.limit]);

  return { tickets, stats, loading, error };
}
