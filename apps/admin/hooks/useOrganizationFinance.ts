'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Transaction {
  id: string;
  eventId: string;
  eventName: string;
  ticketId: string;
  amount: number;
  fee: number;
  netAmount: number;
  type: 'sale' | 'refund' | 'payout';
  status: 'pending' | 'completed' | 'failed';
  buyerEmail?: string;
  buyerName?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface Payout {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'mobile_money' | 'cash';
  createdAt: Date;
  processedAt?: Date;
  failureReason?: string;
}

export interface FinancialStats {
  totalRevenue: number;
  totalFees: number;
  netRevenue: number;
  pendingPayouts: number;
  completedPayouts: number;
  availableBalance: number;
  totalTransactions: number;
  refundedAmount: number;
}

export function useOrganizationFinance(
  organizationId: string | undefined,
  options?: {
    startDate?: Date;
    endDate?: Date;
    eventId?: string;
  }
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    totalFees: 0,
    netRevenue: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    availableBalance: 0,
    totalTransactions: 0,
    refundedAmount: 0,
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

    // Query tickets to calculate financial data
    const ticketsRef = collection(db, 'tickets');
    let ticketsQuery = query(
      ticketsRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );

    // Add event filter if specified
    if (options?.eventId) {
      ticketsQuery = query(ticketsQuery, where('eventId', '==', options.eventId));
    }

    // Setup real-time listener for tickets
    const unsubscribeTickets = onSnapshot(
      ticketsQuery,
      (snapshot) => {
        try {
          const transactionsList: Transaction[] = [];
          let totalRevenue = 0;
          let totalFees = 0;
          let refundedAmount = 0;

          snapshot.docs.forEach((doc) => {
            const ticket = doc.data();
            const createdAt = ticket.createdAt?.toDate() || new Date();

            // Filter by date range if specified
            if (options?.startDate && createdAt < options.startDate) return;
            if (options?.endDate && createdAt > options.endDate) return;

            const amount = ticket.amount || ticket.price || 0;
            const fee = amount * 0.05; // 5% platform fee
            const netAmount = amount - fee;

            // Add sale transaction
            if (ticket.status === 'confirmed' || ticket.status === 'used') {
              transactionsList.push({
                id: doc.id,
                eventId: ticket.eventId,
                eventName: ticket.eventName || 'Evento Desconhecido',
                ticketId: doc.id,
                amount,
                fee,
                netAmount,
                type: 'sale',
                status: 'completed',
                buyerEmail: ticket.buyerEmail,
                buyerName: ticket.buyerName,
                createdAt,
              });

              totalRevenue += amount;
              totalFees += fee;
            }

            // Add refund transaction
            if (ticket.status === 'refunded') {
              transactionsList.push({
                id: `${doc.id}-refund`,
                eventId: ticket.eventId,
                eventName: ticket.eventName || 'Evento Desconhecido',
                ticketId: doc.id,
                amount: -amount,
                fee: -fee,
                netAmount: -netAmount,
                type: 'refund',
                status: 'completed',
                buyerEmail: ticket.buyerEmail,
                buyerName: ticket.buyerName,
                createdAt: ticket.refundedAt?.toDate() || createdAt,
              });

              refundedAmount += amount;
              totalRevenue -= amount;
              totalFees -= fee;
            }
          });

          setTransactions(transactionsList);

          // Calculate stats
          const netRevenue = totalRevenue - totalFees;

          setStats({
            totalRevenue,
            totalFees,
            netRevenue,
            pendingPayouts: 0, // Will be updated from payouts query
            completedPayouts: 0, // Will be updated from payouts query
            availableBalance: netRevenue,
            totalTransactions: transactionsList.length,
            refundedAmount,
          });

          setLoading(false);
        } catch (err) {
          console.error('Error processing transactions:', err);
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

    // Query payouts
    const payoutsRef = collection(db, 'payouts');
    const payoutsQuery = query(
      payoutsRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribePayouts = onSnapshot(
      payoutsQuery,
      (snapshot) => {
        try {
          const payoutsList: Payout[] = snapshot.docs.map((doc) => {
            const payout = doc.data();
            return {
              id: doc.id,
              amount: payout.amount || 0,
              fee: payout.fee || 0,
              netAmount: payout.netAmount || 0,
              status: payout.status || 'pending',
              method: payout.method || 'bank_transfer',
              createdAt: payout.createdAt?.toDate() || new Date(),
              processedAt: payout.processedAt?.toDate(),
              failureReason: payout.failureReason,
            };
          });

          setPayouts(payoutsList);

          // Update payout stats
          const pendingPayouts = payoutsList
            .filter((p) => p.status === 'pending' || p.status === 'processing')
            .reduce((sum, p) => sum + p.netAmount, 0);

          const completedPayouts = payoutsList
            .filter((p) => p.status === 'completed')
            .reduce((sum, p) => sum + p.netAmount, 0);

          setStats((prev) => ({
            ...prev,
            pendingPayouts,
            completedPayouts,
            availableBalance: prev.netRevenue - pendingPayouts - completedPayouts,
          }));
        } catch (err) {
          console.error('Error processing payouts:', err);
        }
      },
      (err) => {
        console.error('Error listening to payouts:', err);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeTickets();
      unsubscribePayouts();
    };
  }, [organizationId, options?.startDate, options?.endDate, options?.eventId]);

  return { transactions, payouts, stats, loading, error };
}
