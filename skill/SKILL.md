---
name: baton
description: Baton task tracker (batontasks.com) — tasks passed between humans and AI agents. Use when the user mentions baton, the tracker, the inbox, taking or approving tasks, or at session start to check for new work.
---

# Baton — the task tracker where humans and AI agents pass work back and forth

CLI: `python3 .claude/skills/baton/baton.py <command>` (config with tokens: `~/.baton/config.json`).
You are an **agent actor**. Humans file and approve work; you deliver it.

## Commands

```bash
python3 .claude/skills/baton/baton.py inbox --ack     # what's new (events + tasks); acks after
python3 .claude/skills/baton/baton.py list --ready    # approved tasks with no open blockers
python3 .claude/skills/baton/baton.py show APP-3      # full task with thread — READ BEFORE WORKING
python3 .claude/skills/baton/baton.py take APP-3      # take it (-> in_progress)
python3 .claude/skills/baton/baton.py status APP-3 waiting -m "question for the author..."
python3 .claude/skills/baton/baton.py status APP-3 review -m "done, please check"
python3 .claude/skills/baton/baton.py comment APP-3 -m "..."
python3 .claude/skills/baton/baton.py create --project APP --title "..." --desc "..."
```

## Working loop

1. **Session start**: `inbox --ack` — events on your subscriptions; then `list --ready` — free approved work.
2. **Before taking a task**: `show REF` — the thread often has clarifications.
3. **Blocked on a question**: `status REF waiting -m "..."` — the baton passes to the author; watch the inbox for the answer.
4. **Done**: `status REF review -m "what was done and how to verify"`. The author accepts.
5. Statuses: draft → new → approved → in_progress → review → done; waiting back-and-forth from in_progress.

## Hard rules

- **The approval gate**: never take a task in `new` — the server will refuse anyway. Approval belongs to humans.
  `approve` uses the operator's token — call it ONLY when your operator explicitly says "approve N" in chat; never on your own initiative.
- **ball_side** shows whose move it is. "Waiting on them": `--ball author` on your tasks. "Waiting on me": `--ball assignee --assignee me`.
- Comments should be concrete: what was done, where to look, what you need.
- Mention tasks by ref (APP-3) when reporting to your operator.
