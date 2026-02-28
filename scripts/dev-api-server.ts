/**
 * Local dev server for /api/membership and /api/membership/not-me.
 * Run with: pnpm run dev:api-server (or tsx scripts/dev-api-server.ts)
 * Load .env.local before importing handlers so Firebase Admin sees env vars.
 */
import { config } from "dotenv";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

const PORT = Number(process.env.API_PORT) || 3001;

function checkEnv() {
  const ok =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;
  if (!ok) {
    console.error(
      "[dev-api-server] Missing Firebase Admin env. Set in .env.local: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
    if (!process.env.FIREBASE_PROJECT_ID) console.error("  - FIREBASE_PROJECT_ID is missing");
    if (!process.env.FIREBASE_CLIENT_EMAIL) console.error("  - FIREBASE_CLIENT_EMAIL is missing");
    if (!process.env.FIREBASE_PRIVATE_KEY) console.error("  - FIREBASE_PRIVATE_KEY is missing");
  }
  return ok;
}

async function main() {
  if (!checkEnv()) {
    console.error("[dev-api-server] Exiting: set FIREBASE_* in .env.local and try again.");
    process.exit(1);
    return;
  }

  let membershipHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let notMeHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let emailPreviewHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let sendMailHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let loadError: Error | null = null;

  async function ensureHandlers() {
    if (loadError) throw loadError;
    if (membershipHandler && notMeHandler && emailPreviewHandler && sendMailHandler) return;
    try {
      membershipHandler = (await import("../src/api/membership")).default;
      notMeHandler = (await import("../src/api/membership/not-me")).default;
      emailPreviewHandler = (await import("../src/api/admin/email-preview")).default;
      sendMailHandler = (await import("../src/api/admin/send-mail")).default;
      console.log("[dev-api-server] Handlers loaded (Firebase Admin OK).");
    } catch (e) {
      loadError = e instanceof Error ? e : new Error(String(e));
      console.error("[dev-api-server] Failed to load API handlers:", loadError.message);
      console.error(loadError.stack);
      throw loadError;
    }
  }

  const server = createServer(async (req, res) => {
    const url = req.url ?? "/";
    const [pathname, search] = url.split("?");
    const query = Object.fromEntries(new URLSearchParams(search || ""));

    const resHelpers = {
      status: (code: number) => {
        res.statusCode = code;
        return resHelpers;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return resHelpers;
      },
      send: (body: string) => {
        res.end(body);
      },
      end: () => {
        res.end();
      },
      json: (obj: object) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(obj));
      },
    };

    const reqAugmented = {
      ...req,
      method: req.method ?? "GET",
      headers: req.headers ?? {},
      query,
      body: undefined as unknown,
    };

    try {
      if (req.method === "POST" && pathname === "/api/membership") {
        await ensureHandlers();
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c);
        const raw = Buffer.concat(chunks).toString("utf8");
        reqAugmented.body = raw ? JSON.parse(raw) : {};
        await membershipHandler!(reqAugmented, resHelpers);
        return;
      }
      if (req.method === "GET" && pathname === "/api/membership/not-me") {
        await ensureHandlers();
        await notMeHandler!(reqAugmented, resHelpers);
        return;
      }
      if (req.method === "GET" && pathname.startsWith("/api/admin/email-preview")) {
        await ensureHandlers();
        await emailPreviewHandler!(reqAugmented, resHelpers);
        return;
      }
      if (req.method === "POST" && pathname === "/api/admin/send-mail") {
        await ensureHandlers();
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c);
        const raw = Buffer.concat(chunks).toString("utf8");
        reqAugmented.body = raw ? JSON.parse(raw) : {};
        await sendMailHandler!(reqAugmented, resHelpers);
        return;
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("[dev-api-server] Error handling", req.method, pathname, err.message);
      console.error(err.stack);
      if (err.message.includes("credential") || err.message.includes("private") || err.message.includes("FIREBASE"))
        console.error("[dev-api-server] Tip: Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local");
      if (!res.writableEnded) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Internal server error", message: err.message }));
      }
      return;
    }

    res.statusCode = 404;
    res.end("Not found");
  });

  server.listen(PORT, () => {
    console.log(`[dev-api-server] API running at http://localhost:${PORT} (use Vite proxy /api -> here)`);
  });
}

main().catch((err) => {
  console.error("Failed to start API server:", err);
  process.exit(1);
});
