import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import JobCard from "@/models/JobCard";
import Vehicle from "@/models/Vehicle";

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

    // Sync vehicle status based on inspection result
    const vehicleStatus = updatedJobCard.inspection.isDamaged ? "DAMAGED" : "AVAILABLE";
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
