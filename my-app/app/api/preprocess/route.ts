/**
 * Next.js API Route: Preprocess MRI Images
 * This route acts as a proxy to the FastAPI backend preprocessing service
 */

import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    // Forward the request to FastAPI backend
    const response = await fetch(`${FASTAPI_BACKEND_URL}/preprocess`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Preprocessing failed' }));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Preprocessing failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Preprocessing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect to preprocessing service' },
      { status: 500 }
    );
  }
}
