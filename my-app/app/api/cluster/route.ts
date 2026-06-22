/**
 * Next.js API Route: Cluster Preprocessed MRI
 * Proxies a request to the FastAPI backend /cluster endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'https://mri-production-1faa.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let payload: Record<string, unknown>;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      payload = Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [
          key,
          typeof value === 'string' ? value : value.name,
        ])
      );
    } else {
      payload = await request.json();
    }

    const response = await fetch(`${FASTAPI_BACKEND_URL}/cluster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseContentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      if (responseContentType.includes('application/json')) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData.error || errorData.detail || 'Clustering failed' },
          { status: response.status }
        );
      }

      const errorText = await response.text().catch(() => 'Clustering failed');
      return NextResponse.json(
        { error: errorText || 'Clustering failed' },
        { status: response.status }
      );
    }

    if (responseContentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        'content-type': responseContentType || 'text/plain; charset=utf-8',
      },
    });
  } catch (error: unknown) {
    console.error('Clustering proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to clustering service' },
      { status: 500 }
    );
  }
}

