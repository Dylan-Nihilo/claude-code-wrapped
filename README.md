# Claude Code Wrapped 2025

Generate your Claude Code year-in-review wrapped report - similar to Spotify Wrapped!

生成你的 Claude Code 年度回顾报告 - 类似 Spotify Wrapped！

## Usage / 使用方法

```bash
npx claude-code-wrapped

# Chinese / 中文
npx claude-code-wrapped --lang zh

# English
npx claude-code-wrapped --lang en
```

## Features / 功能特性

- TUI output in terminal with beautiful ASCII art / 终端 TUI 输出，精美 ASCII 艺术字
- HTML report with CRT/retro terminal aesthetic / HTML 报告，CRT 复古终端风格
- PNG export capability / PNG 导出功能
- Cross-platform support (macOS, Windows, Linux) / 跨平台支持
- Bilingual support (English/Chinese) / 双语支持（中英文）

## Statistics Tracked / 统计维度

- Total sessions and messages / 总会话数和消息数
- Active days and usage streaks / 活跃天数和连续使用记录
- Token consumption by model / 各模型 Token 消耗
- Hourly activity distribution / 每小时活动分布
- Project usage breakdown / 项目使用分析
- Longest session records / 最长会话记录
- Achievement badges / 成就徽章

## Options / 选项

```bash
npx claude-code-wrapped --help

Options:
  --no-tui           Skip TUI output in terminal
  --no-html          Skip opening HTML report in browser
  --export-png       Export report as PNG image
  --json             Output stats as JSON
  -l, --lang <lang>  Language: en (English) or zh (Chinese)
```

## Requirements / 环境要求

- Node.js 18+
- Claude Code installed and used at least once

## License / 许可证

MIT
