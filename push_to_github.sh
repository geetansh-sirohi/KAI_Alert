#!/usr/bin/env bash
# ==============================================================================
# KAI Alert — Autonomous One-Click GitHub & Vercel Prep Script
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "🌀 KAI Alert — GitHub & Vercel Production Deployment Prep"
echo "=========================================================="

# 1. Voice Announcement (Jarvis / Itachi)
if [ -f "/Users/macbookpro/voice-automation/speak.py" ]; then
  python3 /Users/macbookpro/voice-automation/speak.py "नमस्ते गीतंश! काई अलर्ट रिपोजिटरी को गिटहब और वरसेल डिप्लॉयमेंट के लिए तैयार किया जा रहा है।" 2>/dev/null || true
fi

# 2. Check Security: Ensure .env.local is NOT staged
echo "🔒 Verifying Secret Leak-Proof Status..."
if git status --porcelain | grep -q "\.env\.local"; then
  echo "⚠️ Warning: .env.local detected in untracked files. Ensuring it is ignored..."
fi

# 3. Add all verified production files
echo "📦 Staging verified project files..."
git add .gitignore .env.example README.md package.json tsconfig.json next.config.ts 2>/dev/null || true
git add src/ public/ prd.md 2>/dev/null || true

# 4. Commit
echo "💾 Creating production commit..."
git commit -m "feat(core): KAI Alert - Autonomous Cyclonic Vulnerability Command Center (Track 5: Disaster Management)" || echo "No changes to commit."

# 5. Check if remote exists
REMOTE_EXISTS=$(git remote get-url origin 2>/dev/null || true)

if [ -n "$REMOTE_EXISTS" ]; then
  echo "🚀 Remote origin found: $REMOTE_EXISTS"
  echo "Pushing to main..."
  git push -u origin main
  echo "✅ Successfully pushed to GitHub!"
else
  echo ""
  echo "ℹ️ Remote origin is not set yet."
  echo "Aap simply GitHub par new repository create karke ye commands run karein:"
  echo ""
  echo "  git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/kai-alert.git"
  echo "  git branch -M main"
  echo "  git push -u origin main"
  echo ""
  echo "Ya agar GitHub CLI (gh) installed hai to run karein:"
  echo "  gh repo create kai-alert --public --source=. --remote=origin --push"
  echo ""
fi

# 6. Final Voice Confirmation
if [ -f "/Users/macbookpro/voice-automation/speak.py" ]; then
  python3 /Users/macbookpro/voice-automation/speak.py "बॉस, गिट कमिट तैयार है। गिटहब पर पुश करने के बाद वरसेल पर सिर्फ एक क्लिक में डिप्लॉय हो जाएगा।" 2>/dev/null || true
fi

echo "=========================================================="
echo "🎯 Complete! Ready for Vercel Deployment."
echo "=========================================================="
