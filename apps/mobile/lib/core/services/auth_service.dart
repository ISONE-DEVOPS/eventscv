import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../config/firebase_config.dart';
import '../models/user_model.dart';

/// Authentication service for Firebase Auth
class AuthService {
  final FirebaseAuth _auth = FirebaseConfig.auth;
  final FirebaseFirestore _firestore = FirebaseConfig.firestore;

  /// Get current Firebase user
  User? get currentUser => _auth.currentUser;

  /// Get current user ID
  String? get currentUserId => _auth.currentUser?.uid;

  /// Check if user is logged in
  bool get isLoggedIn => _auth.currentUser != null;

  /// Stream of auth state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Sign in with email and password
  Future<UserCredential> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );

      // Update last login
      if (credential.user != null) {
        await _updateLastLogin(credential.user!.uid);
      }

      return credential;
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Create account with email and password
  Future<UserCredential> signUpWithEmail({
    required String email,
    required String password,
    required String name,
    String? phone,
  }) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );

      // Update display name
      await credential.user?.updateDisplayName(name);

      // Create user document in Firestore
      if (credential.user != null) {
        await _createUserDocument(
          uid: credential.user!.uid,
          email: email.trim(),
          name: name,
          phone: phone,
        );
      }

      return credential;
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Sign out
  Future<void> signOut() async {
    await _auth.signOut();
  }

  /// Send password reset email
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email.trim());
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Send email verification
  Future<void> sendEmailVerification() async {
    try {
      await _auth.currentUser?.sendEmailVerification();
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Update user password
  Future<void> updatePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final user = _auth.currentUser;
      if (user == null || user.email == null) {
        throw Exception('Utilizador não autenticado');
      }

      // Re-authenticate before changing password
      final credential = EmailAuthProvider.credential(
        email: user.email!,
        password: currentPassword,
      );
      await user.reauthenticateWithCredential(credential);

      // Update password
      await user.updatePassword(newPassword);
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Delete account
  Future<void> deleteAccount(String password) async {
    try {
      final user = _auth.currentUser;
      if (user == null || user.email == null) {
        throw Exception('Utilizador não autenticado');
      }

      // Re-authenticate before deleting
      final credential = EmailAuthProvider.credential(
        email: user.email!,
        password: password,
      );
      await user.reauthenticateWithCredential(credential);

      // Delete user document from Firestore
      await _firestore.collection(Collections.users).doc(user.uid).delete();

      // Delete Firebase Auth account
      await user.delete();
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Get user profile from Firestore
  Future<UserModel?> getUserProfile(String uid) async {
    final doc = await _firestore.collection(Collections.users).doc(uid).get();
    if (!doc.exists) return null;
    return UserModel.fromFirestore(doc);
  }

  /// Get current user profile
  Future<UserModel?> getCurrentUserProfile() async {
    final uid = currentUserId;
    if (uid == null) return null;
    return getUserProfile(uid);
  }

  /// Update user profile
  Future<void> updateUserProfile({
    String? name,
    String? phone,
    String? avatarUrl,
    String? preferredLanguage,
    bool? notificationsEnabled,
  }) async {
    final uid = currentUserId;
    if (uid == null) throw Exception('Utilizador não autenticado');

    final updates = <String, dynamic>{
      'updatedAt': Timestamp.now(),
    };

    if (name != null) {
      updates['name'] = name;
      await _auth.currentUser?.updateDisplayName(name);
    }
    if (phone != null) updates['phone'] = phone;
    if (avatarUrl != null) updates['avatarUrl'] = avatarUrl;
    if (preferredLanguage != null) updates['preferredLanguage'] = preferredLanguage;
    if (notificationsEnabled != null) updates['notificationsEnabled'] = notificationsEnabled;

    await _firestore.collection(Collections.users).doc(uid).update(updates);
  }

  /// Create user document in Firestore
  Future<void> _createUserDocument({
    required String uid,
    required String email,
    required String name,
    String? phone,
  }) async {
    final now = DateTime.now();
    final user = UserModel(
      id: uid,
      email: email,
      phone: phone,
      name: name,
      preferredLanguage: 'pt',
      notificationsEnabled: true,
      createdAt: now,
      updatedAt: now,
      wallet: UserWallet.empty(),
    );

    await _firestore.collection(Collections.users).doc(uid).set(user.toMap());
  }

  /// Update last login timestamp
  Future<void> _updateLastLogin(String uid) async {
    await _firestore.collection(Collections.users).doc(uid).update({
      'lastLoginAt': Timestamp.now(),
    });
  }

  /// Handle Firebase Auth exceptions
  String _handleAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'Nenhum utilizador encontrado com este email.';
      case 'wrong-password':
        return 'Password incorreta.';
      case 'email-already-in-use':
        return 'Este email já está registado.';
      case 'weak-password':
        return 'A password é muito fraca.';
      case 'invalid-email':
        return 'Email inválido.';
      case 'user-disabled':
        return 'Esta conta foi desativada.';
      case 'too-many-requests':
        return 'Demasiadas tentativas. Tente novamente mais tarde.';
      case 'operation-not-allowed':
        return 'Operação não permitida.';
      case 'requires-recent-login':
        return 'Por favor, faça login novamente para continuar.';
      default:
        return e.message ?? 'Ocorreu um erro de autenticação.';
    }
  }
}
