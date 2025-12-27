// HTML report generator - Light TUI style
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { WrappedStats } from './types.js';
import { formatNumber, formatDuration } from './analyzer.js';
import { t, getLanguage } from './i18n.js';

/**
 * Format cost with appropriate precision
 */
function formatCost(cost: number): string {
  if (cost >= 10000) {
    return (cost / 1000).toFixed(1) + 'K';
  }
  if (cost >= 1000) {
    return cost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  if (cost >= 100) {
    return cost.toFixed(0);
  }
  if (cost >= 10) {
    return cost.toFixed(1);
  }
  return cost.toFixed(2);
}

export async function generateHTML(stats: WrappedStats): Promise<string> {
  const html = buildHTML(stats);
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, `claude-code-wrapped-${Date.now()}.html`);
  await fs.promises.writeFile(filePath, html, 'utf-8');
  return filePath;
}

function buildHTML(stats: WrappedStats): string {
  const lang = getLanguage();
  const peakMessages = Math.max(...stats.dailyActivity.map((d) => d.messageCount));
  const tokensFormatted = formatNumber(stats.totalTokens);
  const longestDuration = stats.longestSession ? formatDuration(stats.longestSession.duration) : '0h';

  const hourlyHTML = buildHourlyDistribution(stats);
  const projectsHTML = buildProjectsHTML(stats);
  const modelUsageHTML = buildModelUsage(stats);
  const weeklyHTML = buildWeeklyPattern(stats);
  const today = new Date().toISOString().split('T')[0];

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Wrapped 2025</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --cream: #FAF9F7;
            --warm-gray: #F5F4F2;
            --border: #E8E6E3;
            --text-primary: #1A1915;
            --text-secondary: #6B6966;
            --text-muted: #9C9A97;
            --coral: #D97757;
            --coral-light: #F5E6E0;
            --coral-soft: rgba(217, 119, 87, 0.1);
            --sage: #5B8A72;
            --sage-light: #E8F0EC;
            --amber: #C4963A;
            --amber-light: #FBF5E8;
            --purple: #8B7EC8;
            --purple-light: #F0EDF8;
        }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; min-height: 100vh; }
        body {
            background-color: var(--cream);
            color: var(--text-primary);
            font-family: 'JetBrains Mono', monospace;
            line-height: 1.4;
            display: flex;
            flex-direction: column;
        }
        .landing-header {
            width: 100%;
            padding: 20px 48px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
        }
        .landing-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
        }
        .landing-logo-icon {
            width: 32px;
            height: 32px;
            background: var(--coral);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .landing-nav {
            display: flex;
            gap: 32px;
        }
        .landing-nav a, .github-link {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 13px;
            transition: color 0.2s;
        }
        .landing-nav a:hover, .github-link:hover { color: var(--coral); }
        .github-link svg { width: 16px; height: 16px; }
        .page-wrapper {
            flex: 1;
            padding: 60px 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        .dashboard {
            width: 100%;
            max-width: 1360px;
            padding: 32px 40px;
            background: white;
            display: flex;
            flex-direction: column;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
            gap: 16px;
            position: relative;
            z-index: 10;
        }
        /* Flowing background animation */
        .bg-animation {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            pointer-events: none;
        }
        .floating-shape {
            position: absolute;
            border-radius: 50%;
            opacity: 0.15;
            animation: float 20s ease-in-out infinite;
        }
        .shape-1 {
            width: 300px;
            height: 300px;
            background: linear-gradient(135deg, var(--coral), var(--amber));
            top: 10%;
            left: -5%;
            animation-delay: 0s;
        }
        .shape-2 {
            width: 200px;
            height: 200px;
            background: linear-gradient(135deg, var(--sage), var(--purple));
            top: 60%;
            right: -3%;
            animation-delay: -5s;
        }
        .shape-3 {
            width: 150px;
            height: 150px;
            background: linear-gradient(135deg, var(--purple), var(--coral));
            bottom: 20%;
            left: 10%;
            animation-delay: -10s;
        }
        .shape-4 {
            width: 250px;
            height: 250px;
            background: linear-gradient(135deg, var(--amber), var(--sage));
            top: 5%;
            right: 15%;
            animation-delay: -15s;
        }
        @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
            25% { transform: translate(30px, -30px) rotate(5deg) scale(1.05); }
            50% { transform: translate(-20px, 20px) rotate(-5deg) scale(0.95); }
            75% { transform: translate(20px, 10px) rotate(3deg) scale(1.02); }
        }
        .pixel-text {
            font-family: 'JetBrains Mono', monospace;
            font-size: 42px;
            font-weight: 900;
            color: var(--coral);
            letter-spacing: 4px;
            text-shadow:
                3px 0 0 var(--coral),
                -3px 0 0 var(--coral),
                0 3px 0 var(--coral),
                0 -3px 0 var(--coral),
                2px 2px 0 rgba(217, 119, 87, 0.3),
                4px 4px 0 rgba(217, 119, 87, 0.15);
        }
        .pixel-text-sm {
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            font-weight: 700;
            color: var(--coral);
            letter-spacing: 3px;
            text-shadow:
                1px 0 0 var(--coral),
                -1px 0 0 var(--coral),
                0 1px 0 var(--coral),
                0 -1px 0 var(--coral);
        }
        .landing-footer {
            padding: 32px 48px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid var(--border);
            background: var(--cream);
        }
        .landing-footer-left { display: flex; align-items: center; gap: 24px; }
        .landing-footer-links { display: flex; gap: 24px; }
        .landing-footer-links a {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 12px;
            transition: color 0.2s;
        }
        .landing-footer-links a:hover { color: var(--coral); }
        .landing-footer-copy { color: var(--text-muted); font-size: 11px; }
        .tui-box {
            border: 1px solid var(--border);
            background: white;
            position: relative;
            border-radius: 4px;
            padding: 24px;
        }
        .tui-box::before {
            content: attr(data-title);
            position: absolute;
            top: -9px;
            left: 12px;
            background: white;
            padding: 0 8px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .stat-card {
            background: var(--warm-gray);
            border-radius: 8px;
            padding: 24px;
            text-align: center;
        }
        .stat-label {
            font-size: 11px;
            color: var(--text-muted);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
        }
        .stat-value { font-size: 2.25rem; font-weight: 700; }
        .progress-track { display: flex; gap: 4px; }
        .progress-segment { width: 14px; height: 24px; border-radius: 3px; }
        .segment-filled { background: var(--coral); }
        .segment-empty { background: var(--border); }
        .tag {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .tag-coral { background: var(--coral-light); color: var(--coral); }
        .tag-sage { background: var(--sage-light); color: var(--sage); }
        .tag-amber { background: var(--amber-light); color: var(--amber); }
        .tag-purple { background: var(--purple-light); color: var(--purple); }
        .activity-bar {
            height: 100%;
            background: var(--coral);
            border-radius: 3px;
            min-width: 4px;
        }
        .project-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            border-radius: 6px;
        }
        .project-item:hover { background: var(--warm-gray); }
        .project-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .corner-box { position: relative; padding: 20px; }
        .corner-box::before, .corner-box::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            border-color: var(--border);
            border-style: solid;
        }
        .corner-box::before { top: 0; left: 0; border-width: 2px 0 0 2px; }
        .corner-box::after { bottom: 0; right: 0; border-width: 0 2px 2px 0; }
        .cursor {
            display: inline-block;
            width: 10px;
            height: 18px;
            background: var(--coral);
            animation: blink 1s step-end infinite;
            margin-left: 4px;
            vertical-align: middle;
        }
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
        .pixel-logo { display: flex; flex-direction: column; }
        .pixel-char {
            display: grid;
            grid-template-columns: repeat(4, 8px);
            grid-template-rows: repeat(5, 8px);
            gap: 2px;
        }
        .pr {
            background: var(--coral);
            border-radius: 1px;
            box-shadow: inset -1px -1px 0 rgba(0,0,0,0.2), inset 1px 1px 0 rgba(255,255,255,0.3);
        }
        .pe { background: transparent; }
        .export-btn {
            padding: 10px 20px;
            background: var(--coral);
            color: white;
            border: none;
            border-radius: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        .export-btn:hover {
            background: #c56a4d;
            transform: translateY(-1px);
        }
        .export-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <!-- Landing Header -->
    <header class="landing-header">
        <div class="landing-logo">
            <pre style="font-size: 10px; line-height: 1.1; color: var(--coral); margin: 0; font-weight: bold;">
 ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗     ██████╗ ██████╗ ██████╗ ███████╗    ██╗    ██╗██████╗  █████╗ ██████╗ ██████╗ ███████╗██████╗
██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝    ██╔════╝██╔═══██╗██╔══██╗██╔════╝    ██║    ██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗
██║     ██║     ███████║██║   ██║██║  ██║█████╗      ██║     ██║   ██║██║  ██║█████╗      ██║ █╗ ██║██████╔╝███████║██████╔╝██████╔╝█████╗  ██║  ██║
██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝      ██║     ██║   ██║██║  ██║██╔══╝      ██║███╗██║██╔══██╗██╔══██║██╔═══╝ ██╔═══╝ ██╔══╝  ██║  ██║
╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗    ╚██████╗╚██████╔╝██████╔╝███████╗    ╚███╔███╔╝██║  ██║██║  ██║██║     ██║     ███████╗██████╔╝
 ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝     ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝     ╚══════╝╚═════╝</pre>
        </div>
        <nav class="landing-nav">
            <a href="https://github.com/anthropics/claude-code" target="_blank" class="github-link">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                anthropics/claude-code
            </a>
            <a href="https://github.com/anthropics/claude-code" target="_blank" class="github-link">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                claude-code-wrapped
            </a>
            <button class="export-btn" onclick="exportImage()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export PNG
            </button>
        </nav>
    </header>

    <div class="page-wrapper">
    <!-- Floating background shapes -->
    <div class="bg-animation">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
        <div class="floating-shape shape-4"></div>
    </div>
    <div class="dashboard">
        <!-- Header Row -->
        <header class="flex justify-between items-start mb-4">
            <div>
                <pre style="font-size: 20px; line-height: 1.2; color: var(--coral); margin: 0; font-weight: bold;">
╔═╗╦  ╔═╗╦ ╦╔╦╗╔═╗  ╔═╗╔═╗╔╦╗╔═╗
║  ║  ╠═╣║ ║ ║║║╣   ║  ║ ║ ║║║╣
╚═╝╩═╝╩ ╩╚═╝═╩╝╚═╝  ╚═╝╚═╝═╩╝╚═╝</pre>
                <p class="text-sm font-semibold tracking-wider mt-2" style="color: var(--text-muted)">WRAPPED 2025</p>
            </div>
            <div class="flex items-center gap-3">
                <span class="tag tag-coral">${today}</span>
                <span class="tag tag-sage">${stats.userLevel}</span>
            </div>
        </header>

        <!-- Overview Stats -->
        <div class="tui-box" data-title="Overview">
            <div class="grid grid-cols-6 gap-5">
                <div class="stat-card">
                    <div class="stat-label">Total Sessions</div>
                    <div class="stat-value" style="color: var(--coral)">${stats.totalSessions.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Active Days</div>
                    <div class="stat-value" style="color: var(--sage)">${stats.activeDays}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Peak Messages</div>
                    <div class="stat-value" style="color: var(--amber)">${peakMessages.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Tool Calls</div>
                    <div class="stat-value" style="color: var(--purple)">${stats.totalToolCalls.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Tokens</div>
                    <div class="stat-value" style="color: var(--coral)">${tokensFormatted}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Projects</div>
                    <div class="stat-value" style="color: var(--sage)">${stats.topProjects.length}</div>
                </div>
            </div>
        </div>

        <!-- Row 2: Impact + Activity -->
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-5 tui-box" data-title="Impact">
                <div class="corner-box h-full flex flex-col justify-center">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="tag tag-coral">${stats.userTitle}</span>
                        <span class="tag tag-sage">${stats.userLevel}</span>
                    </div>
                    <div class="text-7xl font-bold mb-2" style="color: var(--text-primary)">${stats.totalMessages.toLocaleString()}</div>
                    <div class="text-base" style="color: var(--text-secondary)">Total messages exchanged with Claude</div>
                </div>
            </div>

            <div class="col-span-4 tui-box" data-title="Hourly Activity">
                <div class="space-y-2 h-full flex flex-col justify-center">
                    ${hourlyHTML}
                </div>
            </div>

            <div class="col-span-3 tui-box" data-title="Weekly Pattern">
                <div class="flex items-end gap-3 h-full">
                    ${weeklyHTML}
                </div>
            </div>
        </div>

        <!-- Row 3: Projects + Model + Tools -->
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-3 tui-box" data-title="Projects">
                <div class="space-y-2 h-full flex flex-col justify-center">
                    ${projectsHTML}
                </div>
            </div>

            <div class="col-span-3 tui-box" data-title="Model Usage">
                <div class="space-y-3 h-full flex flex-col justify-center">
                    <div class="flex items-center justify-between text-base">
                        <span style="color: var(--text-muted)">Primary</span>
                        <span class="font-semibold">${stats.primaryModel}</span>
                    </div>
                    ${modelUsageHTML}
                </div>
            </div>

            <div class="col-span-2 tui-box flex flex-col" data-title="Top Tools">
                <div class="space-y-3 flex-1 flex flex-col justify-center">
                    <div class="flex items-center justify-between">
                        <span class="text-sm">Read</span>
                        <span class="tag tag-coral">32%</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm">Edit</span>
                        <span class="tag tag-sage">28%</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm">Bash</span>
                        <span class="tag tag-amber">18%</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm">Grep</span>
                        <span class="tag tag-purple">12%</span>
                    </div>
                </div>
            </div>

            <div class="col-span-2 tui-box flex flex-col" data-title="Cost Estimate">
                <div class="space-y-3 flex-1 flex flex-col justify-center">
                    <div>
                        <span class="text-2xl font-bold" style="color: var(--coral)">$${formatCost(stats.estimatedCost)}</span>
                        <span class="text-xs ml-1" style="color: var(--text-muted)">USD</span>
                    </div>
                    <div class="pt-2 border-t text-xs" style="border-color: var(--border); color: var(--text-muted)">
                        Based on API pricing
                    </div>
                </div>
            </div>

            <div class="col-span-2 tui-box flex flex-col" data-title="Achievements">
                <div class="space-y-3 flex-1 flex flex-col justify-center">
                    <div class="flex items-center gap-2">
                        <span style="color: var(--amber)">★</span>
                        <span class="text-sm">Marathon ${longestDuration}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span style="color: var(--amber)">★</span>
                        <span class="text-sm">${stats.userTitle}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span style="color: var(--amber)">★</span>
                        <span class="text-sm">${stats.userLevel}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="flex justify-between items-center mt-6 text-xs" style="color: var(--text-muted)">
            <div class="flex items-center gap-2">
                <span style="color: var(--coral)">$</span>
                <span>claude-code --wrapped 2025</span>
                <span class="cursor"></span>
            </div>
            <div class="flex items-center gap-2">
                <span>claude code wrapped by</span>
                <span style="color: var(--coral); font-weight: bold; letter-spacing: 2px;">▓█▀▄ █▄█ █   █▀█ █▄ █</span>
            </div>
        </footer>
    </div>
    </div>

    <!-- Landing Footer -->
    <footer class="landing-footer">
        <div class="landing-footer-left">
            <span class="landing-footer-copy">Made with Claude Code</span>
            <div class="landing-footer-links">
                <a href="https://github.com/anthropics/claude-code" target="_blank">GitHub</a>
                <a href="https://anthropic.com" target="_blank">Anthropic</a>
            </div>
        </div>
        <span class="landing-footer-copy">2025 Claude Code Wrapped</span>
    </footer>

    <script>
    async function exportImage() {
        const btn = document.querySelector('.export-btn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Exporting...';

        try {
            btn.style.display = 'none';
            const dashboard = document.querySelector('.dashboard');
            const canvas = await html2canvas(dashboard, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#FFFFFF',
                logging: false
            });
            const link = document.createElement('a');
            link.download = 'claude-code-wrapped-2025.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Please try again.');
        } finally {
            btn.style.display = 'flex';
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
    </script>
</body>
</html>`;
}

function buildHourlyDistribution(stats: WrappedStats): string {
  const ranges = [
    { label: '00:00-08:00', hours: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
    { label: '09:00-12:00', hours: [9, 10, 11, 12] },
    { label: '13:00-18:00', hours: [13, 14, 15, 16, 17, 18] },
    { label: '19:00-23:00', hours: [19, 20, 21, 22, 23] },
  ];

  let maxCount = 0;
  const rangeCounts = ranges.map((r) => {
    const count = r.hours.reduce((sum, h) => sum + (stats.hourlyDistribution[h] || 0), 0);
    maxCount = Math.max(maxCount, count);
    return { ...r, count };
  });

  const peakRange = rangeCounts.reduce((max, r) => r.count > max.count ? r : max);

  return rangeCounts.map((range) => {
    const isPeak = range === peakRange;
    const ratio = maxCount > 0 ? range.count / maxCount : 0;
    const width = Math.round(ratio * 100);

    const labelStyle = isPeak ? 'color: var(--coral); font-weight: 600;' : 'color: var(--text-muted);';
    const countStyle = isPeak ? 'color: var(--coral); font-weight: 600;' : 'color: var(--text-muted);';

    return `<div class="flex items-center gap-3">
      <span class="w-28 text-xs" style="${labelStyle}">${range.label}</span>
      <div class="flex-1 h-6 rounded overflow-hidden" style="background: var(--warm-gray)">
        <div class="activity-bar" style="width: ${width}%"></div>
      </div>
      <span class="w-12 text-right text-xs" style="${countStyle}">${range.count}</span>
    </div>`;
  }).join('\n');
}

function buildProjectsHTML(stats: WrappedStats): string {
  const projects = stats.topProjects.slice(0, 4);
  const colors = ['var(--coral)', 'var(--sage)', 'var(--amber)', 'var(--purple)'];

  return projects.map((p, idx) => {
    const isFirst = idx === 0;
    const bgStyle = isFirst ? 'background: var(--coral-soft);' : '';

    return `<div class="project-item" style="${bgStyle}">
      <div class="flex items-center">
        <div class="project-dot" style="background: ${colors[idx]}"></div>
        <span class="text-sm${isFirst ? ' font-medium' : ''}">${p.name}</span>
      </div>
      ${isFirst ? '<span class="text-xs" style="color: var(--text-muted)">★</span>' : ''}
    </div>`;
  }).join('\n');
}

function buildModelUsage(stats: WrappedStats): string {
  const total = Object.values(stats.tokensByModel).reduce((s, t) => s + t, 0);
  const models = Object.entries(stats.tokensByModel)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const colors = ['var(--coral)', 'var(--sage)', 'var(--amber)'];

  return `<div class="space-y-2">
    ${models.map(([name, tokens], idx) => {
      const ratio = total > 0 ? tokens / total : 0;
      const percent = Math.round(ratio * 100);
      const shortName = name.replace('Claude ', '').replace(' 4.5', '');
      return `<div class="flex items-center gap-2">
        <span class="text-xs w-16" style="color: var(--text-muted)">${shortName}</span>
        <div class="flex-1 h-4 rounded overflow-hidden" style="background: var(--warm-gray)">
          <div class="h-full rounded" style="width: ${percent}%; background: ${colors[idx]}"></div>
        </div>
        <span class="text-xs" style="color: var(--text-muted)">${percent}%</span>
      </div>`;
    }).join('\n')}
  </div>`;
}

function buildWeeklyPattern(stats: WrappedStats): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  stats.dailyActivity.forEach((d) => {
    const dayOfWeek = new Date(d.date).getDay();
    const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    dayCounts[idx] += d.messageCount;
  });

  const maxCount = Math.max(...dayCounts);
  const peakIdx = dayCounts.indexOf(maxCount);

  return days.map((day, idx) => {
    const ratio = maxCount > 0 ? dayCounts[idx] / maxCount : 0;
    const height = Math.max(20, Math.round(ratio * 100));
    const isPeak = idx === peakIdx;
    const color = isPeak ? 'var(--coral)' : (idx >= 5 ? 'var(--amber)' : 'var(--sage)');
    const opacity = isPeak ? 1 : (ratio * 0.5 + 0.5);
    const labelStyle = isPeak ? 'color: var(--coral); font-weight: 600;' : 'color: var(--text-muted);';

    return `<div class="flex-1 flex flex-col items-center gap-1 h-full">
      <div class="w-full rounded-t flex-1 flex items-end">
        <div class="w-full rounded-t" style="height: ${height}%; background: ${color}; opacity: ${opacity}"></div>
      </div>
      <span class="text-xs" style="${labelStyle}">${day}</span>
    </div>`;
  }).join('\n');
}
