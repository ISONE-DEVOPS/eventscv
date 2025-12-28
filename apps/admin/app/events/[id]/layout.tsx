export const dynamicParams = false;

export async function generateStaticParams() {
  // Return a placeholder to satisfy Next.js static export requirements
  // Actual routing will be handled client-side
  return [
    { id: '_placeholder' },
  ];
}

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
