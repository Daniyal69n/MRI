/**
 * Next.js API Route: Preprocess MRI Images
 * This route acts as a proxy to the FastAPI backend preprocessing service
 */

import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'https://mri-production-1faa.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    // Forward the multipart form data exactly as received.
    const formData = await request.formData();

    const response = await fetch(`${FASTAPI_BACKEND_URL}/preprocess`, {
      method: 'POST',
      body: formData,
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      if (contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData.error || errorData.detail || 'Preprocessing failed' },
          { status: response.status }
        );
      }

      const errorText = await response.text().catch(() => 'Preprocessing failed');
      return NextResponse.json(
        { error: errorText || 'Preprocessing failed' },
        { status: response.status }
      );
    }

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        'content-type': contentType || 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Preprocessing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect to preprocessing service' },
      { status: 500 }
    );
  }
}
