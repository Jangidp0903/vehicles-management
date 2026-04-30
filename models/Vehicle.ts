import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
  vehicleId: string; // Human readable ID like ZOM-EV-001
  modelName?: string;
  status:
    | "RENTED"
    | "UNDER_INSPECTION"
    | "DAMAGED"
    | "UNDER_REPAIR"
    | "AVAILABLE";
  currentOdometer?: number;
}

const VehicleSchema: Schema = new Schema(
  {
    vehicleId: { type: String, required: true, unique: true, index: true },
    modelName: { type: String },
    status: {
      type: String,
      enum: [
        "RENTED",
        "UNDER_INSPECTION",
        "DAMAGED",
        "UNDER_REPAIR",
        "AVAILABLE",
      ],
      default: "AVAILABLE",
    },
    currentOdometer: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Vehicle ||
  mongoose.model<IVehicle>("Vehicle", VehicleSchema);
