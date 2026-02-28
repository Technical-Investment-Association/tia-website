/**
 * Vercel serverless entry for /api/membership.
 * Uses the recommended default fetch handler so all methods (OPTIONS, POST) are routed to one entry.
 */
import handler from "../src/api/membership";

/** Single entry point: Vercel calls this for every request, we handle OPTIONS and POST. */
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    const body = await request.json().catch(() => ({}));
    const req = {
      method: "POST" as const,
      body,
      headers: Object.fromEntries(request.headers.entries()),
      query: {} as Record<string, string>,
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
    const bodyOut = last.data;
    const contentType = last.type === "json" ? "application/json" : "text/plain";
    return new Response(bodyOut, { status: statusCode, headers: { "Content-Type": contentType } });
  },
};
