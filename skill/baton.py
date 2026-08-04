#!/usr/bin/env python3
"""Baton CLI for AI agents (Claude Code and friends) — batontasks.com

Config: ~/.baton/config.json
  {"api": "https://api.batontasks.com/v1",
   "token": "bt_...",            # the agent's own token
   "operator_token": "bt_..."}   # optional: the operator's token — used ONLY for
                                 # approve, and ONLY on the operator's explicit command

Every command prints compact JSON.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

CONFIG_PATH = os.path.expanduser("~/.baton/config.json")


def config():
    with open(CONFIG_PATH) as f:
        return json.load(f)


def call(method, path, body=None, as_operator=False, params=None):
    cfg = config()
    op = cfg.get("operator_token") or cfg.get("sergei_token")  # sergei_token — legacy alias
    token = op if as_operator and op else cfg["token"]
    url = cfg["api"] + path
    if params:
        url += "?" + urllib.parse.urlencode({k: v for k, v in params.items() if v})
    req = urllib.request.Request(url, method=method)
    req.add_header("Authorization", "Bearer " + token)
    data = None
    if body is not None:
        req.add_header("Content-Type", "application/json")
        data = json.dumps(body).encode()
    try:
        with urllib.request.urlopen(req, data, timeout=20) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        err = json.load(e)
        print(json.dumps({"http": e.code, **err}, ensure_ascii=False))
        sys.exit(1)


def out(data):
    print(json.dumps(data, ensure_ascii=False, indent=1))


def main():
    p = argparse.ArgumentParser(prog="baton.py")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("inbox", help="what happened since my cursor").add_argument(
        "--ack", action="store_true", help="acknowledge right away")
    a = sub.add_parser("ack"); a.add_argument("cursor", type=int)

    ls = sub.add_parser("list", help="list tasks")
    for flag in ("--project", "--status", "--ball", "--assignee", "--author", "--q", "--sort"):
        ls.add_argument(flag)
    ls.add_argument("--ready", action="store_true", help="approved tasks with no open blockers")

    sh = sub.add_parser("show", help="task with its full thread"); sh.add_argument("ref")

    cr = sub.add_parser("create")
    cr.add_argument("--project", required=True)
    cr.add_argument("--title", required=True)
    cr.add_argument("--desc")
    cr.add_argument("--priority", type=int, default=2)
    cr.add_argument("--assignee", type=int, help="actor id")

    tk = sub.add_parser("take", help="take a task (-> in_progress)"); tk.add_argument("ref")

    st = sub.add_parser("status", help="change status")
    st.add_argument("ref"); st.add_argument("to")
    st.add_argument("-m", "--message", help="comment posted with the transition")

    cm = sub.add_parser("comment"); cm.add_argument("ref")
    cm.add_argument("-m", "--message", required=True)

    ap = sub.add_parser("approve", help="approve (operator token; ONLY on their explicit command)")
    ap.add_argument("refs", nargs="+")

    rk = sub.add_parser("rank", help="reorder the backlog")
    rk.add_argument("project"); rk.add_argument("refs", nargs="+")

    sub.add_parser("projects")
    sub.add_parser("actors")
    sub.add_parser("me")

    args = p.parse_args()

    if args.cmd == "inbox":
        data = call("GET", "/inbox")
        out(data)
        if args.ack and data.get("events"):
            call("POST", "/inbox/ack", {"cursor": data["cursor"]})
            print(json.dumps({"acked": data["cursor"]}))
    elif args.cmd == "ack":
        out(call("POST", "/inbox/ack", {"cursor": args.cursor}))
    elif args.cmd == "list":
        params = {"project": args.project, "status": args.status, "ball": args.ball,
                  "assignee": args.assignee, "author": args.author, "q": args.q,
                  "sort": args.sort, "ready": "1" if args.ready else None}
        out(call("GET", "/tasks", params=params))
    elif args.cmd == "show":
        out(call("GET", f"/tasks/{args.ref}", params={"include": "comments"}))
    elif args.cmd == "create":
        body = {"project": args.project, "title": args.title, "priority": args.priority}
        if args.desc:
            body["description"] = args.desc
        if args.assignee:
            body["assignee_actor_id"] = args.assignee
        out(call("POST", "/tasks", body))
    elif args.cmd == "take":
        out(call("POST", f"/tasks/{args.ref}/transition", {"status": "in_progress"}))
    elif args.cmd == "status":
        body = {"status": args.to}
        if args.message:
            body["comment"] = args.message
        out(call("POST", f"/tasks/{args.ref}/transition", body))
    elif args.cmd == "comment":
        out(call("POST", f"/tasks/{args.ref}/comments", {"body": args.message}))
    elif args.cmd == "approve":
        out(call("POST", "/tasks/approve", {"refs": args.refs}, as_operator=True))
    elif args.cmd == "rank":
        out(call("POST", f"/projects/{args.project}/rank", {"ordered_refs": args.refs}))
    elif args.cmd == "projects":
        out(call("GET", "/projects"))
    elif args.cmd == "actors":
        out(call("GET", "/actors"))
    elif args.cmd == "me":
        out(call("GET", "/me"))


if __name__ == "__main__":
    main()
