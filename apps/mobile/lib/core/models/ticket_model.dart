import 'package:cloud_firestore/cloud_firestore.dart';

/// Ticket status
enum TicketStatus { active, used, cancelled, transferred, expired }

/// Ticket type model
class TicketTypeModel {
  final String id;
  final String eventId;
  final String name;
  final String? description;
  final double price;
  final String currency;
  final int quantityTotal;
  final int quantitySold;
  final int quantityReserved;
  final DateTime saleStart;
  final DateTime saleEnd;
  final int maxPerOrder;
  final int minPerOrder;
  final bool transferable;
  final bool refundable;
  final List<String>? benefits;
  final bool isHidden;
  final String? accessCode;
  final int sortOrder;

  TicketTypeModel({
    required this.id,
    required this.eventId,
    required this.name,
    this.description,
    required this.price,
    required this.currency,
    required this.quantityTotal,
    required this.quantitySold,
    required this.quantityReserved,
    required this.saleStart,
    required this.saleEnd,
    required this.maxPerOrder,
    required this.minPerOrder,
    required this.transferable,
    required this.refundable,
    this.benefits,
    required this.isHidden,
    this.accessCode,
    required this.sortOrder,
  });

  factory TicketTypeModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return TicketTypeModel.fromMap(data, doc.id);
  }

  factory TicketTypeModel.fromMap(Map<String, dynamic> map, String id) {
    return TicketTypeModel(
      id: id,
      eventId: map['eventId'] ?? '',
      name: map['name'] ?? '',
      description: map['description'],
      price: (map['price'] ?? 0).toDouble(),
      currency: map['currency'] ?? 'CVE',
      quantityTotal: map['quantityTotal'] ?? 0,
      quantitySold: map['quantitySold'] ?? 0,
      quantityReserved: map['quantityReserved'] ?? 0,
      saleStart: (map['saleStart'] as Timestamp).toDate(),
      saleEnd: (map['saleEnd'] as Timestamp).toDate(),
      maxPerOrder: map['maxPerOrder'] ?? 10,
      minPerOrder: map['minPerOrder'] ?? 1,
      transferable: map['transferable'] ?? true,
      refundable: map['refundable'] ?? true,
      benefits: map['benefits'] != null
          ? List<String>.from(map['benefits'])
          : null,
      isHidden: map['isHidden'] ?? false,
      accessCode: map['accessCode'],
      sortOrder: map['sortOrder'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'eventId': eventId,
      'name': name,
      'description': description,
      'price': price,
      'currency': currency,
      'quantityTotal': quantityTotal,
      'quantitySold': quantitySold,
      'quantityReserved': quantityReserved,
      'saleStart': Timestamp.fromDate(saleStart),
      'saleEnd': Timestamp.fromDate(saleEnd),
      'maxPerOrder': maxPerOrder,
      'minPerOrder': minPerOrder,
      'transferable': transferable,
      'refundable': refundable,
      'benefits': benefits,
      'isHidden': isHidden,
      'accessCode': accessCode,
      'sortOrder': sortOrder,
    };
  }

  /// Check if tickets are available for sale
  bool get isOnSale {
    final now = DateTime.now();
    return now.isAfter(saleStart) && now.isBefore(saleEnd);
  }

  /// Get available quantity
  int get availableQuantity => quantityTotal - quantitySold - quantityReserved;

  /// Check if sold out
  bool get isSoldOut => availableQuantity <= 0;

  /// Format price for display
  String get formattedPrice {
    if (price == 0) return 'Grátis';
    return '$currency ${price.toStringAsFixed(0)}';
  }
}

/// Main Ticket model
class TicketModel {
  final String id;
  final String eventId;
  final String ticketTypeId;
  final String orderId;
  final String userId;
  final String organizationId;
  // Codes
  final String qrCode;
  final String? qrCodeUrl;
  final String? nfcUid;
  // Status
  final TicketStatus status;
  final DateTime? checkedInAt;
  final String? checkedInBy;
  final String? checkedInGate;
  // Transfer history
  final String? transferredFrom;
  final DateTime? transferredAt;
  final String originalUserId;
  // Metadata
  final DateTime purchasedAt;
  // Additional info for display
  final String? eventTitle;
  final String? ticketTypeName;
  final double? ticketPrice;

  TicketModel({
    required this.id,
    required this.eventId,
    required this.ticketTypeId,
    required this.orderId,
    required this.userId,
    required this.organizationId,
    required this.qrCode,
    this.qrCodeUrl,
    this.nfcUid,
    required this.status,
    this.checkedInAt,
    this.checkedInBy,
    this.checkedInGate,
    this.transferredFrom,
    this.transferredAt,
    required this.originalUserId,
    required this.purchasedAt,
    this.eventTitle,
    this.ticketTypeName,
    this.ticketPrice,
  });

  factory TicketModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return TicketModel.fromMap(data, doc.id);
  }

  factory TicketModel.fromMap(Map<String, dynamic> map, String id) {
    return TicketModel(
      id: id,
      eventId: map['eventId'] ?? '',
      ticketTypeId: map['ticketTypeId'] ?? '',
      orderId: map['orderId'] ?? '',
      userId: map['userId'] ?? '',
      organizationId: map['organizationId'] ?? '',
      qrCode: map['qrCode'] ?? '',
      qrCodeUrl: map['qrCodeUrl'],
      nfcUid: map['nfcUid'],
      status: TicketStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => TicketStatus.active,
      ),
      checkedInAt: (map['checkedInAt'] as Timestamp?)?.toDate(),
      checkedInBy: map['checkedInBy'],
      checkedInGate: map['checkedInGate'],
      transferredFrom: map['transferredFrom'],
      transferredAt: (map['transferredAt'] as Timestamp?)?.toDate(),
      originalUserId: map['originalUserId'] ?? map['userId'] ?? '',
      purchasedAt:
          (map['purchasedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      eventTitle: map['eventTitle'],
      ticketTypeName: map['ticketTypeName'],
      ticketPrice: (map['ticketPrice'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'eventId': eventId,
      'ticketTypeId': ticketTypeId,
      'orderId': orderId,
      'userId': userId,
      'organizationId': organizationId,
      'qrCode': qrCode,
      'qrCodeUrl': qrCodeUrl,
      'nfcUid': nfcUid,
      'status': status.name,
      'checkedInAt':
          checkedInAt != null ? Timestamp.fromDate(checkedInAt!) : null,
      'checkedInBy': checkedInBy,
      'checkedInGate': checkedInGate,
      'transferredFrom': transferredFrom,
      'transferredAt':
          transferredAt != null ? Timestamp.fromDate(transferredAt!) : null,
      'originalUserId': originalUserId,
      'purchasedAt': Timestamp.fromDate(purchasedAt),
      'eventTitle': eventTitle,
      'ticketTypeName': ticketTypeName,
      'ticketPrice': ticketPrice,
    };
  }

  /// Check if ticket can be used
  bool get isValid => status == TicketStatus.active;

  /// Check if ticket was transferred
  bool get wasTransferred => transferredFrom != null;

  /// Check if ticket was checked in
  bool get isCheckedIn => status == TicketStatus.used && checkedInAt != null;
}
