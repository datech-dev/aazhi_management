import { runRemote } from './ssh-helper';

async function main() {
  console.log('Searching for Zetamart directory on VPS...');
  await runRemote(`
    echo "=== NGINX SITES ==="
    grep -rn "zetalink.cloud" /etc/nginx/ 2>/dev/null || true
    echo "=== SITES ENABLED FULL ==="
    cat /etc/nginx/sites-enabled/* 2>/dev/null | grep -E "server_name|root|proxy_pass" || true
    echo "=== FIND BOUTIQUE ==="
    find /var/www /usr/share/nginx /home /root /srv -iname "*boutique*" 2>/dev/null || true
    echo "=== FIND ZETAMART ==="
    find /var/www /usr/share/nginx /home /root /srv -iname "*zetamart*" 2>/dev/null || true
  `);
}

main().catch(console.error);
