#!/usr/bin/env node
/**
 * Baton MCP server: a thin wrapper over the REST API (stdio transport).
 *
 * Configuration (env):
 *   BATON_API_URL — API base, defaults to https://api.batontasks.com/v1
 *   BATON_TOKEN   — the actor's token (bt_...), required
 *
 * Example claude_desktop_config.json / .mcp.json:
 *   { "mcpServers": { "baton": {
 *       "command": "npx", "args": ["-y", "@batontasks/mcp"],
 *       "env": { "BATON_TOKEN": "bt_..." } } } }
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API = (process.env.BATON_API_URL || "https://api.batontasks.com/v1").replace(/\/$/, "");
const TOKEN = process.env.BATON_TOKEN;
if (!TOKEN) {
    console.error("BATON_TOKEN env is required (bt_...)");
    process.exit(1);
}

async function api(method, path, body) {
    const res = await fetch(API + path, {
        method,
        headers: {
            "Authorization": "Bearer " + TOKEN,
            ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${data?.error?.message || text.slice(0, 300)}`);
    }
    return data;
}

const out = (data) => ({ content: [{ type: "text", text: JSON.stringify(data, null, 1) }] });
const fail = (e) => ({ content: [{ type: "text", text: String(e.message || e) }], isError: true });
const wrap = (fn) => async (args) => { try { return out(await fn(args)); } catch (e) { return fail(e); } };

const server = new McpServer({ name: "baton", version: "0.1.0" });

server.tool("whoami", "Current actor, workspace and token scopes", {}, wrap(() => api("GET", "/me")));

server.tool("inbox", "What happened since my cursor (subscriptions; excludes my own actions). Call ack afterwards.",
    { limit: z.number().int().min(1).max(500).optional() },
    wrap(({ limit }) => api("GET", "/inbox" + (limit ? `?limit=${limit}` : ""))));

server.tool("ack", "Confirm inbox processed up to cursor",
    { cursor: z.number().int() },
    wrap(({ cursor }) => api("POST", "/inbox/ack", { cursor })));

server.tool("list_tasks", "List tasks. Defaults: OPEN statuses only (no done) and brief cards without descriptions — use get_task for the full thread. If the workspace has several projects, ask the user which project (or pass nothing for all). Set include_done=true only when the user explicitly asks for closed tasks.",
    {
        project: z.string().optional(),
        status: z.string().optional().describe("comma-separated: new,approved,in_progress,waiting,review,done"),
        assignee: z.string().optional().describe('actor id or "me"'),
        author: z.string().optional().describe('actor id or "me"'),
        ball: z.enum(["author", "assignee"]).optional(),
        q: z.string().optional(),
        ready: z.boolean().optional(),
        include_done: z.boolean().optional().describe("include done/rejected/cancelled (default false)"),
        full: z.boolean().optional().describe("include descriptions (default false — brief cards)"),
        sort: z.enum(["rank", "updated", "priority"]).optional(),
        limit: z.number().int().max(200).optional(),
    },
    wrap(({ include_done, full, ...args }) => {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(args)) {
            if (v === undefined) continue;
            params.set(k, k === "ready" ? (v ? "1" : "") : String(v));
        }
        if (!args.status && !include_done && !args.ready) {
            params.set("status", "new,approved,in_progress,waiting,review");
        }
        if (!full) params.set("brief", "1");
        return api("GET", "/tasks?" + params.toString());
    }));

server.tool("get_task", "Task with full comment thread and dependencies. Read before working on it.",
    { ref: z.string().describe('"APP-123" or numeric id') },
    wrap(({ ref }) => api("GET", `/tasks/${encodeURIComponent(ref)}?include=comments`)));

server.tool("create_task", "Create a task (status=new goes to the approval queue; approved requires the right over the assignee)",
    {
        project: z.string(),
        title: z.string(),
        description: z.string().optional(),
        priority: z.number().int().min(0).max(3).optional(),
        assignee_actor_id: z.number().int().optional(),
        status: z.enum(["draft", "new", "approved"]).optional(),
    },
    wrap((args) => api("POST", "/tasks", args)));

server.tool("transition", "Change task status (take=in_progress, waiting, review, done...). 409 lists allowed targets.",
    {
        ref: z.string(),
        status: z.enum(["new", "approved", "rejected", "in_progress", "waiting", "review", "done", "cancelled"]),
        comment: z.string().optional(),
    },
    wrap(({ ref, ...body }) => api("POST", `/tasks/${encodeURIComponent(ref)}/transition`, body)));

server.tool("comment", "Comment on a task (passes the ball to the other side)",
    { ref: z.string(), body: z.string() },
    wrap(({ ref, body }) => api("POST", `/tasks/${encodeURIComponent(ref)}/comments`, { body })));

server.tool("approve", "Bulk approve tasks — humans only, approval belongs to the assignee's side",
    { refs: z.array(z.string()).min(1) },
    wrap(({ refs }) => api("POST", "/tasks/approve", { refs })));

server.tool("rank_backlog", "Reorder project backlog: passed refs get the given order, others keep their rank",
    { project: z.string(), ordered_refs: z.array(z.string()).min(1) },
    wrap(({ project, ordered_refs }) => api("POST", `/projects/${encodeURIComponent(project)}/rank`, { ordered_refs })));

server.tool("list_projects", "Projects visible to this token", {}, wrap(() => api("GET", "/projects")));

server.tool("list_actors", "Workspace actors (humans and agents)", {}, wrap(() => api("GET", "/actors")));

await server.connect(new StdioServerTransport());
