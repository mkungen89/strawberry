#!/bin/bash

# 🚀 Vexcraft Deployment Script
# Automatiskt rensar cache och deployer hemsidan
# Användning: ./deploy.sh

set -e

echo "🚀 Vexcraft Deployment Starting..."
echo ""

# 1. Döda gamla Node-processer (except PM2 daemon)
echo "1️⃣ Dödar gamla Next.js-processer..."
pkill -f "next start" || true
pkill -f "node src/index" || true
sleep 1

# 2. Synka Git
echo "2️⃣ Synkar Git från origin..."
git pull origin main --rebase

# 3. Rensa cache HELT
echo "3️⃣ Rensar cache..."
rm -rf .next/cache .next/static .next/server .next/standalone
rm -rf node_modules/.cache
echo "   ✅ Cache borta"

# 4. Rebuild
echo "4️⃣ Bygger om appen..."
npm run build

# 5. Restart PM2
echo "5️⃣ Startar om PM2..."
pm2 stop vexcraft || true
sleep 2
pm2 start vexcraft
pm2 save
sleep 3

# 6. Verifiera
echo "6️⃣ Verifierar deployment..."
STATUS=$(pm2 status vexcraft | grep "online" | wc -l)

if [ $STATUS -eq 1 ]; then
  echo ""
  echo "✅ DEPLOYMENT LYCKAT!"
  echo ""
  echo "Hemsidan körs på: http://localhost:3000"
  echo "Live på: https://vexcraft.io"
  echo ""
  echo "Senaste logs:"
  pm2 logs vexcraft --lines 10 --nostream
else
  echo ""
  echo "❌ DEPLOYMENT MISSLYCKADES!"
  echo "Kolla logs: pm2 logs vexcraft"
  exit 1
fi
