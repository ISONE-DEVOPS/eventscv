/**
 * Settings Service - Global platform configuration
 */

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const SETTINGS_COLLECTION = 'platform_settings';
const GENERAL_DOC_ID = 'general';

// ============================================
// TYPES
// ============================================

export interface PlatformSettings {
    general: {
        platformName: string;
        supportEmail: string;
        contactPhone: string;
        currency: string;
        timezone: string;
        defaultLanguage: string;
    };
    financial: {
        serviceFeePercentage: number;
        fixedFee: number;
        minWithdrawalAmount: number;
        payoutSchedule: 'weekly' | 'biweekly' | 'monthly' | 'manual';
        taxRate: number;
    };
    features: {
        enableRegistration: boolean;
        enableEventCreation: boolean;
        enablePayouts: boolean;
        maintenanceMode: boolean;
        requireEmailVerification: boolean;
    };
    appearance: {
        logoUrl?: string;
        faviconUrl?: string;
        primaryColor?: string;
    };
    updatedAt?: Date;
    updatedBy?: string;
}

// Default settings
const DEFAULT_SETTINGS: PlatformSettings = {
    general: {
        platformName: 'EventsCV',
        supportEmail: 'suporte@eventscv.com',
        contactPhone: '+238 000 000 000',
        currency: 'CVE',
        timezone: 'Atlantic/Cape_Verde',
        defaultLanguage: 'pt',
    },
    financial: {
        serviceFeePercentage: 5, // 5%
        fixedFee: 0,
        minWithdrawalAmount: 1000,
        payoutSchedule: 'manual',
        taxRate: 0,
    },
    features: {
        enableRegistration: true,
        enableEventCreation: true,
        enablePayouts: true,
        maintenanceMode: false,
        requireEmailVerification: true,
    },
    appearance: {},
};

// ============================================
// OPERATIONS
// ============================================

// Get platform settings
export async function getPlatformSettings(): Promise<PlatformSettings> {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        // If not initialized, return defaults
        // Optionally create it on read if missing? Let's just return defaults for safety.
        return DEFAULT_SETTINGS;
    }

    const data = docSnap.data();
    return {
        ...data,
        updatedAt: data.updatedAt?.toDate(),
    } as PlatformSettings;
}

// Update platform settings
export async function updatePlatformSettings(
    settings: Partial<PlatformSettings>,
    adminId: string
): Promise<void> {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);

    // Use set with merge true to ensure document exists
    await setDoc(docRef, {
        ...settings,
        updatedAt: Timestamp.now(),
        updatedBy: adminId,
    }, { merge: true });
}

// Initialize settings (if needed)
export async function initializeSettings(adminId: string): Promise<void> {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        await setDoc(docRef, {
            ...DEFAULT_SETTINGS,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            createdBy: adminId,
        });
    }
}
