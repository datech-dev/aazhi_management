import { Client } from "ssh2";

const config = {
  host: "157.66.191.104",
  port: 22,
  username: "root",
  password: "Nagarajeev@01",
};

export function runRemote(cmd: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let stdout = "";
    let stderr = "";

    conn
      .on("ready", () => {
        conn.exec(cmd, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          stream
            .on("close", (code: number) => {
              conn.end();
              resolve({ stdout, stderr, code });
            })
            .on("data", (data: Buffer) => {
              stdout += data.toString();
              process.stdout.write(data);
            })
            .stderr.on("data", (data: Buffer) => {
              stderr += data.toString();
              process.stderr.write(data);
            });
        });
      })
      .on("error", (err) => {
        reject(err);
      })
      .connect(config);
  });
}

async function inspectAndDeploy() {
  console.log("🔍 Connecting to VPS 157.66.191.104 to inspect running applications...");

  // 1. Inspect OS and resources
  console.log("\n--- System & Memory Info ---");
  const sysInfo = await runRemote("uname -a; free -h; df -h /");

  // 2. Check running processes, PM2, Docker, Systemd
  console.log("\n--- PM2 Applications ---");
  await runRemote("pm2 list || echo 'pm2 not installed or no apps'");

  console.log("\n--- Docker Containers ---");
  await runRemote("docker ps || echo 'docker not running'");

  // 3. Check active listening ports
  console.log("\n--- Active Listening Ports ---");
  const portInfo = await runRemote("ss -tulpn || netstat -tulpn");

  // 4. Check Node, NPM, PostgreSQL, Nginx versions
  console.log("\n--- Installed Tools ---");
  await runRemote("node -v || echo 'node missing'; npm -v || echo 'npm missing'; psql --version || echo 'psql missing'; nginx -v || echo 'nginx missing'");
}

inspectAndDeploy().catch((e) => {
  console.error("SSH Execution Error:", e);
  process.exit(1);
});
