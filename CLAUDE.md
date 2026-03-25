# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
# Development
npm run dev                    # Next.js dev server (port 3000)
npm run build                  # prisma generate + next build + tsc services
npm run lint                   # ESLint

# Database
npx prisma db push --accept-data-loss   # Apply schema changes (no shadow DB)
npx prisma generate                      # Regenerate Prisma client after schema changes
npx prisma studio                        # DB GUI

# Production (pm2)
pm2 restart vexcraft           # Restart Next.js app
pm2 restart email-orchestrator # Restart email AI service
pm2 logs vexcraft --lines 50   # Tail app logs
```

> **Never use `prisma migrate dev`** — requires `CREATE DATABASE` permission not available on this DB. Always use `db push`.
> **Always run `prisma generate` after schema changes** — the client won't reflect new models until regenerated.

## Architecture

### Stack
- **Next.js 16.2.1** (App Router) — breaking changes from older versions; check `node_modules/next/dist/docs/` before using unfamiliar APIs
- **React 19 / TypeScript 5**
- **Prisma 7.5 + PostgreSQL** (via `@prisma/adapter-pg`)
- **Better Auth** — session auth with Prisma adapter; `role` field is a custom `additionalField`
- **Stripe 20.x** — `current_period_end` is on `SubscriptionItem`, not `Subscription` (SDK breaking change)
- **Tailwind CSS 4** — PostCSS-based, no `tailwind.config.js`

### Route params pattern (Next.js 16)
All dynamic route params are `Promise<{id: string}>`. Always `await` them:
```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### Path alias
`@/*` maps to `src/*` for both Next.js and the services tsconfig.

### Process map
| pm2 name | What it is |
|---|---|
| `vexcraft` | Next.js app (port 3000) |
| `email-orchestrator` | Node.js daemon — polls IMAP every 5 min, generates AI email drafts |
| `vexcraft-bot` | Discord bot |

### Services (compiled separately)
`src/services/` is compiled by `tsconfig.services.json` → `dist/services/`. These run as standalone Node processes, not inside Next.js. They use `@/lib/db` directly.

- `email-orchestrator.ts` — orchestrates the loop
- `email-listener.ts` — IMAP polling, saves `EmailThread` records
- `email-ai-processor.ts` — calls Claude Haiku, creates `EmailDraft` records
- `email-sender.ts` — sends approved drafts via Nodemailer

### Data model highlights

**Order lifecycle:** `PENDING → PAID → IN_PROGRESS → REVIEW → REVISION → COMPLETED`

- When status → `IN_PROGRESS`: `autoGenerateConcepts()` fires automatically in the background, then moves order to `REVIEW` and emails customer
- `briefLocked: true` prevents customers from editing their brief after work begins
- Concept `imageUrl` stores real image URLs only — Midjourney prompts are returned by the API but **not** persisted

**Two separate Kanban systems:**
1. **Order board** (`/admin/orders`) — manages customer orders through the lifecycle above
2. **Project/Task board** (`/admin/kanban`) — internal work tracking with QA workflow; REVIEW and DONE columns are write-protected (use dedicated buttons, not drag-and-drop)

**Subscriptions:** One `Subscription` per user (`@unique userId`). Plan slugs: `creator`, `streamer`, `business`, `growth`. Price IDs resolved via `STRIPE_PRICE_{SLUG}` env vars, auto-created in Stripe if missing.

### Key lib files
| File | Purpose |
|---|---|
| `src/lib/auth.ts` | Better Auth server config |
| `src/lib/auth-client.ts` | Client-side `useSession()` |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/email.ts` | Nodemailer sender + email template functions |
| `src/lib/email-templates.ts` | Transactional email HTML templates |
| `src/lib/ai.ts` | Elin chat assistant (Claude Haiku) |
| `src/lib/auto-generate-concepts.ts` | AI concept generation shared function |
| `src/lib/subscription-data.ts` | Static plan/bundle data (source of truth for prices) |
| `src/lib/services-data.ts` | Static service catalog |

### API route split
- `/api/orders/*` — customer-facing (auth required, scoped to `session.user.id`)
- `/api/admin/*` — admin-only (checks `session.user.role === "ADMIN"`)
- `/api/subscriptions/*` — subscription management (checkout, cancel, portal, current)
- `/api/webhooks/stripe` — Stripe webhook handler (signature-verified, no auth)

### Admin panels
All under `/admin/*`, role-gated. Key pages:
- `/admin/orders/[id]` — full order management: concepts, notes, milestones, files, activity
- `/admin/kanban` — internal project tasks with QA workflow
- `/admin/emails` — email AI draft approval queue
- `/admin/qa` — QA review dashboard

### AI usage
All AI calls use `claude-haiku-4-5-20251001`:
- **Elin** (live chat assistant): `src/lib/ai.ts`
- **Concept generation**: `src/lib/auto-generate-concepts.ts`
- **Email drafts**: `src/services/email-ai-processor.ts`

### Stripe webhook events handled
`checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

Webhook secret: `STRIPE_WEBHOOK_SECRET` env var. Register endpoint at `https://vexcraft.io/api/webhooks/stripe`.
