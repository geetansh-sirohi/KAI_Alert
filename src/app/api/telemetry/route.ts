import { NextRequest, NextResponse } from "next/server";
import cycloneData from "../../../../public/data/cyclone_benchmark_dana.json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") || "REPLAY_DANA";

  if (mode === "LIVE_SENTINEL") {
    return NextResponse.json({
      mode: "REPLAY_DANA",
      source: "BENCHMARK_FALLBACK",
      points: cycloneData,
      status: "LIVE_TRACK_UNAVAILABLE",
    });
  }

  return NextResponse.json({
    mode: "REPLAY_DANA",
    source: "IMD_HISTORICAL_DANA_2024",
    points: cycloneData,
    status: "REPLAY_READY",
  });
}
