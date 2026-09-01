import { runRemote } from "./ssh-helper";

async function checkLoginIssue() {
  console.log("Checking PM2 logs for aazhi-studio...");
  const logs = await runRemote("pm2 logs aazhi-studio --lines 100 --nostream");
  console.log(logs.stdout);
  console.log(logs.stderr);

  console.log("\nChecking seeded users in database...");
  const dbUsers = await runRemote(`
    docker exec sms_postgres psql -U sms_user -d aazhi_designer -c "SELECT id, email, name, role, \\"isActive\\" FROM \\"User\\";"
  `);
  console.log(dbUsers.stdout);
}

checkLoginIssue().catch(console.error);
