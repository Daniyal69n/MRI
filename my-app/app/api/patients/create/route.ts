import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';

// Generate unique patient ID
function generatePatientId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAT-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      firstName,
      lastName,
      age,
      gender,
      contactNumber,
      email,
      address,
      medicalHistory,
      notes,
      uploadedBy,
    } = body;

    // Validation
    if (!firstName || !lastName || !age || !gender || !contactNumber || !uploadedBy) {
      return NextResponse.json(
        { error: 'Required fields: firstName, lastName, age, gender, contactNumber, uploadedBy' },
        { status: 400 }
      );
    }

    // Generate unique patient ID
    let patientId = generatePatientId();
    let isUnique = false;
    let attempts = 0;
    
    // Ensure patientId is unique
    while (!isUnique && attempts < 10) {
      const existing = await Patient.findOne({ patientId });
      if (!existing) {
        isUnique = true;
      } else {
        patientId = generatePatientId();
        attempts++;
      }
    }

    // Create new patient
    const patient = await Patient.create({
      patientId,
      firstName,
      lastName,
      age: parseInt(age),
      gender,
      contactNumber,
      email: email || undefined,
      address: address || undefined,
      medicalHistory: medicalHistory || undefined,
      notes: notes || undefined,
      uploadedBy,
      status: 'pending',
    });

    // Return patient data
    const patientData = {
      id: patient._id,
      patientId: patient.patientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: patient.age,
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      email: patient.email,
      address: patient.address,
      medicalHistory: patient.medicalHistory,
      notes: patient.notes,
      status: patient.status,
      createdAt: patient.createdAt,
    };

    return NextResponse.json(
      { message: 'Patient registered successfully', patient: patientData },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Patient creation error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Patient ID already exists. Please try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
