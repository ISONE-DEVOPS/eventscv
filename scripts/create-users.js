/**
 * Script to create test users with different roles
 * Run with: node scripts/create-users.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error('Error loading service account:', error.message);
  console.log('Make sure serviceAccountKey.json exists in the project root');
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

// Test users configuration
const testUsers = [
  {
    email: 'superadmin@eventscv.cv',
    password: 'SuperAdmin123!',
    displayName: 'Super Admin',
    phoneNumber: '+2389991001',
    role: 'super_admin',
    claims: {
      platformRole: 'super_admin',
      permissions: [
        'manage_platform',
        'manage_organizations',
        'manage_users',
        'view_analytics',
        'manage_subscriptions',
        'manage_rewards',
        'view_audit_logs',
      ],
    },
  },
  {
    email: 'admin@morabeza.cv',
    password: 'OrgAdmin123!',
    displayName: 'Carlos Silva',
    phoneNumber: '+2389991002',
    role: 'org_admin',
    organizationId: 'morabeza-events',
    claims: {
      organizationId: 'morabeza-events',
      organizationRole: 'admin',
      permissions: [
        'manage_organization',
        'manage_events',
        'manage_members',
        'view_analytics',
        'manage_payouts',
      ],
    },
  },
  {
    email: 'promoter@morabeza.cv',
    password: 'Promoter123!',
    displayName: 'Maria Santos',
    phoneNumber: '+2389991003',
    role: 'promoter',
    organizationId: 'morabeza-events',
    claims: {
      organizationId: 'morabeza-events',
      organizationRole: 'promoter',
      permissions: [
        'manage_events',
        'view_analytics',
        'manage_tickets',
        'manage_vendors',
      ],
    },
  },
  {
    email: 'staff@morabeza.cv',
    password: 'Staff123!',
    displayName: 'João Tavares',
    phoneNumber: '+2389991004',
    role: 'staff',
    organizationId: 'morabeza-events',
    claims: {
      organizationId: 'morabeza-events',
      organizationRole: 'staff',
      permissions: [
        'check_in_tickets',
        'view_event_details',
        'process_cashless',
      ],
    },
  },
  {
    email: 'user@gmail.com',
    password: 'User123!',
    displayName: 'Ana Fernandes',
    phoneNumber: '+2389991005',
    role: 'user',
    claims: {
      // Regular users don't have special platform claims
    },
  },
  {
    email: 'admin@kriolu.cv',
    password: 'KrioluAdmin123!',
    displayName: 'Pedro Lopes',
    phoneNumber: '+2389991006',
    role: 'org_admin',
    organizationId: 'kriolu-productions',
    claims: {
      organizationId: 'kriolu-productions',
      organizationRole: 'admin',
      permissions: [
        'manage_organization',
        'manage_events',
        'manage_members',
        'view_analytics',
        'manage_payouts',
      ],
    },
  },
];

async function createUser(userData) {
  try {
    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(userData.email);
      console.log(`User ${userData.email} already exists (UID: ${existingUser.uid})`);

      // Update custom claims
      await auth.setCustomUserClaims(existingUser.uid, userData.claims);
      console.log(`  Updated custom claims for ${userData.email}`);

      return existingUser;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create new user
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      phoneNumber: userData.phoneNumber,
      emailVerified: true,
    });

    console.log(`Created user: ${userData.email} (UID: ${userRecord.uid})`);

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, userData.claims);
    console.log(`  Set custom claims for ${userData.email}`);

    // Create user document in Firestore
    const userDoc = {
      uid: userRecord.uid,
      email: userData.email,
      displayName: userData.displayName,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      organizationId: userData.organizationId || null,
      walletBalance: userData.role === 'user' ? 5000 : 0, // Give regular users some balance
      loyaltyPoints: userData.role === 'user' ? 150 : 0,
      referralCode: generateReferralCode(userData.displayName),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        language: 'pt',
      },
    };

    await db.collection('users').doc(userRecord.uid).set(userDoc);
    console.log(`  Created Firestore document for ${userData.email}`);

    // If user belongs to an organization, add them as a member
    if (userData.organizationId) {
      const memberDoc = {
        odId: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.claims.organizationRole,
        permissions: userData.claims.permissions,
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        invitedBy: 'system',
        isActive: true,
      };

      await db
        .collection('organizations')
        .doc(userData.organizationId)
        .collection('members')
        .doc(userRecord.uid)
        .set(memberDoc);
      console.log(`  Added as member to organization ${userData.organizationId}`);
    }

    return userRecord;
  } catch (error) {
    console.error(`Error creating user ${userData.email}:`, error.message);
    return null;
  }
}

function generateReferralCode(name) {
  const prefix = name.split(' ')[0].toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${random}`;
}

async function main() {
  console.log('========================================');
  console.log('Creating Test Users for EventsCV');
  console.log('========================================\n');

  for (const userData of testUsers) {
    await createUser(userData);
    console.log('');
  }

  console.log('========================================');
  console.log('Test Users Summary');
  console.log('========================================\n');

  console.log('| Role | Email | Password |');
  console.log('|------|-------|----------|');
  for (const user of testUsers) {
    console.log(`| ${user.role.padEnd(10)} | ${user.email.padEnd(25)} | ${user.password} |`);
  }

  console.log('\n========================================');
  console.log('Done!');
  console.log('========================================');

  process.exit(0);
}

main().catch(console.error);
