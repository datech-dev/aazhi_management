import { runRemote } from "./ssh-helper";

async function checkNginx() {
  console.log("Checking Nginx sites...");
  const res = await runRemote("ls -la /etc/nginx/sites-enabled/; cat /etc/nginx/sites-enabled/* || true");
  console.log(res.stdout);
}

checkNginx().catch(console.error);
