import mongoose, { Schema, Document } from "mongoose";

export interface IJobCard extends Document {
  jobCardId: string;
  vehicleId: string;
  technicianId?: string;

  inspection: {
    odometer: number;
    checklist: {
      bodyAndFrame: "OK" | "DAMAGED";
      tyresAndWheels: "OK" | "DAMAGED";
      batteryAndCables: "OK" | "DAMAGED";
      lightsAndIndicators: "OK" | "DAMAGED";
      brakes: "OK" | "DAMAGED";
    };
    findings?: string;
    photos: string[];
    isDamaged: boolean; // derived
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

    inspection: {
      odometer: { type: Number, required: true },

      checklist: {
        bodyAndFrame: {
          type: String,
          enum: ["OK", "DAMAGED"],
          default: "OK",
        },
        tyresAndWheels: {
          type: String,
          enum: ["OK", "DAMAGED"],
          default: "OK",
        },
        batteryAndCables: {
          type: String,
          enum: ["OK", "DAMAGED"],
          default: "OK",
        },
        lightsAndIndicators: {
          type: String,
          enum: ["OK", "DAMAGED"],
          default: "OK",
        },
        brakes: {
          type: String,
          enum: ["OK", "DAMAGED"],
          default: "OK",
        },
      },

      findings: { type: String },
      photos: [{ type: String }],

      // ⚡ IMPORTANT: auto-calculate
      isDamaged: { type: Boolean, default: false },
    },

    repairDetails: {
      parts: [
        {
          partName: { type: String },
          price: { type: Number },
        },
      ],
      estimatedCost: { type: Number, default: 0 },
    },

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
