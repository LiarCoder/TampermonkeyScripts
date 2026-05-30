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
const distDir = path.join(projectDir, "dist");

const distEntries = await fs.readdir(distDir);
const distFile = distEntries.find((entry) => entry.endsWith(".user.js"));

if (!distFile) {
  throw new Error(`No .user.js file found in ${distDir}. Run build first.`);
}

const distPath = path.join(distDir, distFile);
const localRequireUrl = pathToFileURL(distPath).href;
const shellName = distFile.replace(/\.user\.js$/, ".local.user.js");
const shellPath = path.join(distDir, shellName);

const distContent = await fs.readFile(distPath, "utf8");
const headerStart = distContent.indexOf("// ==UserScript==");
const headerEnd = distContent.indexOf("// ==/UserScript==");

if (headerStart === -1 || headerEnd === -1) {
  throw new Error(`No userscript header found in ${distPath}.`);
}

const lines = distContent
  .slice(headerStart, headerEnd)
  .split(/\r?\n/)
  .filter((line) => line && !line.startsWith("// @require"))
  .map((line) => line.replace(/^(\/\/ @name\s+)(.*)$/, "$1local:$2"));

lines.push(`// @${"require".padEnd(12, " ")} ${localRequireUrl}`);
lines.push("// ==/UserScript==");
lines.push("");
lines.push("// Local development shell. The built script is loaded through @require.");

await fs.writeFile(shellPath, `${lines.join("\n")}\n`, "utf8");

console.log(`Generated ${path.relative(root, shellPath)}`);
