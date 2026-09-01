import { runRemote } from "./ssh-helper";

async function checkDb() {
  const res = await runRemote(`
    docker exec sms_postgres psql -U sms_user -d aazhi_designer -c "SELECT id, email, name, role FROM users;"
  `);
  console.log(res.stdout);
}

checkDb().catch(console.error);
