import type { Metadata } from 'next';
import type { Event } from '@eventscv/shared-types';

interface GenerateEventMetadataOptions {
  event: Event;
  ogImageUrl?: string;
}

export function generateEventMetadata({
  event,
  ogImageUrl,
}: GenerateEventMetadataOptions): Metadata {
  const title = event.title;
  const description =
    event.description?.substring(0, 155) ||
    `Participa no ${event.title} em ${event.venue}, ${event.city}`;

  const eventDate = new Date(event.startDate);
  const formattedDate = eventDate.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fullDescription = `${description}\n\n📅 ${formattedDate}\n📍 ${event.venue}, ${event.city}\n\n🎟️ Bilhetes disponíveis em Events.cv`;

  // Use the event's cover image or generate OG image URL
  const imageUrl = ogImageUrl || event.coverImage || `https://events.cv/api/og?event=${event.id}`;

  const eventUrl = `https://events.cv/events/${event.slug}`;

  return {
    title: title,
    description: description,

    // Open Graph
    openGraph: {
      title: title,
      description: fullDescription,
      url: eventUrl,
      siteName: 'Events.cv',
      locale: 'pt_CV',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
      creator: '@eventscv',
      site: '@eventscv',
    },

    // Additional meta tags
    keywords: [
      event.title,
      event.category || 'evento',
      event.city,
      event.venue,
      'eventos cabo verde',
      'bilhetes',
      'events.cv',
      ...(event.tags || []),
    ],

    // Robots
    robots: {
      index: event.isPublic,
      follow: true,
      googleBot: {
        index: event.isPublic,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Alternate languages
    alternates: {
      canonical: eventUrl,
      languages: {
        'pt-CV': eventUrl,
        'pt-PT': eventUrl,
        'pt-BR': eventUrl,
        'en': `${eventUrl}?lang=en`,
      },
    },

    // Other metadata
    other: {
      'event:start_time': event.startDate.toString(),
      'event:end_time': event.endDate.toString(),
      'event:location': `${event.venue}, ${event.address}, ${event.city}`,
    },
  };
}

/**
 * Generate metadata for organization/calendar pages
 */
export function generateOrganizationMetadata(org: {
  name: string;
  description?: string;
  logo?: string;
  slug: string;
}): Metadata {
  const title = org.name;
  const description = org.description || `Descobre os eventos de ${org.name} em Events.cv`;
  const url = `https://events.cv/org/${org.slug}`;
  const imageUrl = org.logo || 'https://events.cv/images/og-default.png';

  return {
    title: title,
    description: description,

    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: 'Events.cv',
      locale: 'pt_CV',
      type: 'profile',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
    },

    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate structured data (JSON-LD) for event
 */
export function generateEventStructuredData(event: Event) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.address,
        addressLocality: event.city,
            addressCountry: 'CV',
          },
        },
    image: [event.coverImage],
    organizer: {
      '@type': 'Organization',
      name: 'Events.cv',
      url: `https://events.cv/org/${event.organizationId}`,
    },
  };
}
