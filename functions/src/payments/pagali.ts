/**
 * Pagali Payment Integration
 *
 * Integration with Pagali payment gateway for Cabo Verde payments.
 * Supports Vinti4 network (Visa, Mastercard) payments.
 */

import { onCall, onRequest, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Pagali Configuration
// These should be moved to environment variables in production
const PAGALI_CONFIG = {
  test: {
    entityId: '4A96B708-FD44-4133-8A79-B6F04FC914A1',
    paymentPageId: '0933F2B2-B1D6-78B2-C6AB-4DF232196AA2',
    url: 'http://app.pagali.io/pagali/index.php?r=pgPaymentInterface/ecommercePayment',
  },
  production: {
    entityId: process.env.PAGALI_ENTITY_ID || '',
    paymentPageId: process.env.PAGALI_PAYMENT_PAGE_ID || '',
    url: process.env.PAGALI_URL || '',
  },
};

const isProduction = process.env.NODE_ENV === 'production';
const config = isProduction ? PAGALI_CONFIG.production : PAGALI_CONFIG.test;

interface PagaliPaymentRequest {
  orderId: string;
  eventId: string;
  userId: string;
  items: Array<{
    name: string;
    quantity: number;
    itemNumber?: string;
    amount: number;
    totalItem: number;
  }>;
  total: number;
  currencyCode: string;
  returnUrl: string;
  notifyUrl: string;
}

interface PagaliPaymentResponse {
  order_id: string;
  payment_status: 'Completed' | 'Error';
}

/**
 * Initiate Pagali Payment
 * Creates payment order and returns Pagali payment page URL
 */
export const initiatePagaliPayment = onCall(
  { region: 'europe-west1' },
  async (request: CallableRequest<PagaliPaymentRequest>) => {
    // Verify authentication
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'User must be authenticated to initiate payment'
      );
    }

    const { orderId, eventId, userId, items, total, currencyCode, returnUrl, notifyUrl } = request.data;

    try {
      // Validate order exists and belongs to user
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

      // Prepare Pagali request data
      const formData = new URLSearchParams();
      formData.append('id_ent', config.entityId);
      formData.append('id_temp', config.paymentPageId);
      formData.append('order_id', orderId);
      formData.append('currency_code', currencyCode);
      formData.append('total', total.toString());
      formData.append('notify', notifyUrl);
      formData.append('return', returnUrl);

      // Add items
      items.forEach((item) => {
        formData.append('item_name[]', item.name);
        formData.append('quantity[]', item.quantity.toString());
        formData.append('item_number[]', item.itemNumber || '');
        formData.append('amount[]', item.amount.toString());
        formData.append('total_item[]', item.totalItem.toString());
      });

      // Update order with Pagali payment info
      await db.collection('orders').doc(orderId).update({
        paymentMethod: 'pagali',
        paymentStatus: 'pending',
        paymentProvider: 'pagali',
        pagaliPaymentInitiatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log payment initiation
      await db.collection('payment-logs').add({
        orderId,
        eventId,
        userId,
        provider: 'pagali',
        action: 'initiate',
        total,
        currencyCode,
        items,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Return Pagali payment URL and form data
      // The frontend will submit this form to redirect to Pagali
      return {
        success: true,
        paymentUrl: config.url,
        formData: Object.fromEntries(formData.entries()),
      };
    } catch (error: any) {
      console.error('Error initiating Pagali payment:', error);

      // Log error
      await db.collection('payment-logs').add({
        orderId,
        userId,
        provider: 'pagali',
        action: 'initiate_error',
        error: error.message,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      throw new HttpsError('internal', 'Failed to initiate payment');
    }
  }
);

/**
 * Pagali Payment Webhook
 * Receives payment status from Pagali after payment completion
 */
export const pagaliWebhook = onRequest(
  { region: 'europe-west1' },
  async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { order_id, payment_status }: PagaliPaymentResponse = req.body;

      if (!order_id || !payment_status) {
        console.error('Missing required fields in Pagali webhook:', req.body);
        res.status(400).send('Bad Request: Missing required fields');
        return;
      }

      console.log(`Pagali webhook received for order ${order_id}: ${payment_status}`);

      // Get order
      const orderDoc = await db.collection('orders').doc(order_id).get();
      if (!orderDoc.exists) {
        console.error(`Order not found: ${order_id}`);
        res.status(404).send('Order not found');
        return;
      }

      const orderData = orderDoc.data();
      const isCompleted = payment_status === 'Completed';

      // Update order status
      await db.collection('orders').doc(order_id).update({
        paymentStatus: isCompleted ? 'completed' : 'failed',
        pagaliPaymentStatus: payment_status,
        pagaliPaymentCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log webhook
      await db.collection('payment-logs').add({
        orderId: order_id,
        eventId: orderData?.eventId,
        userId: orderData?.userId,
        provider: 'pagali',
        action: 'webhook',
        paymentStatus: payment_status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (isCompleted) {
        // Payment successful - generate tickets
        try {
          await processSuccessfulPayment(order_id, orderData);
        } catch (error) {
          console.error(`Error processing successful payment for order ${order_id}:`, error);
          // Don't fail the webhook - we already received the payment
        }
      } else {
        // Payment failed - notify user
        await notifyPaymentFailure(order_id, orderData);
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Error processing Pagali webhook:', error);
      res.status(500).send('Internal Server Error');
    }
  }
);

/**
 * Process successful payment
 * Generate tickets and send confirmation
 */
async function processSuccessfulPayment(orderId: string, orderData: any) {
  const { eventId, userId, tickets, buyerEmail, buyerName, total } = orderData;

  // Generate tickets for each ticket type
  const ticketPromises = tickets.map(async (ticketInfo: any) => {
    const ticketsToGenerate = [];
    for (let i = 0; i < ticketInfo.quantity; i++) {
      ticketsToGenerate.push({
        eventId,
        userId,
        orderId,
        ticketTypeId: ticketInfo.ticketTypeId,
        ticketTypeName: ticketInfo.ticketTypeName,
        price: ticketInfo.price,
        currency: ticketInfo.currency || 'CVE',
        status: 'valid',
        buyerName,
        buyerEmail,
        purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
        qrCode: generateQRCodeData(orderId, i),
      });
    }
    return ticketsToGenerate;
  });

  const allTickets = (await Promise.all(ticketPromises)).flat();

  // Save tickets to Firestore
  const batch = db.batch();
  allTickets.forEach((ticket) => {
    const ticketRef = db.collection('tickets').doc();
    batch.set(ticketRef, ticket);
  });
  await batch.commit();

  // Update event ticket count
  await db.collection('events').doc(eventId).update({
    ticketsSold: admin.firestore.FieldValue.increment(allTickets.length),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Send confirmation email
  // TODO: Implement email sending
  console.log(`Tickets generated for order ${orderId}:`, allTickets.length);

  // Award points to user (gamification)
  const pointsToAward = Math.floor(total / 100); // 1 point per 100 CVE
  await db.collection('users').doc(userId).update({
    totalPoints: admin.firestore.FieldValue.increment(pointsToAward),
  });

  await db.collection('point-transactions').add({
    userId,
    type: 'event_attended',
    points: pointsToAward,
    balanceAfter: 0, // Will be calculated
    description: `Purchase: ${orderData.eventTitle || 'Event'}`,
    metadata: {
      orderId,
      eventId,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Notify user of payment failure
 */
async function notifyPaymentFailure(orderId: string, orderData: any) {
  // TODO: Send email/notification about payment failure
  console.log(`Payment failed for order ${orderId}`);
}

/**
 * Generate QR code data for ticket
 */
function generateQRCodeData(orderId: string, ticketIndex: number): string {
  // Simple QR code data - in production, use a secure token
  return `EVENTSCV-${orderId}-${ticketIndex}-${Date.now()}`;
}

/**
 * Get Pagali Payment Status
 * Check payment status for an order
 */
export const getPagaliPaymentStatus = onCall(
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
        paymentStatus: orderData?.paymentStatus || 'pending',
        pagaliPaymentStatus: orderData?.pagaliPaymentStatus,
        createdAt: orderData?.createdAt,
        updatedAt: orderData?.updatedAt,
      };
    } catch (error: any) {
      console.error('Error getting Pagali payment status:', error);
      throw new HttpsError('internal', 'Failed to get payment status');
    }
  }
);
