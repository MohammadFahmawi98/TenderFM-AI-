# Supabase Setup

TenderFlow FM AI is connected to this Supabase project:

- Project name: `TenderFM-AI-`
- Project ref: `xsvkksgwwekgobtkcffl`
- Region: `ap-southeast-1`
- API URL: `https://xsvkksgwwekgobtkcffl.supabase.co`
- Database host: `db.xsvkksgwwekgobtkcffl.supabase.co`
- Postgres version: `17`

## Applied Migrations

The initial platform schema has been applied to Supabase.

Local migration files:

- `prisma/migrations/20260618152000_initial_supabase_schema/migration.sql`
- `prisma/migrations/20260618154000_add_foreign_key_indexes/migration.sql`

## Tables

The public schema contains the TenderFlow application tables, including:

- `Organization`
- `User`
- `Role`
- `Permission`
- `Tender`
- `TenderFile`
- `TenderAnalysis`
- `ComplianceItem`
- `RiskItem`
- `Asset`
- `ManpowerPlan`
- `CostEstimate`
- `Proposal`
- `GeneratedFile`
- `Supplier`
- `ChatConversation`
- `Notification`
- `AuditLog`
- `Subscription`

All application tables have Row Level Security enabled.

## Current Access Model

The app currently uses server-side Prisma over a direct PostgreSQL connection.

No public Supabase Data API policies have been created yet. This is intentional until Supabase Auth tenant policies are implemented.

## Local Environment

Create `.env` and add:

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xsvkksgwwekgobtkcffl.supabase.co:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://xsvkksgwwekgobtkcffl.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

Use the database password and anon key from the Supabase dashboard.

For local IPv4 networks, use the Supabase **Session pooler** connection string instead of the direct database host:

```bash
DATABASE_URL="postgresql://postgres.xsvkksgwwekgobtkcffl:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?schema=public"
```

Find the anon key in:

```text
Supabase Dashboard -> Project Settings -> API -> Project API keys -> anon public
```

## Verification Commands

```bash
npm run db:generate
npm run lint
npm run build
```

## Advisor Notes

Supabase may show informational advisor notices immediately after migration:

- `unused_index`: expected before real traffic and query history exist.
- `rls_enabled_no_policy`: expected until Supabase Auth policies are implemented.

Do not disable RLS. Add tenant-aware policies after the authentication model is finalized.
