// Cross-platform path detection for Claude Code data
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import type { ClaudeDataPaths } from './types.js';

/**
 * Get the Claude Code data directory path based on the operating system
 *
 * macOS: ~/.claude
 * Linux: ~/.claude
 * Windows: %APPDATA%\claude or %USERPROFILE%\.claude
 */
export function getClaudeDataDir(): string {
  const platform = os.platform();
  const homeDir = os.homedir();

  if (platform === 'win32') {
    // Windows: Try multiple locations
    const appDataPath = process.env.APPDATA;
    const possiblePaths = [
      appDataPath ? path.join(appDataPath, 'claude') : null,
      appDataPath ? path.join(appDataPath, 'Claude') : null,
      path.join(homeDir, '.claude'),
      path.join(homeDir, 'AppData', 'Roaming', 'claude'),
      path.join(homeDir, 'AppData', 'Local', 'claude'),
    ].filter(Boolean) as string[];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    // Default to .claude in home directory
    return path.join(homeDir, '.claude');
  }

  // macOS and Linux
  return path.join(homeDir, '.claude');
}

/**
 * Get all relevant Claude Code data paths
 */
export function getClaudeDataPaths(): ClaudeDataPaths {
  const root = getClaudeDataDir();

  return {
    root,
    statsCache: path.join(root, 'stats-cache.json'),
    history: path.join(root, 'history.jsonl'),
    projects: path.join(root, 'projects'),
    telemetry: path.join(root, 'telemetry'),
    todos: path.join(root, 'todos'),
  };
}

/**
 * Check if Claude Code data exists
 */
export function hasClaudeData(): boolean {
  const paths = getClaudeDataPaths();
  return fs.existsSync(paths.root) && fs.existsSync(paths.statsCache);
}

/**
 * Validate Claude data directory and return info
 */
export function validateClaudeData(): {
  valid: boolean;
  paths: ClaudeDataPaths;
  errors: string[];
} {
  const paths = getClaudeDataPaths();
  const errors: string[] = [];

  if (!fs.existsSync(paths.root)) {
    errors.push(`Claude data directory not found: ${paths.root}`);
  }

  if (!fs.existsSync(paths.statsCache)) {
    errors.push(`Stats cache file not found: ${paths.statsCache}`);
  }

  return {
    valid: errors.length === 0,
    paths,
    errors,
  };
}
