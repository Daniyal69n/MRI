import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const uploadedBy = searchParams.get('uploadedBy');

    // Build query
    const query: any = {};
    if (uploadedBy) {
      query.uploadedBy = uploadedBy;
    }

    // Get all patients (optionally filtered by user)
    const patients = await Patient.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { patients },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get patients error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
