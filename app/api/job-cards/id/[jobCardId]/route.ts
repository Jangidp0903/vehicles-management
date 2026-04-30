import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import JobCard from "@/models/JobCard";

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
