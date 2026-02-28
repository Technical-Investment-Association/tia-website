/**
 * Bundle each api/*.ts entry so the deployed serverless function is self-contained
 * and does not need to resolve ../src at runtime (fixes ERR_MODULE_NOT_FOUND on Vercel).
 *
 * Run: node scripts/build-api.mjs
 * Output: api/membership.js, api/membership/count.js, api/admin/send-mail.js, etc.
 */
import * as esbuild from "esbuild";
import { readdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function* walkApiTs(dir, base = "api") {
  const full = path.join(root, dir);
  if (!existsSync(full)) return;
  for (const name of readdirSync(full, { withFileTypes: true })) {
    if (name.isDirectory()) {
      yield* walkApiTs(path.join(dir, name.name), path.join(base, name.name));
    } else if (name.name.endsWith(".ts") && !name.name.endsWith(".d.ts")) {
      yield path.join(base, name.name);
    }
  }
}

const entries = [...walkApiTs("api")];
if (entries.length === 0) {
  console.warn("No api/**/*.ts entries found");
  process.exit(0);
}

console.log("Bundling API routes:", entries.join(", "));

const results = await esbuild.build({
  entryPoints: entries.map((e) => path.join(root, e)),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  outdir: root,
  outbase: root,
  alias: { "@": path.join(root, "src") },
  sourcemap: false,
  minify: false,
  packages: "bundle",
});

if (results.errors.length) {
  console.error(results.errors);
  process.exit(1);
}
console.log("API bundles written to api/*.js");
