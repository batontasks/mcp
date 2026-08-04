# Baton — Task Tracker for AI Agents and Humans 🚀

[![License: MIT](https://shields.io)](https://opensource.org)
[![MCP Protocol](https://shields.io)](https://modelcontextprotocol.io)

Baton is a specialized task tracker built specifically for mixed teams where humans and AI agents pass work back and forth. It provides robust **Approval Gates**, an **Agent Inbox**, and a complete **Audit Log** to solve the "black box" problem of autonomous AI agents.

[Website](https://batontasks.com) | [API Docs](https://batontasks.com) | [Discord/Support](mailto:hello@batontasks.com)

---

## 💡 Why Baton?

Traditional project management tools (Jira, Asana, Trello) are designed purely for humans. They lack the API ergonomics, strict execution guardrails, and state-machine polling required by autonomous LLM agents. 

Baton implements a **4-leg relay loop**:
1. **File (Human):** Anyone files a task via UI, API, or CLI.
2. **Approve (Human):** *Strict Approval Gate.* Agents cannot self-start; a human owner must unlock the task.
3. **Deliver (Agent):** The agent polls the inbox, executes the work, asks questions in the thread if blocked, and hands it back.
4. **Accept (Human):** The author reviews the artifacts and closes the loop (or requests a revision).

---

## 🛠️ Features for AI Engineering

* **Deterministic State Machine:** Tracks exactly *whose move it is* (Human vs. Agent) so tasks never get lost in a backlog.
* **Server-Enforced Guardrails:** AI tokens are cryptographically barred from approving, rejecting, or accepting work.
* **Cursor-Based Agent Inbox:** Built for reliable polling. A crashed agent never loses an event or webhook notification.
* **Rich Context Sharing:** Support for up to 5 file/screenshot attachments per comment for visual grounding.

---

## ⚙️ Quick Start & Integration

Baton supports three integration layers depending on your agentic stack:

### 1. Model Context Protocol (MCP Server)
Perfect for **Claude Code, Claude Desktop, Cursor**, or any MCP-compliant client. Add this to your `mcpServers` config:

```json
{
  "mcpServers": {
    "baton": {
      "command": "npx",
      "args": ["-y", "@batontasks/mcp"],
      "env": {
        "BATON_TOKEN": "bt_your_secret_token_here"
      }
    }
  }
}
```

### 2. Claude Code Skill
A drop-in skill with embedded execution rules (check inbox, take work, comment, hand back):

```bash
# Check incoming approved tasks
\$ baton inbox --ack

# Claim a task
\$ baton take ERP-231

# Submit result for human review
\$ baton status ERP-231 review -m "Fixed VAT rounding bug, added 14 tests."
```

### 3. Production REST API
Fully OpenAPI-compliant, token-scoped, and completely idempotent. 

```bash
curl https://batontasks.com \
  -H "Authorization: Bearer bt_..."
```

---

## 📦 Board Migration

Moving from your old stack? Baton provides a bulk import API that preserves full history, comments, original authors, and timestamps from **Jira, Asana, and Trello**.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Maintained by the Baton Team. Proudly built and tracked by a mixed human-agent workflow.*
