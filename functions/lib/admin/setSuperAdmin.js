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
exports.initializeSuperAdmin = exports.setSuperAdmin = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const auth = admin.auth();
/**
 * Callable function to set a user as super_admin.
 * Can only be called by existing super_admins or when no super_admin exists.
 */
exports.setSuperAdmin = (0, https_1.onCall)(async (request) => {
    const { email } = request.data;
    if (!email) {
        throw new https_1.HttpsError('invalid-argument', 'Email is required');
    }
    // Check if any super_admin exists
    const superAdminsQuery = await db
        .collection('platform')
        .doc('config')
        .get();
    const platformConfig = superAdminsQuery.data();
    const hasSuperAdmin = platformConfig?.superAdminCount > 0;
    // If super_admin exists, only another super_admin can create more
    if (hasSuperAdmin) {
        if (!request.auth) {
            throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const callerToken = request.auth.token;
        if (callerToken.platformRole !== 'super_admin') {
            throw new https_1.HttpsError('permission-denied', 'Only super_admin can create other super_admins');
        }
    }
    try {
        // Get user by email
        const userRecord = await auth.getUserByEmail(email);
        const uid = userRecord.uid;
        // Set custom claims for super_admin
        await auth.setCustomUserClaims(uid, {
            platformRole: 'super_admin',
            permissions: [
                'platform:manage',
                'organizations:create',
                'organizations:read',
                'organizations:update',
                'organizations:delete',
                'users:manage',
                'billing:manage',
                'support:manage',
            ],
        });
        // Create/update user document in platform_admins collection
        await db.collection('platform_admins').doc(uid).set({
            uid,
            email: userRecord.email,
            name: userRecord.displayName || email.split('@')[0],
            role: 'super_admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // Update platform config
        await db.collection('platform').doc('config').set({
            superAdminCount: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        firebase_functions_1.logger.info(`User ${email} set as super_admin`);
        return {
            success: true,
            message: `${email} is now a super_admin`,
            uid
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error setting super_admin:', error);
        if (error.code === 'auth/user-not-found') {
            throw new https_1.HttpsError('not-found', 'User not found. Please create an account first.');
        }
        throw new https_1.HttpsError('internal', 'Failed to set super_admin');
    }
});
/**
 * HTTP endpoint to initialize the first super_admin.
 * Only works when no super_admin exists.
 */
exports.initializeSuperAdmin = (0, https_1.onRequest)(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
    }
    const { email, secretKey } = req.body;
    // Simple secret key protection
    const configuredSecret = process.env.ADMIN_INIT_SECRET || 'eventscv-init-2024';
    if (secretKey !== configuredSecret) {
        res.status(403).json({ error: 'Invalid secret key' });
        return;
    }
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }
    // Check if any super_admin already exists
    const configDoc = await db.collection('platform').doc('config').get();
    if (configDoc.exists && configDoc.data()?.superAdminCount > 0) {
        res.status(400).json({
            error: 'Super admin already exists. Use the setSuperAdmin function.'
        });
        return;
    }
    try {
        // Get user by email
        const userRecord = await auth.getUserByEmail(email);
        const uid = userRecord.uid;
        // Set custom claims
        await auth.setCustomUserClaims(uid, {
            platformRole: 'super_admin',
            permissions: [
                'platform:manage',
                'organizations:create',
                'organizations:read',
                'organizations:update',
                'organizations:delete',
                'users:manage',
                'billing:manage',
                'support:manage',
            ],
        });
        // Create platform admin document
        await db.collection('platform_admins').doc(uid).set({
            uid,
            email: userRecord.email,
            name: userRecord.displayName || email.split('@')[0],
            role: 'super_admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Initialize platform config
        await db.collection('platform').doc('config').set({
            superAdminCount: 1,
            initialized: true,
            initializedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        firebase_functions_1.logger.info(`First super_admin initialized: ${email}`);
        res.json({
            success: true,
            message: `${email} is now the first super_admin`,
            uid
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('Error initializing super_admin:', error);
        if (error.code === 'auth/user-not-found') {
            res.status(404).json({
                error: 'User not found. Please create an account first at the login page.'
            });
            return;
        }
        res.status(500).json({ error: 'Failed to initialize super_admin' });
    }
});
//# sourceMappingURL=setSuperAdmin.js.map