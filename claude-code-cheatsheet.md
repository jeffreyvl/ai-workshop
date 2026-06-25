# Claude Code Cheatsheet

## Slash Commands

| Command | Description |
|---|---|
| `/help` | Show help |
| `/clear` | Clear conversation context |
| `/config` | Open settings UI |
| `/cost` | Show token usage for this session |
| `/status` | Show account and model info |
| `/model` | Switch model |
| `/fast` | Toggle fast mode (Opus with faster output) |
| `/review` | Review a GitHub PR |
| `/code-review` | Review current diff (`--fix` to apply, `--comment` for inline PR comments) |
| `/init` | Generate a CLAUDE.md for the repo |
| `/memory` | Open memory files for editing |
| `/doctor` | Check environment health |
| `/logout` | Log out |

## Key Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+C` | Cancel current response |
| `Ctrl+L` | Clear screen |
| `Escape` | Interrupt / go back |
| `Up arrow` | Previous prompt |
| `Shift+Enter` | Newline in prompt |

## CLI Flags

```bash
claude                          # Start interactive session
claude "do X to this file"      # One-shot prompt
claude --model opus             # Set model
claude --verbose                # Show full tool output
claude -p "prompt" --json       # JSON output (non-interactive)
claude --no-tools               # Disable all tools
claude --allowedTools "Read,Edit,Bash"  # Restrict tools
claude --add-dir /path          # Add directory to context
```

## Running Shell Commands

```bash
! git status          # Run shell command inline (output lands in conversation)
```

## CLAUDE.md

A `CLAUDE.md` at the repo root (or `~/.claude/CLAUDE.md` globally) is auto-loaded as context. Use it for:
- Project conventions
- Commands to run tests/build
- Repo structure notes
- What NOT to do

## Permissions & Settings

- **Project settings**: `.claude/settings.json`
- **User settings**: `~/.claude/settings.json`
- **Local overrides**: `.claude/settings.local.json` (gitignored)

```jsonc
{
  "permissions": {
    "allow": ["Bash(npm:*)", "Read"],
    "deny": ["Bash(rm -rf*)"]
  },
  "env": { "NODE_ENV": "development" }
}
```

## Hooks

Hooks run shell commands on events — configured in `settings.json`:

```jsonc
{
  "hooks": {
    "PreToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command", "command": "echo pre-bash" }] }],
    "PostToolUse": [...],
    "Stop": [{ "hooks": [{ "type": "command", "command": "notify-send 'Claude done'" }] }],
    "Notification": [...]
  }
}
```

## MCP Servers

Add MCP servers in `~/.claude/settings.json` or `.claude/settings.json`:

```jsonc
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    }
  }
}
```

Enable with `/mcp` or `--mcp-debug` flag for troubleshooting.

## Memory System

- **Per-project**: `.claude/memory/` — recalled in project sessions
- **Global**: `~/.claude/memory/` — recalled everywhere
- Use `/memory` to edit; Claude auto-writes memories during sessions

## Agents & Workflows

```bash
# Spawn subagents in prompts:
"use a workflow to review all files in src/"
"fan out agents to test each endpoint"

# Skills (slash commands):
/deep-research <topic>
/security-review
/run
/loop 5m /code-review
```

## Useful Patterns

```bash
# Pipe content in
cat error.log | claude "what's wrong here?"

# Non-interactive scripting
claude -p "summarize CHANGELOG.md" --json

# Resume after context compression — just keep chatting, context is auto-managed

# Add a second directory to context
claude --add-dir ../shared-lib
```
