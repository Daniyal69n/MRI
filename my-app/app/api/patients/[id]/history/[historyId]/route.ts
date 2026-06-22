import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PatientHistory from '@/models/PatientHistory';
import mongoose from 'mongoose';

function resolveParams(params: Promise<{ id: string; historyId: string }> | { id: string; historyId: string }) {
  return Promise.resolve(params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; historyId: string }> | { id: string; historyId: string } }
) {
  try {
    await connectDB();
    const { id, historyId } = await resolveParams(params);

    if (!mongoose.Types.ObjectId.isValid(historyId)) {
      return NextResponse.json({ error: 'Invalid history ID' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      gm_percent, 
      wm_percent, 
      csf_percent, 
      tumor_detected, 
      tumor_area_px,
      entries,
      imageCount,
      status,
      notes
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (gm_percent !== undefined) updateData.gm_percent = gm_percent;
    if (wm_percent !== undefined) updateData.wm_percent = wm_percent;
    if (csf_percent !== undefined) updateData.csf_percent = csf_percent;
    if (tumor_detected !== undefined) updateData.tumor_detected = tumor_detected;
    if (tumor_area_px !== undefined) updateData.tumor_area_px = tumor_area_px;
    if (entries !== undefined) updateData.entries = entries;
    if (imageCount !== undefined) updateData.imageCount = imageCount;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await PatientHistory.findByIdAndUpdate(
      historyId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'History not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'History updated', history: updated },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Update patient history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
