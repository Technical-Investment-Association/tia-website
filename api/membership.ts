/**
 * Vercel serverless entry for /api/membership.
 * Delegates to the shared implementation in src.
 * Export POST so Vercel routes POST requests to this handler; default export for legacy (req, res) runtime.
 */
import handler from "../src/api/membership";

export default handler;

/** CORS preflight so browser POST requests succeed. */
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

/** Web API entry for POST so Vercel can route by method (avoids 405 when only default is used). */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const req = {
    method: "POST",
    body,
    headers: Object.fromEntries(request.headers.entries()),
    query: {},
  };
  const chunks: { type: string; data: string }[] = [];
  let statusCode = 200;
  const res = {
    setHeader: () => res,
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    send: (data: string) => {
      chunks.push({ type: "send", data });
      return res;
    },
    end: () => res,
    json: (obj: object) => {
      chunks.push({ type: "json", data: JSON.stringify(obj) });
      return res;
    },
    redirect: () => res,
  };
  await handler(req as any, res as any);
  if (chunks.length === 0) {
    return new Response(null, { status: statusCode });
  }
  const last = chunks[chunks.length - 1];
  const bodyOut = last.type === "json" ? last.data : last.data;
  const contentType = last.type === "json" ? "application/json" : "text/plain";
  return new Response(bodyOut, { status: statusCode, headers: { "Content-Type": contentType } });
}
