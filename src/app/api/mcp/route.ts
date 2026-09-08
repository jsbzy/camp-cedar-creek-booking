import { NextRequest } from "next/server";
import { callTool } from "@/lib/mcp/tools";
import { READ_TOOLS, WRITE_TOOLS, ADMIN_TOOLS, INSTRUCTIONS } from "@/lib/mcp/toolDefs";
import { lawFrom, rulesSummary } from "@/lib/mcp/validate";
import { getDb } from "@/lib/data/db";

// MCP connector for Camp Cedar Creek. Streamable-HTTP JSON-RPC, stateless.
// One access level: ?k=<MCP_ADMIN_KEY> or ?k=<MCP_EDITOR_KEY>, both full.
//
// This runs on Node (not edge) because the tools use Payload's local API.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PROTO = ["2025-06-18", "2025-03-26", "2024-11-05"];

// One level of access. Everyone who holds a key can do everything, because
// every change is now recorded and reversible, and because a permission split
// that gated homepage wording while letting rate changes straight through was
// guarding the cheap thing. Both key names still work so nobody has to
// reconnect; they differ only in who you handed them to.
function authorised(key: string): boolean {
  const keys = [process.env.MCP_ADMIN_KEY, process.env.MCP_EDITOR_KEY].filter(Boolean);
  return !!key && keys.includes(key);
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const ok = (id: unknown, result: unknown) => json({ jsonrpc: "2.0", id, result });
const rpcError = (id: unknown, code: number, message: string) => json({ jsonrpc: "2.0", id, error: { code, message } });

export async function GET() {
  return new Response(null, { status: 405 });
}
export async function DELETE() {
  return new Response(null, { status: 200 });
}

/**
 * The rules travel with the connection. Built from the stored Brand Guide, so
 * they cannot drift from what the validator actually enforces, and so a session
 * starts knowing them rather than being told to go and look them up.
 */
async function instructionsWithRules(): Promise<string> {
  try {
    const db = await getDb();
    const guide: any = await db.findGlobal({ slug: "brand-guide" });
    const rules = rulesSummary(lawFrom(guide?.markdown));
    return rules ? `${INSTRUCTIONS}\n\nThe rules:\n${rules}` : INSTRUCTIONS;
  } catch (e) {
    // Never fail a connection over this. The server still enforces the rules.
    console.error("[mcp] could not attach rules to instructions:", e);
    return INSTRUCTIONS;
  }
}

export async function POST(request: NextRequest) {
  if (!authorised(request.nextUrl.searchParams.get("k") || "")) return new Response("Unauthorized", { status: 401 });

  let msg: any;
  try {
    msg = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }
  if (Array.isArray(msg)) return rpcError(null, -32600, "Batches not supported");

  const { id, method, params } = msg || {};
  if (id === undefined || id === null) return new Response(null, { status: 202 }); // notification

  try {
    if (method === "initialize") {
      const want = params?.protocolVersion;
      return ok(id, {
        protocolVersion: PROTO.includes(want) ? want : PROTO[1],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "cici", version: "2.1.0", title: "Cici · Camp Cedar Creek" },
        instructions: await instructionsWithRules(),
      });
    }
    if (method === "ping") return ok(id, {});
    if (method === "tools/list")
      return ok(id, { tools: [...READ_TOOLS, ...WRITE_TOOLS, ...ADMIN_TOOLS] });
    if (method === "tools/call") {
      const r = await callTool(params.name, params.arguments || {});
      return ok(id, { content: [{ type: "text", text: r.text }], isError: !!r.isError });
    }
    if (method === "resources/list") return ok(id, { resources: [] });
    if (method === "prompts/list") return ok(id, { prompts: [] });
    return rpcError(id, -32601, `Method not found: ${method}`);
  } catch (e: any) {
    console.error("[mcp]", method, params?.name, e);
    return rpcError(id, -32603, `Internal error: ${e?.message}`);
  }
}
