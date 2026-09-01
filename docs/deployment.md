# VPS Production Deployment Guide — Aazhi Designer Studio

This guide explains how to deploy **Aazhi Designer Studio** to a Linux VPS (Ubuntu 22.04 / 24.04 LTS on Hetzner, DigitalOcean, Linode, AWS EC2, etc.).

---

## Architecture on VPS

```
Internet (HTTPS)
   ↓
[ Nginx Reverse Proxy (Certbot SSL) :443 ]
   ↓
[ PM2 Process Manager / Node.js Next.js App :3000 ]
   ↓
[ PostgreSQL 16 Database :5432 (Local Unix Socket / 127.0.0.1) ]
```

---

## 1. Initial VPS Server Setup

SSH into your server:
```bash
ssh root@YOUR_SERVER_IP
```

Update packages and install core utilities:
```bash
apt update && apt upgrade -y
apt install -y curl git ufw fail2ban unzip build-essential
```

Setup basic firewall:
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## 2. Install Node.js 22 LTS & PM2

```bash
# Install Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Verify versions
node -v
npm -v

# Install PM2 process manager globally
npm install -g pm2
```

---

## 3. Install & Configure PostgreSQL 16

```bash
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
systemctl start postgresql
systemctl enable postgresql

# Create Database and User
sudo -u postgres psql <<EOF
CREATE DATABASE aazhi_designer;
CREATE USER aazhi_user WITH ENCRYPTED PASSWORD 'YOUR_STRONG_DB_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE aazhi_designer TO aazhi_user;
ALTER DATABASE aazhi_designer OWNER TO aazhi_user;
\q
EOF
```

---

## 4. Deploy Application Code

Create a dedicated deploy user:
```bash
adduser --disabled-password --gecos "" aazhi
usermod -aG sudo aazhi

# Switch to aazhi user
su - aazhi
```

Clone your repository:
```bash
git clone YOUR_GIT_REPO_URL /home/aazhi/aazhi-studio
cd /home/aazhi/aazhi-studio
```

Install dependencies:
```bash
npm ci --legacy-peer-deps
```

Setup production environment file:
```bash
cp .env.example .env.production
nano .env.production
```

Configure `.env.production` with your real production secrets:
```env
DATABASE_URL="postgresql://aazhi_user:YOUR_STRONG_DB_PASSWORD_HERE@localhost:5432/aazhi_designer"
AUTH_SECRET="RUN_openssl_rand_base64_32"
NEXTAUTH_URL="https://yourdomain.com"

# Storage
STORAGE_PROVIDER="local"
STORAGE_LOCAL_PATH="./public/uploads"

# WhatsApp & Instagram (when configured)
WHATSAPP_ENABLED="false"
INSTAGRAM_ENABLED="false"

# Production flags
NODE_ENV="production"
PORT=3000
```

Generate Prisma Client and push migrations:
```bash
npx prisma generate
npx prisma db push

# Optional: Seed initial admin user and default settings
npx prisma db seed
```

Build the production Next.js bundle:
```bash
npm run build
```

---

## 5. Configure PM2 Process Manager

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'aazhi-studio',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/home/aazhi/aazhi-studio',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '.env.production',
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100,
    },
  ],
};
```

Start the application with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
(Copy and run the `sudo env PATH=...` command displayed by PM2 to enable auto-restart on system reboot).

---

## 6. Configure Nginx Reverse Proxy with SSL

Exit to root user:
```bash
exit # back to root
apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/aazhi.conf`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static Next.js assets
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Uploads directory
    location /uploads/ {
        alias /home/aazhi/aazhi-studio/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

Enable site and test Nginx:
```bash
ln -s /etc/nginx/sites-available/aazhi.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Obtain Free SSL Certificate via Let's Encrypt:
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 7. Daily Database Automated Backup Strategy

Create a backup script `/home/aazhi/backup-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/aazhi/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

# Dump PostgreSQL database
pg_dump -U aazhi_user -h localhost aazhi_designer | gzip > $BACKUP_DIR/aazhi_db_$TIMESTAMP.sql.gz

# Retain only last 14 days of backups
find $BACKUP_DIR -type f -name "aazhi_db_*.sql.gz" -mtime +14 -delete
```

Make executable and add to crontab:
```bash
chmod +x /home/aazhi/backup-db.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /home/aazhi/backup-db.sh") | crontab -
```

---

## 8. Continuous Updates & Deployment Script

Create `deploy.sh` in the project root:
```bash
#!/bin/bash
set -e

echo "🚀 Deploying latest Aazhi Studio updates..."
git pull origin main
npm ci --legacy-peer-deps
npx prisma generate
npx prisma db push --accept-data-loss
npm run build
pm2 reload aazhi-studio --update-env
echo "✅ Deployment completed successfully!"
```
