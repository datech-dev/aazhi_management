import { runRemote } from "./ssh-helper";

async function checkPostgres() {
  console.log("Checking PostgreSQL container config...");
  const res = await runRemote("docker inspect sms_postgres --format '{{json .Config.Env}}'");
  console.log("Postgres Environment:", res.stdout);
}

checkPostgres().catch(console.error);
