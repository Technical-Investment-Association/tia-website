/**
 * Produces .vercel/output for the Build Output API so Vercel serves JS with
 * correct Content-Type (application/javascript), fixing the module script MIME error on reload.
 *
 * Run after: pnpm run build (vite build + build-api.mjs)
 * Output: .vercel/output/static (from dist), .vercel/output/functions (from api/*.js), .vercel/output/config.json
 */
import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  existsSync,
} from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const apiDir = path.join(root, "api");
const out = path.join(root, ".vercel", "output");
const staticDir = path.join(out, "static");
const functionsDir = path.join(out, "functions");

const JS_MIME = "application/javascript; charset=utf-8";

// 1. Copy dist -> .vercel/output/static
if (!existsSync(dist)) {
  console.error("Run build first: pnpm run build");
  process.exit(1);
}
mkdirSync(staticDir, { recursive: true });
cpSync(dist, staticDir, { recursive: true });

// 2. Build overrides for every .js and .mjs in static (fix MIME type)
const overrides = {};
function walk(dir, prefix = "") {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) {
      walk(full, rel);
    } else if (name.endsWith(".js") || name.endsWith(".mjs")) {
      overrides[rel] = { contentType: JS_MIME };
    }
  }
}
walk(staticDir);

// 3. Copy api/*.js to .vercel/output/functions/<path>.func/index.js
function* walkJs(baseDir, prefix = "") {
  if (!existsSync(baseDir)) return;
  for (const name of readdirSync(baseDir)) {
    const full = path.join(baseDir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) {
      yield* walkJs(full, rel);
    } else if (name.endsWith(".js")) {
      yield { rel, full, name };
    }
  }
}

for (const { rel, full } of walkJs(apiDir)) {
  // api/membership.js -> api/membership.func, api/membership/count.js -> api/membership/count.func
  const routePath = rel.replace(/\.js$/, "");
  const funcDir = path.join(
    functionsDir,
    path.dirname(routePath),
    path.basename(routePath) + ".func"
  );
  mkdirSync(funcDir, { recursive: true });
  const content = readFileSync(full, "utf-8");
  writeFileSync(path.join(funcDir, "index.js"), content);
  writeFileSync(
    path.join(funcDir, ".vc-config.json"),
    JSON.stringify(
      {
        runtime: "nodejs20.x",
        handler: "index.js",
        launcherType: "Nodejs",
        shouldAddHelpers: true,
      },
      null,
      2
    )
  );
}

// 4. config.json: overrides + SPA fallback
const config = {
  version: 3,
  overrides,
  routes: [{ handle: "filesystem" }, { src: "/(.*)", dest: "/index.html" }],
};

writeFileSync(path.join(out, "config.json"), JSON.stringify(config, null, 2));

console.log(
  ".vercel/output created: static +",
  Object.keys(overrides).length,
  "JS overrides, functions from api/*.js"
);
