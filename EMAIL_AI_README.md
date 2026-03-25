# Email AI Integration — Elin Support Bot 🤖

**Status:** ✅ Klart för deployment  
**Deadline:** 26 mars (klart för test före kunder 27 mars)

---

## 📋 Översikt

Elin (AI-assistent baserad på Claude Haiku) läser och svarar automatiskt på emails till `support@vexcraft.io`.

### Funktioner:
1. ✅ IMAP-listener (läser olästa emails var 5:e minut)
2. ✅ AI-processor (Elin genererar professionella svar)
3. ✅ SMTP-sender (skickar godkända svar)
4. ✅ Database (EmailThread & EmailDraft tabeller)
5. ✅ API endpoints (`GET /api/admin/emails`, `POST /api/admin/emails/[id]/send`)
6. ✅ PM2-integration (automatisk restart)

---

## 🔧 Installation & Setup

### 1. Lägg till Email-lösenord i `.env`

```bash
EMAIL_PASSWORD=<lösenord för support@vexcraft.io>
```

**VIKTIGT:** Detta måste fyllas i innan orchestrator startas!

### 2. Kör Database Migration (redan gjort)

```bash
npm run db:migrate
```

Detta skapar tabellerna `EmailThread` och `EmailDraft`.

### 3. Bygg Services

```bash
npm run build
```

Detta kompilerar TypeScript-filerna i `src/services/` till `dist/services/`.

### 4. Testa Manuellt (Valfritt)

```bash
# Testa IMAP-listener
node dist/services/email-listener.js

# Testa AI-processor
node dist/services/email-ai-processor.js

# Testa SMTP-sender
node dist/services/email-sender.js
```

---

## 🚀 Starta Email Orchestrator

### Med PM2 (Rekommenderat):

```bash
# Starta både web + email orchestrator
pm2 start ecosystem.config.js

# Visa status
pm2 status

# Visa loggar för email orchestrator
pm2 logs email-orchestrator

# Stoppa orchestrator
pm2 stop email-orchestrator

# Restart orchestrator
pm2 restart email-orchestrator
```

### Manuellt (För testing):

```bash
npm run start:email
```

Tryck `Ctrl+C` för att stoppa.

---

## 🛠️ API Endpoints

### `GET /api/admin/emails`

Hämta alla email-trådar med AI-drafts.

**Query params:**
- `status` — Filtrera efter status (`PENDING`, `DRAFT`, `SENT`, `FAILED`)
- `limit` — Max antal (default: 50)

**Response:**
```json
{
  "threads": [
    {
      "id": "cm6abcd...",
      "from": "customer@example.com",
      "subject": "Question about Discord bot",
      "originalEmail": "Hi, I want...",
      "aiResponse": "Hello! Thank you...",
      "status": "DRAFT",
      "receivedAt": "2026-03-25T10:00:00Z",
      "draft": {
        "id": "cm6xyz...",
        "to": "customer@example.com",
        "subject": "Re: Question about Discord bot",
        "body": "Hello! Thank you...",
        "approved": false
      }
    }
  ],
  "count": 1
}
```

---

### `POST /api/admin/emails/[id]/send`

Godkänn och skicka ett draft.

**Body:**
```json
{
  "approvedBy": "Mikael"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

## 📊 Database Schema

### `EmailThread`

Lagrar alla inkommande emails och AI-svar.

| Field          | Type     | Description                      |
|----------------|----------|----------------------------------|
| id             | String   | Primary key                      |
| from           | String   | Avsändare (email)                |
| subject        | String   | Ämnesrad                         |
| originalEmail  | Text     | Original email-body              |
| aiResponse     | Text?    | AI-genererat svar (null = inte processad än) |
| status         | String   | `PENDING`, `DRAFT`, `SENT`, `FAILED` |
| receivedAt     | DateTime | När emailen kom in               |
| processedAt    | DateTime?| När AI processade den            |
| sentAt         | DateTime?| När svaret skickades             |
| failureReason  | String?  | Om FAILED, varför                |
| messageId      | String?  | Email Message-ID (för threading) |
| inReplyTo      | String?  | Message-ID vi svarar på          |

---

### `EmailDraft`

Sparar AI-genererade drafts för manuell granskning.

| Field          | Type     | Description                      |
|----------------|----------|----------------------------------|
| id             | String   | Primary key                      |
| emailThreadId  | String   | FK → EmailThread                 |
| to             | String   | Mottagare (email)                |
| subject        | String   | Ämnesrad                         |
| body           | Text     | Email-body (med signatur)        |
| approved       | Boolean  | Godkänd för sending?             |
| approvedAt     | DateTime?| När den godkändes                |
| approvedBy     | String?  | Vem som godkände (admin name)    |

---

## 🔄 Workflow

1. **Email kommer in** → IMAP-listener hittar den → Sparas i `EmailThread` (status: `PENDING`)
2. **AI-processor** → Läser `PENDING` emails → Genererar svar med Claude Haiku → Sparar i `EmailDraft` (status: `DRAFT`)
3. **Admin granskar** → Besöker `/api/admin/emails` → Ser draft
4. **Admin godkänner** → POST till `/api/admin/emails/[id]/send` → SMTP-sender skickar emailen
5. **Email skickad** → Status uppdateras till `SENT`

---

## ⚙️ Konfiguration

### Environment Variables (`.env`)

```bash
# Email Account
EMAIL_ACCOUNT=support@vexcraft.io
EMAIL_PASSWORD=<fyll-i-lösenord>

# IMAP
IMAP_HOST=mail.spacemail.com
IMAP_PORT=993

# SMTP
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_SECURE=true

# AI
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🐛 Troubleshooting

### Orchestrator startar inte

```bash
# Kolla PM2-loggar
pm2 logs email-orchestrator

# Vanliga fel:
# - EMAIL_PASSWORD saknas i .env
# - ANTHROPIC_API_KEY saknas
# - Database connection error
```

### IMAP connection error

- Kolla att `EMAIL_PASSWORD` är korrekt
- Verifiera att `mail.spacemail.com:993` är nåbar:
  ```bash
  telnet mail.spacemail.com 993
  ```

### SMTP send failure

- Kolla att SMTP credentials är korrekta
- Verifiera att `mail.spacemail.com:465` är nåbar

### AI-processing failure

- Kolla `ANTHROPIC_API_KEY`
- Se logs för specifika Claude-fel

---

## 📝 Viktiga Filer

```
vexcraft/hemsida/
├── src/
│   ├── services/
│   │   ├── email-listener.ts        # IMAP-listener
│   │   ├── email-ai-processor.ts    # AI-processor (Claude Haiku)
│   │   ├── email-sender.ts          # SMTP-sender
│   │   └── email-orchestrator.ts    # Huvudloop
│   ├── app/api/admin/emails/
│   │   ├── route.ts                 # GET /api/admin/emails
│   │   └── [id]/send/route.ts       # POST /api/admin/emails/[id]/send
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── migrations/
│       └── 20260325110000_add_email_ai_integration/
│           └── migration.sql
├── ecosystem.config.js              # PM2 config
├── tsconfig.services.json           # TypeScript config för services
└── .env                             # Environment variables (INTE committad!)
```

---

## ✅ Checklist för Deployment

- [x] Database migration körd
- [x] `EMAIL_PASSWORD` tillagd i `.env`
- [x] `npm run build` genomförd
- [ ] PM2 startat: `pm2 start ecosystem.config.js`
- [ ] Loggar verifierade: `pm2 logs email-orchestrator`
- [ ] Skicka test-email till `support@vexcraft.io`
- [ ] Verifiera att draft skapas: `GET /api/admin/emails`
- [ ] Godkänn draft: `POST /api/admin/emails/[id]/send`
- [ ] Verifiera att email skickades

---

## 🎯 Nästa Steg (Efter Test-vecka)

1. **Auto-send (valfritt):**  
   Om drafts alltid är bra → lägg till auto-send (ta bort manuell granskning)

2. **Admin UI:**  
   Bygg en admin-panel för att granska och godkänna drafts visuellt

3. **Email Templates:**  
   Lägg till mallar för vanliga frågor

4. **Multi-language:**  
   Detektera språk och svara på samma språk

---

**Skapad:** 25 mars 2026  
**Status:** ✅ Deployment-klar  
**Contact:** Mikael / Vex
