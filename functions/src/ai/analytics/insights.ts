import * as functions from 'firebase-functions/v2';
import OpenAI from 'openai';
import { getFirestore } from 'firebase-admin/firestore';
import type {
  AIInsight,
  AIAnalyticsReport,
  InsightType,
  InsightCategory,
} from '../../shared-types';

// Lazy initialization
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

const INSIGHTS_SYSTEM_PROMPT = `You are an expert event analytics consultant for Events.cv, a Cape Verdean event platform.

Your role is to analyze event data and provide actionable insights to help organizers maximize sales, engagement, and attendee satisfaction.

ANALYSIS AREAS:
1. SALES: Ticket sales velocity, pricing effectiveness, revenue optimization
2. MARKETING: Social media engagement, conversion rates, reach
3. PRICING: Dynamic pricing opportunities, discount effectiveness
4. OPERATIONS: Check-in efficiency, capacity utilization, timing
5. AUDIENCE: Demographics, behavior patterns, preferences

INSIGHT TYPES:
- positive: Good news, things going well
- alert: Urgent issues requiring immediate attention
- suggestion: Opportunities for improvement
- neutral: Informational updates

OUTPUT FORMAT (JSON):
{
  "insights": [
    {
      "type": "alert|positive|suggestion|neutral",
      "category": "sales|marketing|pricing|operations|audience",
      "title": "Brief title (max 50 chars)",
      "description": "Clear explanation (max 200 chars)",
      "actionable": true|false,
      "actions": [
        {
          "label": "Action button text",
          "description": "What this action does",
          "impact": "low|medium|high"
        }
      ]
    }
  ],
  "summary": "Overall event performance summary (max 300 chars)",
  "predictions": {
    "expectedSales": number,
    "expectedRevenue": number,
    "sellOutDate": "ISO date or null",
    "confidence": 0-1
  }
}

Be specific, data-driven, and actionable. Focus on Cape Verde market context.`;

/**
 * Gather event analytics data
 */
async function gatherEventAnalytics(eventId: string) {
  const db = getFirestore();

  // Get event data
  const eventDoc = await db.collection('events').doc(eventId).get();
  if (!eventDoc.exists) {
    throw new Error('Event not found');
  }

  const eventData = eventDoc.data()!;

  // Get ticket sales over time
  const ticketsSnapshot = await db
    .collection('tickets')
    .where('eventId', '==', eventId)
    .orderBy('purchasedAt', 'asc')
    .get();

  const salesTimeline = ticketsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      date: data.purchasedAt.toDate(),
      quantity: data.quantity || 1,
      revenue: data.totalAmount,
    };
  });

  // Calculate daily sales velocity
  const salesByDay: { [key: string]: { count: number; revenue: number } } = {};
  salesTimeline.forEach(sale => {
    const dateKey = sale.date.toISOString().split('T')[0];
    if (!salesByDay[dateKey]) {
      salesByDay[dateKey] = { count: 0, revenue: 0 };
    }
    salesByDay[dateKey].count += sale.quantity;
    salesByDay[dateKey].revenue += sale.revenue;
  });

  // Get ticket types and availability
  const ticketTypesSnapshot = await db
    .collection('events')
    .doc(eventId)
    .collection('ticketTypes')
    .get();

  const ticketTypes = ticketTypesSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      name: data.name,
      price: data.price,
      quantity: data.quantity,
      sold: data.sold || 0,
      available: data.quantity - (data.sold || 0),
      percentageSold: ((data.sold || 0) / data.quantity) * 100,
    };
  });

  // Get social engagement
  const socialStats = {
    views: eventData.views || 0,
    shares: eventData.shares || 0,
    favorites: eventData.favorites || 0,
    conversionRate: eventData.views > 0 ? (ticketsSnapshot.size / eventData.views) * 100 : 0,
  };

  // Calculate time metrics
  const now = new Date();
  const eventDate = eventData.date.toDate();
  const createdAt = eventData.createdAt.toDate();
  const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysSinceCreated = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  // Get check-in data (if event already happened)
  let checkInData = null;
  if (eventDate < now) {
    const checkInsSnapshot = await db
      .collection('checkIns')
      .where('eventId', '==', eventId)
      .get();

    const checkInTimes = checkInsSnapshot.docs.map(doc => doc.data().checkedInAt.toDate());

    checkInData = {
      totalCheckIns: checkInsSnapshot.size,
      totalTickets: ticketsSnapshot.size,
      attendanceRate: (checkInsSnapshot.size / ticketsSnapshot.size) * 100,
      checkInTimes,
    };
  }

  return {
    event: {
      id: eventId,
      title: eventData.title,
      category: eventData.category,
      date: eventDate,
      createdAt,
      status: eventData.status,
      capacity: eventData.capacity,
      city: eventData.city,
    },
    sales: {
      totalSold: ticketsSnapshot.size,
      totalRevenue: salesTimeline.reduce((sum, s) => sum + s.revenue, 0),
      averageTicketPrice: salesTimeline.length > 0
        ? salesTimeline.reduce((sum, s) => sum + s.revenue, 0) / salesTimeline.length
        : 0,
      salesByDay,
      timeline: salesTimeline,
    },
    ticketTypes,
    social: socialStats,
    timing: {
      daysUntilEvent,
      daysSinceCreated,
      percentageOfTimeElapsed: (daysSinceCreated / (daysSinceCreated + daysUntilEvent)) * 100,
    },
    checkIns: checkInData,
  };
}

/**
 * Core insights generation logic (can be called from HTTP or scheduled functions)
 */
async function generateInsightsForEvent(eventId: string, organizationId: string) {
  const db = getFirestore();

  // Gather analytics data
  const analytics = await gatherEventAnalytics(eventId);

  // Build prompt for GPT
  const analyticsPrompt = `Analyze this event and provide actionable insights:

EVENT: ${analytics.event.title}
Category: ${analytics.event.category}
Date: ${analytics.event.date.toLocaleDateString('pt-PT')}
Days until event: ${analytics.timing.daysUntilEvent}
Days since created: ${analytics.timing.daysSinceCreated}

SALES:
- Total tickets sold: ${analytics.sales.totalSold} / ${analytics.event.capacity}
- Total revenue: €${analytics.sales.totalRevenue.toFixed(2)}
- Average ticket price: €${analytics.sales.averageTicketPrice.toFixed(2)}
- Sales velocity: ${JSON.stringify(analytics.sales.salesByDay)}

TICKET TYPES:
${analytics.ticketTypes.map(tt => `- ${tt.name}: ${tt.sold}/${tt.quantity} sold (${tt.percentageSold.toFixed(0)}%) at €${tt.price}`).join('\n')}

SOCIAL ENGAGEMENT:
- Views: ${analytics.social.views}
- Shares: ${analytics.social.shares}
- Favorites: ${analytics.social.favorites}
- Conversion rate: ${analytics.social.conversionRate.toFixed(2)}%

${analytics.checkIns ? `
CHECK-IN DATA:
- Attendance rate: ${analytics.checkIns.attendanceRate.toFixed(0)}%
- Total check-ins: ${analytics.checkIns.totalCheckIns}
` : ''}

Provide insights in JSON format as specified.`;

  // Call GPT-4o mini
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: INSIGHTS_SYSTEM_PROMPT },
      { role: 'user', content: analyticsPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const analysisResult = JSON.parse(response.choices[0].message.content || '{}');

  // Save insights to Firestore
  const batch = db.batch();

  for (const insight of analysisResult.insights || []) {
    const insightRef = db.collection('aiInsights').doc();
    const insightData: Omit<AIInsight, 'id'> = {
      eventId,
      organizationId,
      type: insight.type as InsightType,
      category: insight.category as InsightCategory,
      title: insight.title,
      description: insight.description,
      actionable: insight.actionable || false,
      actions: insight.actions,
      metadata: {
        dataPoints: {
          salesVelocity: analytics.sales.salesByDay,
          conversionRate: analytics.social.conversionRate,
        },
        confidence: 0.85,
      },
      acknowledged: false,
      createdAt: new Date(),
    };

    batch.set(insightRef, insightData);
  }

  // Save analytics report
  const reportRef = db.collection('aiAnalyticsReports').doc(eventId);
  const reportData: Omit<AIAnalyticsReport, 'insights'> & { insights: string[] } = {
    eventId,
    organizationId,
    insights: [], // Will be populated with insight IDs
    summary: analysisResult.summary || '',
    predictions: analysisResult.predictions,
    generatedAt: new Date(),
  };

  batch.set(reportRef, reportData);
  await batch.commit();

  return {
    insights: analysisResult.insights,
    summary: analysisResult.summary,
    predictions: analysisResult.predictions,
  };
}

/**
 * Generate AI insights for event (HTTP callable)
 */
export const generateInsights = functions.https.onCall(
  {
    region: 'europe-west1',
    cors: ['https://events.cv', 'https://www.events.cv'],
    timeoutSeconds: 60,
  },
  async (request) => {
    const { eventId, userId } = request.data;

    if (!eventId || !userId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'eventId and userId are required'
      );
    }

    try {
      const db = getFirestore();

      // Get event and check permissions
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
            'Only event organizers can view insights'
          );
        }
      }

      return await generateInsightsForEvent(eventId, eventData.organizationId);
    } catch (error) {
      console.error('Insights generation error:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to generate insights: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
);

/**
 * Auto-generate insights for events (scheduled)
 */
export const autoGenerateInsights = functions.scheduler.onSchedule(
  {
    schedule: '0 8 * * *', // Every day at 8am
    timeZone: 'Atlantic/Cape_Verde',
    region: 'europe-west1',
  },
  async () => {
    const db = getFirestore();

    try {
      // Get all upcoming events that are published
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const eventsSnapshot = await db
        .collection('events')
        .where('status', '==', 'published')
        .where('date', '>', now)
        .where('date', '<', in30Days)
        .limit(100)
        .get();

      console.log(`Auto-generating insights for ${eventsSnapshot.size} events`);

      for (const eventDoc of eventsSnapshot.docs) {
        try {
          const eventData = eventDoc.data();

          // Get organization owner to attribute insights
          if (eventData.organizationId) {
            const orgDoc = await db.collection('organizations').doc(eventData.organizationId).get();
            const orgData = orgDoc.data();
            const ownerId = orgData?.members?.find((m: any) => m.role === 'owner')?.userId;

            if (ownerId) {
              await generateInsightsForEvent(eventDoc.id, eventData.organizationId);

              console.log(`Generated insights for event ${eventDoc.id}`);
            }
          }
        } catch (error) {
          console.error(`Failed for event ${eventDoc.id}:`, error);
        }
      }

      console.log('Auto-generate insights completed');
    } catch (error) {
      console.error('Auto-generate insights error:', error);
    }
  }
);
