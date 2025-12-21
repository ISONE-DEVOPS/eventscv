import 'package:cloud_firestore/cloud_firestore.dart';

/// Loyalty tier levels
enum LoyaltyTier { bronze, silver, gold, platinum }

/// User wallet information
class UserWallet {
  final double balance;
  final double bonusBalance;
  final int loyaltyPoints;
  final LoyaltyTier loyaltyTier;
  final String currency;
  final DateTime? lastTopUp;
  final double totalSpent;

  UserWallet({
    required this.balance,
    required this.bonusBalance,
    required this.loyaltyPoints,
    required this.loyaltyTier,
    required this.currency,
    this.lastTopUp,
    required this.totalSpent,
  });

  factory UserWallet.fromMap(Map<String, dynamic> map) {
    return UserWallet(
      balance: (map['balance'] ?? 0).toDouble(),
      bonusBalance: (map['bonusBalance'] ?? 0).toDouble(),
      loyaltyPoints: map['loyaltyPoints'] ?? 0,
      loyaltyTier: LoyaltyTier.values.firstWhere(
        (e) => e.name == map['loyaltyTier'],
        orElse: () => LoyaltyTier.bronze,
      ),
      currency: map['currency'] ?? 'CVE',
      lastTopUp: (map['lastTopUp'] as Timestamp?)?.toDate(),
      totalSpent: (map['totalSpent'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'balance': balance,
      'bonusBalance': bonusBalance,
      'loyaltyPoints': loyaltyPoints,
      'loyaltyTier': loyaltyTier.name,
      'currency': currency,
      'lastTopUp': lastTopUp != null ? Timestamp.fromDate(lastTopUp!) : null,
      'totalSpent': totalSpent,
    };
  }

  static UserWallet empty() {
    return UserWallet(
      balance: 0,
      bonusBalance: 0,
      loyaltyPoints: 0,
      loyaltyTier: LoyaltyTier.bronze,
      currency: 'CVE',
      totalSpent: 0,
    );
  }
}

/// User referral information
class UserReferral {
  final String code;
  final String? referredBy;
  final int referralCount;
  final double totalEarned;

  UserReferral({
    required this.code,
    this.referredBy,
    required this.referralCount,
    required this.totalEarned,
  });

  factory UserReferral.fromMap(Map<String, dynamic> map) {
    return UserReferral(
      code: map['code'] ?? '',
      referredBy: map['referredBy'],
      referralCount: map['referralCount'] ?? 0,
      totalEarned: (map['totalEarned'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'code': code,
      'referredBy': referredBy,
      'referralCount': referralCount,
      'totalEarned': totalEarned,
    };
  }
}

/// Main User model
class UserModel {
  final String id;
  final String email;
  final String? phone;
  final String name;
  final String? avatarUrl;
  final UserWallet? wallet;
  final UserReferral? referral;
  final String preferredLanguage;
  final bool notificationsEnabled;
  final DateTime? lastLoginAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserModel({
    required this.id,
    required this.email,
    this.phone,
    required this.name,
    this.avatarUrl,
    this.wallet,
    this.referral,
    required this.preferredLanguage,
    required this.notificationsEnabled,
    this.lastLoginAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return UserModel.fromMap(data, doc.id);
  }

  factory UserModel.fromMap(Map<String, dynamic> map, String id) {
    return UserModel(
      id: id,
      email: map['email'] ?? '',
      phone: map['phone'],
      name: map['name'] ?? '',
      avatarUrl: map['avatarUrl'],
      wallet: map['wallet'] != null
          ? UserWallet.fromMap(map['wallet'] as Map<String, dynamic>)
          : null,
      referral: map['referral'] != null
          ? UserReferral.fromMap(map['referral'] as Map<String, dynamic>)
          : null,
      preferredLanguage: map['preferredLanguage'] ?? 'pt',
      notificationsEnabled: map['notificationsEnabled'] ?? true,
      lastLoginAt: (map['lastLoginAt'] as Timestamp?)?.toDate(),
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (map['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'phone': phone,
      'name': name,
      'avatarUrl': avatarUrl,
      'wallet': wallet?.toMap(),
      'referral': referral?.toMap(),
      'preferredLanguage': preferredLanguage,
      'notificationsEnabled': notificationsEnabled,
      'lastLoginAt':
          lastLoginAt != null ? Timestamp.fromDate(lastLoginAt!) : null,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? phone,
    String? name,
    String? avatarUrl,
    UserWallet? wallet,
    UserReferral? referral,
    String? preferredLanguage,
    bool? notificationsEnabled,
    DateTime? lastLoginAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      name: name ?? this.name,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      wallet: wallet ?? this.wallet,
      referral: referral ?? this.referral,
      preferredLanguage: preferredLanguage ?? this.preferredLanguage,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
