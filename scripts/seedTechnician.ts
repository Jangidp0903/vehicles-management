import "dotenv/config";
import mongoose from "mongoose";
import Technician from "../models/Technician";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env",
  );
}

const seedTechnician = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    await Technician.deleteMany({});
    console.log("Cleared existing technicians.");

    const technician = {
      name: "Harish Singh",
      empId: "TECH-001",
      isAvailable: true,
    };

    await Technician.create(technician);
    console.log("1 Technician seeded ✅");
  } catch (error) {
    console.error("Error seeding technician:", error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seedTechnician();
