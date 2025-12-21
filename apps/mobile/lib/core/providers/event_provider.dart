import 'package:flutter/foundation.dart';
import '../services/event_service.dart';
import '../models/event_model.dart';
import '../models/ticket_model.dart';

/// Events state provider
class EventProvider extends ChangeNotifier {
  final EventService _eventService = EventService();

  List<EventModel> _events = [];
  List<EventModel> _featuredEvents = [];
  List<EventModel> _upcomingEvents = [];
  EventModel? _selectedEvent;
  List<TicketTypeModel> _ticketTypes = [];
  bool _isLoading = false;
  String? _error;

  /// Get all events
  List<EventModel> get events => _events;

  /// Get featured events
  List<EventModel> get featuredEvents => _featuredEvents;

  /// Get upcoming events
  List<EventModel> get upcomingEvents => _upcomingEvents;

  /// Get selected event
  EventModel? get selectedEvent => _selectedEvent;

  /// Get ticket types for selected event
  List<TicketTypeModel> get ticketTypes => _ticketTypes;

  /// Check if loading
  bool get isLoading => _isLoading;

  /// Get error message
  String? get error => _error;

  /// Load featured events
  Future<void> loadFeaturedEvents() async {
    try {
      _featuredEvents = await _eventService.getFeaturedEvents();
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading featured events: $e');
    }
  }

  /// Load upcoming events
  Future<void> loadUpcomingEvents({int limit = 10}) async {
    try {
      _upcomingEvents = await _eventService.getUpcomingEvents(limit: limit);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading upcoming events: $e');
    }
  }

  /// Load events with filters
  Future<void> loadEvents({
    EventCategory? category,
    String? city,
    String? island,
    int limit = 20,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      _events = await _eventService.getPublishedEvents(
        category: category,
        city: city,
        island: island,
        limit: limit,
      );
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  /// Load events by category
  Future<void> loadEventsByCategory(EventCategory category) async {
    _setLoading(true);
    _clearError();

    try {
      _events = await _eventService.getEventsByCategory(category);
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  /// Search events
  Future<void> searchEvents(String query) async {
    if (query.isEmpty) {
      _events = [];
      notifyListeners();
      return;
    }

    _setLoading(true);
    _clearError();

    try {
      _events = await _eventService.searchEvents(query);
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  /// Select an event and load its details
  Future<void> selectEvent(String eventId) async {
    _setLoading(true);
    _clearError();

    try {
      _selectedEvent = await _eventService.getEvent(eventId);
      if (_selectedEvent != null) {
        await loadTicketTypes(eventId);
      }
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  /// Load event by ID
  Future<EventModel?> getEvent(String eventId) async {
    try {
      return await _eventService.getEvent(eventId);
    } catch (e) {
      debugPrint('Error loading event: $e');
      return null;
    }
  }

  /// Load ticket types for an event
  Future<void> loadTicketTypes(String eventId) async {
    try {
      _ticketTypes = await _eventService.getTicketTypes(eventId);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading ticket types: $e');
    }
  }

  /// Get available ticket types (not sold out)
  List<TicketTypeModel> get availableTicketTypes {
    return _ticketTypes.where((t) => !t.isSoldOut && t.isOnSale).toList();
  }

  /// Clear selected event
  void clearSelectedEvent() {
    _selectedEvent = null;
    _ticketTypes = [];
    notifyListeners();
  }

  /// Refresh all data
  Future<void> refresh() async {
    await Future.wait([
      loadFeaturedEvents(),
      loadUpcomingEvents(),
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
