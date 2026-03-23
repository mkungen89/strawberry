# INVOICE TEMPLATE — Vexcraft AB
*For manual invoices when Stripe invoicing is not used*

---

```
FAKTURA / INVOICE

Vexcraft AB
Org.nr: [FILL IN]
[Address, City, Sweden]
support@vexcraft.io
vexcraft.io

Fakturanummer / Invoice No: VX-2026-[NUMBER]
Fakturadatum / Invoice Date: [DATE]
Förfallodatum / Due Date: [DATE + 30 days]

TILL / BILL TO:
[Customer Name / Company]
[Address]
[Country]
[Email]

─────────────────────────────────────────────────

TJÄNST / SERVICE                   ANTAL  Á-PRIS    SUMMA
─────────────────────────────────────────────────
[Service name — e.g.,
"Discord Server Setup, Pro package"]  1    $XXX.XX   $XXX.XX
[Add-on: e.g., "Custom Bot Setup"]   1     $XX.XX    $XX.XX
─────────────────────────────────────────────────
Delsumma / Subtotal:                            $XXX.XX
Moms / VAT (25%):                               $  0.00 *
─────────────────────────────────────────────────
TOTALT / TOTAL:                                 $XXX.XX
─────────────────────────────────────────────────

* Reverse charge applies for EU B2B / No VAT for non-EU / 
  [or: VAT included if applicable]

BETALNINGSINFORMATION / PAYMENT DETAILS:
[Bank: ]
[IBAN: ]
[BIC/SWIFT: ]
[Swish: ]
[Or: Paid via Stripe — see confirmation email]

Referens / Reference: Order #[ORDER-ID]
Betalningsvillkor / Payment terms: 30 days net

─────────────────────────────────────────────────
Tack för ditt förtroende! / Thank you for your business!
vexcraft.io | support@vexcraft.io
```

---

## Notes for use

- Sequential invoice numbers: VX-2026-001, VX-2026-002, etc.
- Keep a log of all invoices issued (spreadsheet)
- Swedish law requires keeping invoice records for **7 years**
- If VAT-registered: add 25% VAT and your VAT number (SE + org.nr + 01)
- For EU B2B: write "Reverse charge — VAT to be accounted for by recipient"
- For non-EU customers: typically no VAT
- Store copies in bookkeeping (Fortnox, Excel, or similar)

## Invoice Automation (TODO)
- Stripe Invoicing can auto-generate invoices when payments are made
- For Swedish compliance, consider **Fortnox** integration
- Action: evaluate Stripe Invoicing vs Fortnox for Swedish accounting needs
