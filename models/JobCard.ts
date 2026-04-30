import mongoose, { Schema, Document } from 'mongoose';

export interface IJobCard extends Document {
  jobCardId: string;
  vehicleId: string;
  technicianId: string;
  inspection: {
    odometer?: number;
    findings?: string;
    photos?: string[];
    isDamaged?: boolean;
  };
  repairDetails: {
    parts: { partName: string; price: number }[];
    estimatedCost?: number;
  };
  closure: {
    finalCost?: number;
    closedAt?: Date;
  };
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
}

const JobCardSchema: Schema = new Schema(
  {
    jobCardId: { type: String, required: true, unique: true },
    vehicleId: { type: String, required: true }, // Reference to Vehicle vehicleId
    technicianId: { type: String }, // Reference to Technician empId or name
    
    // Stage 2: Inspection
    inspection: {
      odometer: { type: Number },
      findings: { type: String },
      photos: [{ type: String }],
      isDamaged: { type: Boolean, default: false }
    },

    // Stage 3: Job Card Details
    repairDetails: {
      parts: [
        {
          partName: { type: String },
          price: { type: Number }
        }
      ],
      estimatedCost: { type: Number }
    },

    // Stage 4: Closure
    closure: {
      finalCost: { type: Number },
      closedAt: { type: Date }
    },
    
    status: { 
      type: String, 
      enum: ['OPEN', 'IN_PROGRESS', 'CLOSED'],
      default: 'OPEN'
    }
  },
  { timestamps: true }
);

export default mongoose.models.JobCard || mongoose.model<IJobCard>('JobCard', JobCardSchema);
