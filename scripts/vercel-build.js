import fs from "node:fs";
import path from "node:path";

const dist = "dist";
const clientDir = path.join(dist, "client");

if (!fs.existsSync(clientDir)) process.exit(0);

const entries = fs.readdirSync(clientDir);
for (const entry of entries) {
  const src = path.join(clientDir, entry);
  const dest = path.join(dist, entry);
  fs.cpSync(src, dest, { recursive: true });
}

fs.rmSync(clientDir, { recursive: true });

const apiSrc = path.join("api", "server.js");
const apiDest = path.join(dist, "api", "server.js");
if (fs.existsSync(apiSrc)) {
  fs.mkdirSync(path.dirname(apiDest), { recursive: true });
  fs.cpSync(apiSrc, apiDest);
}
