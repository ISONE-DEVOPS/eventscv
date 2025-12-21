import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const db = admin.firestore();

// Helper to update global stats
async function updateStats(updates: { [key: string]: any }) {
    const statsRef = db.collection('analytics').doc('stats');
    await statsRef.set(updates, { merge: true });
}

// 1. Aggregating Transactions (Revenue)
export const onTransactionWrite = onDocumentWritten("transactions/{transactionId}", async (event) => {
    if (!event.data) return;

    const before = event.data.before.data();
    const after = event.data.after.data();

    let revenueChange = 0;
    let transactionsChange = 0;

    // Use 'amount' and check status = 'completed'
    // Case 1: Created (and completed)
    if (!before && after && after.status === 'completed') {
        revenueChange += (after.amount || 0);
        transactionsChange += 1;
    }

    // Case 2: Deleted (and was completed)
    if (before && !after && before.status === 'completed') {
        revenueChange -= (before.amount || 0);
        transactionsChange -= 1;
    }

    // Case 3: Updated
    if (before && after) {
        const wasCompleted = before.status === 'completed';
        const isCompleted = after.status === 'completed';

        if (!wasCompleted && isCompleted) {
            revenueChange += (after.amount || 0);
            transactionsChange += 1;
        } else if (wasCompleted && !isCompleted) {
            revenueChange -= (before.amount || 0);
            transactionsChange -= 1;
        } else if (wasCompleted && isCompleted) {
            revenueChange += ((after.amount || 0) - (before.amount || 0));
        }
    }

    if (revenueChange !== 0 || transactionsChange !== 0) {
        await updateStats({
            totalRevenue: FieldValue.increment(revenueChange),
            totalTransactions: FieldValue.increment(transactionsChange)
        });
    }
});

// 2. Aggregating Users
export const onUserWrite = onDocumentWritten("users/{userId}", async (event) => {
    if (!event.data) return;

    const before = event.data.before.data();
    const after = event.data.after.data();

    let userChange = 0;
    let activeUserChange = 0;

    // Created
    if (!before && after) {
        userChange += 1;
        if (after.isActive) activeUserChange += 1;
    }

    // Deleted
    if (before && !after) {
        userChange -= 1;
        if (before.isActive) activeUserChange -= 1;
    }

    // Updated
    if (before && after) {
        if (!before.isActive && after.isActive) activeUserChange += 1;
        if (before.isActive && !after.isActive) activeUserChange -= 1;
    }

    if (userChange !== 0 || activeUserChange !== 0) {
        await updateStats({
            totalUsers: FieldValue.increment(userChange),
            activeUsers: FieldValue.increment(activeUserChange)
        });
    }
});

// 3. Aggregating Events
export const onEventWrite = onDocumentWritten("events/{eventId}", async (event) => {
    if (!event.data) return;

    const before = event.data.before.data();
    const after = event.data.after.data();

    let eventChange = 0;
    let activeEventChange = 0;

    // Created
    if (!before && after) {
        eventChange += 1;
        if (after.status === 'published') activeEventChange += 1;
    }

    // Deleted
    if (before && !after) {
        eventChange -= 1;
        if (before.status === 'published') activeEventChange -= 1;
    }

    // Updated
    if (before && after) {
        if (before.status !== 'published' && after.status === 'published') activeEventChange += 1;
        if (before.status === 'published' && after.status !== 'published') activeEventChange -= 1;
    }

    if (eventChange !== 0 || activeEventChange !== 0) {
        await updateStats({
            totalEvents: FieldValue.increment(eventChange),
            activeEvents: FieldValue.increment(activeEventChange)
        });
    }
});
