import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const sanitized = text.replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/`/g, "\\`");
    const cmd = `python3 /Users/macbookpro/voice-automation/speak.py "${sanitized}"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("Speech execution error:", err);
      } else {
        console.log("Speech triggered successfully:", stdout);
      }
    });

    return NextResponse.json({ success: true, message: "Speech triggered" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text") || "नमस्ते गीतंश";
  
  const sanitized = text.replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/`/g, "\\`");
  const cmd = `python3 /Users/macbookpro/voice-automation/speak.py "${sanitized}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("Speech execution error:", err);
    } else {
      console.log("Speech triggered successfully:", stdout);
    }
  });

  return NextResponse.json({ success: true, message: "Speech triggered", text });
}
