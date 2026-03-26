import { NextResponse } from "next/server";
import { locations } from "@/lib/locations";
import { runPipeline } from "@/lib/pipeline";

export async function POST() {
  try {
    const pipelinePromises = locations.map((loc) => runPipeline(loc.lat, loc.lon, loc.name));
    const results = await Promise.all(pipelinePromises);
    
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stage: "api" }, { status: 500 });
  }
}
