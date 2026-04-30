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

    // Sync status logic
    let vehicleStatus: string = updatedJobCard.inspection.isDamaged ? "DAMAGED" : "AVAILABLE";

    if (updatedJobCard.status === "CLOSED") {
      vehicleStatus = "AVAILABLE";
      // Mark technician as available again when job is closed
      if (updatedJobCard.technicianId) {
        await Technician.findOneAndUpdate(
          { empId: updatedJobCard.technicianId },
          { $set: { isAvailable: true } }
        );
      }
    } else if (updatedJobCard.technicianId) {
      // If assigned but not closed, it's under repair
      vehicleStatus = "UNDER_REPAIR";
      
      // Also ensure technician is marked as unavailable if they are assigned
      await Technician.findOneAndUpdate(
        { empId: updatedJobCard.technicianId },
        { $set: { isAvailable: false } }
      );
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

export async function GET(
  request: Request,
  { params }: { params: { jobCardId: string } }
) {
  try {
    await connectToDatabase();
    const { jobCardId } = await params;

    const jobCard = await JobCard.findOne({ jobCardId: jobCardId });

    if (!jobCard) {
      return NextResponse.json(
        { success: false, error: "Job Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: jobCard,
    });
  } catch (error) {
    console.error("Error fetching job card:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
