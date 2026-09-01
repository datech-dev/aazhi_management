import { runRemote } from "./ssh-helper";

async function testSignIn() {
  console.log("Testing sign-in and session via curl on VPS...");
  const res = await runRemote(`
    curl -s -X POST http://127.0.0.1:3005/api/auth/callback/credentials \\
      -H "Content-Type: application/x-www-form-urlencoded" \\
      -d "email=owner@aazhi.studio&password=Aazhi@2026!" -I
  `);
  console.log(res.stdout);
}

testSignIn().catch(console.error);
