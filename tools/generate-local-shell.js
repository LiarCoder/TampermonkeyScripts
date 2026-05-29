import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const scriptDir = process.argv[2];

if (!scriptDir) {
  console.error("Usage: node tools/generate-local-shell.js <script-dir>");
  process.exit(1);
}

const root = process.cwd();
const projectDir = path.resolve(root, scriptDir);
const metaPath = path.join(projectDir, "src", "meta.js");
const distDir = path.join(projectDir, "dist");
const devDir = path.join(projectDir, "dev");

const { userscript } = await import(pathToFileURL(metaPath).href);

const distEntries = await fs.readdir(distDir);
const distFile = distEntries.find((entry) => entry.endsWith(".user.js"));

if (!distFile) {
  throw new Error(`No .user.js file found in ${distDir}. Run build first.`);
}

const distPath = path.join(distDir, distFile);
const localRequireUrl = pathToFileURL(distPath).href;
const shellName = distFile.replace(/\.user\.js$/, ".local.user.js");
const shellPath = path.join(devDir, shellName);

const headerOrder = [
  "name",
  "namespace",
  "version",
  "author",
  "description",
  "license",
  "match",
  "include",
  "exclude",
  "connect",
  "grant",
  "run-at",
];

const formatValue = (key, value) => {
  if (key === "name") {
    return `local:${value}`;
  }
  return value;
};

const lines = ["// ==UserScript=="];

for (const key of headerOrder) {
  const value = userscript[key];
  if (value === undefined || value === null) {
    continue;
  }
  const values = Array.isArray(value) ? value : [value];
  for (const item of values) {
    lines.push(`// @${key.padEnd(12, " ")} ${formatValue(key, item)}`);
  }
}

lines.push(`// @${"require".padEnd(12, " ")} ${localRequireUrl}`);
lines.push("// ==/UserScript==");
lines.push("");
lines.push("// Local development shell. The built script is loaded through @require.");

await fs.mkdir(devDir, { recursive: true });
await fs.writeFile(shellPath, `${lines.join("\n")}\n`, "utf8");

console.log(`Generated ${path.relative(root, shellPath)}`);
