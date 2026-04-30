import mongoose, { Schema, Document } from 'mongoose';

export interface ITechnician extends Document {
  name: string;
  empId: string;
  isAvailable: boolean;
}

const TechnicianSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    empId: { type: String, required: true, unique: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Technician || mongoose.model<ITechnician>('Technician', TechnicianSchema);
