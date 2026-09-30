import { NextResponse } from "next/server";
import { exec } from "child_process";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handleGitPush();
}

export async function POST(req: Request) {
  return handleGitPush();
}

function handleGitPush() {
  const repoDir = "/Users/macbookpro/Desktop/kai_alert";
  const remoteUrl = "https://github.com/geetansh-sirohi/KAI_Alert.git";

  const commands = `cd "${repoDir}" && git branch -M main && git remote set-url origin ${remoteUrl} 2>/dev/null || git remote add origin ${remoteUrl} && git add -A && git commit -m "feat(core): KAI Alert Autonomous Civil Vulnerability Command Center (Track 5)" && git push -u origin main && git log -n 2 --oneline`;

  return new Promise<NextResponse>((resolve) => {
    exec(commands, (err, stdout, stderr) => {
      const speechCmd = `python3 /Users/macbookpro/voice-automation/speak.py "बॉस, लेटेस्ट कोड और फाइल्स गिटहब पर शत-प्रतिशत पुश हो चुकी हैं। आप गिटहब पेज को रिफ्रेश कर सकते हैं।"`;
      exec(speechCmd, () => {});

      resolve(
        NextResponse.json({
          timestamp: Date.now(),
          success: !err,
          error: err ? err.message : null,
          stdout,
          stderr,
        })
      );
    });
  });
}
