import mongoose, { Schema, Document } from "mongoose";

export interface IJobCard extends Document {
  jobCardId: string;
  vehicleId: string; // Linked to Vehicle.vehicleId
  technicianId?: string; // Linked to Technician.empId
  inspection: {
    odometer: number;
    findings: string;
    photos: string[];
    isDamaged: boolean;
  };
  repairDetails: {
    parts: { partName: string; price: number }[];
    estimatedCost: number;
  };
  closure: {
    finalCost: number;
    closedAt?: Date;
  };
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
}

const JobCardSchema: Schema = new Schema(
  {
    jobCardId: { type: String, required: true, unique: true, index: true },
    vehicleId: { type: String, required: true },
    technicianId: { type: String },

    // Stage 2: Inspection Data
    inspection: {
      odometer: { type: Number },
      findings: { type: String },
      photos: [{ type: String }],
      isDamaged: { type: Boolean, default: false },
    },

    // Stage 3: Repair & Parts
    repairDetails: {
      parts: [
        {
          partName: { type: String },
          price: { type: Number },
        },
      ],
      estimatedCost: { type: Number, default: 0 },
    },

    // Stage 4: Closure Data
    closure: {
      finalCost: { type: Number, default: 0 },
      closedAt: { type: Date },
    },

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "CLOSED"],
      default: "OPEN",
    },
  },
  { timestamps: true },
);

export default mongoose.models.JobCard ||
  mongoose.model<IJobCard>("JobCard", JobCardSchema);
