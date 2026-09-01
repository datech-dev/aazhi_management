import { runRemote } from "./ssh-helper";

async function setupNginx() {
  console.log("Setting up Nginx site configuration for Aazhi Studio...");
  const nginxConf = `
server {
    listen 80;
    server_name aazhi.zetalink.cloud aazhidesigner.com www.aazhidesigner.com;

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
    ln -sf /etc/nginx/sites-available/aazhi-studio /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
  `);

  console.log("✅ Nginx site configured and reloaded.");
}

setupNginx().catch(console.error);
