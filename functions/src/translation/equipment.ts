/**
 * Equipment Rental Management
 * Handle physical translation equipment rentals
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type {
  EquipmentRental,
  KitType,
  RentalStatus,
  EquipmentRentalItem,
} from '../shared-types';

const db = getFirestore();

// Kit Definitions
const KITS: Record<KitType, any> = {
  basic: {
    name: 'Kit Básico',
    capacity: 50,
    receivers: 50,
    transmitters: 1,
    microphones: 1,
    booths: 0,
    technician: false,
    basePrice: 150,
  },
  professional: {
    name: 'Kit Profissional',
    capacity: 200,
    receivers: 200,
    transmitters: 2,
    microphones: 2,
    booths: 0,
    technician: false,
    tablet: true,
    basePrice: 350,
  },
  enterprise: {
    name: 'Kit Enterprise',
    capacity: 500,
    receivers: 500,
    transmitters: 4,
    microphones: 4,
    booths: 2,
    technician: true,
    tablet: true,
    mixingConsole: true,
    basePrice: 750,
  },
  hybrid: {
    name: 'Kit Híbrido',
    capacity: 200,
    receivers: 200,
    transmitters: 2,
    microphones: 2,
    booths: 1,
    technician: true,
    tablet: true,
    interpreterHeadsets: 2,
    basePrice: 1200,
  },
};

/**
 * Check equipment availability for given dates
 */
export const checkEquipmentAvailability = onCall<{
  kitType?: KitType;
  items?: EquipmentRentalItem[];
  startDate: string;
  endDate: string;
}>(async (request) => {
  const { kitType, items, startDate, endDate } = request.data;

  if (!startDate || !endDate) {
    throw new HttpsError('invalid-argument', 'Start and end dates are required');
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (start >= end) {
    throw new HttpsError('invalid-argument', 'Invalid date range');
  }

  // Determine what items we need to check
  let requiredItems: EquipmentRentalItem[] = [];

  if (kitType && KITS[kitType]) {
    requiredItems = getKitItems(kitType);
  } else if (items) {
    requiredItems = items;
  } else {
    throw new HttpsError(
      'invalid-argument',
      'Either kitType or items must be provided'
    );
  }

  // Check availability for each item
  const availabilityResults = await Promise.all(
    requiredItems.map((item) =>
      checkItemAvailability(item, start, end)
    )
  );

  const allAvailable = availabilityResults.every((result) => result.available);

  return {
    available: allAvailable,
    items: availabilityResults,
  };
});

/**
 * Calculate rental price with discounts
 */
export const calculateRentalPrice = onCall<{
  kitType?: KitType;
  items?: EquipmentRentalItem[];
  startDate: string;
  endDate: string;
  deliveryOption: 'pickup' | 'delivery';
  includeInsurance: boolean;
}>(async (request) => {
  const {
    kitType,
    items,
    startDate,
    endDate,
    deliveryOption,
    includeInsurance,
  } = request.data;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 1) {
    throw new HttpsError('invalid-argument', 'Rental must be at least 1 day');
  }

  let basePrice = 0;
  let itemsBreakdown: any[] = [];

  if (kitType && KITS[kitType]) {
    const kit = KITS[kitType];
    basePrice = kit.basePrice;
    itemsBreakdown.push({
      name: kit.name,
      price: kit.basePrice,
      quantity: 1,
    });
  } else if (items) {
    itemsBreakdown = items.map((item) => {
      const price = getItemPrice(item);
      basePrice += price * item.quantity;
      return {
        name: item.itemType,
        price,
        quantity: item.quantity,
      };
    });
  }

  // Calculate multi-day discount
  let subtotal = basePrice * days;
  let discount = 0;

  if (days >= 7) {
    // 20% discount for weekly rental
    discount = subtotal * 0.2;
  } else if (days >= 3) {
    // 10% discount for 3+ days
    discount = subtotal * 0.1;
  }

  // Delivery fee
  const deliveryFee = deliveryOption === 'delivery' ? 50 : 0;

  // Insurance (10% of equipment value)
  const insuranceFee = includeInsurance ? subtotal * 0.1 : 0;

  // Deposit (equal to one day rental)
  const deposit = basePrice;

  // Technician fee (if included in kit or requested)
  const technicianFee =
    kitType && (kitType === 'enterprise' || kitType === 'hybrid') ? 100 * days : 0;

  const total = subtotal - discount + deliveryFee + insuranceFee + technicianFee;

  return {
    breakdown: {
      basePrice,
      days,
      subtotal,
      discount,
      deliveryFee,
      insuranceFee,
      technicianFee,
      deposit,
      total,
    },
    items: itemsBreakdown,
  };
});

/**
 * Create equipment rental
 */
export const createEquipmentRental = onCall<{
  eventId: string;
  kitType?: KitType;
  additionalItems?: EquipmentRentalItem[];
  startDate: string;
  endDate: string;
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress?: string;
  includeInsurance: boolean;
}>(async (request) => {
  const {
    eventId,
    kitType,
    additionalItems = [],
    startDate,
    endDate,
    deliveryOption,
    deliveryAddress,
    includeInsurance,
  } = request.data;
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Verify event exists and user is organizer
  const eventRef = db.collection('events').doc(eventId);
  const eventDoc = await eventRef.get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const eventData = eventDoc.data();
  if (eventData?.organizerId !== userId) {
    throw new HttpsError(
      'permission-denied',
      'Only event organizer can rent equipment'
    );
  }

  // Check availability
  const availability = await checkEquipmentAvailability.run({
    data: { kitType, items: additionalItems, startDate, endDate },
  } as any);

  if (!availability.data.available) {
    throw new HttpsError(
      'failed-precondition',
      'Equipment not available for selected dates'
    );
  }

  // Calculate pricing
  const pricing = await calculateRentalPrice.run({
    data: {
      kitType,
      items: additionalItems,
      startDate,
      endDate,
      deliveryOption,
      includeInsurance,
    },
  } as any);

  // Determine items to rent
  let rentalItems: EquipmentRentalItem[] = [];
  if (kitType && KITS[kitType]) {
    rentalItems = getKitItems(kitType);
  }
  rentalItems = [...rentalItems, ...additionalItems];

  // Create rental
  const rentalData: Partial<EquipmentRental> = {
    eventId,
    organizerId: userId,
    items: {
      kitType: kitType || 'basic',
      additionalItems,
    },
    period: {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      setupTime: deliveryOption === 'delivery' ? '2 hours before event' : undefined,
      packupTime: deliveryOption === 'delivery' ? '1 hour after event' : undefined,
    },
    status: 'pending' as RentalStatus,
    pricing: {
      daily: pricing.data.breakdown.basePrice,
      total: pricing.data.breakdown.total,
      deposit: pricing.data.breakdown.deposit,
      depositPaid: 0,
      depositReturned: 0,
      insurance: includeInsurance ? pricing.data.breakdown.insuranceFee : undefined,
      discounts: pricing.data.breakdown.discount > 0
        ? [{ reason: 'Multi-day discount', amount: pricing.data.breakdown.discount }]
        : [],
    },
    delivery: {
      option: deliveryOption,
      address: deliveryAddress,
      fee: pricing.data.breakdown.deliveryFee,
      status: deliveryOption === 'pickup' ? 'not_required' : 'scheduled',
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const rentalRef = await db.collection('equipment-rentals').add(rentalData);

  return {
    rentalId: rentalRef.id,
    pricing: pricing.data.breakdown,
    items: rentalItems,
  };
});

/**
 * Update rental status
 */
export const updateRentalStatus = onCall<{
  rentalId: string;
  status: RentalStatus;
  notes?: string;
}>(async (request) => {
  const { rentalId, status, notes } = request.data;
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const rentalRef = db.collection('equipment-rentals').doc(rentalId);
  const rentalDoc = await rentalRef.get();

  if (!rentalDoc.exists) {
    throw new HttpsError('not-found', 'Rental not found');
  }

  const rental = rentalDoc.data() as EquipmentRental;

  // Only organizer or admin can update
  if (rental.organizerId !== userId) {
    // TODO: Add admin check
    throw new HttpsError('permission-denied', 'Not authorized');
  }

  await rentalRef.update({
    status,
    notes,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, status };
});

/**
 * Trigger when rental is created - reserve equipment
 */
export const onEquipmentRentalCreated = onDocumentCreated(
  'equipment-rentals/{rentalId}',
  async (event) => {
    const rental = event.data?.data() as EquipmentRental;
    const rentalId = event.params.rentalId;

    if (!rental) return;

    try {
      // Reserve equipment items
      const items = rental.items.kitType
        ? getKitItems(rental.items.kitType)
        : rental.items.additionalItems;

      for (const item of items) {
        await reserveEquipmentItem(
          item,
          rental.period.startDate,
          rental.period.endDate,
          rentalId
        );
      }

      // Update status to confirmed if reservation successful
      await event.data?.ref.update({
        status: 'confirmed',
        confirmedAt: FieldValue.serverTimestamp(),
      });

      // TODO: Send confirmation email/notification to organizer
    } catch (error) {
      console.error('Error reserving equipment:', error);

      // Update rental to show it's pending review
      await event.data?.ref.update({
        status: 'pending',
        notes: 'Equipment reservation failed - manual review required',
      });
    }
  }
);

// Helper Functions

/**
 * Get items included in a kit
 */
function getKitItems(kitType: KitType): EquipmentRentalItem[] {
  const kit = KITS[kitType];
  if (!kit) return [];

  const items: EquipmentRentalItem[] = [];

  if (kit.receivers) {
    items.push({
      itemType: 'receiver',
      quantity: kit.receivers,
      notes: `Part of ${kit.name}`,
    });
  }

  if (kit.transmitters) {
    items.push({
      itemType: 'transmitter',
      quantity: kit.transmitters,
      notes: `Part of ${kit.name}`,
    });
  }

  if (kit.microphones) {
    items.push({
      itemType: 'microphone',
      quantity: kit.microphones,
      notes: 'Wireless microphone',
    });
  }

  if (kit.booths) {
    items.push({
      itemType: 'booth',
      quantity: kit.booths,
      notes: 'Soundproof interpretation booth',
    });
  }

  return items;
}

/**
 * Get price for individual item type
 */
function getItemPrice(item: EquipmentRentalItem): number {
  const prices: { [key: string]: number } = {
    receiver: 2, // €2 per receiver per day
    transmitter: 30, // €30 per transmitter per day
    microphone: 15, // €15 per microphone per day
    booth: 100, // €100 per booth per day
    headset: 5, // €5 per headset per day
    tablet: 20, // €20 per control tablet per day
    mixer: 50, // €50 per mixing console per day
  };

  return prices[item.itemType] || 0;
}

/**
 * Check if specific item is available
 */
async function checkItemAvailability(
  item: EquipmentRentalItem,
  startDate: number,
  endDate: number
): Promise<{
  itemType: string;
  requested: number;
  available: number;
  canFulfill: boolean;
}> {
  // Get total inventory for this item type
  const inventorySnapshot = await db
    .collection('equipment-inventory')
    .where('type', '==', item.itemType)
    .where('status', '==', 'available')
    .get();

  const totalAvailable = inventorySnapshot.size;

  // Check existing reservations for this period
  const reservationsSnapshot = await db
    .collection('equipment-reservations')
    .where('itemType', '==', item.itemType)
    .where('status', '==', 'active')
    .get();

  let reservedCount = 0;

  reservationsSnapshot.forEach((doc) => {
    const reservation = doc.data();
    const resStart = reservation.startDate.toMillis();
    const resEnd = reservation.endDate.toMillis();

    // Check if dates overlap
    if (
      (startDate >= resStart && startDate < resEnd) ||
      (endDate > resStart && endDate <= resEnd) ||
      (startDate <= resStart && endDate >= resEnd)
    ) {
      reservedCount += reservation.quantity;
    }
  });

  const availableCount = totalAvailable - reservedCount;

  return {
    itemType: item.itemType,
    requested: item.quantity,
    available: availableCount,
    canFulfill: availableCount >= item.quantity,
  };
}

/**
 * Reserve equipment item
 */
async function reserveEquipmentItem(
  item: EquipmentRentalItem,
  startDate: any,
  endDate: any,
  rentalId: string
) {
  await db.collection('equipment-reservations').add({
    rentalId,
    itemType: item.itemType,
    quantity: item.quantity,
    startDate,
    endDate,
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
  });
}
