import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';
import '../models/user_model.dart';

/// Authentication state provider
class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  User? _firebaseUser;
  UserModel? _user;
  bool _isLoading = false;
  String? _error;

  /// Get Firebase user
  User? get firebaseUser => _firebaseUser;

  /// Get user profile
  UserModel? get user => _user;

  /// Check if loading
  bool get isLoading => _isLoading;

  /// Get error message
  String? get error => _error;

  /// Check if user is logged in
  bool get isLoggedIn => _firebaseUser != null;

  /// Get user ID
  String? get userId => _firebaseUser?.uid;

  /// Initialize auth state listener
  void initialize() {
    _authService.authStateChanges.listen((User? user) async {
      _firebaseUser = user;
      if (user != null) {
        await _loadUserProfile();
      } else {
        _user = null;
      }
      notifyListeners();
    });
  }

  /// Load user profile from Firestore
  Future<void> _loadUserProfile() async {
    if (_firebaseUser == null) return;

    try {
      _user = await _authService.getUserProfile(_firebaseUser!.uid);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading user profile: $e');
    }
  }

  /// Sign in with email and password
  Future<bool> signInWithEmail({
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      await _authService.signInWithEmail(email: email, password: password);
      await _loadUserProfile();
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  /// Sign up with email and password
  Future<bool> signUpWithEmail({
    required String email,
    required String password,
    required String name,
    String? phone,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      await _authService.signUpWithEmail(
        email: email,
        password: password,
        name: name,
        phone: phone,
      );
      await _loadUserProfile();
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  /// Sign out
  Future<void> signOut() async {
    _setLoading(true);
    try {
      await _authService.signOut();
      _firebaseUser = null;
      _user = null;
    } catch (e) {
      _setError(e.toString());
    }
    _setLoading(false);
  }

  /// Send password reset email
  Future<bool> sendPasswordResetEmail(String email) async {
    _setLoading(true);
    _clearError();

    try {
      await _authService.sendPasswordResetEmail(email);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  /// Update user profile
  Future<bool> updateProfile({
    String? name,
    String? phone,
    String? avatarUrl,
    String? preferredLanguage,
    bool? notificationsEnabled,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      await _authService.updateUserProfile(
        name: name,
        phone: phone,
        avatarUrl: avatarUrl,
        preferredLanguage: preferredLanguage,
        notificationsEnabled: notificationsEnabled,
      );
      await _loadUserProfile();
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  /// Update password
  Future<bool> updatePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      await _authService.updatePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  /// Refresh user profile
  Future<void> refreshProfile() async {
    await _loadUserProfile();
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
