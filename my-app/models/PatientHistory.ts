import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHistoryEntry {
  originalFilename: string;
  processedPath: string;
  processingSteps: string[];
  originalShape: number[];
  processedShape: number[];
  denoiseMethod: string;
}

export interface IPatientHistory extends Document {
  patient: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  visitDate: Date;
  imageCount: number;
  status: 'completed' | 'failed' | 'partial';
  entries: IHistoryEntry[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HistoryEntrySchema = new Schema(
  {
    originalFilename: { type: String, required: true },
    processedPath: { type: String, required: true },
    processingSteps: { type: [String], default: [] },
    originalShape: { type: [Number], default: [] },
    processedShape: { type: [Number], default: [] },
    denoiseMethod: { type: String, default: 'gaussian' },
  },
  { _id: false }
);

const PatientHistorySchema: Schema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visitDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    imageCount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'partial'],
      required: true,
    },
    entries: {
      type: [HistoryEntrySchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

PatientHistorySchema.index({ patient: 1 });
PatientHistorySchema.index({ uploadedBy: 1 });
PatientHistorySchema.index({ visitDate: -1 });

const PatientHistory: Model<IPatientHistory> =
  mongoose.models.PatientHistory ||
  mongoose.model<IPatientHistory>('PatientHistory', PatientHistorySchema);

export default PatientHistory;
