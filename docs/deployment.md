# Production VPS Deployment Guide — Aazhi Designer Studio

This guide details the complete deployment process for running **Aazhi Designer Studio** on an Ubuntu 22.04 / 24.04 LTS VPS instance with Nginx, PostgreSQL 16, PM2 cluster management, and SSL encryption.

---

## 1. Prerequisites

- **Server Hardware**: Minimum 2 vCPU, 2GB RAM (Recommended 4GB RAM).
- **Domain Name**: Registered domain pointing to VPS IP address (e.g., `aazhi.studio`).
- **OS**: Ubuntu 22.04 LTS / 24.04 LTS.

---

## 2. Automated VPS Infrastructure Setup

Connect to your VPS via SSH and run the setup script:

```bash
# Clone the repository
git clone https://github.com/datech-dev/aazhi_management.git /var/www/aazhi-studio
cd /var/www/aazhi-studio

# Execute VPS setup script
chmod +x vps-setup.sh
sudo ./vps-setup.sh
```

---

## 3. Environment Configuration

Create the production environment file:

```bash
cp .env.example .env
nano .env
```

Set the following variables:
```env
DATABASE_URL="postgresql://aazhi_user:AazhiProduction2026!@localhost:5432/aazhi_db?schema=public"
AUTH_SECRET="your-32-character-random-auth-secret-key"
AUTH_TRUST_HOST=true
NEXTAUTH_URL="https://aazhi.studio"

WHATSAPP_ENABLED="false"
WHATSAPP_ACCESS_TOKEN=""
INSTAGRAM_ENABLED="false"
INSTAGRAM_ACCESS_TOKEN=""
```

---

## 4. Database Push & Seeding

```bash
# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma Client & push database schema
npm run db:generate
npm run db:push

# Seed initial boutique data & demo accounts
npm run db:seed
```

---

## 5. Build & PM2 Cluster Execution

```bash
# Compile Next.js production build
npm run build

# Start Next.js app with PM2
pm2 start ecosystem.config.js
pm2 save
sudo pm2 startup
```

---

## 6. Nginx & SSL Configuration

```bash
# Copy Nginx configuration
sudo cp docs/aazhi-studio.nginx.conf /etc/nginx/sites-available/aazhi-studio
sudo ln -s /etc/nginx/sites-available/aazhi-studio /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax
sudo nginx -t

# Obtain Let's Encrypt SSL Certificate
sudo certbot --nginx -d aazhi.studio -d www.aazhi.studio

# Reload Nginx
sudo systemctl reload nginx
```

---

## 7. Automated Crontab Database Backups

Schedule daily database backups:

```bash
# Make backup script executable
chmod +x scripts/backup-db.sh

# Open crontab
crontab -e
```

Add daily 2:00 AM backup cron job:
```cron
0 2 * * * /var/www/aazhi-studio/scripts/backup-db.sh >> /var/log/aazhi-db-backup.log 2>&1
```

---

## 8. Verification & Smoke Testing

1. Open `https://aazhi.studio` in browser.
2. Sign in with demo credentials (`owner@aazhi.studio` / `Aazhi@2026!`).
3. Verify Customer 360, Products, Measurement Sheets, Order Booking, Kanban Pipeline, Payments Ledger, Reports, and Staff Settings.
