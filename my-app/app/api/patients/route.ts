import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';
import PatientHistory from '@/models/PatientHistory';

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

    // Fetch analysis history for each patient and attach it
    const patientsWithHistory = await Promise.all(
      patients.map(async (patient) => {
        const analysisHistory = await PatientHistory.find({ patient: patient._id })
          .sort({ visitDate: -1 })
          .lean();
        
        return {
          ...patient,
          analysisHistory: analysisHistory || [],
        };
      })
    );

    return NextResponse.json(
      { patients: patientsWithHistory },
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
