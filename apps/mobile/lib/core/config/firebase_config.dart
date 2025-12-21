import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';

import '../../firebase_options.dart';

/// Firebase configuration and initialization
class FirebaseConfig {
  static FirebaseFirestore? _firestore;
  static FirebaseAuth? _auth;
  static FirebaseStorage? _storage;
  static bool _initialized = false;

  /// Initialize Firebase
  static Future<void> initialize() async {
    if (_initialized) return;

    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

    _initialized = true;

    // Initialize Firestore with settings
    _firestore = FirebaseFirestore.instance;
    _firestore!.settings = const Settings(
      persistenceEnabled: true,
      cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
    );

    _auth = FirebaseAuth.instance;
    _storage = FirebaseStorage.instance;
  }

  /// Get Firestore instance
  static FirebaseFirestore get firestore {
    if (_firestore == null) {
      throw Exception('Firebase not initialized. Call FirebaseConfig.initialize() first.');
    }
    return _firestore!;
  }

  /// Get Auth instance
  static FirebaseAuth get auth {
    if (_auth == null) {
      throw Exception('Firebase not initialized. Call FirebaseConfig.initialize() first.');
    }
    return _auth!;
  }

  /// Get Storage instance
  static FirebaseStorage get storage {
    if (_storage == null) {
      throw Exception('Firebase not initialized. Call FirebaseConfig.initialize() first.');
    }
    return _storage!;
  }
}

/// Firestore collection references
class Collections {
  static const String users = 'users';
  static const String events = 'events';
  static const String organizations = 'organizations';
  static const String tickets = 'tickets';
  static const String orders = 'orders';
  static const String ticketTypes = 'ticketTypes';
  static const String walletTransactions = 'walletTransactions';
  static const String notifications = 'notifications';
}
