import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export async function GET(req: Request) {
  const repoDir = "/Users/macbookpro/Desktop/kai_alert";
  const remoteUrl = "https://github.com/geetansh-sirohi/KAI_Alert.git";

  // Commands to stage, commit, set remote, and push
  const commands = [
    `cd "${repoDir}"`,
    `git branch -M main`,
    `git remote remove origin 2>/dev/null || true`,
    `git remote add origin ${remoteUrl}`,
    `git add .gitignore .env.example README.md package.json tsconfig.json next.config.ts src/ public/ prd.md`,
    `git commit -m "feat(core): KAI Alert - Autonomous Cyclonic Vulnerability Command Center (Track 5: Disaster Management)" || true`,
    `git push -u origin main 2>&1`
  ].join(" && ");

  return new Promise<NextResponse>((resolve) => {
    exec(commands, (err, stdout, stderr) => {
      // Also trigger voice announcement
      const speechCmd = `python3 /Users/macbookpro/voice-automation/speak.py "बॉस, कोड गिटहब पर सफलतापूर्वक पुश हो गया है।"`;
      exec(speechCmd, () => {});

      if (err) {
        resolve(
          NextResponse.json({
            success: false,
            error: err.message,
            stdout,
            stderr,
          }, { status: 200 })
        );
      } else {
        resolve(
          NextResponse.json({
            success: true,
            stdout,
            stderr,
          })
        );
      }
    });
  });
}
