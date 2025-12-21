import 'package:cloud_firestore/cloud_firestore.dart';

/// Order status
enum OrderStatus {
  pending,
  reserved,
  paid,
  cancelled,
  refunded,
  partiallyRefunded
}

/// Payment method
enum PaymentMethod { wallet, stripe, pagali, vinti4, free }

/// Order item
class OrderItem {
  final String ticketTypeId;
  final String ticketTypeName;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  OrderItem({
    required this.ticketTypeId,
    required this.ticketTypeName,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory OrderItem.fromMap(Map<String, dynamic> map) {
    return OrderItem(
      ticketTypeId: map['ticketTypeId'] ?? '',
      ticketTypeName: map['ticketTypeName'] ?? '',
      quantity: map['quantity'] ?? 0,
      unitPrice: (map['unitPrice'] ?? 0).toDouble(),
      totalPrice: (map['totalPrice'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'ticketTypeId': ticketTypeId,
      'ticketTypeName': ticketTypeName,
      'quantity': quantity,
      'unitPrice': unitPrice,
      'totalPrice': totalPrice,
    };
  }
}

/// Order fees
class OrderFees {
  final double serviceFee;
  final double platformFee;
  final double paymentProcessingFee;
  final double total;

  OrderFees({
    required this.serviceFee,
    required this.platformFee,
    required this.paymentProcessingFee,
    required this.total,
  });

  factory OrderFees.fromMap(Map<String, dynamic> map) {
    return OrderFees(
      serviceFee: (map['serviceFee'] ?? 0).toDouble(),
      platformFee: (map['platformFee'] ?? 0).toDouble(),
      paymentProcessingFee: (map['paymentProcessingFee'] ?? 0).toDouble(),
      total: (map['total'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'serviceFee': serviceFee,
      'platformFee': platformFee,
      'paymentProcessingFee': paymentProcessingFee,
      'total': total,
    };
  }

  static OrderFees zero() {
    return OrderFees(
      serviceFee: 0,
      platformFee: 0,
      paymentProcessingFee: 0,
      total: 0,
    );
  }
}

/// Main Order model
class OrderModel {
  final String id;
  final String eventId;
  final String organizationId;
  final String userId;
  // Items
  final List<OrderItem> items;
  final double subtotal;
  final OrderFees fees;
  final double totalAmount;
  final String currency;
  // Payment
  final OrderStatus status;
  final PaymentMethod? paymentMethod;
  final String? paymentReference;
  final String? stripePaymentIntentId;
  // Reservation
  final DateTime? reservedUntil;
  // Refund
  final double? refundedAmount;
  final DateTime? refundedAt;
  final String? refundReason;
  // Timestamps
  final DateTime? paidAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  // Additional info for display
  final String? eventTitle;
  final String? eventCoverImage;
  final DateTime? eventDate;

  OrderModel({
    required this.id,
    required this.eventId,
    required this.organizationId,
    required this.userId,
    required this.items,
    required this.subtotal,
    required this.fees,
    required this.totalAmount,
    required this.currency,
    required this.status,
    this.paymentMethod,
    this.paymentReference,
    this.stripePaymentIntentId,
    this.reservedUntil,
    this.refundedAmount,
    this.refundedAt,
    this.refundReason,
    this.paidAt,
    required this.createdAt,
    required this.updatedAt,
    this.eventTitle,
    this.eventCoverImage,
    this.eventDate,
  });

  factory OrderModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return OrderModel.fromMap(data, doc.id);
  }

  factory OrderModel.fromMap(Map<String, dynamic> map, String id) {
    return OrderModel(
      id: id,
      eventId: map['eventId'] ?? '',
      organizationId: map['organizationId'] ?? '',
      userId: map['userId'] ?? '',
      items: (map['items'] as List<dynamic>?)
              ?.map((item) => OrderItem.fromMap(item as Map<String, dynamic>))
              .toList() ??
          [],
      subtotal: (map['subtotal'] ?? 0).toDouble(),
      fees: map['fees'] != null
          ? OrderFees.fromMap(map['fees'] as Map<String, dynamic>)
          : OrderFees.zero(),
      totalAmount: (map['totalAmount'] ?? 0).toDouble(),
      currency: map['currency'] ?? 'CVE',
      status: OrderStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => OrderStatus.pending,
      ),
      paymentMethod: map['paymentMethod'] != null
          ? PaymentMethod.values.firstWhere(
              (e) => e.name == map['paymentMethod'],
              orElse: () => PaymentMethod.wallet,
            )
          : null,
      paymentReference: map['paymentReference'],
      stripePaymentIntentId: map['stripePaymentIntentId'],
      reservedUntil: (map['reservedUntil'] as Timestamp?)?.toDate(),
      refundedAmount: (map['refundedAmount'] as num?)?.toDouble(),
      refundedAt: (map['refundedAt'] as Timestamp?)?.toDate(),
      refundReason: map['refundReason'],
      paidAt: (map['paidAt'] as Timestamp?)?.toDate(),
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (map['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      eventTitle: map['eventTitle'],
      eventCoverImage: map['eventCoverImage'],
      eventDate: (map['eventDate'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'eventId': eventId,
      'organizationId': organizationId,
      'userId': userId,
      'items': items.map((item) => item.toMap()).toList(),
      'subtotal': subtotal,
      'fees': fees.toMap(),
      'totalAmount': totalAmount,
      'currency': currency,
      'status': status.name,
      'paymentMethod': paymentMethod?.name,
      'paymentReference': paymentReference,
      'stripePaymentIntentId': stripePaymentIntentId,
      'reservedUntil':
          reservedUntil != null ? Timestamp.fromDate(reservedUntil!) : null,
      'refundedAmount': refundedAmount,
      'refundedAt': refundedAt != null ? Timestamp.fromDate(refundedAt!) : null,
      'refundReason': refundReason,
      'paidAt': paidAt != null ? Timestamp.fromDate(paidAt!) : null,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'eventTitle': eventTitle,
      'eventCoverImage': eventCoverImage,
      'eventDate': eventDate != null ? Timestamp.fromDate(eventDate!) : null,
    };
  }

  /// Get total ticket count
  int get totalTickets => items.fold(0, (total, item) => total + item.quantity);

  /// Check if order is paid
  bool get isPaid => status == OrderStatus.paid;

  /// Check if order can be refunded
  bool get canBeRefunded =>
      status == OrderStatus.paid && refundedAt == null;

  /// Format total amount for display
  String get formattedTotal => '$currency ${totalAmount.toStringAsFixed(0)}';
}
