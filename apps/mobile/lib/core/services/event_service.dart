import 'package:cloud_firestore/cloud_firestore.dart';
import '../config/firebase_config.dart';
import '../models/event_model.dart';
import '../models/ticket_model.dart';

/// Event service for Firestore operations
class EventService {
  final FirebaseFirestore _firestore = FirebaseConfig.firestore;

  /// Get published events
  Future<List<EventModel>> getPublishedEvents({
    int limit = 20,
    DocumentSnapshot? startAfter,
    EventCategory? category,
    String? city,
    String? island,
    DateTime? dateFrom,
    DateTime? dateTo,
  }) async {
    Query<Map<String, dynamic>> query = _firestore
        .collection(Collections.events)
        .where('status', isEqualTo: 'published')
        .orderBy('startDate', descending: false);

    // Filter by category
    if (category != null) {
      query = query.where('category', isEqualTo: category.name);
    }

    // Filter by city
    if (city != null) {
      query = query.where('city', isEqualTo: city);
    }

    // Filter by island
    if (island != null) {
      query = query.where('island', isEqualTo: island);
    }

    // Filter by date range
    if (dateFrom != null) {
      query = query.where('startDate', isGreaterThanOrEqualTo: Timestamp.fromDate(dateFrom));
    }
    if (dateTo != null) {
      query = query.where('startDate', isLessThanOrEqualTo: Timestamp.fromDate(dateTo));
    }

    // Pagination
    if (startAfter != null) {
      query = query.startAfterDocument(startAfter);
    }

    query = query.limit(limit);

    final snapshot = await query.get();
    return snapshot.docs.map((doc) => EventModel.fromFirestore(doc)).toList();
  }

  /// Get upcoming events (starting from now)
  Future<List<EventModel>> getUpcomingEvents({int limit = 10}) async {
    final snapshot = await _firestore
        .collection(Collections.events)
        .where('status', isEqualTo: 'published')
        .where('startDate', isGreaterThan: Timestamp.now())
        .orderBy('startDate')
        .limit(limit)
        .get();

    return snapshot.docs.map((doc) => EventModel.fromFirestore(doc)).toList();
  }

  /// Get featured events
  Future<List<EventModel>> getFeaturedEvents({int limit = 5}) async {
    final snapshot = await _firestore
        .collection(Collections.events)
        .where('status', isEqualTo: 'published')
        .where('isFeatured', isEqualTo: true)
        .where('startDate', isGreaterThan: Timestamp.now())
        .orderBy('startDate')
        .limit(limit)
        .get();

    return snapshot.docs.map((doc) => EventModel.fromFirestore(doc)).toList();
  }

  /// Get events by category
  Future<List<EventModel>> getEventsByCategory(
    EventCategory category, {
    int limit = 20,
  }) async {
    final snapshot = await _firestore
        .collection(Collections.events)
        .where('status', isEqualTo: 'published')
        .where('category', isEqualTo: category.name)
        .where('startDate', isGreaterThan: Timestamp.now())
        .orderBy('startDate')
        .limit(limit)
        .get();

    return snapshot.docs.map((doc) => EventModel.fromFirestore(doc)).toList();
  }

  /// Get event by ID
  Future<EventModel?> getEvent(String eventId) async {
    final doc = await _firestore.collection(Collections.events).doc(eventId).get();
    if (!doc.exists) return null;
    return EventModel.fromFirestore(doc);
  }

  /// Get ticket types for an event
  Future<List<TicketTypeModel>> getTicketTypes(String eventId) async {
    final snapshot = await _firestore
        .collection(Collections.events)
        .doc(eventId)
        .collection(Collections.ticketTypes)
        .where('isHidden', isEqualTo: false)
        .orderBy('sortOrder')
        .get();

    return snapshot.docs.map((doc) => TicketTypeModel.fromFirestore(doc)).toList();
  }

  /// Get ticket type by ID
  Future<TicketTypeModel?> getTicketType(String eventId, String ticketTypeId) async {
    final doc = await _firestore
        .collection(Collections.events)
        .doc(eventId)
        .collection(Collections.ticketTypes)
        .doc(ticketTypeId)
        .get();

    if (!doc.exists) return null;
    return TicketTypeModel.fromFirestore(doc);
  }

  /// Search events
  Future<List<EventModel>> searchEvents(String query, {int limit = 20}) async {
    // Note: Firestore doesn't support full-text search
    // For production, use Algolia or similar service
    // This is a simple title prefix search
    final searchTerm = query.toLowerCase();

    final snapshot = await _firestore
        .collection(Collections.events)
        .where('status', isEqualTo: 'published')
        .orderBy('title')
        .startAt([searchTerm])
        .endAt(['$searchTerm\uf8ff'])
        .limit(limit)
        .get();

    return snapshot.docs.map((doc) => EventModel.fromFirestore(doc)).toList();
  }

  /// Get events near location
  Future<List<EventModel>> getEventsNearby({
    required double latitude,
    required double longitude,
    double radiusKm = 50,
    int limit = 20,
  }) async {
    // Note: For accurate geo queries, use GeoFlutterFire or similar
    // This is a simplified version filtering by city/island

    final snapshot = await _firestore
        .collection(Collections.events)
        .where('status', isEqualTo: 'published')
        .where('startDate', isGreaterThan: Timestamp.now())
        .orderBy('startDate')
        .limit(limit)
        .get();

    return snapshot.docs.map((doc) => EventModel.fromFirestore(doc)).toList();
  }

  /// Stream event updates
  Stream<EventModel?> streamEvent(String eventId) {
    return _firestore
        .collection(Collections.events)
        .doc(eventId)
        .snapshots()
        .map((doc) => doc.exists ? EventModel.fromFirestore(doc) : null);
  }

  /// Stream ticket types updates
  Stream<List<TicketTypeModel>> streamTicketTypes(String eventId) {
    return _firestore
        .collection(Collections.events)
        .doc(eventId)
        .collection(Collections.ticketTypes)
        .where('isHidden', isEqualTo: false)
        .orderBy('sortOrder')
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => TicketTypeModel.fromFirestore(doc)).toList());
  }

  /// Get event gallery images
  Future<List<String>> getEventGallery(String eventId) async {
    final event = await getEvent(eventId);
    return event?.gallery ?? [];
  }

  /// Get events by organization
  Future<List<EventModel>> getEventsByOrganization(
    String organizationId, {
    int limit = 20,
  }) async {
    final snapshot = await _firestore
        .collection(Collections.events)
        .where('organizationId', isEqualTo: organizationId)
        .where('status', isEqualTo: 'published')
        .orderBy('startDate', descending: true)
        .limit(limit)
        .get();

    return snapshot.docs.map((doc) => EventModel.fromFirestore(doc)).toList();
  }
}
