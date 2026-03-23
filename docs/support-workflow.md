# Support Workflow — Vexcraft
**Support Lead:** Maja  
**Last updated:** March 2026

---

## Support Channels

| Channel | How | Who monitors |
|---------|-----|-------------|
| Order chat | `/orders/[id]` — customer types in chat tab | Maja (primary), whole team |
| Email | `support@vexcraft.io` | Maja |
| GDPR requests | `gdpr@vexcraft.io` | Klara / Maja |
| Discord | `!order [id]` command, ticket system | Noah / Maja |
| Admin panel | `/admin/orders/[id]` — respond inline | Assigned team member |

---

## End-to-End Support Flow

### 1. Customer places order
- Customer fills out order form on `/services/[slug]`
- Agrees to Terms of Service + Privacy Policy (checkbox enforced)
- Redirected to Stripe checkout

### 2. Payment confirmed
- Stripe webhook fires → order status set to `PAID`
- **Automatic email** sent from `noreply@vexcraft.io`:
  - Subject: "Order confirmed — [Service] | Vexcraft"
  - Contains order ID, service name, link to dashboard
- Admin can see new order in `/admin/dashboard`

### 3. Customer sends a message
- Customer types in the Chat tab on `/orders/[id]`
- Rate limit: **20 messages per minute per IP**
- **Admin notification email** sent automatically to `support@vexcraft.io`
  - Contains customer name, service, order ID, full message text
  - Direct link to `/admin/orders/[id]` to reply
- Maja checks email or admin panel → responds within SLA

### 4. Admin responds
- Go to `/admin/orders/[id]` → type in the message box → Send
- Or use API: `POST /api/admin/orders/[id]/messages` with `{ content: "..." }`
- **Automatic email** sent to customer from `noreply@vexcraft.io`:
  - Subject: "New message on your order | Vexcraft"
  - Contains link to `/orders/[id]` to view thread

### 5. Customer sees reply
- Customer can re-open `/orders/[id]` — chat polls every 10 seconds
- Or `GET /api/orders/[id]/messages` returns full thread

### 6. Discord order tracking
- Customer types `!order [order-id]` in any Vexcraft Discord channel
- Bot returns private embed with: status, service, package, amount, progress bar
- Customers find order ID at `vexcraft.io/dashboard`

---

## SLA — Response Time Expectations

| Priority | Criteria | Target response |
|----------|----------|----------------|
| 🔴 Urgent | Payment issues, order not found, refund request | < 2 hours |
| 🟡 Normal | Project questions, revision requests, file delivery | < 8 hours (business hours) |
| 🟢 Low | General questions, feedback, non-order inquiries | < 24 hours |

**Business hours:** Mon–Fri 09:00–18:00 CET  
**Weekend:** Best effort, urgent only

---

## Refund Process

1. Customer emails `support@vexcraft.io` with order ID + reason
2. Maja checks order status:
   - `PENDING` / `PAID` (work not started) → Full refund, process in Stripe dashboard
   - `IN_PROGRESS` → Partial refund based on work done, escalate to Mikael
   - `COMPLETED` → Review against agreed specs, escalate to Mikael if disputed
3. Refunds processed within 5–10 business days via Stripe
4. Communicate outcome to customer within 2 business hours of decision

See `/terms` on the website for official refund policy.

---

## Email Templates Available (in `/src/lib/email.ts`)

- `orderConfirmationEmail()` — sent on `checkout.session.completed`
- `statusUpdateEmail()` — sent when admin changes order status
- `newMessageEmail()` — sent when admin replies to customer

**Email FROM addresses:**
- `noreply@vexcraft.io` — transactional (order confirmations, status updates, replies)
- `support@vexcraft.io` — admin notifications, inbound support

---

## Rate Limits (Anti-spam)

| Endpoint | Limit |
|----------|-------|
| `POST /api/orders` | 10 orders per 15 min per IP |
| `POST /api/orders/[id]/messages` | 20 messages per 60 sec per IP |
| `POST /api/contact` | (check contact route for limits) |

Returns HTTP 429 with `Retry-After` header when exceeded.

---

## Escalation Path

1. **Maja** handles day-to-day support
2. **Mikael** handles: refunds >$200, legal complaints, chargebacks
3. **Klara** handles: GDPR requests, data deletion, DPA inquiries

---

## Checklist — Pre-Launch Verification

- [x] Order confirmation email fires after Stripe payment (webhook updated)
- [x] Customer message → admin notification email (`support@vexcraft.io`)
- [x] Admin reply → customer email notification
- [x] `GET /api/orders/[id]/messages` endpoint works (returns thread)
- [x] Rate limiting active on message endpoint (20/min)
- [x] Rate limiting active on order creation (10/15min)
- [x] Discord `!order [id]` returns status + progress bar
- [x] Terms checkbox enforced on checkout form
- [ ] **TODO:** Verify `RESEND_API_KEY` set in production `.env`
- [ ] **TODO:** Verify `ADMIN_NOTIFICATION_EMAIL` set in production `.env` (defaults to `support@vexcraft.io`)
- [ ] **TODO:** Verify Discord bot is running on VPS
- [ ] **TODO:** Send test order end-to-end before go-live
