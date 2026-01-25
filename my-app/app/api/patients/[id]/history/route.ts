import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';
import PatientHistory from '@/models/PatientHistory';
import mongoose from 'mongoose';

function resolveParams(params: Promise<{ id: string }> | { id: string }) {
  return Promise.resolve(params);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const { id } = await resolveParams(params);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 });
    }

    const patient = await Patient.findById(id).lean();
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const history = await PatientHistory.find({ patient: id })
      .sort({ visitDate: -1 })
      .lean();

    return NextResponse.json({ history }, { status: 200 });
  } catch (error: unknown) {
    console.error('Get patient history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const { id } = await resolveParams(params);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 });
    }

    const patient = await Patient.findById(id).lean();
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const body = await request.json();
    const { uploadedBy, visitDate, imageCount, status, entries, notes } = body;

    if (!uploadedBy || imageCount == null || !status || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Required: uploadedBy, imageCount, status, entries' },
        { status: 400 }
      );
    }

    const record = await PatientHistory.create({
      patient: id,
      uploadedBy,
      visitDate: visitDate ? new Date(visitDate) : new Date(),
      imageCount: Number(imageCount),
      status,
      entries: entries.map((e: Record<string, unknown>) => ({
        originalFilename: e.originalFilename ?? '',
        processedPath: e.processedPath ?? '',
        processingSteps: Array.isArray(e.processingSteps) ? e.processingSteps : [],
        originalShape: Array.isArray(e.originalShape) ? e.originalShape : [],
        processedShape: Array.isArray(e.processedShape) ? e.processedShape : [],
        denoiseMethod: e.denoiseMethod ?? 'gaussian',
      })),
      notes: notes ?? undefined,
    });

    return NextResponse.json(
      { message: 'History recorded', history: record },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create patient history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
