# Database Schema Documentation — Aazhi Designer Studio

This document describes the PostgreSQL database architecture, relationships, constraints, indexes, and design patterns utilized in Aazhi Designer Studio.

---

## Entity Relationship Overview

```
[Branch] ──┬── [User] ───────────────┬── [AuditLog]
           │                         ├── [Notification]
           │                         └── [Session / Account]
           │
           ├── [Customer] ───────────┬── [CustomerAddress]
           │    │                    ├── [CustomerTag] ──── [Tag]
           │    │                    ├── [CustomerNote]
           │    │                    └── [MeasurementProfile] ── [MeasurementValue]
           │    │
           │    ├── [Lead] ──────────┬── [LeadActivity]
           │    │                    └── [LeadTag]
           │    │
           │    ├── [Conversation] ──┬── [Message] ────────── [MessageAttachment]
           │    │
           │    ├── [Quotation] ─────└── [QuotationItem]
           │    │
           │    └── [Order] ─────────┬── [OrderItem] ──────── [Product]
           │         │               ├── [OrderStatusHistory]
           │         │               ├── [Payment] ────────── [PaymentRefund]
           │         │               ├── [ProductionJob] ────┬── [ProductionStatusHistory]
           │         │               │                       └── [QualityCheck] ── [QualityCheckItem]
           │         │               └── [Delivery]
           │
           ├── [Product] ────────────┬── [ProductCategory]
           │                         ├── [ProductImage]
           │                         └── [ProductVariant]
           │
           ├── [InventoryItem] ──────┬── [InventoryTransaction]
           │                         └── [Supplier]
           │
           └── [NumberSequence]
```

---

## Key Domain Models

### 1. Customer & CRM
* **`Customer`**: Central entity storing client contact information (`phone`, `whatsappNumber`, `instagramUsername`, `email`), communication preferences, total lifetime value (`totalLifetimeValue`), order counts, and soft deletion (`isArchived`).
* **Indexes**: Indexed on phone numbers, WhatsApp numbers, Instagram handles, and full names for instant sub-millisecond lookups.
* **`MeasurementProfile` & `MeasurementValue`**: Complete versioned historical measurements. Measurement fields are defined dynamically by `MeasurementTemplate` (e.g., Blouse, Kurti, Saree) without schema migrations.

### 2. Orders & Financial Calculations
* **`Order`**: Tracks order lifecycle (`DRAFT` → `CONFIRMED` → `CUTTING` → `STITCHING` → `FINISHING` → `QUALITY_CHECK` → `READY` → `DELIVERED` → `COMPLETED`).
* **Historical Pricing Preservation**: `OrderItem` stores `unitPrice` and `totalPrice` at the time of creation. Changing product catalog prices never modifies past orders.
* **Decimal Money**: All monetary fields use PostgreSQL `DECIMAL(12, 2)` to eliminate floating-point drift.
* **Balance Equation**: `balance = subtotal - discountAmount + taxAmount - advancePaid`.

### 3. Concurrency-Safe Sequence Generator
* **`NumberSequence`**: Generates human-friendly identifiers:
  * Orders: `AZ-2026-0001`
  * Quotations: `QT-2026-0001`
  * Payments: `PAY-2026-0001`
  * Leads: `LD-2026-0001`
* Increments atomically inside database transactions.

### 4. Tailoring & Production Workflow
* **`ProductionJob`**: Assigned tailor tracking, target completion dates, and alteration notes.
* **`QualityCheck` & `QualityCheckItem`**: Structured pre-delivery quality inspection checklist (neck depth, stitching precision, pressing, embroidery).

### 5. Multi-Branch & Multi-Tenant Ready
* All customer, order, inventory, lead, and conversation records carry optional `branchId` to support physical boutique expansion.

---

## Migrations & Seeding Commands

```bash
# Push schema changes to database
npx prisma db push

# Create and apply migration
npx prisma migrate dev --name init_schema

# Seed realistic development data
npx prisma db seed
```
