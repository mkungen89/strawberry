# Legal & Compliance Checklist — Vexcraft
**Owner:** Klara (legal lead)  
**Last updated:** March 2026

---

## 1. Business Registration

| Item | Status | Notes |
|------|--------|-------|
| Company registered as **Vexcraft AB** | ⏳ Verify | Check Bolagsverket |
| Org number (organisationsnummer) | ⏳ Verify | Needed for invoices |
| F-tax (F-skatt) registered with Skatteverket | ⏳ Verify | Required to invoice without deducting tax |
| VAT number (momsregistreringsnummer) if applicable | ⏳ Verify | Required if turnover >80,000 SEK/year |
| Business insurance (liability + professional indemnity) | ⏳ Research | See section 5 |

**How to check:** bolagsverket.se → search company name  
**Skatteverket:** skatteverket.se → "Mina sidor" → F-skatt status

---

## 2. Legal Documents (Website)

| Document | Status | Location |
|----------|--------|----------|
| Terms of Service | ✅ Live | `/terms` on website |
| Privacy Policy (GDPR) | ✅ Live | `/privacy` on website |
| GDPR info page | ✅ Live | `/gdpr` on website |
| CCPA info page | ✅ Live | `/ccpa` on website |
| Accept Terms checkbox at checkout | ✅ Implemented | OrderForm.tsx |
| Privacy link in footer | ✅ Live | Footer.tsx |
| Cookie consent banner | ✅ Live | CookieConsent.tsx |

---

## 3. GDPR Compliance Checklist

| Item | Status | Notes |
|------|--------|-------|
| Lawful basis for processing documented | ⏳ Document | Contract performance (orders), consent (emails) |
| Data deletion mechanism | ⏳ Implement | Email to `gdpr@vexcraft.io` → manual process |
| Data retention policy | ⏳ Document | Orders: 5 years after completion; inactive accounts: 3 years |
| Email opt-in/opt-out mechanism | ⏳ Implement | Add unsubscribe link to all transactional emails |
| Third-party audit | ✅ Done | See section below |
| Data Processing Agreement (DPA) template | ⏳ Create | For enterprise customers |
| GDPR request tracking log | ⏳ Create | Spreadsheet: date, type, response, deadline |
| Breach notification procedure | ⏳ Document | 72 hours to Datainspektionen if breach occurs |

### Third-Party GDPR Compliance

| Processor | GDPR Compliant | DPA | Notes |
|-----------|---------------|-----|-------|
| **Resend** (email) | ✅ Yes | ✅ Available | resend.com/legal/dpa |
| **Stripe** (payments) | ✅ Yes | ✅ Available | stripe.com/legal/dpa |
| **PostgreSQL/Neon/Supabase** (database) | ✅ Yes | Check provider | Ensure EU data residency if required |
| **Vercel** (hosting) | ✅ Yes | ✅ Available | vercel.com/legal/dpa |

---

## 4. GDPR Data Processing Summary

### Data Collected
- **Account:** name, email (registration)
- **Orders:** service details, project brief, tech stack preferences
- **Payment:** handled entirely by Stripe (we don't store card data)
- **Communications:** order messages, support emails
- **Usage:** server logs, IP addresses (via hosting provider)

### Retention Policy
| Data type | Retention period |
|-----------|-----------------|
| Active orders | Until delivered + 5 years (legal requirement) |
| Completed orders | 5 years after completion date |
| Account data | Until deletion requested or 3 years inactive |
| Support emails | 2 years |
| Server logs | 90 days |

### Customer Rights Procedure
1. Customer emails `gdpr@vexcraft.io` with request type + proof of identity
2. Klara/Maja logs request in GDPR tracking spreadsheet
3. Response within **30 days** (GDPR requirement)
4. Access request: export from database manually
5. Deletion request: anonymize order records, delete personal data
6. Portability: export as CSV/JSON

---

## 5. Insurance

**Recommended coverage for a Swedish digital agency:**

| Type | Purpose | Estimated cost |
|------|---------|---------------|
| Ansvarsförsäkring (liability) | Covers errors/omissions in delivered work | 2,000–5,000 SEK/year |
| Rättsskyddsförsäkring (legal protection) | Covers legal disputes | Often bundled |
| Egendomsförsäkring | Covers company equipment | If needed |

**Providers to contact:**
- Länsförsäkringar (business insurance, Swedish)
- Folksam Företag
- If (Gjensidige) — popular for small tech companies
- Trygg-Hansa Företag

**Action:** Get quotes from 2-3 providers. Budget 3,000–6,000 SEK/year for basic coverage.

---

## 6. Swedish Legal Counsel

**Need a lawyer for:** initial contract review, GDPR DPA, Terms of Service validation, any disputes.

### Recommended Swedish options

| Firm | Specialization | Contact |
|------|---------------|---------|
| **Setterwalls** | Tech/SaaS, IP | setterwalls.se |
| **Delphi** | Digital business, GDPR | delphi.se |
| **Vinge** | Commercial law, tech | vinge.se |
| **Juridium** | Small business, affordable | juridium.se |
| **Startup Lawyer Sweden** | Startups specifically | Search LinkedIn |

**For budget-conscious startups:**
- **Jurigo** (jurigo.se) — fixed-fee legal packages for startups
- **Lexly** (lexly.se) — online legal services, contracts from ~1,000 SEK
- **Lawline** (lawline.se) — legal Q&A, consultations

**Initial consultation:** 1,500–3,000 SEK for 1 hour. Budget 5,000–10,000 SEK for:
- Contract template review (ToS, Service Agreement, NDA)
- GDPR compliance review
- Initial setup

**Action:** Book consultation with Jurigo or Lexly first (cheaper), then escalate to larger firm if needed.

---

## 7. Invoice & Tax Requirements

### Invoice Must Include (Swedish law)
- Company name: **Vexcraft AB**
- Org number: [fill in]
- Address: [fill in]
- Customer name + address
- Invoice number (sequential)
- Invoice date
- Due date (typically 30 days: "30 dagar netto")
- Itemized services with description
- Price excl. VAT
- VAT amount (if registered)
- Total incl. VAT
- Payment details (bank/Swish/etc.)

### VAT Rules
- If **not** VAT-registered: no VAT on invoices, no VAT number needed
- If **VAT-registered** (>80k SEK revenue): add 25% VAT on Swedish B2C sales
- EU B2B: reverse charge applies (customer VAT number needed)
- Outside EU: typically no VAT

### Currencies Supported
- USD (primary)
- EUR (EU customers)
- GBP (UK customers)
- SEK (Swedish customers — for manual/enterprise orders)

### Invoice Automation Status
- ⏳ **TODO:** Auto-generate invoice on `PAID` status
- Current: Manual invoices via Stripe dashboard or separate invoicing tool
- Recommended tool: Fortnox (Swedish, integrates with Skatteverket), or Stripe Invoicing

---

## 8. Contract Templates Needed

| Template | Purpose | Status |
|----------|---------|--------|
| Standard Service Agreement | For enterprise/custom orders | ⏳ Create |
| Client Onboarding Form | Collect project requirements formally | ⏳ Create |
| NDA (Non-Disclosure Agreement) | For sensitive client projects | ⏳ Create |
| Data Processing Agreement (DPA) | For clients who ask (enterprise) | ⏳ Create |

Templates location: `/legal/` folder in this repo.

---

## 9. Pre-Launch Legal Checklist

- [x] Terms of Service published at `/terms`
- [x] Privacy Policy published at `/privacy` (GDPR rights included)
- [x] Accept Terms checkbox on checkout
- [x] GDPR contact email `gdpr@vexcraft.io` in Privacy Policy
- [x] Support email `support@vexcraft.io` in Terms + Privacy
- [x] Privacy link in footer
- [ ] **Verify** Vexcraft AB registered at Bolagsverket
- [ ] **Verify** F-skatt status at Skatteverket
- [ ] **Decide** VAT registration (consult accountant)
- [ ] **Book** initial lawyer consultation (Lexly or Jurigo recommended)
- [ ] **Get** business insurance quote (Länsförsäkringar)
- [ ] **Create** GDPR request tracking log
- [ ] **Add** unsubscribe link to transactional emails
- [ ] **Create** Standard Service Agreement template
- [ ] **Create** NDA template
- [ ] **Set up** `gdpr@vexcraft.io` email forwarding
