// Stands in for the Resend API during tests: records every email it is asked to send.
import { createServer } from "node:http";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
const log = process.argv[2];
mkdirSync(dirname(log), { recursive: true });
writeFileSync(log, "");
createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    appendFileSync(log, JSON.stringify({ auth: req.headers.authorization, ...JSON.parse(body || "{}") }) + "\n");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ id: "test-" + Date.now() }));
  });
}).listen(3999, () => console.log("mock resend on 3999"));
