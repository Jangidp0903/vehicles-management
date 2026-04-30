import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import JobCard from "@/models/JobCard";

export async function POST(
  request: Request,
  { params }: { params: { vehicleId: string } }
) {
  try {
    await connectToDatabase();
    const { vehicleId } = await params;
    const { odometer } = await request.json();

    if (odometer === undefined || odometer === null) {
      return NextResponse.json(
        { success: false, error: "Odometer reading is required" },
        { status: 400 }
      );
    }

    // 1. Update Vehicle Status and Odometer
    const vehicle = await Vehicle.findOneAndUpdate(
      { vehicleId: vehicleId },
      { 
        status: "UNDER_INSPECTION",
        currentOdometer: odometer
      },
      { new: true }
    );

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    // 2. Create a Job Card for this vehicle
    const jobCardId = `JC-${Date.now()}`;
    const newJobCard = await JobCard.create({
      jobCardId: jobCardId,
      vehicleId: vehicleId,
      status: "OPEN",
      inspection: {
        odometer: odometer,
        checklist: {
          bodyAndFrame: "OK",
          tyresAndWheels: "OK",
          batteryAndCables: "OK",
          lightsAndIndicators: "OK",
          brakes: "OK"
        },
        findings: "",
        photos: [],
        isDamaged: false
      },
      repairDetails: {
        parts: [],
        estimatedCost: 0
      },
      closure: {
        finalCost: 0
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        vehicle,
        jobCard: newJobCard
      },
    });
  } catch (error) {
    console.error("Error during vehicle surrender:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
