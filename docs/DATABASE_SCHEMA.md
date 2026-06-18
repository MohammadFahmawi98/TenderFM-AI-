# TenderFlow FM AI Database Schema

This document summarizes the Prisma schema used by the platform.

## Database

- PostgreSQL
- Prisma ORM
- Multi-tenant isolation through `organizationId` on business records

## Core Domains

- Organizations and users
- Roles, permissions, and user-role assignments
- Tenders and uploaded tender files
- AI tender analysis
- Compliance matrix items
- Risk register items
- Asset register records
- Manpower plans and manpower lines
- Cost estimates and estimate lines
- Proposals and generated files
- Suppliers and subcontractors
- Tender chat conversations and messages
- Notifications
- Audit logs
- Subscriptions

## Required Environment Variable

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tenderflow_fm_ai?schema=public"
```

## Setup Commands

```bash
npm run db:generate
npm run db:push
```

## No Demo Data Rule

The application must not seed fake tenders or fake AI outputs. Empty states are displayed until real records are created from uploaded documents.
