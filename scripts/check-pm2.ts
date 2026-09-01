import { runRemote } from "./ssh-helper";

async function checkPm2() {
  const res = await runRemote("pm2 logs aazhi-studio --lines 30 --nostream");
  console.log(res.stdout);
}

checkPm2().catch(console.error);
