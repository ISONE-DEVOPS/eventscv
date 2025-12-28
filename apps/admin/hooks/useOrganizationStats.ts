'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface OrganizationStats {
  totalEvents: number;
  activeEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  pendingPayout: number;
  growthEvents: number;
  growthTickets: number;
  growthRevenue: number;
}

export function useOrganizationStats(organizationId: string | undefined) {
  const [stats, setStats] = useState<OrganizationStats>({
    totalEvents: 0,
    activeEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    pendingPayout: 0,
    growthEvents: 0,
    growthTickets: 0,
    growthRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current month dates
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Query events
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(
          eventsRef,
          where('organizationId', '==', organizationId)
        );
        const eventsSnapshot = await getDocs(eventsQuery);

        let totalEvents = 0;
        let activeEvents = 0;
        let eventsThisMonth = 0;
        let eventsLastMonth = 0;

        const now_timestamp = Timestamp.now();

        eventsSnapshot.forEach((doc) => {
          const event = doc.data();
          totalEvents++;

          // Check if event is active (published and not ended)
          if (event.status === 'published' && event.endDate?.toDate() > now) {
            activeEvents++;
          }

          // Count events created this month
          if (event.createdAt?.toDate() >= firstDayThisMonth) {
            eventsThisMonth++;
          }

          // Count events created last month
          if (
            event.createdAt?.toDate() >= firstDayLastMonth &&
            event.createdAt?.toDate() <= lastDayLastMonth
          ) {
            eventsLastMonth++;
          }
        });

        // Query tickets
        const ticketsRef = collection(db, 'tickets');
        const ticketsQuery = query(
          ticketsRef,
          where('organizationId', '==', organizationId),
          where('status', '==', 'confirmed')
        );
        const ticketsSnapshot = await getDocs(ticketsQuery);

        let totalTicketsSold = 0;
        let totalRevenue = 0;
        let ticketsThisMonth = 0;
        let ticketsLastMonth = 0;
        let revenueThisMonth = 0;
        let revenueLastMonth = 0;

        ticketsSnapshot.forEach((doc) => {
          const ticket = doc.data();
          totalTicketsSold++;
          totalRevenue += ticket.amount || 0;

          // Count tickets sold this month
          if (ticket.createdAt?.toDate() >= firstDayThisMonth) {
            ticketsThisMonth++;
            revenueThisMonth += ticket.amount || 0;
          }

          // Count tickets sold last month
          if (
            ticket.createdAt?.toDate() >= firstDayLastMonth &&
            ticket.createdAt?.toDate() <= lastDayLastMonth
          ) {
            ticketsLastMonth++;
            revenueLastMonth += ticket.amount || 0;
          }
        });

        // Query payouts to get pending amount
        const payoutsRef = collection(db, 'payouts');
        const payoutsQuery = query(
          payoutsRef,
          where('organizationId', '==', organizationId),
          where('status', 'in', ['pending', 'processing'])
        );
        const payoutsSnapshot = await getDocs(payoutsQuery);

        let pendingPayout = 0;
        payoutsSnapshot.forEach((doc) => {
          const payout = doc.data();
          pendingPayout += payout.amount || 0;
        });

        // Calculate growth percentages
        const growthEvents =
          eventsLastMonth > 0
            ? ((eventsThisMonth - eventsLastMonth) / eventsLastMonth) * 100
            : eventsThisMonth > 0
            ? 100
            : 0;

        const growthTickets =
          ticketsLastMonth > 0
            ? ((ticketsThisMonth - ticketsLastMonth) / ticketsLastMonth) * 100
            : ticketsThisMonth > 0
            ? 100
            : 0;

        const growthRevenue =
          revenueLastMonth > 0
            ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
            : revenueThisMonth > 0
            ? 100
            : 0;

        setStats({
          totalEvents,
          activeEvents,
          totalTicketsSold,
          totalRevenue,
          pendingPayout,
          growthEvents: Math.round(growthEvents * 10) / 10,
          growthTickets: Math.round(growthTickets * 10) / 10,
          growthRevenue: Math.round(growthRevenue * 10) / 10,
        });
      } catch (err) {
        console.error('Error fetching organization stats:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [organizationId, refreshKey]);

  const refresh = () => setRefreshKey((prev) => prev + 1);

  return { stats, loading, error, refresh };
}
