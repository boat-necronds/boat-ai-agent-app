import { getAgentById } from "@workspace/services";
import { NextRequest } from "next/server";

const log = (msg: string, ...args: unknown[]) => {
  const time = new Date().toISOString();
  console.log(`[${time}] [Next Agent Proxy] ${msg}`, ...args);
};

/**
 * POST /api/agents/[id]/chat
 * - transport = 'proxy': forward ไป agent.url + /api/chat/agent/:slug (Bun agents-server รองรับ POST /api/chat/agent/:agent)
 * - transport = 'cloudflare': forward ไป agent.url + /api/chat (Worker)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const agent = await getAgentById(id);
  const baseUrl = agent?.url ?? null;
  const transport = agent?.chatTransport ?? "proxy";

  if (!agent) {
    return new Response(
      JSON.stringify({ error: "Agent not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: "Agent not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const base = baseUrl.replace(/\/$/, "");
  const chatUrl =
    transport === "proxy"
      ? `${base}/api/chat/agent/${encodeURIComponent(agent.slug ?? agent.agentType ?? "default")}`
      : `${base}/api/chat`;
  log("Forwarding POST /api/agents/%s/chat → %s (transport=%s)", id, chatUrl, transport);

  let body: string;
  try {
    body = await request.text();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const accept = request.headers.get("Accept") ?? undefined;

  const res = await fetch(chatUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accept && { Accept: accept }),
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    log("Agent API error:", res.status, res.statusText);
    return new Response(text, {
      status: res.status,
      statusText: res.statusText,
      headers: { "Content-Type": "application/json" },
    });
  }

  log("Agent API response OK (streaming)");
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}
