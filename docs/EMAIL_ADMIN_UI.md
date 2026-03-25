# Email Admin UI Documentation 📧

**URL:** [https://vexcraft.io/admin/emails](https://vexcraft.io/admin/emails)

## Overview

The Email Admin UI provides a clean interface for managing Elin's AI-generated email responses to customer inquiries at `support@vexcraft.io`.

## Features

### 📊 Status Dashboard
- **Filter Tabs:** All, DRAFT, SENT, FAILED
- **Real-time counts** for each status
- **Auto-refresh** every 30 seconds

### 📧 Email Queue Management

Each email card displays:
- **From:** Customer email address
- **Subject:** Email subject line
- **Date:** Received timestamp (Swedish format)
- **Status Badge:**
  - ⚠️ **DRAFT** (Yellow) - Waiting for approval
  - ✅ **SENT** (Green) - Successfully sent
  - ❌ **FAILED** (Red) - Failed to send or rejected
  - ⏳ **PENDING** (Gray) - Being processed by AI

### 🎛️ Actions

For **DRAFT** emails:
1. **✏️ Edit** - Modify Elin's suggested response
2. **✅ Approve & Send** - Send the email immediately
3. **❌ Reject** - Mark as rejected and remove draft

### 📝 Email Details (Expandable)

Click "▼ Expand" to view:
- **Original Email:** Full customer message
- **Elin's Suggested Response:** AI-generated reply
- **Action Buttons:** Edit, Approve, Reject
- **Sent Confirmation:** Timestamp if sent
- **Error Messages:** Failure reason if failed

### ✏️ Edit Modal

When editing a draft:
- **To:** Recipient email (read-only)
- **Subject:** Email subject (read-only)
- **Message Body:** Editable textarea
- **Save Changes** → Updates draft in database

## API Endpoints

The UI connects to:

### GET `/api/admin/emails`
- **Query Params:** `?status=DRAFT|SENT|FAILED` (optional)
- **Response:** List of email threads with drafts

### POST `/api/admin/emails/[id]/send`
- **Body:** `{ "approvedBy": "Admin" }`
- **Action:** Send approved draft

### PATCH `/api/admin/emails/[id]/edit`
- **Body:** `{ "body": "Updated email content" }`
- **Action:** Update draft body

### DELETE `/api/admin/emails/[id]/delete`
- **Action:** Reject draft and mark thread as failed

## User Experience

### Workflow Example

1. Customer sends email to `support@vexcraft.io`
2. Elin (AI) reads email via IMAP
3. Elin generates professional response
4. Admin visits `/admin/emails`
5. Admin reviews DRAFT email
6. Admin can:
   - ✅ Approve → Email sent immediately
   - ✏️ Edit → Modify response, then approve
   - ❌ Reject → Draft deleted, no email sent

### Notifications

- ✅ **Success toast:** "Email sent successfully!"
- ❌ **Error toast:** "Failed to send email"
- ⚠️ **Confirmation:** "Are you sure you want to reject this draft?"

## Technical Details

### Components

**Location:** `/src/app/admin/emails/`

1. **page.tsx**
   - Main email queue page
   - Filter tabs and refresh logic
   - Auto-refresh timer (30s interval)

2. **email-card.tsx**
   - Individual email card component
   - Expand/collapse functionality
   - Edit modal dialog
   - Action handlers

### Dependencies

- **UI Components:** Shadcn/ui (Card, Badge, Button, Dialog, Tabs, etc.)
- **State Management:** React hooks (useState, useEffect)
- **Notifications:** Sonner (toast)
- **Styling:** Tailwind CSS

### Database Schema

**EmailThread:**
```prisma
model EmailThread {
  id             String    @id @default(cuid())
  from           String
  subject        String
  originalEmail  String    @db.Text
  status         String    // PENDING | DRAFT | SENT | FAILED
  receivedAt     DateTime
  sentAt         DateTime?
  failureReason  String?
}
```

**EmailDraft:**
```prisma
model EmailDraft {
  id             String    @id @default(cuid())
  emailThreadId  String    @unique
  to             String
  subject        String
  body           String    @db.Text
  approved       Boolean
}
```

## Future Enhancements

Possible improvements:
- [ ] Batch approve/reject
- [ ] Email preview before sending
- [ ] Search/filter by sender or subject
- [ ] Response templates
- [ ] Email analytics dashboard
- [ ] Keyboard shortcuts (e.g., "A" to approve)

## Testing

**Test the UI:**

1. Visit `/admin/emails` (login required)
2. Filter by DRAFT to see pending emails
3. Expand an email card
4. Test Edit → Save → Approve flow
5. Check SENT tab for confirmed emails

**Manual testing:**
```bash
# Send test email to support@vexcraft.io
# Wait 5 minutes for Elin to process
# Check /admin/emails for new DRAFT
```

---

**Built:** March 25, 2026  
**Build Time:** ~20 minutes  
**Status:** ✅ Production Ready
