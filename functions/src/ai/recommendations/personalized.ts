import * as functions from 'firebase-functions/v2';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { getFirestore } from 'firebase-admin/firestore';
import type {
  EventRecommendation,
  RecommendationReason,
  EventEmbedding,
} from '../../shared-types';

const PINECONE_INDEX_NAME = 'events-cv-embeddings';

// Lazy initialization
let openaiClient: OpenAI | null = null;
let pineconeClient: Pinecone | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

function getPinecone(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

/**
 * Generate embedding for event using OpenAI
 */
async function generateEventEmbedding(eventData: any): Promise<number[]> {
  const text = `${eventData.title} ${eventData.description} ${eventData.category} ${eventData.tags?.join(' ')} ${eventData.city}`;

  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Store event embedding in Pinecone
 */
export const createEventEmbedding = functions.firestore
  .onDocumentWritten(
    {
      document: 'events/{eventId}',
      region: 'europe-west1',
    },
    async (event) => {
      const eventId = event.params.eventId;
      const eventData = event.data?.after.data();

      if (!eventData) {
        console.log('Event deleted, skipping embedding');
        return;
      }

      // Skip if event is draft or cancelled
      if (eventData.status !== 'published') {
        console.log('Event not published, skipping embedding');
        return;
      }

      try {
        // Generate embedding
        const embedding = await generateEventEmbedding(eventData);

        // Store in Pinecone
        const index = getPinecone().index(PINECONE_INDEX_NAME);

        await index.upsert([
          {
            id: eventId,
            values: embedding,
            metadata: {
              title: eventData.title,
              category: eventData.category,
              tags: eventData.tags || [],
              city: eventData.city,
              price: eventData.minPrice || 0,
              date: eventData.date.toDate().toISOString(),
            },
          },
        ]);

        // Store embedding reference in Firestore
        const db = getFirestore();
        const embeddingData: EventEmbedding = {
          eventId,
          embedding,
          metadata: {
            title: eventData.title,
            category: eventData.category,
            tags: eventData.tags || [],
            city: eventData.city,
            price: eventData.minPrice || 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.collection('eventEmbeddings').doc(eventId).set(embeddingData);

        console.log(`Created embedding for event ${eventId}`);
      } catch (error) {
        console.error('Error creating event embedding:', error);
      }
    }
  );

/**
 * Calculate recommendation reasons and score
 */
async function calculateRecommendationScore(
  eventData: any,
  userData: any,
  friendsGoing: number,
  similarityScore: number
): Promise<{ score: number; reasons: RecommendationReason[] }> {
  const reasons: RecommendationReason[] = [];
  let score = 0;

  // Category match (25%)
  if (userData.favoriteCategories?.includes(eventData.category)) {
    const weight = 0.25;
    score += weight;
    reasons.push({
      type: 'category_match',
      weight,
      description: `Matches your favorite category: ${eventData.category}`,
    });
  }

  // Friends attending (30%)
  if (friendsGoing > 0) {
    const weight = Math.min(0.3, friendsGoing * 0.1);
    score += weight;
    reasons.push({
      type: 'friend_attending',
      weight,
      description: `${friendsGoing} friend${friendsGoing > 1 ? 's' : ''} going`,
    });
  }

  // Location proximity (15%)
  if (userData.city && eventData.city === userData.city) {
    const weight = 0.15;
    score += weight;
    reasons.push({
      type: 'location_nearby',
      weight,
      description: `In your city: ${eventData.city}`,
    });
  }

  // Price match (10%)
  if (userData.preferredPriceRange) {
    const eventPrice = eventData.minPrice || 0;
    const [minPrice, maxPrice] = userData.preferredPriceRange;

    if (eventPrice >= minPrice && eventPrice <= maxPrice) {
      const weight = 0.1;
      score += weight;
      reasons.push({
        type: 'price_match',
        weight,
        description: 'Within your preferred price range',
      });
    }
  }

  // Past behavior similarity (20%)
  const behaviorWeight = similarityScore * 0.2;
  score += behaviorWeight;
  reasons.push({
    type: 'past_behavior',
    weight: behaviorWeight,
    description: 'Similar to events you enjoyed before',
  });

  return { score, reasons };
}

/**
 * Core recommendation logic (can be called from HTTP or scheduled functions)
 */
async function generateRecommendationsForUser(
  userId: string,
  limit: number = 10,
  city?: string,
  category?: string
) {
  const db = getFirestore();

      // Get user data
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      const userData = userDoc.data()!;

      // Get user's past events to build preference profile
      const ticketsSnapshot = await db
        .collection('tickets')
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .orderBy('purchasedAt', 'desc')
        .limit(20)
        .get();

      const pastEventIds = ticketsSnapshot.docs.map(doc => doc.data().eventId);

      // Build user preference embedding from past events
      let userEmbedding: number[] | null = null;

      if (pastEventIds.length > 0) {
        const pastEventsSnapshot = await db
          .collection('events')
          .where('__name__', 'in', pastEventIds.slice(0, 10))
          .get();

        const pastEventsText = pastEventsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            return `${data.title} ${data.category} ${data.tags?.join(' ')}`;
          })
          .join(' ');

        const response = await getOpenAI().embeddings.create({
          model: 'text-embedding-3-small',
          input: pastEventsText,
        });

        userEmbedding = response.data[0].embedding;
      }

      // Query Pinecone for similar events
      const index = getPinecone().index(PINECONE_INDEX_NAME);

      const queryFilter: any = {};
      if (city) {
        queryFilter.city = city;
      }
      if (category) {
        queryFilter.category = category;
      }

      const queryResponse = await index.query({
        vector: userEmbedding || Array(1536).fill(0), // Use zero vector if no history
        topK: limit * 3, // Get more than needed for filtering
        filter: Object.keys(queryFilter).length > 0 ? queryFilter : undefined,
        includeMetadata: true,
      });

      // Get full event data and calculate scores
      const recommendations: EventRecommendation[] = [];

      for (const match of queryResponse.matches || []) {
        const eventId = match.id;

        // Skip events user already has tickets for
        if (pastEventIds.includes(eventId)) {
          continue;
        }

        // Get full event data
        const eventDoc = await db.collection('events').doc(eventId).get();
        if (!eventDoc.exists) {
          continue;
        }

        const eventData = eventDoc.data()!;

        // Skip past or cancelled events
        if (
          eventData.status !== 'published' ||
          eventData.date.toDate() < new Date()
        ) {
          continue;
        }

        // Get friends going to this event
        const friendIds = userData.friends || [];
        let friendsGoing: any[] = [];

        if (friendIds.length > 0) {
          const friendTicketsSnapshot = await db
            .collection('tickets')
            .where('eventId', '==', eventId)
            .where('userId', 'in', friendIds.slice(0, 10))
            .get();

          friendsGoing = await Promise.all(
            friendTicketsSnapshot.docs.map(async doc => {
              const friendId = doc.data().userId;
              const friendDoc = await db.collection('users').doc(friendId).get();
              const friendData = friendDoc.data();

              return {
                userId: friendId,
                userName: friendData?.name || 'Friend',
                userAvatar: friendData?.avatar,
              };
            })
          );
        }

        // Calculate recommendation score
        const { score, reasons } = await calculateRecommendationScore(
          eventData,
          userData,
          friendsGoing.length,
          match.score || 0
        );

        recommendations.push({
          eventId,
          userId,
          score,
          reasons,
          friendsGoing,
          generatedAt: new Date(),
        });
      }

  // Sort by score and limit
  recommendations.sort((a, b) => b.score - a.score);
  const topRecommendations = recommendations.slice(0, limit);

  // Save recommendations to Firestore for caching
  const batch = db.batch();
  for (const rec of topRecommendations) {
    const recRef = db.collection('recommendations').doc();
    batch.set(recRef, rec);
  }
  await batch.commit();

  return {
    recommendations: topRecommendations,
    count: topRecommendations.length,
  };
}

/**
 * Get personalized event recommendations for user (HTTP callable)
 */
export const getRecommendations = functions.https.onCall(
  {
    region: 'europe-west1',
    cors: ['https://events.cv', 'https://www.events.cv'],
  },
  async (request) => {
    const { userId, limit = 10, city, category } = request.data;

    if (!userId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'userId is required'
      );
    }

    try {
      return await generateRecommendationsForUser(userId, limit, city, category);
    } catch (error) {
      console.error('Recommendations error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get recommendations'
      );
    }
  }
);

/**
 * Generate daily recommendations for all active users (scheduled)
 */
export const generateDailyRecommendations = functions.scheduler.onSchedule(
  {
    schedule: '0 6 * * *', // Every day at 6am
    timeZone: 'Atlantic/Cape_Verde',
    region: 'europe-west1',
  },
  async () => {
    const db = getFirestore();

    try {
      // Get all active users
      const usersSnapshot = await db
        .collection('users')
        .where('emailNotifications', '==', true)
        .limit(1000) // Process in batches
        .get();

      console.log(`Generating recommendations for ${usersSnapshot.size} users`);

      for (const userDoc of usersSnapshot.docs) {
        try {
          // Call core recommendations function for each user
          await generateRecommendationsForUser(userDoc.id, 5);

          console.log(`Generated recommendations for user ${userDoc.id}`);
        } catch (error) {
          console.error(`Failed for user ${userDoc.id}:`, error);
        }
      }

      console.log('Daily recommendations generation completed');
    } catch (error) {
      console.error('Daily recommendations error:', error);
    }
  }
);
