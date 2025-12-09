import WristbandDetailClient from './WristbandDetailClient';

// Static params for export - pre-render pages for known NFC IDs
export function generateStaticParams() {
  return [
    { id: 'NFC-001' },
    { id: 'NFC-002' },
    { id: 'NFC-003' },
  ];
}

export default function WristbandDetailPage() {
  return <WristbandDetailClient />;
}
