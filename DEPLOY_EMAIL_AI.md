# 🚀 Quick Deployment Guide — Email AI Integration

## ⚡ TL;DR (5 minuter)

```bash
# 1. Lägg till email-lösenord i .env
nano .env
# Lägg till: EMAIL_PASSWORD=<lösenord för support@vexcraft.io>

# 2. Pull senaste koden
cd /root/.openclaw/workspace/vexcraft/hemsida
git pull origin main

# 3. Installera dependencies
npm install

# 4. Bygg projektet
npm run build

# 5. Starta PM2
pm2 start ecosystem.config.js

# 6. Kolla status
pm2 status
pm2 logs email-orchestrator
```

---

## ✅ Verifiering

### Test 1: Skicka Email till support@vexcraft.io

1. Skicka ett test-email från din egen email
2. Vänta 5 minuter (eller mindre)
3. Kolla loggar: `pm2 logs email-orchestrator`
4. Du borde se:
   ```
   [EmailListener] Found 1 unread emails
   [EmailListener] Saved email cm6... from your-email@example.com
   [EmailAI] Processing 1 pending emails...
   [EmailAI] Generating response for cm6...
   [EmailAI] Created draft for cm6...
   ```

### Test 2: Hämta Drafts via API

```bash
curl http://localhost:3000/api/admin/emails
```

Du borde se din email + AI-genererat draft.

### Test 3: Godkänn & Skicka Draft

```bash
# Ersätt <draft-id> med id från förra steget
curl -X POST http://localhost:3000/api/admin/emails/<draft-id>/send \
  -H "Content-Type: application/json" \
  -d '{"approvedBy": "Mikael"}'
```

Kolla din inbox — du borde få ett svar från Elin!

---

## 🔧 PM2 Commands

```bash
# Visa status
pm2 status

# Visa loggar (real-time)
pm2 logs email-orchestrator

# Stoppa orchestrator
pm2 stop email-orchestrator

# Starta orchestrator
pm2 start email-orchestrator

# Restart orchestrator
pm2 restart email-orchestrator

# Spara PM2-lista (auto-start on reboot)
pm2 save
pm2 startup
```

---

## 🐛 Troubleshooting

### Orchestrator crashar direkt

```bash
pm2 logs email-orchestrator --lines 100
```

**Vanliga fel:**
- `EMAIL_PASSWORD not configured` → Lägg till i `.env`
- `ANTHROPIC_API_KEY not set` → Kontrollera `.env`
- `Database connection error` → Kolla PostgreSQL

### Inga emails hittas

- Kontrollera att email-kontot har nya emails
- Testa IMAP manuellt:
  ```bash
  node dist/services/email-listener.js
  ```

### AI-svar genereras inte

- Kontrollera `ANTHROPIC_API_KEY`
- Kolla Claude-quota

---

## 📊 Monitoring

### Kolla Database

```bash
# Logga in i Prisma Studio (lokalt)
npx prisma studio

# Eller query direkt:
psql -U vexcraft -d vexcraft -c "SELECT * FROM \"EmailThread\" ORDER BY \"receivedAt\" DESC LIMIT 10;"
```

### Kolla Loggar

```bash
# PM2 logs
pm2 logs email-orchestrator

# System logs
tail -f /root/.openclaw/workspace/vexcraft/hemsida/logs/email-orchestrator-out.log
tail -f /root/.openclaw/workspace/vexcraft/hemsida/logs/email-orchestrator-error.log
```

---

## 🎯 Nästa Steg (Efter Test)

1. **Frontend Admin Panel** — Bygg UI för att granska drafts visuellt
2. **Auto-send** — Ta bort manuell granskning (om drafts alltid är bra)
3. **Email Metrics** — Spåra svarstid, AI-kvalitet, kundnöjdhet
4. **Multi-språk** — Detektera och svara på kundens språk

---

**Status:** ✅ Deployment-klar  
**Deadline:** 26 mars (test före kunder 27 mars)  
**Contact:** Mikael / Vex
