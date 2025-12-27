/**
 * Translation Service Types
 * Real-time AI translation + Equipment rental
 */

export type LanguageCode =
  | 'pt'      // Portuguese
  | 'pt-br'   // Portuguese (Brazil)
  | 'en'      // English
  | 'en-gb'   // English (UK)
  | 'cv'      // Cape Verdean Creole
  | 'fr'      // French
  | 'es'      // Spanish
  | 'it'      // Italian
  | 'de'      // German
  | 'zh'      // Chinese Mandarin
  | 'ar'      // Arabic
  | 'ru'      // Russian
  | 'ja';     // Japanese

export type TranslationMode =
  | 'simultaneous'  // Real-time translation
  | 'consecutive'   // Translation after pauses
  | 'subtitle'      // Subtitles on screen
  | 'transcript'    // Transcription only (no audio)
  | 'hybrid';       // AI + Human interpreter (override)

export type TranslationQuality = 'standard' | 'premium';

export type TranslationPlan = 'starter' | 'business' | 'enterprise' | 'custom';

export type TranslationStatus = 'scheduled' | 'live' | 'paused' | 'ended';

export interface TranslationConfig {
  sourceLanguage: LanguageCode;
  targetLanguages: LanguageCode[];
  mode: TranslationMode;
  quality: TranslationQuality;
  plan?: TranslationPlan;

  // Equipment needs
  equipmentNeeded?: {
    receivers?: number;
    transmitters?: number;
    booths?: number;
    technician?: boolean;
  };

  // Advanced options
  enableSubtitles?: boolean;
  enableTranscript?: boolean;
  enableQATranslation?: boolean;
  voicePreferences?: {
    [key in LanguageCode]?: {
      voiceId?: string;
      gender?: 'male' | 'female' | 'neutral';
      speed?: number; // 0.5 - 2.0
    };
  };
}

export interface TranslationMetrics {
  totalDuration: number; // seconds
  segmentsTranslated: number;
  languagesActive: number;
  peakListeners: number;
  averageLatency: number; // milliseconds
  accuracyScore: number; // 0-100%

  // Legacy/optional fields
  totalListeners?: number;
  wordsTranslated?: number;
  avgLatencyMs?: number;
  accuracy?: number;

  // Per language breakdown
  languageBreakdown?: {
    [key in LanguageCode]?: {
      listeners: number;
      percentage: number;
    };
  };
}

export interface ExtraCharge {
  type: string;
  description: string;
  amount: number;
}

export interface Discount {
  reason: string;
  amount: number;
}

export interface TranslationBilling {
  plan: TranslationPlan;
  softwareFee: number;
  equipmentFee: number;
  setupFee: number;
  totalCost: number;
  paid: boolean;
  depositPaid?: number;
  depositReturned?: number;
  insurance?: number;
  discounts?: Discount[];

  // Legacy/optional fields
  basePrice?: number;
  extraCharges?: ExtraCharge[];
  totalPrice?: number;
}

export interface TranslationEquipment {
  softwareOnly: boolean;
  receivers: number;
  transmitters: number;
  booths: number;
  technician: boolean;

  // Optional/legacy fields
  rentalOrderId?: string | null;
  transmitterIds?: string[];
  receiverCount?: number;
}

export interface TranslationSession {
  id: string;
  eventId: string;
  organizerId: string;

  // Configuration
  config: TranslationConfig;

  // State
  status: TranslationStatus;
  startedAt?: Date | any | null; // Can be FieldValue.serverTimestamp()
  endedAt?: Date | any | null;

  // Active listeners per language
  activeListeners?: {
    [key: string]: number;
  };

  // Metrics
  metrics: TranslationMetrics;

  // Hardware associated
  equipment: TranslationEquipment;

  // Billing
  billing: TranslationBilling;

  // WebSocket stream URLs
  streamUrls?: {
    [key in LanguageCode]?: string;
  };

  createdAt?: Date | any; // Can be FieldValue.serverTimestamp()
  updatedAt?: Date | any;
}

export interface TranscriptSegment {
  id?: string;
  sessionId: string;
  timestamp: number | Date;
  speaker: string; // Speaker identifier
  speakerId?: string | null; // Legacy field
  speakerName?: string;

  original: {
    language: LanguageCode;
    text: string;
    confidence?: number; // 0-1
  };

  translations: {
    [key: string]: string | { text: string; audioUrl: string | null };
  };

  metadata?: {
    latency: number;
    confidence: number;
    edited: boolean;
    editedAt?: string;
    editedBy?: string;
  };

  createdAt?: Date | any;
}

// ============================================
// EQUIPMENT RENTAL TYPES
// ============================================

export type KitType = 'basic' | 'professional' | 'enterprise' | 'hybrid';

export type EquipmentType =
  | 'transmitter'
  | 'receiver'
  | 'microphone'
  | 'booth'
  | 'screen'
  | 'charger'
  | 'case'
  | 'tablet'
  | 'other';

export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'needs_repair';

export type RentalStatus =
  | 'pending'
  | 'confirmed'
  | 'dispatched'
  | 'delivered'
  | 'in_use'
  | 'returned'
  | 'inspected'
  | 'completed'
  | 'cancelled';

export interface Address {
  street: string;
  city: string;
  island: string;
  postalCode?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface EquipmentRentalItem {
  itemType: string; // 'receiver', 'transmitter', 'microphone', 'booth', etc.
  quantity: number;
  notes?: string;

  // Legacy/optional
  itemId?: string;
}

export interface EquipmentRentalPeriod {
  startDate: Date | any;
  endDate: Date | any;
  setupTime?: string;
  packupTime?: string;

  // Legacy/optional
  pickupDate?: Date;
  returnDate?: Date;
  pickupLocation?: 'office' | 'delivery';
  returnLocation?: 'office' | 'pickup';
}

export interface EquipmentDelivery {
  option: 'pickup' | 'delivery';
  address?: string | Address | null;
  fee: number;
  status?: 'not_required' | 'scheduled' | 'in_transit' | 'delivered';

  // Legacy/optional fields
  required?: boolean;
  scheduledTime?: Date | null;
  deliveredAt?: Date;
  deliveredBy?: string;
}

export interface EquipmentTechnician {
  required: boolean;
  hours: number;
  assignedId: string | null;
  assignedName?: string;
  contactPhone?: string;
}

export interface EquipmentDeposit {
  amount: number;
  held: boolean;
  releasedAt: Date | null;
  deductions?: {
    reason: string;
    amount: number;
  }[];
}

export interface EquipmentRentalPricing {
  daily: number;
  total: number;
  deposit: number;

  // Optional fields
  subtotal?: number;
  discount?: number;
  discountReason?: string;
  discounts?: Discount[];
  deliveryFee?: number;
  technicianFee?: number;
  depositPaid?: number;
  depositReturned?: number;
  insurance?: number;
}

export interface EquipmentRental {
  id?: string;
  eventId: string;
  organizerId: string;

  // Items
  items: {
    kitType: KitType;
    additionalItems: EquipmentRentalItem[];
  };

  // Period
  period: EquipmentRentalPeriod;

  // Logistics
  delivery: EquipmentDelivery;

  // State
  status: RentalStatus;
  notes?: string;

  // Deposit (optional, can be computed)
  deposit?: EquipmentDeposit;

  // Pricing
  pricing: EquipmentRentalPricing;

  // Support (optional)
  technician?: EquipmentTechnician;

  // Tracking
  assignedEquipmentIds?: string[];
  inspectionReport?: {
    beforeRental: string;
    afterReturn?: string;
    damages?: {
      itemId: string;
      description: string;
      cost: number;
    }[];
  };

  createdAt?: Date | any; // Can be FieldValue.serverTimestamp()
  updatedAt?: Date | any;
  confirmedAt?: Date | any;
}

export interface EquipmentMaintenanceRecord {
  date: Date;
  type: 'repair' | 'cleaning' | 'calibration' | 'inspection';
  notes: string;
  cost: number;
  performedBy?: string;
}

export interface EquipmentItem {
  id: string;
  type: EquipmentType;
  model: string;
  serialNumber: string;

  status: 'available' | 'rented' | 'maintenance' | 'retired';
  condition: EquipmentCondition;

  location: string;
  purchaseDate: Date;
  purchasePrice: number;

  maintenanceHistory: EquipmentMaintenanceRecord[];

  currentRentalId: string | null;

  // Metadata
  specifications?: {
    [key: string]: string | number | boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// APP/UI TYPES
// ============================================

export interface LiveTranslationAudio {
  enabled: boolean;
  language: LanguageCode;
  quality: 'low' | 'medium' | 'high';
  latency: number; // ms
  volume: number; // 0-100
}

export interface LiveTranslationSubtitles {
  enabled: boolean;
  fontSize: number; // 12-48
  position: 'top' | 'bottom' | 'middle';
  backgroundColor: string;
  textColor: string;
  opacity: number; // 0-100
}

export interface LiveTranslationTranscript {
  enabled: boolean;
  downloadable: boolean;
  searchable: boolean;
  timestamps: boolean;
  autoScroll: boolean;
}

export interface TranslatedQA {
  enabled: boolean;
  submitInNativeLanguage: boolean;
  moderationEnabled: boolean;
  translationDelay?: number; // ms
}

export interface TranslationFeatures {
  // Audio in real-time
  liveAudio: LiveTranslationAudio;

  // Subtitles
  subtitles: LiveTranslationSubtitles;

  // Transcript
  transcript: LiveTranslationTranscript;

  // Translated Q&A
  translatedQA: TranslatedQA;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface StartTranslationSessionRequest {
  eventId: string;
  config: TranslationConfig;
  equipmentRentalId?: string;
}

export interface StartTranslationSessionResponse {
  sessionId: string;
  streamConfig: {
    websocketUrl: string;
    apiKey: string;
  };
  status: 'scheduled' | 'live';
}

export interface ProcessAudioChunkRequest {
  sessionId: string;
  audioChunk: string; // base64 encoded
  language: LanguageCode;
  timestamp: number;
}

export interface ProcessAudioChunkResponse {
  success: boolean;
  transcriptSegmentId: string;
  translations: {
    [key in LanguageCode]?: {
      text: string;
      audioUrl: string;
    };
  };
  latencyMs: number;
}

export interface CreateEquipmentRentalRequest {
  eventId: string;
  kitType: KitType;
  additionalItems?: EquipmentRentalItem[];
  period: EquipmentRentalPeriod;
  delivery: Omit<EquipmentDelivery, 'fee'>;
  technician: Omit<EquipmentTechnician, 'assignedId'>;
}

export interface CreateEquipmentRentalResponse {
  rentalId: string;
  pricing: EquipmentRentalPricing;
  availabilityConfirmed: boolean;
  depositRequired: number;
  paymentUrl: string;
}
