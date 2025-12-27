```
╔═╗╦  ╔═╗╦ ╦╔╦╗╔═╗  ╔═╗╔═╗╔╦╗╔═╗  ╦ ╦╦═╗╔═╗╔═╗╔═╗╔═╗╔╦╗
║  ║  ╠═╣║ ║ ║║║╣   ║  ║ ║ ║║║╣   ║║║╠╦╝╠═╣╠═╝╠═╝║╣  ║║
╚═╝╩═╝╩ ╩╚═╝═╩╝╚═╝  ╚═╝╚═╝═╩╝╚═╝  ╚╩╝╩╚═╩ ╩╩  ╩  ╚═╝═╩╝
```

<p align="center">
  <i>Your year with Claude Code, beautifully visualized.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18-green.svg" alt="Node">
</p>

---

## ┌─ Preview ─┐

> Generate a beautiful dashboard showing your Claude Code usage statistics for 2025.

**Dashboard**

![Dashboard](https://raw.githubusercontent.com/Dylan-Nihilo/claude-code-wrapped/main/assets/dashboard.png)

**CLI**

![CLI](https://raw.githubusercontent.com/Dylan-Nihilo/claude-code-wrapped/main/assets/cli.png)

## ┌─ Quick Start ─┐

```bash
# Run directly with npx
npx claude-code-wrapped

# Or install globally
npm install -g claude-code-wrapped
claude-code-wrapped
```

## ┌─ Features ─┐

```
┌────────────────────────────────────────────────────────────┐
│  ★ Beautiful Dashboard    Modern HTML report + PNG export  │
│  ★ Terminal TUI           ASCII art in your terminal       │
│  ★ Cost Estimation        API pricing calculation          │
│  ★ Multi-language         English & Chinese support        │
│  ★ Cross-platform         macOS / Windows / Linux          │
└────────────────────────────────────────────────────────────┘
```

## ┌─ Usage ─┐

```bash
# Default (English, opens HTML report)
claude-code-wrapped

# Chinese interface
claude-code-wrapped --lang zh

# Terminal only, no HTML
claude-code-wrapped --no-html

# Show help
claude-code-wrapped --help
```

## ┌─ What's Tracked ─┐

```
┌──────────────┬─────────────────────────────────┐
│ Metric       │ Description                     │
├──────────────┼─────────────────────────────────┤
│ Sessions     │ Total coding sessions           │
│ Messages     │ Messages exchanged with Claude  │
│ Tokens       │ Total token consumption         │
│ Models       │ Usage breakdown by model        │
│ Projects     │ Your most active projects       │
│ Time         │ Hourly and weekly patterns      │
│ Cost         │ Estimated API cost              │
└──────────────┴─────────────────────────────────┘
```

## ┌─ Requirements ─┐

- Node.js 18+
- Claude Code installed and used

---

<p align="center">
  <sub>MIT © Dylan</sub>
</p>
