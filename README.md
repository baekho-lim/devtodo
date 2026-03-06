# devtodo

Cross-repo TODO manager for developers. Stores todos in `~/.devtodo/GLOBAL_TODO.md` (plain markdown). Works as a CLI and as an MCP server for Claude Desktop.

## Install

```bash
npm install -g devtodo
# or use without installing:
npx devtodo <command>
```

## Usage

```bash
# Initialize (creates ~/.devtodo/GLOBAL_TODO.md)
devtodo init

# Add a TODO
devtodo add "Implement auth" --repo my-app --priority high

# List active TODOs
devtodo list
devtodo list --repo my-app
devtodo list --status BLOCKED
devtodo list --priority high

# Mark as done (moves to Archive section)
devtodo done 001
```

### Priority values

| Flag | Meaning |
|------|---------|
| `high` / `h` | 🔴 긴급 |
| `medium` / `med` / `m` | 🟡 중요 |
| `low` / `l` | 🟢 일반 |

### Status values

`TODO` (default), `IN_PROGRESS` / `WIP`, `BLOCKED`, `PLANNING`

## MCP Server (Claude Desktop)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "devtodo": {
      "command": "npx",
      "args": ["devtodo", "--mcp"]
    }
  }
}
```

Available MCP tools: `devtodo_init`, `devtodo_add`, `devtodo_list`, `devtodo_done`

## File format

```markdown
# Global TODO

## Active

### [TODO] my-repo | 2026-03-06 | 🔴 긴급

- [ ] <id:001> Implement auth

## Archive

- [x] <id:000> Setup project
```

## Part of BHNote

devtodo is Phase 1 of [BHNote](https://github.com/baekho-lim) — an AI-native knowledge management tool for developers.

## License

MIT
