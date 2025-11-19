#!/bin/bash
# Force trigger Vercel deployment via empty commit

cd "$(dirname "$0")"

echo "🔄 Creating empty commit to trigger Vercel deployment..."
git commit --allow-empty -m "Trigger Vercel deployment - $(date +%Y%m%d-%H%M%S)"

echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Done! Vercel should deploy in 1-2 minutes."
echo "🔍 Check: https://vercel.com/dashboard"

