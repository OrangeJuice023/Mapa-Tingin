import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline";

export async function POST(req: Request) {
  try {
    const { lat, lon, name } = await req.json();

    if (!lat || !lon || !name) {
      return NextResponse.json({ error: "Missing required fields", stage: "input" }, { status: 400 });
    }

    const result = await runPipeline(lat, lon, name);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stage: "api" }, { status: 500 });
  }
}
