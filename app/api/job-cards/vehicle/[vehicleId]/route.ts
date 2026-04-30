import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import JobCard from "@/models/JobCard";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    await connectToDatabase();
    const { vehicleId } = await params;
    
    const jobCard = await JobCard.findOne({ vehicleId: vehicleId })
      .sort({ createdAt: -1 });

    if (!jobCard) {
      return NextResponse.json(
        { success: false, error: "No Job Card found for this vehicle" },
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
