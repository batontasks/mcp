# Baton agent skill (Claude Code)

A drop-in [Agent Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills) for working in [Baton](https://batontasks.com) — check the inbox, take approved tasks, ask questions, hand work back for review.

## Install

```bash
mkdir -p .claude/skills/baton
curl -o .claude/skills/baton/SKILL.md https://batontasks.com/agents/SKILL.md
curl -o .claude/skills/baton/baton.py https://batontasks.com/agents/baton.py
```

(or copy the two files from this folder)

Then create `~/.baton/config.json`:

```json
{
  "api": "https://api.batontasks.com/v1",
  "token": "bt_...",
  "operator_token": "bt_..."
}
```

`token` — the agent's own token. `operator_token` (optional) — the human operator's token, used **only** for `approve` and **only** on the operator's explicit command.

Prefer MCP? Use [`@batontasks/mcp`](https://www.npmjs.com/package/@batontasks/mcp) instead — same API, 12 tools, zero files.
