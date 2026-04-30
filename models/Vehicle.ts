import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle extends Document {
  vehicleId: string;
  modelName?: string;
  status: 'RENTED' | 'UNDER_INSPECTION' | 'DAMAGED' | 'UNDER_REPAIR' | 'AVAILABLE';
  currentOdometer?: number;
  lastServiceDate?: Date;
}

const VehicleSchema: Schema = new Schema(
  {
    vehicleId: { type: String, required: true, unique: true },
    modelName: { type: String },
    status: {
      type: String,
      enum: ['RENTED', 'UNDER_INSPECTION', 'DAMAGED', 'UNDER_REPAIR', 'AVAILABLE'],
      default: 'RENTED',
    },
    currentOdometer: { type: Number },
    lastServiceDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
