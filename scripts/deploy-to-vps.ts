import { runRemote } from "./ssh-helper";

async function deploy() {
  console.log("🚀 Starting deployment of Aazhi Designer Studio to VPS 157.66.191.104...\n");

  const domain = "aazhistore.zetalink.cloud";

  // Step 1: Install Node.js 22 & PM2 if missing
  console.log("📦 1/7 Checking/Installing Node.js 22 LTS & PM2...");
  await runRemote(`
    if ! command -v node &> /dev/null; then
      echo "Installing Node.js 22..."
      curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
      apt-get install -y nodejs
    fi
    if ! command -v pm2 &> /dev/null; then
      echo "Installing PM2..."
      npm install -g pm2
    fi
    node -v
    npm -v
  `);

  // Step 2: Ensure PostgreSQL database exists
  console.log("\n🗄️ 2/7 Configuring PostgreSQL database 'aazhi_designer' on existing Postgres instance...");
  await runRemote(`
    docker exec sms_postgres psql -U sms_user -d postgres -c "CREATE DATABASE aazhi_designer;" 2>&1 || echo "Database aazhi_designer already exists."
  `);

  // Step 3: Clone or Pull latest Git repository
  console.log("\n📥 3/7 Pulling latest code from GitHub (https://github.com/datech-dev/aazhi_management.git)...");
  await runRemote(`
    mkdir -p /var/www
    if [ -d "/var/www/aazhi_management/.git" ]; then
      cd /var/www/aazhi_management
      git fetch --all
      git reset --hard origin/main
    else
      rm -rf /var/www/aazhi_management
      git clone https://github.com/datech-dev/aazhi_management.git /var/www/aazhi_management
    fi
  `);

  // Step 4: Configure Production Environment Variables on Port 3005
  console.log("\n⚙️ 4/7 Writing production .env configuration for " + domain + "...");
  const envContent = `
PORT=3005
DATABASE_URL="postgresql://sms_user:sms_pass@localhost:5432/aazhi_designer"
AUTH_SECRET="AazhiDesignerStudioSecretKey2026SecureHashBoutique"
AUTH_TRUST_HOST=true
AUTH_URL="https://${domain}"
NEXTAUTH_URL="https://${domain}"
NEXTAUTH_SECRET="AazhiDesignerStudioSecretKey2026SecureHashBoutique"
NEXT_PUBLIC_APP_URL="https://${domain}"
NEXT_PUBLIC_APP_NAME="Aazhi Designer Studio"
STORAGE_PROVIDER="local"
STORAGE_LOCAL_PATH="./public/uploads"
WHATSAPP_ENABLED="false"
INSTAGRAM_ENABLED="false"
NODE_ENV="production"
`;

  await runRemote(`
    cat << 'EOF' > /var/www/aazhi_management/.env
${envContent.trim()}
EOF
    cat << 'EOF' > /var/www/aazhi_management/.env.production
${envContent.trim()}
EOF
  `);

  // Step 5: Install dependencies, run Prisma migrations & seed
  console.log("\n🔨 5/7 Installing dependencies and running database migration & seed...");
  await runRemote(`
    cd /var/www/aazhi_management
    npm ci --legacy-peer-deps || npm install --legacy-peer-deps
    npx prisma generate
    npx prisma db push --accept-data-loss
    npx tsx prisma/seed.ts
  `);

  // Step 6: Build Next.js production bundle
  console.log("\n🏗️ 6/7 Building Next.js production bundle on VPS...");
  await runRemote(`
    cd /var/www/aazhi_management
    npm run build
  `);

  // Step 7: Configure PM2 process and start application
  console.log("\n🚦 7/7 Starting / Reloading application on Port 3005 with PM2...");
  await runRemote(`
    cd /var/www/aazhi_management
    pm2 restart aazhi-studio --update-env || pm2 start npm --name "aazhi-studio" -- run start -- -p 3005
    pm2 save
  `);

  // Step 8: Verify health check
  console.log("\n🔍 Verifying health check on https://" + domain + "...");
  const health = await runRemote(`
    sleep 3
    curl -Is https://${domain}/login | head -n 5
  `);
  console.log(health.stdout);

  console.log("\n✨ DEPLOYMENT SUCCESSFUL! ✨");
  console.log("-----------------------------------------------------------------");
  console.log(`🌐 Production App URL: https://${domain}`);
  console.log(`🔐 Login Portal:      https://${domain}/login`);
  console.log("👑 Owner Login:       owner@aazhi.studio / Aazhi@2026!");
  console.log("🛍️ Sales Login:       sales@aazhi.studio / Aazhi@2026!");
  console.log("✂️ Tailor Login:      tailor@aazhi.studio / Aazhi@2026!");
  console.log("-----------------------------------------------------------------");
}

deploy().catch((e) => {
  console.error("❌ Deployment failed:", e);
  process.exit(1);
});
