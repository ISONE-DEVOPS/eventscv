/**
 * Order Creation and Management
 *
 * Handles order creation before payment processing
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface OrderTicket {
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  currency: string;
  quantity: number;
}

interface CreateOrderRequest {
  eventId: string;
  tickets: OrderTicket[];
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}

/**
 * Create Order
 * Creates a pending order before payment processing
 */
export const createOrder = onCall(
  { region: 'europe-west1' },
  async (request: CallableRequest<CreateOrderRequest>) => {
    // Verify authentication
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'User must be authenticated to create order'
      );
    }

    const { eventId, tickets, buyerName, buyerEmail, buyerPhone } = request.data;

    try {
      // Validate event exists
      const eventDoc = await db.collection('events').doc(eventId).get();
      if (!eventDoc.exists) {
        throw new HttpsError('not-found', 'Event not found');
      }

      const eventData = eventDoc.data();

      // Validate ticket availability
      for (const ticket of tickets) {
        const ticketTypeDoc = await db
          .collection('events')
          .doc(eventId)
          .collection('ticketTypes')
          .doc(ticket.ticketTypeId)
          .get();

        if (!ticketTypeDoc.exists) {
          throw new HttpsError(
            'not-found',
            `Ticket type ${ticket.ticketTypeName} not found`
          );
        }

        const ticketTypeData = ticketTypeDoc.data();
        const available = ticketTypeData?.available || 0;

        if (available < ticket.quantity) {
          throw new HttpsError(
            'resource-exhausted',
            `Insufficient tickets available for ${ticket.ticketTypeName}`
          );
        }
      }

      // Calculate total
      const total = tickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0);

      // Create order
      const orderRef = db.collection('orders').doc();
      const orderData = {
        orderId: orderRef.id,
        eventId,
        eventTitle: eventData?.title || 'Event',
        userId: request.auth.uid,
        tickets,
        total,
        currency: tickets[0]?.currency || 'CVE',
        buyerName,
        buyerEmail,
        buyerPhone,
        paymentStatus: 'pending',
        paymentMethod: null,
        paymentProvider: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 30 * 60 * 1000) // 30 minutes expiration
        ),
      };

      await orderRef.set(orderData);

      // Reserve tickets (temporary hold)
      const batch = db.batch();
      for (const ticket of tickets) {
        const ticketTypeRef = db
          .collection('events')
          .doc(eventId)
          .collection('ticketTypes')
          .doc(ticket.ticketTypeId);

        batch.update(ticketTypeRef, {
          available: admin.firestore.FieldValue.increment(-ticket.quantity),
          reserved: admin.firestore.FieldValue.increment(ticket.quantity),
        });
      }
      await batch.commit();

      // Log order creation
      await db.collection('order-logs').add({
        orderId: orderRef.id,
        eventId,
        userId: request.auth.uid,
        action: 'created',
        total,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        orderId: orderRef.id,
        total,
        currency: orderData.currency,
      };
    } catch (error: any) {
      console.error('Error creating order:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', 'Failed to create order');
    }
  }
);

/**
 * Cancel Order
 * Cancels a pending order and releases reserved tickets
 */
export const cancelOrder = onCall(
  { region: 'europe-west1' },
  async (request: CallableRequest<{ orderId: string }>) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { orderId } = request.data;

    try {
      const orderDoc = await db.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        throw new HttpsError('not-found', 'Order not found');
      }

      const orderData = orderDoc.data();
      if (orderData?.userId !== request.auth.uid) {
        throw new HttpsError(
          'permission-denied',
          'Order does not belong to user'
        );
      }

      if (orderData?.paymentStatus !== 'pending') {
        throw new HttpsError(
          'failed-precondition',
          'Cannot cancel non-pending order'
        );
      }

      // Release reserved tickets
      const batch = db.batch();
      for (const ticket of orderData.tickets) {
        const ticketTypeRef = db
          .collection('events')
          .doc(orderData.eventId)
          .collection('ticketTypes')
          .doc(ticket.ticketTypeId);

        batch.update(ticketTypeRef, {
          available: admin.firestore.FieldValue.increment(ticket.quantity),
          reserved: admin.firestore.FieldValue.increment(-ticket.quantity),
        });
      }

      // Update order status
      batch.update(db.collection('orders').doc(orderId), {
        paymentStatus: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();

      // Log cancellation
      await db.collection('order-logs').add({
        orderId,
        eventId: orderData.eventId,
        userId: request.auth.uid,
        action: 'cancelled',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error cancelling order:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', 'Failed to cancel order');
    }
  }
);

/**
 * Get Order
 * Retrieves order details
 */
export const getOrder = onCall(
  { region: 'europe-west1' },
  async (request: CallableRequest<{ orderId: string }>) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { orderId } = request.data;

    try {
      const orderDoc = await db.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        throw new HttpsError('not-found', 'Order not found');
      }

      const orderData = orderDoc.data();
      if (orderData?.userId !== request.auth.uid) {
        throw new HttpsError(
          'permission-denied',
          'Order does not belong to user'
        );
      }

      return {
        orderId,
        ...orderData,
      };
    } catch (error: any) {
      console.error('Error getting order:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', 'Failed to get order');
    }
  }
);

/**
 * Scheduled function to release expired order reservations
 */
export const releaseExpiredOrders = onSchedule(
  {
    schedule: 'every 5 minutes',
    region: 'europe-west1',
  },
  async () => {
    const now = admin.firestore.Timestamp.now();

    // Find expired orders
    const expiredOrders = await db
      .collection('orders')
      .where('paymentStatus', '==', 'pending')
      .where('expiresAt', '<=', now)
      .get();

    console.log(`Found ${expiredOrders.size} expired orders`);

    // Process each expired order
    const promises = expiredOrders.docs.map(async (orderDoc) => {
      const orderData = orderDoc.data();
      const orderId = orderDoc.id;

      try {
        // Release reserved tickets
        const batch = db.batch();
        for (const ticket of orderData.tickets) {
          const ticketTypeRef = db
            .collection('events')
            .doc(orderData.eventId)
            .collection('ticketTypes')
            .doc(ticket.ticketTypeId);

          batch.update(ticketTypeRef, {
            available: admin.firestore.FieldValue.increment(ticket.quantity),
            reserved: admin.firestore.FieldValue.increment(-ticket.quantity),
          });
        }

        // Update order status
        batch.update(db.collection('orders').doc(orderId), {
          paymentStatus: 'expired',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await batch.commit();

        // Log expiration
        await db.collection('order-logs').add({
          orderId,
          eventId: orderData.eventId,
          userId: orderData.userId,
          action: 'expired',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Released expired order: ${orderId}`);
      } catch (error) {
        console.error(`Error releasing expired order ${orderId}:`, error);
      }
    });

    await Promise.all(promises);
  }
);
