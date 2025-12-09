#!/usr/bin/env node

/**
 * Script to set a user as super_admin
 *
 * Usage:
 *   node scripts/set-super-admin.js <email>
 *
 * Example:
 *   node scripts/set-super-admin.js admin@eventscv.cv
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with default credentials
// Make sure you have GOOGLE_APPLICATION_CREDENTIALS set or use a service account
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (serviceAccountPath) {
  const serviceAccount = require(path.resolve(serviceAccountPath));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // Use application default credentials (gcloud auth)
  admin.initializeApp({
    projectId: 'eventscv-platform',
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function setSuperAdmin(email) {
  if (!email) {
    console.error('Error: Email is required');
    console.log('Usage: node scripts/set-super-admin.js <email>');
    process.exit(1);
  }

  try {
    // Get user by email
    console.log(`Looking up user: ${email}...`);
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;
    console.log(`Found user: ${uid}`);

    // Set custom claims for super_admin
    console.log('Setting custom claims...');
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
    console.log('Creating platform_admins document...');
    await db.collection('platform_admins').doc(uid).set({
      uid,
      email: userRecord.email,
      name: userRecord.displayName || email.split('@')[0],
      role: 'super_admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Update platform config
    console.log('Updating platform config...');
    await db.collection('platform').doc('config').set({
      superAdminCount: admin.firestore.FieldValue.increment(1),
      initialized: true,
      initializedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('\n✅ Success!');
    console.log(`User ${email} is now a super_admin`);
    console.log('\nThe user needs to log out and log back in for the changes to take effect.');

    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ Error: User with email "${email}" not found.`);
      console.log('Please create an account first at http://localhost:3001/login');
    } else {
      console.error('\n❌ Error:', error.message);
    }
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
setSuperAdmin(email);
