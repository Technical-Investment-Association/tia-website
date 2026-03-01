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
  const hasFirebase = checkEnv();
  if (!hasFirebase) {
    console.warn("[dev-api-server] No FIREBASE_* in .env.local – API will start but most routes will 500 until you set them. GET /api/membership/count will still return { count: 0 }.");
  }

  let membershipHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let notMeHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let membershipCountHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let updateProfileHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let confirmEmailHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let unsubscribeHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let deactivateHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let emailPreviewHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let sendMailHandler: ((req: unknown, res: unknown) => Promise<void>) | null = null;
  let loadError: Error | null = null;

  async function ensureHandlers() {
    if (loadError) throw loadError;
    if (membershipHandler && notMeHandler && membershipCountHandler && updateProfileHandler && confirmEmailHandler && unsubscribeHandler && deactivateHandler && emailPreviewHandler && sendMailHandler) return;
    try {
      membershipHandler = (await import("../src/api/membership")).default;
      notMeHandler = (await import("../src/api/membership/not-me")).default;
      membershipCountHandler = (await import("../src/api/membership/count")).default;
      updateProfileHandler = (await import("../src/api/membership/update-profile")).default;
      confirmEmailHandler = (await import("../src/api/membership/confirm-email")).default;
      unsubscribeHandler = (await import("../src/api/membership/unsubscribe")).default;
      deactivateHandler = (await import("../src/api/membership/deactivate")).default;
      emailPreviewHandler = (await import("../src/api/admin/email-preview")).default;
      sendMailHandler = (await import("../src/api/admin/send-mail")).default;
      console.log("[dev-api-server] Handlers loaded (Firebase Admin OK).");
      const baseUrl = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
      console.log("[dev-api-server] Email links base URL:", baseUrl);
      if (baseUrl.includes("localhost")) {
        console.log("[dev-api-server] Tip: Set PUBLIC_BASE_URL=https://tiaassociation.com in .env.local so email links work for recipients.");
      }
    } catch (e) {
      loadError = e instanceof Error ? e : new Error(String(e));
      console.error("[dev-api-server] Failed to load API handlers:", loadError.message);
      console.error(loadError.stack);
      throw loadError;
    }
  }

  /** Load and run only the count handler so /api/membership/count never 500s (no Firebase required). */
  async function handleCountOnly(reqAugmented: unknown, resHelpers: { setHeader: (n: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }) {
    try {
      const { default: countHandler } = await import("../src/api/membership/count");
      await countHandler(reqAugmented, resHelpers);
    } catch (e) {
      console.error("[dev-api-server] /api/membership/count:", e instanceof Error ? e.message : e);
      resHelpers.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      resHelpers.status(200).json({ count: 0 });
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
      redirect: (code: number, url: string) => {
        res.writeHead(code, { Location: url });
        res.end();
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
      if (req.method === "GET" && pathname === "/api/membership/count") {
        await handleCountOnly(reqAugmented, resHelpers);
        return;
      }
      if ((req.method === "GET" || req.method === "POST") && pathname === "/api/membership/update-profile") {
        await ensureHandlers();
        if (req.method === "POST") {
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c);
          const raw = Buffer.concat(chunks).toString("utf8");
          reqAugmented.body = raw ? JSON.parse(raw) : {};
        }
        await updateProfileHandler!(reqAugmented, resHelpers);
        return;
      }
      if (req.method === "GET" && pathname === "/api/membership/confirm-email") {
        await ensureHandlers();
        await confirmEmailHandler!(reqAugmented, resHelpers);
        return;
      }
      if (req.method === "GET" && pathname === "/api/membership/unsubscribe") {
        await ensureHandlers();
        await unsubscribeHandler!(reqAugmented, resHelpers);
        return;
      }
      if ((req.method === "GET" || req.method === "POST") && pathname === "/api/membership/deactivate") {
        await ensureHandlers();
        if (req.method === "POST") {
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c);
          const raw = Buffer.concat(chunks).toString("utf8");
          const contentType = (req.headers["content-type"] as string) || "";
          if (contentType.includes("application/x-www-form-urlencoded")) {
            reqAugmented.body = raw;
          } else {
            reqAugmented.body = raw ? JSON.parse(raw) : {};
          }
        }
        await deactivateHandler!(reqAugmented, resHelpers);
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
