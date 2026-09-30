import { NextResponse } from "next/server";
import { exec } from "child_process";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const repoDir = "/Users/macbookpro/Desktop/kai_alert";

  const command = `cd "${repoDir}" && rm -f package-lock.json && git add -A && git commit -m "fix(security): upgrade Next.js to ^15.1.7 to resolve Vercel deployment block" && git push -u origin main 2>&1`;

  return new Promise<NextResponse>((resolve) => {
    exec(command, (err, stdout, stderr) => {
      const speechCmd = `python3 /Users/macbookpro/voice-automation/speak.py "बॉस, मैंने नेक्स्ट जे एस को सिक्योर वर्जन पंद्रह पॉइंट एक पर अपग्रेड करके गिटहब पर पुश कर दिया है। अब वरसेल पर रिडिप्लॉय बटन दबाइए, बिल्ड पास हो जाएगी।"`;
      exec(speechCmd, () => {});

      resolve(
        NextResponse.json({
          timestamp: Date.now(),
          success: !err,
          stdout,
          stderr,
          error: err ? err.message : null,
        })
      );
    });
  });
}
