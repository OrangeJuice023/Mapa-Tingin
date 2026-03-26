import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ProcessedData from "@/models/ProcessedData";
import { locations } from "@/lib/locations";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");

    if (location) {
      // return last 24 processed records for that location
      const data = await ProcessedData.find({ location })
        .sort({ timestamp: -1 })
        .limit(24);
      return NextResponse.json(data);
    } else {
      // return latest record per location
      const latestDataPromises = locations.map((loc) => 
        ProcessedData.findOne({ location: loc.name }).sort({ timestamp: -1 })
      );
      const results = await Promise.all(latestDataPromises);
      return NextResponse.json(results.filter(r => r !== null));
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
