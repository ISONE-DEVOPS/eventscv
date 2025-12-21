import 'package:cloud_firestore/cloud_firestore.dart';

/// Event status
enum EventStatus { draft, published, cancelled, completed }

/// Event category
enum EventCategory {
  music,
  sports,
  arts,
  food,
  business,
  education,
  community,
  nightlife,
  festival,
  other
}

/// Geographic point
class GeoPoint {
  final double latitude;
  final double longitude;

  GeoPoint({required this.latitude, required this.longitude});

  factory GeoPoint.fromMap(Map<String, dynamic> map) {
    return GeoPoint(
      latitude: (map['latitude'] ?? 0).toDouble(),
      longitude: (map['longitude'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

/// Event settings
class EventSettings {
  final bool requiresApproval;
  final bool allowTransfers;
  final bool allowRefunds;
  final int refundDeadlineHours;
  final int checkInStartMinutes;
  final int maxTicketsPerUser;

  EventSettings({
    required this.requiresApproval,
    required this.allowTransfers,
    required this.allowRefunds,
    required this.refundDeadlineHours,
    required this.checkInStartMinutes,
    required this.maxTicketsPerUser,
  });

  factory EventSettings.fromMap(Map<String, dynamic> map) {
    return EventSettings(
      requiresApproval: map['requiresApproval'] ?? false,
      allowTransfers: map['allowTransfers'] ?? true,
      allowRefunds: map['allowRefunds'] ?? true,
      refundDeadlineHours: map['refundDeadlineHours'] ?? 24,
      checkInStartMinutes: map['checkInStartMinutes'] ?? 60,
      maxTicketsPerUser: map['maxTicketsPerUser'] ?? 10,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'requiresApproval': requiresApproval,
      'allowTransfers': allowTransfers,
      'allowRefunds': allowRefunds,
      'refundDeadlineHours': refundDeadlineHours,
      'checkInStartMinutes': checkInStartMinutes,
      'maxTicketsPerUser': maxTicketsPerUser,
    };
  }

  static EventSettings defaults() {
    return EventSettings(
      requiresApproval: false,
      allowTransfers: true,
      allowRefunds: true,
      refundDeadlineHours: 24,
      checkInStartMinutes: 60,
      maxTicketsPerUser: 10,
    );
  }
}

/// Main Event model
class EventModel {
  final String id;
  final String organizationId;
  final String createdBy;
  final String title;
  final String slug;
  final String description;
  final EventCategory category;
  final List<String> tags;
  // Location
  final String venue;
  final String address;
  final String city;
  final String? island;
  final String country;
  final GeoPoint? location;
  // Schedule
  final DateTime startDate;
  final DateTime endDate;
  final DateTime? doorsOpen;
  final String timezone;
  // Media
  final String coverImage;
  final List<String> gallery;
  // Status
  final EventStatus status;
  final DateTime? publishedAt;
  final bool isFeatured;
  final DateTime? featuredUntil;
  // Features
  final bool nfcEnabled;
  final bool cashlessEnabled;
  // Capacity & Sales
  final int totalCapacity;
  final int ticketsSold;
  final double revenue;
  // Settings
  final EventSettings settings;
  // Metadata
  final DateTime createdAt;
  final DateTime updatedAt;

  EventModel({
    required this.id,
    required this.organizationId,
    required this.createdBy,
    required this.title,
    required this.slug,
    required this.description,
    required this.category,
    required this.tags,
    required this.venue,
    required this.address,
    required this.city,
    this.island,
    required this.country,
    this.location,
    required this.startDate,
    required this.endDate,
    this.doorsOpen,
    required this.timezone,
    required this.coverImage,
    required this.gallery,
    required this.status,
    this.publishedAt,
    required this.isFeatured,
    this.featuredUntil,
    required this.nfcEnabled,
    required this.cashlessEnabled,
    required this.totalCapacity,
    required this.ticketsSold,
    required this.revenue,
    required this.settings,
    required this.createdAt,
    required this.updatedAt,
  });

  factory EventModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return EventModel.fromMap(data, doc.id);
  }

  factory EventModel.fromMap(Map<String, dynamic> map, String id) {
    return EventModel(
      id: id,
      organizationId: map['organizationId'] ?? '',
      createdBy: map['createdBy'] ?? '',
      title: map['title'] ?? '',
      slug: map['slug'] ?? '',
      description: map['description'] ?? '',
      category: EventCategory.values.firstWhere(
        (e) => e.name == map['category'],
        orElse: () => EventCategory.other,
      ),
      tags: List<String>.from(map['tags'] ?? []),
      venue: map['venue'] ?? '',
      address: map['address'] ?? '',
      city: map['city'] ?? '',
      island: map['island'],
      country: map['country'] ?? 'Cabo Verde',
      location: map['location'] != null
          ? GeoPoint.fromMap(map['location'] as Map<String, dynamic>)
          : null,
      startDate: (map['startDate'] as Timestamp).toDate(),
      endDate: (map['endDate'] as Timestamp).toDate(),
      doorsOpen: (map['doorsOpen'] as Timestamp?)?.toDate(),
      timezone: map['timezone'] ?? 'Atlantic/Cape_Verde',
      coverImage: map['coverImage'] ?? '',
      gallery: List<String>.from(map['gallery'] ?? []),
      status: EventStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => EventStatus.draft,
      ),
      publishedAt: (map['publishedAt'] as Timestamp?)?.toDate(),
      isFeatured: map['isFeatured'] ?? false,
      featuredUntil: (map['featuredUntil'] as Timestamp?)?.toDate(),
      nfcEnabled: map['nfcEnabled'] ?? false,
      cashlessEnabled: map['cashlessEnabled'] ?? false,
      totalCapacity: map['totalCapacity'] ?? 0,
      ticketsSold: map['ticketsSold'] ?? 0,
      revenue: (map['revenue'] ?? 0).toDouble(),
      settings: map['settings'] != null
          ? EventSettings.fromMap(map['settings'] as Map<String, dynamic>)
          : EventSettings.defaults(),
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (map['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'organizationId': organizationId,
      'createdBy': createdBy,
      'title': title,
      'slug': slug,
      'description': description,
      'category': category.name,
      'tags': tags,
      'venue': venue,
      'address': address,
      'city': city,
      'island': island,
      'country': country,
      'location': location?.toMap(),
      'startDate': Timestamp.fromDate(startDate),
      'endDate': Timestamp.fromDate(endDate),
      'doorsOpen': doorsOpen != null ? Timestamp.fromDate(doorsOpen!) : null,
      'timezone': timezone,
      'coverImage': coverImage,
      'gallery': gallery,
      'status': status.name,
      'publishedAt':
          publishedAt != null ? Timestamp.fromDate(publishedAt!) : null,
      'isFeatured': isFeatured,
      'featuredUntil':
          featuredUntil != null ? Timestamp.fromDate(featuredUntil!) : null,
      'nfcEnabled': nfcEnabled,
      'cashlessEnabled': cashlessEnabled,
      'totalCapacity': totalCapacity,
      'ticketsSold': ticketsSold,
      'revenue': revenue,
      'settings': settings.toMap(),
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }

  /// Check if event is upcoming
  bool get isUpcoming => startDate.isAfter(DateTime.now());

  /// Check if event is ongoing
  bool get isOngoing {
    final now = DateTime.now();
    return now.isAfter(startDate) && now.isBefore(endDate);
  }

  /// Check if event has ended
  bool get hasEnded => DateTime.now().isAfter(endDate);

  /// Check if tickets are available
  bool get hasAvailableTickets => ticketsSold < totalCapacity;

  /// Get remaining capacity
  int get remainingCapacity => totalCapacity - ticketsSold;

  /// Get formatted date range
  String get dateRange {
    if (startDate.day == endDate.day &&
        startDate.month == endDate.month &&
        startDate.year == endDate.year) {
      return '${_formatDate(startDate)} • ${_formatTime(startDate)} - ${_formatTime(endDate)}';
    }
    return '${_formatDate(startDate)} - ${_formatDate(endDate)}';
  }

  String _formatDate(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return '${days[date.weekday - 1]}, ${months[date.month - 1]} ${date.day}';
  }

  String _formatTime(DateTime date) {
    return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}
