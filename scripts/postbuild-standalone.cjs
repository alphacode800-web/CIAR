const fs = require("fs");
const path = require("path");

const isNetlify = process.env.NETLIFY === "true";
if (isNetlify) {
  process.exit(0);
}

const root = process.cwd();
const nextStaticDir = path.join(root, ".next", "static");
const standaloneNextDir = path.join(root, ".next", "standalone", ".next");
const publicDir = path.join(root, "public");
const standalonePublicDir = path.join(root, ".next", "standalone", "public");

if (!fs.existsSync(nextStaticDir)) {
  process.exit(0);
}

fs.mkdirSync(standaloneNextDir, { recursive: true });
fs.cpSync(nextStaticDir, path.join(standaloneNextDir, "static"), { recursive: true });

if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, standalonePublicDir, { recursive: true });
}
