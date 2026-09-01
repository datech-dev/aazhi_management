# 🪡 Aazhi Designer Studio — Boutique Business Management System

A production-ready full-stack business management application built for **Aazhi Designer Studio** — a premium Indian boutique fashion and custom tailoring studio driving sales through Instagram and WhatsApp.

---

## ✨ Features

- 📱 **Unified Social Inbox**: Centralized communication hub for WhatsApp and Instagram enquiries.
- 👥 **Customer 360° & CRM**: Complete client directory, order history, measurements, and lifetime value tracking.
- 📐 **Dynamic Measurement Templates**: Version-controlled garment measurements for Blouses, Kurtis, Sarees, and Lehengas.
- ✂️ **Tailoring & Production Pipeline**: Live Kanban workflow tracking cutting, stitching, finishing, and quality check stages.
- 💳 **Decimal-Safe Financial Management**: Advance payments, balance calculations, receipts, and revenue reports in INR (₹).
- 🏷️ **Product Catalog & Inventory**: Fabrics, trims, embellishments, and customizable designer outfits.
- 🏢 **Multi-Branch Support**: Scalable architecture with branch-specific sequence numbering and isolation.
- 🔐 **Granular RBAC**: Role-based access control for Owner, Admin, Sales, Tailor, and Staff.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Database & ORM**: PostgreSQL 16 + Prisma ORM v6
- **Authentication**: Auth.js v5 (JWT sessions, bcrypt encryption)
- **UI & Styling**: Tailwind CSS v4 + shadcn/ui + Lucide Icons
- **State & Forms**: TanStack Query + React Hook Form + Zod validation
- **Testing**: Vitest + Testing Library

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 22 LTS
- PostgreSQL 16 instance running locally or in Docker / Cloud

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd "Aazhi designer"

# Install dependencies
npm install --legacy-peer-deps

# Setup environment variables
cp .env.example .env.local
```

### 3. Database Setup & Seeding
Configure your `DATABASE_URL` in `.env.local`, then run:
```bash
# Generate Prisma Client
npm run db:generate

# Push database schema
npm run db:push

# Seed sample boutique data & demo accounts
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **👑 Studio Owner** | `owner@aazhi.studio` | `Aazhi@2026!` |
| **🛍️ Sales Executive** | `sales@aazhi.studio` | `Aazhi@2026!` |
| **✂️ Master Tailor** | `tailor@aazhi.studio` | `Aazhi@2026!` |

---

## 📚 Documentation

- [System Architecture](docs/architecture.md)
- [Database Schema & Models](docs/database.md)
- [WhatsApp & Instagram Integration Guide](docs/integrations.md)
- [VPS Production Deployment Guide](docs/deployment.md)

---

## 🧪 Testing

```bash
# Run unit tests
npm test
```
