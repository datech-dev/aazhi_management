#!/usr/bin/env bash

# Aazhi Designer Studio — VPS Production Infrastructure Setup Script
# Supported OS: Ubuntu 22.04 LTS / 24.04 LTS
# Usage: sudo ./vps-setup.sh

set -e

echo "🚀 Starting Aazhi Designer Studio VPS Provisioning..."

# 1. Update System Packages
echo "🔄 Updating system package repositories..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw ufw-extras unzip gnupg

# 2. Configure UFW Firewall
echo "🛡️ Configuring UFW Firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 3. Install Node.js 22 LTS
echo "🟢 Installing Node.js 22 LTS..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 4. Install PM2 Process Manager
echo "⚡ Installing PM2 Globally..."
sudo npm install -g pm2
sudo pm2 install pm2-logrotate

# 5. Install PostgreSQL 16
echo "🐘 Installing PostgreSQL 16..."
sudo apt install -y postgresql postgresql-contrib

sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create Database & User
sudo -u postgres psql -c "CREATE DATABASE aazhi_db;" || true
sudo -u postgres psql -c "CREATE USER aazhi_user WITH PASSWORD 'AazhiProduction2026!';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aazhi_db TO aazhi_user;" || true

# 6. Install Nginx & Certbot
echo "🌐 Installing Nginx & Certbot SSL..."
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "✨ VPS Infrastructure Provisioning Complete!"
echo "Next Steps: Clone repository into /var/www/aazhi-studio, configure .env, run npm run db:push, npm run db:seed, and npm run build!"
