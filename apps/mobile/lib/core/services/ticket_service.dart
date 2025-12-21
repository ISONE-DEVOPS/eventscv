import 'package:cloud_firestore/cloud_firestore.dart';
import '../config/firebase_config.dart';
import '../models/ticket_model.dart';
import '../models/order_model.dart';

/// Ticket service for Firestore operations
class TicketService {
  final FirebaseFirestore _firestore = FirebaseConfig.firestore;

  /// Get user's tickets
  Future<List<TicketModel>> getUserTickets(
    String userId, {
    TicketStatus? status,
    int limit = 50,
  }) async {
    Query<Map<String, dynamic>> query = _firestore
        .collectionGroup(Collections.tickets)
        .where('userId', isEqualTo: userId)
        .orderBy('purchasedAt', descending: true);

    if (status != null) {
      query = query.where('status', isEqualTo: status.name);
    }

    query = query.limit(limit);

    final snapshot = await query.get();
    return snapshot.docs.map((doc) => TicketModel.fromFirestore(doc)).toList();
  }

  /// Get active (valid) tickets for user
  Future<List<TicketModel>> getActiveTickets(String userId) async {
    return getUserTickets(userId, status: TicketStatus.active);
  }

  /// Get used tickets for user
  Future<List<TicketModel>> getUsedTickets(String userId) async {
    return getUserTickets(userId, status: TicketStatus.used);
  }

  /// Get ticket by ID
  Future<TicketModel?> getTicket(String eventId, String ticketId) async {
    final doc = await _firestore
        .collection(Collections.events)
        .doc(eventId)
        .collection(Collections.tickets)
        .doc(ticketId)
        .get();

    if (!doc.exists) return null;
    return TicketModel.fromFirestore(doc);
  }

  /// Get ticket by QR code
  Future<TicketModel?> getTicketByQRCode(String eventId, String qrCode) async {
    final snapshot = await _firestore
        .collection(Collections.events)
        .doc(eventId)
        .collection(Collections.tickets)
        .where('qrCode', isEqualTo: qrCode)
        .limit(1)
        .get();

    if (snapshot.docs.isEmpty) return null;
    return TicketModel.fromFirestore(snapshot.docs.first);
  }

  /// Get tickets for an event (for a user)
  Future<List<TicketModel>> getTicketsForEvent(
    String eventId,
    String userId,
  ) async {
    final snapshot = await _firestore
        .collection(Collections.events)
        .doc(eventId)
        .collection(Collections.tickets)
        .where('userId', isEqualTo: userId)
        .orderBy('purchasedAt', descending: true)
        .get();

    return snapshot.docs.map((doc) => TicketModel.fromFirestore(doc)).toList();
  }

  /// Stream user's tickets
  Stream<List<TicketModel>> streamUserTickets(String userId) {
    return _firestore
        .collectionGroup(Collections.tickets)
        .where('userId', isEqualTo: userId)
        .orderBy('purchasedAt', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => TicketModel.fromFirestore(doc)).toList());
  }

  /// Transfer ticket to another user
  Future<void> transferTicket({
    required String eventId,
    required String ticketId,
    required String fromUserId,
    required String toUserId,
    required String toUserEmail,
  }) async {
    final ticketRef = _firestore
        .collection(Collections.events)
        .doc(eventId)
        .collection(Collections.tickets)
        .doc(ticketId);

    await ticketRef.update({
      'userId': toUserId,
      'userEmail': toUserEmail,
      'transferredFrom': fromUserId,
      'transferredAt': Timestamp.now(),
      'status': 'active',
    });
  }

  // ============================================
  // ORDERS
  // ============================================

  /// Get user's orders
  Future<List<OrderModel>> getUserOrders(
    String userId, {
    OrderStatus? status,
    int limit = 50,
  }) async {
    Query<Map<String, dynamic>> query = _firestore
        .collectionGroup(Collections.orders)
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true);

    if (status != null) {
      query = query.where('status', isEqualTo: status.name);
    }

    query = query.limit(limit);

    final snapshot = await query.get();
    return snapshot.docs.map((doc) => OrderModel.fromFirestore(doc)).toList();
  }

  /// Get order by ID
  Future<OrderModel?> getOrder(String eventId, String orderId) async {
    final doc = await _firestore
        .collection(Collections.events)
        .doc(eventId)
        .collection(Collections.orders)
        .doc(orderId)
        .get();

    if (!doc.exists) return null;
    return OrderModel.fromFirestore(doc);
  }

  /// Create a new order
  Future<String> createOrder({
    required String eventId,
    required String organizationId,
    required String userId,
    required List<OrderItem> items,
    required double subtotal,
    required OrderFees fees,
    required double totalAmount,
    String currency = 'CVE',
    PaymentMethod? paymentMethod,
  }) async {
    final orderRef = _firestore
        .collection(Collections.events)
        .doc(eventId)
        .collection(Collections.orders)
        .doc();

    final now = DateTime.now();
    final order = OrderModel(
      id: orderRef.id,
      eventId: eventId,
      organizationId: organizationId,
      userId: userId,
      items: items,
      subtotal: subtotal,
      fees: fees,
      totalAmount: totalAmount,
      currency: currency,
      status: OrderStatus.pending,
      paymentMethod: paymentMethod,
      reservedUntil: now.add(const Duration(minutes: 15)),
      createdAt: now,
      updatedAt: now,
    );

    await orderRef.set(order.toMap());
    return orderRef.id;
  }

  /// Update order status
  Future<void> updateOrderStatus(
    String eventId,
    String orderId,
    OrderStatus status, {
    String? paymentReference,
    PaymentMethod? paymentMethod,
  }) async {
    final updates = <String, dynamic>{
      'status': status.name,
      'updatedAt': Timestamp.now(),
    };

    if (status == OrderStatus.paid) {
      updates['paidAt'] = Timestamp.now();
    }

    if (paymentReference != null) {
      updates['paymentReference'] = paymentReference;
    }

    if (paymentMethod != null) {
      updates['paymentMethod'] = paymentMethod.name;
    }

    await _firestore
        .collection(Collections.events)
        .doc(eventId)
        .collection(Collections.orders)
        .doc(orderId)
        .update(updates);
  }

  /// Cancel order
  Future<void> cancelOrder(String eventId, String orderId) async {
    await updateOrderStatus(eventId, orderId, OrderStatus.cancelled);
  }

  /// Stream order updates
  Stream<OrderModel?> streamOrder(String eventId, String orderId) {
    return _firestore
        .collection(Collections.events)
        .doc(eventId)
        .collection(Collections.orders)
        .doc(orderId)
        .snapshots()
        .map((doc) => doc.exists ? OrderModel.fromFirestore(doc) : null);
  }

  /// Get tickets count for user
  Future<int> getUserTicketsCount(String userId) async {
    final snapshot = await _firestore
        .collectionGroup(Collections.tickets)
        .where('userId', isEqualTo: userId)
        .where('status', isEqualTo: 'active')
        .count()
        .get();

    return snapshot.count ?? 0;
  }
}
