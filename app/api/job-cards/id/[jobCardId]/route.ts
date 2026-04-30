import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import JobCard from "@/models/JobCard";
import Vehicle from "@/models/Vehicle";
import Technician from "@/models/Technician";

export async function PATCH(
  request: Request,
  { params }: { params: { jobCardId: string } }
) {
  try {
    await connectToDatabase();
    const { jobCardId } = await params;
    const body = await request.json();

    const updatedJobCard = await JobCard.findOneAndUpdate(
      { jobCardId: jobCardId },
      { $set: body },
      { new: true }
    );

    if (!updatedJobCard) {
      return NextResponse.json(
        { success: false, error: "Job Card not found" },
        { status: 404 }
      );
    }

    // If a technician is assigned, mark them as unavailable
    if (body.technicianId) {
      await Technician.findOneAndUpdate(
        { empId: body.technicianId },
        { $set: { isAvailable: false } }
      );
    }

    // Sync vehicle status based on inspection result and repair stage
    let vehicleStatus = updatedJobCard.inspection.isDamaged ? "DAMAGED" : "AVAILABLE";
    
    // If a technician is assigned, the vehicle is officially under repair
    if (updatedJobCard.technicianId) {
      vehicleStatus = "UNDER_REPAIR";
    }

    await Vehicle.findOneAndUpdate(
      { vehicleId: updatedJobCard.vehicleId },
      { $set: { status: vehicleStatus } }
    );

    return NextResponse.json({
      success: true,
      data: updatedJobCard,
    });
  } catch (error) {
    console.error("Error updating job card:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
