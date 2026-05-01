import mongoose, { Schema, Document } from "mongoose";

export interface IChecklistItem {
  status: "OK" | "DAMAGED" | "WEAR" | "MISSING" | null;
  notes?: string;
  photo?: string;
}

export interface IJobCard extends Document {
  jobCardId: string;
  vehicleId: string;
  technicianId?: string;

  inspection: {
    odometer: number;
    checklist: {
      bodyAndFrame: IChecklistItem;
      tyresAndWheels: IChecklistItem;
      batteryAndCables: IChecklistItem;
      lightsAndIndicators: IChecklistItem;
      brakes: IChecklistItem;
    };
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

    inspection: {
      odometer: { type: Number, required: true },

      checklist: {
        bodyAndFrame: {
          status: {
            type: String,
            enum: ["OK", "DAMAGED", "WEAR", "MISSING", null],
            default: null,
          },
          notes: { type: String },
          photo: { type: String },
        },

        tyresAndWheels: {
          status: {
            type: String,
            enum: ["OK", "DAMAGED", "WEAR", "MISSING", null],
            default: null,
          },
          notes: { type: String },
          photo: { type: String },
        },

        batteryAndCables: {
          status: {
            type: String,
            enum: ["OK", "DAMAGED", "WEAR", "MISSING", null],
            default: null,
          },
          notes: { type: String },
          photo: { type: String },
        },

        lightsAndIndicators: {
          status: {
            type: String,
            enum: ["OK", "DAMAGED", "WEAR", "MISSING", null],
            default: null,
          },
          notes: { type: String },
          photo: { type: String },
        },

        brakes: {
          status: {
            type: String,
            enum: ["OK", "DAMAGED", "WEAR", "MISSING", null],
            default: null,
          },
          notes: { type: String },
          photo: { type: String },
        },
      },

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
