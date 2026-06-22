/**
 * Next.js API Route: Cluster Preprocessed MRI
 * Proxies a request to the FastAPI backend /cluster endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${FASTAPI_BACKEND_URL}/cluster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || data?.detail || 'Clustering failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error('Clustering error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to clustering service' },
      { status: 500 }
    );
  }
}

