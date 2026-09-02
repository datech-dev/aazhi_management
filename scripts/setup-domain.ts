import { runRemote } from "./ssh-helper";

async function setupDomain() {
  console.log("🌐 Setting up domain aazhistore.zetalink.cloud on VPS 157.66.191.104...\n");

  const domain = "aazhistore.zetalink.cloud";

  // Step 1: Write Nginx configuration
  console.log("📝 1/5 Writing Nginx reverse proxy configuration...");
  const nginxConf = `
server {
    listen 80;
    server_name ${domain} aazhi.zetalink.cloud aazhidesigner.com www.aazhidesigner.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:3005;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /uploads/ {
        alias /var/www/aazhi_management/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
`;

  await runRemote(`
    cat << 'EOF' > /etc/nginx/sites-available/aazhi-studio
${nginxConf.trim()}
EOF
    ln -sf /etc/nginx/sites-available/aazhi-studio /etc/nginx/sites-enabled/aazhi-studio
    nginx -t
    systemctl reload nginx
  `);

  // Step 2: Obtain Certbot SSL Certificate
  console.log("\n🔒 2/5 Requesting Let's Encrypt SSL certificate for " + domain + "...");
  await runRemote(`
    certbot --nginx -d ${domain} --non-interactive --agree-tos --email contact@aazhi.studio --redirect || true
    systemctl reload nginx
  `);

  // Step 3: Update Production Environment Variables
  console.log("\n⚙️ 3/5 Updating production .env files with domain URL...");
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

  // Step 4: Reload PM2
  console.log("\n🔄 4/5 Reloading application on PM2...");
  await runRemote(`
    cd /var/www/aazhi_management
    pm2 restart aazhi-studio --update-env || pm2 start npm --name "aazhi-studio" -- run start -- -p 3005
    pm2 save
  `);

  // Step 5: Verify HTTPS resolution
  console.log("\n🔍 5/5 Verifying domain resolution...");
  const check = await runRemote(`
    curl -Is https://${domain} | head -n 5 || curl -Is http://${domain} | head -n 5
  `);
  console.log(check.stdout);

  console.log("\n✨ DOMAIN ROUTING COMPLETE! ✨");
  console.log("-----------------------------------------------------------------");
  console.log(`🌐 Production App URL: https://${domain}`);
  console.log(`🔐 Login Portal:      https://${domain}/login`);
  console.log("-----------------------------------------------------------------");
}

setupDomain().catch((e) => {
  console.error("❌ Domain setup failed:", e);
  process.exit(1);
});
