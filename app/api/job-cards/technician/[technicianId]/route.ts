import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import JobCard from "@/models/JobCard";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ technicianId: string }> }
) {
  try {
    await connectToDatabase();
    const { technicianId } = await params;

    const jobCards = await JobCard.find({ technicianId }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: jobCards,
    });
  } catch (error) {
    console.error("Error fetching technician job cards:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
