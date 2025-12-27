import { Metadata } from 'next';
import EventDetailClient from './EventDetailClient';
import { getEvent } from '../../../lib/services/events';
import { generateEventMetadata, generateEventStructuredData } from '../../../lib/seo/generateMetadata';

// Static params for export - pre-render pages for known event IDs
export async function generateStaticParams() {
  // In production, fetch all event IDs from Firebase
  // For now, return known IDs
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
  ];
}

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const event = await getEvent(params.id);

    if (!event) {
      return {
        title: 'Evento não encontrado | Events.cv',
        description: 'O evento que procura não existe ou foi removido.',
      };
    }

    return generateEventMetadata({ event });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Eventos em Cabo Verde | Events.cv',
      description: 'Descubra e participe nos melhores eventos de Cabo Verde.',
    };
  }
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  let structuredData = null;

  try {
    // Fetch event for structured data
    const event = await getEvent(params.id);
    if (event) {
      structuredData = generateEventStructuredData(event);
    }
  } catch (error) {
    console.error('Error fetching event for structured data:', error);
  }

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      <EventDetailClient />
    </>
  );
}
