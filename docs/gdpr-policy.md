# GDPR Policy — Internal Team Guide
**Owner:** Klara  
**Last updated:** March 2026

---

## What is GDPR?

GDPR (General Data Protection Regulation) is EU law that governs how personal data is collected, processed, and stored. As a Swedish company (Vexcraft AB) serving EU customers, we are **fully subject to GDPR**.

Non-compliance can result in fines up to **4% of annual turnover or €20 million**, whichever is higher.

---

## Our Lawful Bases for Processing

| Activity | Lawful basis | Notes |
|----------|-------------|-------|
| Processing orders | **Contract performance** (Art. 6(1)(b)) | Necessary to deliver the service |
| Account creation | **Contract performance** | Needed to manage user account |
| Payment processing | **Contract performance** | Via Stripe (their DPA applies) |
| Order confirmation emails | **Contract performance** | Transactional, not marketing |
| Status update emails | **Contract performance** | Transactional |
| Marketing emails | **Consent** (Art. 6(1)(a)) | Must have explicit opt-in |
| Analytics/usage logs | **Legitimate interest** (Art. 6(1)(f)) | Minimal, anonymize when possible |

---

## Data Map

### What we collect
| Category | Data | Where stored |
|----------|------|-------------|
| Identity | Name, email | PostgreSQL (users table) |
| Auth | Password hash, session tokens | PostgreSQL (auth tables) |
| Orders | Service, package, brief, price | PostgreSQL (Order table) |
| Messages | Order chat content | PostgreSQL (OrderMessage table) |
| Payment | Stripe session ID only | PostgreSQL + Stripe |
| Card data | NOT stored | Stripe only |

### Where data flows
1. **User browser → our server (VPS, Voxly)** → PostgreSQL
2. **Payment data → Stripe** (we never see raw card details)
3. **Emails → Resend API** → delivered to customer
4. **Hosting → Vercel** (if deployed there) or **Voxly VPS**

---

## Data Subject Rights — How to Handle

### Right to Access (Art. 15)
Customer can request a copy of all their data.

**Process:**
1. Receive request at `gdpr@vexcraft.io`
2. Verify identity (ask for email used to register)
3. Export from database: user record + all orders + messages
4. Return as JSON or PDF within **30 days**
5. Log in GDPR tracking sheet

### Right to Erasure / "Right to be Forgotten" (Art. 17)
Customer can request deletion of their data.

**Process:**
1. Receive request at `gdpr@vexcraft.io`
2. Verify identity
3. Check if legal retention obligation applies (orders: 5 years for accounting)
4. If no legal hold: delete/anonymize personal fields, keep anonymized order records
5. Confirm deletion to customer within **30 days**
6. Delete Stripe customer record if exists

**What to anonymize (not delete) for accounting:**
- Order amount, date, status → keep (Swedish accounting law: 7 years)
- Name, email, message content → delete/replace with "REDACTED"

### Right to Rectification (Art. 16)
Customer can correct their data.
- Direct them to `/settings` (they can update name/email themselves)
- If blocked: Maja/Klara updates in admin panel

### Right to Data Portability (Art. 20)
Customer gets their data in machine-readable format.
- Export JSON from database
- Include: account data + orders + messages

### Right to Object / Restrict Processing (Art. 18, 21)
- If they object to marketing: remove from all marketing lists immediately
- If they object to processing: assess case by case, escalate to Mikael

---

## Data Breach Procedure

If personal data is exposed, lost, or accessed without authorization:

1. **Identify scope:** what data, how many people, what risk
2. **Contain:** isolate system, revoke compromised credentials
3. **Assess:** is there risk to individuals? (most breaches require reporting)
4. **Report to Datainspektionen:** within **72 hours** at datainspektionen.se
5. **Notify affected users:** if high risk to their rights, notify "without undue delay"
6. **Document:** what happened, what we did, timeline
7. **Review:** how to prevent recurrence

**Contact:** Datainspektionen — datainspektionen.se — 08-657 61 00

---

## Email Compliance

### Transactional emails (no consent needed)
- Order confirmation
- Status updates
- Message notifications
- Password reset

### Marketing emails (consent required)
- Newsletters
- Promotional offers
- "We're launching X" announcements

**Unsubscribe:** All marketing emails MUST include an unsubscribe link.  
**Status:** ⏳ TODO — Add unsubscribe mechanism to transactional emails footer  
(Note: transactional don't legally require it, but best practice to include)

---

## Sub-processors We Use

All must have a DPA (Data Processing Agreement):

| Processor | Type | DPA URL | Data shared |
|-----------|------|---------|-------------|
| Resend | Email delivery | resend.com/legal/dpa | Email address, name |
| Stripe | Payment processing | stripe.com/legal/dpa | Payment + contact info |
| PostgreSQL hosting | Database | Depends on provider | All data |
| Vercel / Voxly | Hosting | Check provider | All data (server logs) |

**Action:** Download and store copies of all DPAs. Create list of sub-processors for enterprise DPA requests.

---

## GDPR Tracking Log

Maintain a spreadsheet at (create in Google Sheets / Notion):

| Date | Type | Name/Email | Status | Deadline | Completed |
|------|------|-----------|--------|----------|-----------|
| — | Access/Delete/Rectify/Port | — | Pending/Done | Date+30d | — |

---

## Key Contacts & Resources

- **Internal GDPR lead:** Klara
- **Swedish Data Authority:** Datainspektionen (datainspektionen.se)
- **GDPR email:** gdpr@vexcraft.io
- **EU GDPR text:** gdpr.eu
- **Swedish GDPR guide:** datainspektionen.se/en/

---

## Annual Review

Review this document and the following annually:
- [ ] Sub-processor list still accurate?
- [ ] Retention periods still appropriate?
- [ ] Any new data collection added to site?
- [ ] Team trained on GDPR basics?
- [ ] Breach procedure tested?
