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
