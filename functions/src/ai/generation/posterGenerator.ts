import * as functions from 'firebase-functions/v2';
import Replicate from 'replicate';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import type { AIPoster, PosterStyle } from '../../shared-types';

// Lazy initialization
let replicateClient: Replicate | null = null;

function getReplicate(): Replicate {
  if (!replicateClient) {
    replicateClient = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }
  return replicateClient;
}

const STYLE_PROMPTS = {
  vibrant: 'vibrant colors, energetic, eye-catching, bold typography, modern design, high contrast',
  minimal: 'minimalist, clean, simple, elegant, white space, sans-serif typography, modern',
  elegant: 'elegant, sophisticated, luxury, premium, gold accents, serif typography, refined',
  dark: 'dark theme, moody, atmospheric, neon accents, modern, edgy, dramatic lighting',
};

const QUALITY_MODIFIERS = [
  'professional poster design',
  'high quality',
  'sharp focus',
  'detailed',
  '4k resolution',
  'marketing material',
  'event poster',
].join(', ');

const NEGATIVE_PROMPT = [
  'blurry',
  'low quality',
  'distorted',
  'ugly',
  'bad anatomy',
  'watermark',
  'text errors',
  'misspelling',
].join(', ');

/**
 * Build prompt for event poster generation
 */
function buildPosterPrompt(
  eventTitle: string,
  eventCategory: string,
  eventDate: Date,
  style: PosterStyle,
  customPrompt?: string
): string {
  const styleModifiers = STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS];

  const basePrompt = customPrompt || `Event poster for "${eventTitle}", ${eventCategory} event`;

  const dateStr = eventDate.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `${basePrompt}, ${styleModifiers}, date: ${dateStr}, ${QUALITY_MODIFIERS}`;
}

/**
 * Download image from URL and upload to Firebase Storage
 */
async function uploadImageToStorage(
  imageUrl: string,
  eventId: string,
  posterId: string
): Promise<{ url: string; thumbnailUrl: string }> {
  const bucket = getStorage().bucket();

  // Download image
  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  // Upload full image
  const fileName = `posters/${eventId}/${posterId}.png`;
  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: {
      contentType: 'image/png',
      metadata: {
        eventId,
        posterId,
        generated: 'true',
        timestamp: new Date().toISOString(),
      },
    },
  });

  await file.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

  // TODO: Generate thumbnail using Sharp or similar
  // For now, use the same URL
  const thumbnailUrl = url;

  return { url, thumbnailUrl };
}

/**
 * Generate event poster using AI
 */
export const generatePoster = functions.https.onCall(
  {
    region: 'europe-west1',
    cors: ['https://events.cv', 'https://www.events.cv'],
    timeoutSeconds: 300, // 5 minutes for image generation
  },
  async (request) => {
    const { eventId, style, customPrompt, userId } = request.data;

    if (!eventId || !style || !userId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'eventId, style, and userId are required'
      );
    }

    // Validate style
    if (!['vibrant', 'minimal', 'elegant', 'dark'].includes(style)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid style. Must be: vibrant, minimal, elegant, or dark'
      );
    }

    try {
      const db = getFirestore();

      // Get event data
      const eventDoc = await db.collection('events').doc(eventId).get();
      if (!eventDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Event not found');
      }

      const eventData = eventDoc.data()!;

      // Check if user has permission (must be event organizer)
      if (eventData.organizationId) {
        const orgDoc = await db.collection('organizations').doc(eventData.organizationId).get();
        const orgData = orgDoc.data();

        const isMember = orgData?.members?.some(
          (m: any) => m.userId === userId && ['owner', 'admin', 'editor'].includes(m.role)
        );

        if (!isMember) {
          throw new functions.https.HttpsError(
            'permission-denied',
            'Only event organizers can generate posters'
          );
        }
      }

      // Build prompt
      const prompt = buildPosterPrompt(
        eventData.title,
        eventData.category,
        eventData.date.toDate(),
        style as PosterStyle,
        customPrompt
      );

      console.log('Generating poster with prompt:', prompt);

      // Generate image with FLUX Pro via Replicate
      const output = await getReplicate().run(
        "black-forest-labs/flux-1.1-pro",
        {
          input: {
            prompt,
            negative_prompt: NEGATIVE_PROMPT,
            aspect_ratio: '3:4', // Portrait poster format
            output_format: 'png',
            output_quality: 100,
            safety_tolerance: 2,
          },
        }
      );

      const imageUrl = typeof output === 'string' ? output : String(output);

      if (!imageUrl) {
        throw new Error('No image generated');
      }

      // Create poster ID
      const posterId = db.collection('aiPosters').doc().id;

      // Upload to Firebase Storage
      const { url, thumbnailUrl } = await uploadImageToStorage(
        imageUrl,
        eventId,
        posterId
      );

      // Save to Firestore
      const posterData: Omit<AIPoster, 'id'> = {
        eventId,
        organizationId: eventData.organizationId,
        style: style as PosterStyle,
        prompt,
        imageUrl: url,
        thumbnailUrl,
        metadata: {
          model: 'flux-1.1-pro',
          generationTime: Date.now(),
          resolution: '1024x1365', // 3:4 aspect ratio
        },
        approved: false,
        setAsCover: false,
        generatedBy: userId,
        createdAt: new Date(),
      };

      await db.collection('aiPosters').doc(posterId).set(posterData);

      return {
        posterId,
        imageUrl: url,
        thumbnailUrl,
      };
    } catch (error) {
      console.error('Poster generation error:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to generate poster: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
);

/**
 * Set AI-generated poster as event cover image
 */
export const setPosterAsCover = functions.https.onCall(
  {
    region: 'europe-west1',
    cors: ['https://events.cv', 'https://www.events.cv'],
  },
  async (request) => {
    const { posterId, eventId, userId } = request.data;

    if (!posterId || !eventId || !userId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'posterId, eventId, and userId are required'
      );
    }

    try {
      const db = getFirestore();

      // Get poster
      const posterDoc = await db.collection('aiPosters').doc(posterId).get();
      if (!posterDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Poster not found');
      }

      const posterData = posterDoc.data() as AIPoster;

      // Get event
      const eventDoc = await db.collection('events').doc(eventId).get();
      if (!eventDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Event not found');
      }

      const eventData = eventDoc.data()!;

      // Check permission
      if (eventData.organizationId) {
        const orgDoc = await db.collection('organizations').doc(eventData.organizationId).get();
        const orgData = orgDoc.data();

        const isMember = orgData?.members?.some(
          (m: any) => m.userId === userId && ['owner', 'admin', 'editor'].includes(m.role)
        );

        if (!isMember) {
          throw new functions.https.HttpsError(
            'permission-denied',
            'Only event organizers can update cover image'
          );
        }
      }

      // Update event with new cover image
      await db.collection('events').doc(eventId).update({
        coverImage: posterData.imageUrl,
        updatedAt: new Date(),
      });

      // Mark poster as approved and set as cover
      await db.collection('aiPosters').doc(posterId).update({
        approved: true,
        setAsCover: true,
      });

      return {
        success: true,
        coverImage: posterData.imageUrl,
      };
    } catch (error) {
      console.error('Set poster as cover error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to set poster as cover'
      );
    }
  }
);
