import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.eventId || !body.name || !body.email) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, name, and email are required' },
        { status: 400 }
      );
    }

    // Call Cloud Function
    const functionUrl =
      process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ||
      'https://europe-west1-eventscv-platform.cloudfunctions.net/createGuestRegistration';

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: body,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to create registration');
    }

    const data = await response.json();

    return NextResponse.json(data.result || data, { status: 200 });
  } catch (error: any) {
    console.error('Registration API error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to register. Please try again later.',
      },
      { status: 500 }
    );
  }
}
