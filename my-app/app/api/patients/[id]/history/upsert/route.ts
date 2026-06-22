import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';
import PatientHistory from '@/models/PatientHistory';
import mongoose from 'mongoose';

function resolveParams(params: Promise<{ id: string }> | { id: string }) {
  return Promise.resolve(params);
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
    const {
      historyId,
      uploadedBy,
      visitDate,
      imageCount,
      status,
      entries,
      notes,
      gm_percent,
      wm_percent,
      csf_percent,
      tumor_detected,
      tumor_area_px,
    } = body;

    // Normalize visitDate to a UTC day range so same-day reuploads match reliably.
    const visit = visitDate ? new Date(visitDate) : new Date();
    const visitDateStart = new Date(Date.UTC(visit.getUTCFullYear(), visit.getUTCMonth(), visit.getUTCDate(), 0, 0, 0, 0));
    const visitDateEnd = new Date(visitDateStart);
    visitDateEnd.setUTCDate(visitDateEnd.getUTCDate() + 1);

    // Build update object
    const updateData: Record<string, any> = {};
    if (uploadedBy) updateData.uploadedBy = uploadedBy;
    if (imageCount !== undefined) updateData.imageCount = Number(imageCount);
    if (status) updateData.status = status;
    if (Array.isArray(entries)) {
      updateData.entries = entries.map((e: any) => ({
        originalFilename: e.originalFilename ?? '',
        processedPath: e.processedPath ?? '',
        processingSteps: Array.isArray(e.processingSteps) ? e.processingSteps : [],
        originalShape: Array.isArray(e.originalShape) ? e.originalShape : [],
        processedShape: Array.isArray(e.processedShape) ? e.processedShape : [],
        denoiseMethod: e.denoiseMethod ?? 'gaussian',
      }));
    }
    if (notes !== undefined) updateData.notes = notes;

    // Volumetric fields
    if (gm_percent !== undefined) updateData.gm_percent = gm_percent;
    if (wm_percent !== undefined) updateData.wm_percent = wm_percent;
    if (csf_percent !== undefined) updateData.csf_percent = csf_percent;
    if (tumor_detected !== undefined) updateData.tumor_detected = tumor_detected;
    if (tumor_area_px !== undefined) updateData.tumor_area_px = tumor_area_px;

    console.log('History upsert body keys:', Object.keys(body));
    console.log('History upsert volumetrics:', {
      gm_percent,
      wm_percent,
      csf_percent,
      tumor_detected,
      tumor_area_px,
    });

    const query =
      historyId && mongoose.Types.ObjectId.isValid(historyId)
        ? { _id: historyId, patient: id }
        : { patient: id, visitDate: { $gte: visitDateStart, $lt: visitDateEnd } };

    let record = await PatientHistory.findOne(query);

    if (record) {
        record = await PatientHistory.findByIdAndUpdate(
          record._id,
          { $set: { ...updateData, visitDate: record.visitDate ?? visitDateStart } },
          { new: true, runValidators: true }
        );
        if (!record) {
          return NextResponse.json({ error: 'Failed to update history' }, { status: 500 });
        }
      return NextResponse.json(
        {
          message: 'History upserted',
          history: record,
        },
        { status: 200 }
      );
    }

    record = await PatientHistory.create({
      patient: id,
      uploadedBy: uploadedBy ?? patient.uploadedBy,
      visitDate: visitDateStart,
      imageCount: Number(imageCount ?? 0),
      status: status ?? 'completed',
      ...updateData,
    });

    return NextResponse.json(
      {
        message: 'History upserted',
        history: record,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Upsert patient history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
