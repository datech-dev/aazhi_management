import { runRemote } from "./ssh-helper";

async function main() {
  await runRemote(`
    echo "=== /root/Zetamart contents ==="
    ls -la /root/Zetamart || true
    echo "=== /root/Zetamart git remote ==="
    cd /root/Zetamart 2>/dev/null && git remote -v || true
    echo "=== Search for zetamart - boutique.html in /root/Zetamart ==="
    find /root/Zetamart -iname "*boutique*" 2>/dev/null || true
  `);
}

main().catch(console.error);

