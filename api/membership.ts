/**
 * Vercel serverless entry for /api/membership.
 * Uses Node (request, response) signature so Vercel routes all methods to this handler.
 * @see https://vercel.com/docs/frameworks/frontend/vite#vercel-functions
 */
import internalHandler from "../src/api/membership";

type VercelReq = { method?: string; body?: unknown; headers?: Record<string, string>; query?: Record<string, string> };
type VercelRes = {
  setHeader: (n: string, v: string) => VercelRes;
  status: (c: number) => VercelRes;
  send: (s: string) => void;
  json: (o: object) => void;
  end: () => void;
};

export default async function handler(request: VercelReq, response: VercelRes) {
  if (request.method === "OPTIONS") {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    (response.status(204)).end();
    return;
  }
  if (request.method !== "POST") {
    response.status(405).send("Method not allowed");
    return;
  }
  const req = {
    method: "POST" as const,
    body: request.body ?? {},
    headers: request.headers ?? {},
    query: request.query ?? {},
  };
  await internalHandler(req as any, response as any);
}
