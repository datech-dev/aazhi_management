import { runRemote } from "./ssh-helper";

async function verifyPort() {
  console.log("Checking and allowing Port 3005 on UFW firewall...");
  await runRemote("ufw allow 3005/tcp || true; iptables -I INPUT -p tcp --dport 3005 -j ACCEPT || true; pm2 status");
}

verifyPort().catch(console.error);
