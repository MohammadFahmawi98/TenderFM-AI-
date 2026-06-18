# TenderFlow FM AI

# System Architecture Document

Version: 1.0

---

# Architecture Overview

TenderFlow FM AI is a multi-tenant enterprise SaaS platform designed for Facility Management tender intelligence.

The platform architecture consists of:

Frontend Layer

->

API Layer

->

Business Logic Layer

->

AI Services Layer

->

Database Layer

->

Storage Layer

->

Export Generation Layer

---

# High Level Architecture

User Browser

->

Next.js Frontend

->

API Gateway

->

Application Services

->

AI Engine

->

Database

->

Storage

->

Export Engine

---

# Frontend Architecture

Framework:

Next.js 15

React 19

TypeScript

TailwindCSS

ShadCN

Framer Motion

React Query

Zustand

Features:

- Dark Mode
- Light Mode
- Responsive
- Mobile Ready
- Real Time Updates

---

# Backend Architecture

Framework:

NestJS

TypeScript

Responsibilities:

- Authentication
- User Management
- Tender Management
- AI Orchestration
- Cost Calculations
- Proposal Generation
- Compliance Engine
- Export Engine

---

# Database

PostgreSQL

ORM:

Prisma

---

# Core Tables

- Organizations
- Users
- Roles
- Permissions
- Tenders
- TenderFiles
- TenderAnalysis
- ComplianceItems
- RiskItems
- Assets
- ManpowerPlans
- CostEstimates
- GeneratedFiles
- Suppliers
- Subcontractors
- ChatMessages
- Notifications
- AuditLogs

---

# AI Layer

Models:

- OpenAI
- Claude
- Gemini
- LangGraph
- LangChain

---

# AI Agents

- Tender Analyst Agent
- Compliance Agent
- Estimator Agent
- Manpower Agent
- Proposal Agent
- Risk Agent
- Win Probability Agent
- Submission Agent
- Coordinator Agent

---

# Storage

AWS S3

or

Supabase Storage

Stores:

- PDF
- Word
- Excel
- Images
- ZIP
- Generated Files

---

# Vector Database

Pinecone

or

Supabase Vector

Stores:

- Tender Chunks
- Company Documents
- Proposal Templates
- Method Statements
- Knowledge Base

---

# Authentication

Clerk

or

Auth.js

Features:

- Email Login
- Google Login
- Microsoft Login
- SSO
- SAML

---

# Multi-Tenant Design

Organization A

Data isolated

Organization B

Data isolated

Organization C

Data isolated

No data leakage.

---

# Tender Processing Pipeline

Upload RFP

->

OCR

->

Document Parsing

->

Chunking

->

Embedding

->

Vector Storage

->

AI Analysis

->

Results Database

---

# Export Engine

Generate:

- PDF
- DOCX
- XLSX
- PPTX
- ZIP

Libraries:

- PDFKit
- Docx
- ExcelJS
- PptxGenJS
- Archiver

---

# Security

- RBAC
- Encryption
- Audit Logs
- Rate Limiting
- Tenant Isolation
- SOC2 Ready
- GDPR Ready

---

# Deployment

Frontend:

Vercel

Backend:

AWS ECS

Database:

AWS RDS PostgreSQL

Storage:

S3

Cache:

Redis

Monitoring:

Sentry

PostHog

Grafana

---

# CI/CD

GitHub

->

GitHub Actions

->

Testing

->

Build

->

Deploy

->

Production

---

# Folder Structure

```text
apps/
  web/
  api/

packages/
  ui/
  ai/
  database/
  auth/
  exports/

infrastructure/
  docker/
  terraform/

docs/
```

---

# Next Document Required

Database Schema + Prisma Models

This is the next file Claude Code needs before coding.
