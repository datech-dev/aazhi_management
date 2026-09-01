# System Architecture — Aazhi Designer Studio

This document outlines the architectural patterns, security mechanisms, API structure, and messaging abstractions in Aazhi Designer Studio.

---

## 1. High-Level Architecture

```
                               ┌────────────────────────────────┐
                               │   Next.js 15 (App Router)      │
                               │   React 19 + TypeScript        │
                               └───────────────┬────────────────┘
                                               │
                                 ┌─────────────┴─────────────┐
                                 │                           │
                     ┌───────────▼──────────┐    ┌───────────▼──────────┐
                     │ Server Actions / API │    │ Client Components    │
                     │ Service Layer        │    │ TanStack Query       │
                     └───────────┬──────────┘    │ React Hook Form      │
                                 │               └──────────────────────┘
                     ┌───────────┴──────────┐
                     │                      │
        ┌────────────▼─────────┐ ┌──────────▼─────────┐ ┌─────────────────┐
        │ Prisma ORM           │ │ Messaging Adapters  │ │ Storage Adapter │
        │ PostgreSQL 16        │ │ WhatsApp/Instagram  │ │ Local / S3 / R2 │
        └──────────────────────┘ └────────────────────┘ └─────────────────┘
```

---

## 2. Layered Backend Design

```
HTTP / Route Handler / Server Action
   ↓
[ Zod Validation (lib/validations) ]
   ↓
[ Auth & Permission Guard (lib/permissions.ts, lib/auth.ts) ]
   ↓
[ Service Layer (services/*.service.ts) ]
   ↓
[ Database / Storage / Messaging Adapters ]
   ↓
[ Audit Logging (services/audit.service.ts) ]
```

### Benefits:
1. **Separation of Concerns**: Business rules and financial math reside in isolated services (`services/`), independent of HTTP route wrappers.
2. **Reusability**: Functions can be invoked interchangeably by REST endpoints, Server Actions, webhook callbacks, or CLI tasks.
3. **Auditability**: Critical business operations (status transitions, payments, client creations) automatically trigger non-blocking audit entries.

---

## 3. Security & Access Control

* **Role-Based Access Control (RBAC)**: Supports `OWNER`, `ADMIN`, `STAFF`, `SALES`, and `TAILOR`.
* **Server-Side Enforcement**: Permissions (`customers.create`, `orders.status`, `payments.void`) are checked at the service/action level.
* **Credentials & Password Hashing**: Passwords stored using `bcryptjs` with high work factor salt rounds.
* **Secret Protection**: API secrets (`AUTH_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `DATABASE_URL`) are isolated from client bundles.

---

## 4. Messaging Adapter Design

The system implements the **Channel Adapter Pattern** via `src/lib/messaging/types.ts`:

```typescript
export interface ChannelAdapter {
  sendTextMessage(to: string, text: string): Promise<MessageResult>;
  sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<MessageResult>;
  sendTemplateMessage(to: string, templateName: string, variables: Record<string, string>): Promise<MessageResult>;
  verifyWebhook(req: Request): boolean | Promise<boolean>;
  parseIncomingWebhook(payload: unknown): IncomingMessagePayload[];
}
```

* In development: `MockChannelAdapter` logs message payloads safely without attempting live HTTP dispatch.
* In production: `WhatsAppAdapter` and `InstagramAdapter` execute secure authenticated Graph API requests.
