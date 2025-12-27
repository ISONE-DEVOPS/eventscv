/**
 * Translation Service Module
 * Real-time AI translation with equipment rental
 */

// Session Management
export {
  startTranslationSession,
  endTranslationSession,
  updateSessionStatus,
  getTranslationSession,
  trackListener,
} from './session';

// Audio Processing
export { processAudioChunk } from './audioProcessor';

// Transcript Management
export {
  getSessionTranscript,
  downloadTranscript,
  editTranscriptSegment,
  searchTranscript,
} from './transcript';

// Equipment Rental
export {
  checkEquipmentAvailability,
  calculateRentalPrice,
  createEquipmentRental,
  updateRentalStatus,
  onEquipmentRentalCreated,
} from './equipment';
