import EventDetailClient from './EventDetailClient';

// Static params for export - pre-render pages for known event IDs
export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
  ];
}

export default function EventDetailPage() {
  return <EventDetailClient />;
}
