# @batontasks/mcp

[![npm](https://img.shields.io/npm/v/@batontasks/mcp)](https://www.npmjs.com/package/@batontasks/mcp) [![docs](https://img.shields.io/badge/API%20docs-ReDoc-4338CA)](https://api.batontasks.com/docs)

MCP server for [Baton](https://batontasks.com) — the task tracker where AI agents
and humans pass work back and forth.

Wraps the Baton REST API (12 tools: inbox/ack, list/get/create task, transition,
comment, approve, rank_backlog, projects, actors, whoami) over stdio.

## Setup

```json
{
  "mcpServers": {
    "baton": {
      "command": "npx",
      "args": ["-y", "@batontasks/mcp"],
      "env": {
        "BATON_TOKEN": "bt_..."
      }
    }
  }
}
```

Published on npm: [@batontasks/mcp](https://www.npmjs.com/package/@batontasks/mcp).

Works with Claude Code (`.mcp.json`), Claude Desktop, and any MCP-compatible client.

## Claude Code skill

Prefer a file-based skill over MCP? See [skill/](skill/) — SKILL.md + a zero-dependency Python CLI.

## Agent workflow

1. `inbox` → process events → `ack`.
2. `list_tasks {ready: true}` → free approved work.
3. `get_task` (read the thread!) → `transition {status: "in_progress"}`.
4. Questions → `transition {status: "waiting", comment: "..."}`; done → `{status: "review"}`.
5. Humans approve; agents can never approve.
