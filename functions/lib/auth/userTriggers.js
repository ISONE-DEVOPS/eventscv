"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserDelete = exports.onUserCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Triggered when a new user is created in Firebase Auth.
 * Creates the user's Firestore document with default values.
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    const { uid, email, displayName, photoURL, phoneNumber } = user;
    // Generate unique referral code
    const referralCode = generateReferralCode(uid);
    // Create user document
    const userData = {
        id: uid,
        email: email || null,
        phone: phoneNumber || null,
        name: displayName || email?.split('@')[0] || 'Utilizador',
        avatarUrl: photoURL || null,
        role: 'user',
        wallet: {
            balance: 0,
            bonusBalance: 0,
            loyaltyPoints: 0,
            loyaltyTier: 'bronze',
            currency: 'CVE',
            totalSpent: 0,
        },
        loyalty: {
            points: 0,
            lifetimePoints: 0,
            tier: 'bronze',
            nextTierAt: 5000,
        },
        referral: {
            code: referralCode,
            referredBy: null,
            referralCount: 0,
            totalEarned: 0,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    try {
        await db.collection('users').doc(uid).set(userData);
        functions.logger.info(`User document created for ${uid}`);
        // Check if user was referred (stored in custom claims during signup)
        const customClaims = user.customClaims;
        if (customClaims?.referredBy) {
            await processReferral(uid, customClaims.referredBy);
        }
    }
    catch (error) {
        functions.logger.error(`Error creating user document for ${uid}:`, error);
        throw error;
    }
});
/**
 * Triggered when a user is deleted from Firebase Auth.
 * Cleans up user data (soft delete or anonymize).
 */
exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
    const { uid } = user;
    try {
        // Option 1: Soft delete - mark user as deleted
        await db.collection('users').doc(uid).update({
            status: 'deleted',
            email: null,
            phone: null,
            name: 'Utilizador Removido',
            avatarUrl: null,
            deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Option 2: Hard delete - uncomment if preferred
        // await db.collection('users').doc(uid).delete();
        functions.logger.info(`User data cleaned up for ${uid}`);
        // Note: Tickets and transactions are kept for audit purposes
        // They reference userId but personal data is anonymized
    }
    catch (error) {
        functions.logger.error(`Error cleaning up user data for ${uid}:`, error);
        throw error;
    }
});
/**
 * Generate a unique referral code from user ID
 */
function generateReferralCode(uid) {
    const prefix = 'ECV';
    const suffix = uid.substring(0, 6).toUpperCase();
    return `${prefix}${suffix}`;
}
/**
 * Process referral when new user signs up with a referral code
 */
async function processReferral(newUserId, referrerCode) {
    try {
        // Find referrer by code
        const referrerQuery = await db
            .collection('users')
            .where('referral.code', '==', referrerCode)
            .limit(1)
            .get();
        if (referrerQuery.empty) {
            functions.logger.warn(`Referral code not found: ${referrerCode}`);
            return;
        }
        const referrerDoc = referrerQuery.docs[0];
        const referrerId = referrerDoc.id;
        // Update new user with referredBy
        await db.collection('users').doc(newUserId).update({
            'referral.referredBy': referrerId,
        });
        // Update referrer stats
        await db.collection('users').doc(referrerId).update({
            'referral.referralCount': admin.firestore.FieldValue.increment(1),
        });
        // Create referral record for tracking
        await db.collection('referrals').add({
            referrerId,
            referredId: newUserId,
            code: referrerCode,
            status: 'pending', // Becomes 'completed' after first purchase
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`Referral processed: ${referrerId} referred ${newUserId}`);
    }
    catch (error) {
        functions.logger.error('Error processing referral:', error);
    }
}
//# sourceMappingURL=userTriggers.js.map