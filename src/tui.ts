// TUI (Terminal User Interface) output module
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import Table from 'cli-table3';
import type { WrappedStats } from './types.js';
import { formatNumber, formatDuration, padNumber } from './analyzer.js';
import { t, getLanguage } from './i18n.js';

// Custom coral gradient
const coralGradient = gradient(['#ff7f50', '#ff6347', '#ff4500']);

// ASCII art banner
const BANNER = `
   ____ _                 _         ____          _
  / ___| | __ _ _   _  __| | ___   / ___|___   __| | ___
 | |   | |/ _\` | | | |/ _\` |/ _ \\ | |   / _ \\ / _\` |/ _ \\
 | |___| | (_| | |_| | (_| |  __/ | |__| (_) | (_| |  __/
  \\____|_|\\__,_|\\__,_|\\__,_|\\___|  \\____\\___/ \\__,_|\\___|
            WRAPPED // EDITION.2025 // SYNC.SUCCESS
`;

/**
 * Print the main TUI output
 */
export function printTUI(stats: WrappedStats): void {
  const i = t();
  console.clear();

  // Banner
  console.log(coralGradient(BANNER));
  console.log(
    chalk.dim(
      `        ${i.neuralLinkEstablished}: ${stats.firstSessionDate.toISOString().split('T')[0]}`
    )
  );
  console.log();

  // Overview stats box
  printOverviewBox(stats);
  console.log();

  // Main impact section
  printMainImpact(stats);
  console.log();

  // Activity distribution
  printActivityDistribution(stats);
  console.log();

  // Projects
  printProjects(stats);
  console.log();

  // Longest session highlight
  printLongestSession(stats);
  console.log();

  // Footer
  printFooter();
}

/**
 * Print overview statistics box
 */
function printOverviewBox(stats: WrappedStats): void {
  const i = t();
  const isZh = getLanguage() === 'zh';
  const colWidth = isZh ? 18 : 20;

  const table = new Table({
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
      middle: '│',
    },
    style: { head: [], border: ['gray'] },
    colWidths: [colWidth, colWidth, colWidth, colWidth],
  });

  table.push([
    chalk.dim(i.totalSessions.toUpperCase()),
    chalk.dim(i.activeDays.toUpperCase()),
    chalk.dim(i.peakMessages.toUpperCase()),
    chalk.dim(i.toolCalls.toUpperCase()),
  ]);

  table.push([
    chalk.white.bold(padNumber(stats.totalSessions)),
    chalk.white.bold(padNumber(stats.activeDays)),
    chalk.white.bold(
      padNumber(Math.max(...stats.dailyActivity.map((d) => d.messageCount)))
    ),
    chalk.white.bold(padNumber(stats.totalToolCalls)),
  ]);

  console.log(table.toString());
}

/**
 * Print main impact section
 */
function printMainImpact(stats: WrappedStats): void {
  const i = t();
  const title = chalk.hex('#ff7f50').bold(`${i.identified}: ${stats.userTitle.toUpperCase()}`);
  const messageCount = chalk.white.bold(stats.totalMessages.toLocaleString());
  const tokens = formatNumber(stats.totalTokens);

  console.log(boxen(
    `${title}\n\n` +
    `${chalk.white.bold.underline(messageCount)} ${chalk.dim(i.totalMessages)}\n\n` +
    chalk.dim(`${i.collaborationDensity}\n`) +
    chalk.dim(`${i.cumulativeIntelligence}: ${chalk.white(tokens)} ${i.tokens}\n`) +
    chalk.dim(`${i.primaryModel}: ${chalk.white(stats.primaryModel)}\n\n`) +
    chalk.bgHex('#ff7f50').black(` ${i.level}: ${stats.userLevel} `),
    {
      padding: 1,
      margin: 0,
      borderStyle: 'double',
      borderColor: 'gray',
    }
  ));
}

/**
 * Print activity distribution by hour
 */
function printActivityDistribution(stats: WrappedStats): void {
  const i = t();

  console.log(chalk.dim('─'.repeat(60)));
  console.log(
    chalk.gray(i.activityDistribution) +
      chalk.dim('                             ' + i.timeZone)
  );
  console.log(chalk.dim('─'.repeat(60)));

  // Group hours into time ranges
  const ranges = [
    { label: i.night, hours: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
    { label: i.morning, hours: [9, 10, 11, 12] },
    { label: i.afternoon, hours: [13, 14, 15, 16, 17, 18] },
    { label: i.evening, hours: [19, 20, 21, 22, 23] },
  ];

  let maxCount = 0;
  const rangeCounts = ranges.map((r) => {
    const count = r.hours.reduce(
      (sum, h) => sum + (stats.hourlyDistribution[h] || 0),
      0
    );
    maxCount = Math.max(maxCount, count);
    return { ...r, count };
  });

  const peakRange = rangeCounts.reduce((max, r) =>
    r.count > max.count ? r : max
  );

  for (const range of rangeCounts) {
    const isPeak = range === peakRange;
    const barLength = maxCount > 0 ? Math.round((range.count / maxCount) * 20) : 0;
    const bar =
      chalk.hex('#ff7f50')(isPeak ? '█' : '▓').repeat(barLength) +
      chalk.dim('░').repeat(20 - barLength);

    const label = isPeak
      ? chalk.hex('#ff7f50')(range.label.padEnd(12))
      : chalk.dim(range.label.padEnd(12));
    const count = isPeak
      ? chalk.hex('#ff7f50').bold(range.count.toString().padStart(4))
      : chalk.dim(range.count.toString().padStart(4));

    console.log(`  ${label}  ${bar}  ${count}`);
  }
}

/**
 * Print top projects
 */
function printProjects(stats: WrappedStats): void {
  const i = t();

  console.log();
  console.log(
    boxen(chalk.white.bold(i.activeRegistry.toUpperCase()), {
      padding: { left: 2, right: 2, top: 0, bottom: 0 },
      borderStyle: 'double',
      borderColor: 'gray',
      textAlignment: 'center',
    })
  );

  const table = new Table({
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '─',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: '  ',
    },
    style: { head: [], border: ['gray'] },
    colWidths: [30, 10, 30, 10],
  });

  const projects = stats.topProjects.slice(0, 8);
  const rows: string[][] = [];

  for (let i = 0; i < projects.length; i += 2) {
    const p1 = projects[i];
    const p2 = projects[i + 1];

    const col1 = p1
      ? `${chalk.white(truncate(p1.name, 25))}`
      : '';
    const num1 = p1 ? chalk.dim(padNumber(i + 1, 2)) : '';
    const col2 = p2
      ? `${chalk.white(truncate(p2.name, 25))}`
      : '';
    const num2 = p2 ? chalk.dim(padNumber(i + 2, 2)) : '';

    rows.push([col1, num1, col2, num2]);
  }

  for (const row of rows) {
    table.push(row);
  }

  console.log(table.toString());
  console.log(chalk.dim(`  ${i.totalProjects}: ${stats.totalProjects}`));
}

/**
 * Print longest session highlight
 */
function printLongestSession(stats: WrappedStats): void {
  const i = t();
  if (!stats.longestSession) return;

  const duration = formatDuration(stats.longestSession.duration);
  const messages = stats.longestSession.messageCount;

  const marathonText = i.marathonSession
    .replace('{duration}', duration)
    .replace('{messages}', messages.toLocaleString());

  console.log(
    boxen(
      chalk.italic.gray(
        `"${marathonText}\n${i.systemRecognizes}"`
      ),
      {
        padding: 1,
        margin: { top: 1, bottom: 0, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: '#ff7f50',
      }
    )
  );
}

/**
 * Print footer
 */
function printFooter(): void {
  const i = t();

  console.log();
  console.log(
    chalk.dim(i.sysRef) +
      '                              ' +
      chalk.hex('#ff7f50')(i.terminalReady) +
      chalk.dim(' (C) CLAUDE-CODE-WRAPPED')
  );
}

/**
 * Truncate string to max length
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Print a simple loading message
 */
export function printLoading(message: string): void {
  console.log(chalk.dim(`[${chalk.hex('#ff7f50')('*')}] ${message}`));
}

/**
 * Print error message
 */
export function printError(message: string): void {
  console.log(chalk.red(`[!] ${message}`));
}

/**
 * Print success message
 */
export function printSuccess(message: string): void {
  console.log(chalk.green(`[✓] ${message}`));
}
