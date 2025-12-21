import 'package:flutter/foundation.dart';
import '../services/ticket_service.dart';
import '../models/ticket_model.dart';
import '../models/order_model.dart';

/// Tickets state provider
class TicketProvider extends ChangeNotifier {
  final TicketService _ticketService = TicketService();

  List<TicketModel> _tickets = [];
  List<TicketModel> _activeTickets = [];
  List<TicketModel> _pastTickets = [];
  List<OrderModel> _orders = [];
  TicketModel? _selectedTicket;
  OrderModel? _currentOrder;
  bool _isLoading = false;
  String? _error;

  /// Get all user tickets
  List<TicketModel> get tickets => _tickets;

  /// Get active tickets
  List<TicketModel> get activeTickets => _activeTickets;

  /// Get past/used tickets
  List<TicketModel> get pastTickets => _pastTickets;

  /// Get user orders
  List<OrderModel> get orders => _orders;

  /// Get selected ticket
  TicketModel? get selectedTicket => _selectedTicket;

  /// Get current order (during checkout)
  OrderModel? get currentOrder => _currentOrder;

  /// Check if loading
  bool get isLoading => _isLoading;

  /// Get error message
  String? get error => _error;

  /// Load user tickets
  Future<void> loadUserTickets(String userId) async {
    _setLoading(true);
    _clearError();

    try {
      _tickets = await _ticketService.getUserTickets(userId);
      _categorizeTickets();
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  /// Categorize tickets into active and past
  void _categorizeTickets() {
    _activeTickets = _tickets
        .where((t) => t.status == TicketStatus.active)
        .toList();
    _pastTickets = _tickets
        .where((t) => t.status == TicketStatus.used ||
                      t.status == TicketStatus.cancelled ||
                      t.status == TicketStatus.expired)
        .toList();
  }

  /// Load user orders
  Future<void> loadUserOrders(String userId) async {
    _setLoading(true);
    _clearError();

    try {
      _orders = await _ticketService.getUserOrders(userId);
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  /// Get ticket by ID
  Future<void> selectTicket(String eventId, String ticketId) async {
    _setLoading(true);
    _clearError();

    try {
      _selectedTicket = await _ticketService.getTicket(eventId, ticketId);
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  /// Get tickets for a specific event
  Future<List<TicketModel>> getTicketsForEvent(
    String eventId,
    String userId,
  ) async {
    try {
      return await _ticketService.getTicketsForEvent(eventId, userId);
    } catch (e) {
      debugPrint('Error loading tickets for event: $e');
      return [];
    }
  }

  /// Create a new order
  Future<String?> createOrder({
    required String eventId,
    required String organizationId,
    required String userId,
    required List<OrderItem> items,
    required double subtotal,
    required OrderFees fees,
    required double totalAmount,
    String currency = 'CVE',
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final orderId = await _ticketService.createOrder(
        eventId: eventId,
        organizationId: organizationId,
        userId: userId,
        items: items,
        subtotal: subtotal,
        fees: fees,
        totalAmount: totalAmount,
        currency: currency,
      );

      // Load the created order
      _currentOrder = await _ticketService.getOrder(eventId, orderId);

      _setLoading(false);
      return orderId;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return null;
    }
  }

  /// Complete order payment
  Future<bool> completeOrderPayment({
    required String eventId,
    required String orderId,
    required PaymentMethod paymentMethod,
    String? paymentReference,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      await _ticketService.updateOrderStatus(
        eventId,
        orderId,
        OrderStatus.paid,
        paymentMethod: paymentMethod,
        paymentReference: paymentReference,
      );

      // Refresh current order
      _currentOrder = await _ticketService.getOrder(eventId, orderId);

      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  /// Cancel order
  Future<bool> cancelOrder(String eventId, String orderId) async {
    _setLoading(true);
    _clearError();

    try {
      await _ticketService.cancelOrder(eventId, orderId);
      _currentOrder = null;
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  /// Transfer ticket
  Future<bool> transferTicket({
    required String eventId,
    required String ticketId,
    required String fromUserId,
    required String toUserId,
    required String toUserEmail,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      await _ticketService.transferTicket(
        eventId: eventId,
        ticketId: ticketId,
        fromUserId: fromUserId,
        toUserId: toUserId,
        toUserEmail: toUserEmail,
      );

      // Refresh tickets
      await loadUserTickets(fromUserId);

      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  /// Get ticket by QR code
  Future<TicketModel?> getTicketByQRCode(String eventId, String qrCode) async {
    try {
      return await _ticketService.getTicketByQRCode(eventId, qrCode);
    } catch (e) {
      debugPrint('Error getting ticket by QR code: $e');
      return null;
    }
  }

  /// Clear selected ticket
  void clearSelectedTicket() {
    _selectedTicket = null;
    notifyListeners();
  }

  /// Clear current order
  void clearCurrentOrder() {
    _currentOrder = null;
    notifyListeners();
  }

  /// Refresh all data
  Future<void> refresh(String userId) async {
    await Future.wait([
      loadUserTickets(userId),
      loadUserOrders(userId),
    ]);
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }

  /// Clear error
  void clearError() {
    _clearError();
    notifyListeners();
  }
}
