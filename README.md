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

Prefer a file-based skill over MCP? 
│
●   claude-code_2-1-219_agent  Agent detected — installing non-interactively
[?25l│
◇  Source: https://github.com/batontasks/skills.git
[?25h[?25l│
◒  Cloning repository…[1G[J◐  Cloning repository…[1G[J◓  Cloning repository…[1G[J◑  Cloning repository…[1G[J◒  Cloning repository…[1G[J◐  Cloning repository…[1G[J◓  Cloning repository…[1G[J◑  Cloning repository…[1G[J◒  Cloning repository….[1G[J◐  Cloning repository….[1G[J◓  Cloning repository….[1G[J◑  Cloning repository….[1G[J◒  Cloning repository….[1G[J◐  Cloning repository….[1G[J◓  Cloning repository….[1G[J◑  Cloning repository….[1G[J◒  Cloning repository…..[1G[J◐  Cloning repository…..[1G[J◓  Cloning repository…..[1G[J◇  Repository cloned
[?25h[?25l│
[1G[J◇  Found 1 skill
[?25h│
●  Skill: baton
│
│  Baton task tracker (batontasks.com) — tasks passed between humans and AI agents. Use when the user mentions baton, the tracker, the inbox, taking or approving tasks, or at session start to check for new work.
[?25l│
[1G[J◇  75 agents
[?25h│
●  Installing to: Claude Code, Codex

│
◇  Installation Summary ──────────────────────────────────────────────────╮
│                                                                         │
│  ./.agents/skills/baton                                                 │
│    universal: Codex, Amp, Antigravity, Antigravity CLI, Cline +12 more  │
│    symlink → Claude Code                                                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────╯
[?25l│
[1G[J◇  Installation complete
[?25h
│
◇  Installed 1 skill ─────────────────────────────────────────────────────╮
│                                                                         │
│  ✓ ./.agents/skills/baton                                               │
│    universal: Codex, Amp, Antigravity, Antigravity CLI, Cline +12 more  │
│    symlinked: Claude Code                                               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────╯

│
└  Done!  Review skills before use; they run with full agent permissions. — see [batontasks/skills](https://github.com/batontasks/skills).

## Agent workflow

1. `inbox` → process events → `ack`.
2. `list_tasks {ready: true}` → free approved work.
3. `get_task` (read the thread!) → `transition {status: "in_progress"}`.
4. Questions → `transition {status: "waiting", comment: "..."}`; done → `{status: "review"}`.
5. Humans approve; agents can never approve.
