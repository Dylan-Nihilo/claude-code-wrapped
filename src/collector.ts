// Data collector module - reads and parses Claude Code data
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { getClaudeDataPaths } from './paths.js';
import type {
  StatsCache,
  HistoryEntry,
  ProjectStats,
  DailyActivity,
} from './types.js';

/**
 * Read and parse stats-cache.json
 */
export async function readStatsCache(): Promise<StatsCache | null> {
  const paths = getClaudeDataPaths();

  try {
    const content = await fs.promises.readFile(paths.statsCache, 'utf-8');
    return JSON.parse(content) as StatsCache;
  } catch {
    return null;
  }
}

/**
 * Read and parse history.jsonl
 */
export async function readHistory(): Promise<HistoryEntry[]> {
  const paths = getClaudeDataPaths();
  const entries: HistoryEntry[] = [];

  try {
    if (!fs.existsSync(paths.history)) {
      return entries;
    }

    const fileStream = fs.createReadStream(paths.history);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (line.trim()) {
        try {
          entries.push(JSON.parse(line) as HistoryEntry);
        } catch {
          // Skip invalid lines
        }
      }
    }
  } catch {
    // Return empty array on error
  }

  return entries;
}

/**
 * Get project statistics from projects directory
 */
export async function getProjectStats(): Promise<ProjectStats[]> {
  const paths = getClaudeDataPaths();
  const projects: ProjectStats[] = [];

  try {
    if (!fs.existsSync(paths.projects)) {
      return projects;
    }

    const projectDirs = await fs.promises.readdir(paths.projects);

    for (const dir of projectDirs) {
      // Skip hidden files
      if (dir.startsWith('.')) continue;

      const projectPath = path.join(paths.projects, dir);
      const stat = await fs.promises.stat(projectPath);

      if (!stat.isDirectory()) continue;

      // Count session files
      const files = await fs.promises.readdir(projectPath);
      const sessionFiles = files.filter((f) => f.endsWith('.jsonl'));

      // Decode project path from directory name
      const decodedPath = dir.replace(/-/g, '/');

      let messageCount = 0;

      // Sample message count from a few session files
      const sampleFiles = sessionFiles.slice(0, 5);
      for (const file of sampleFiles) {
        try {
          const filePath = path.join(projectPath, file);
          const content = await fs.promises.readFile(filePath, 'utf-8');
          const lines = content.split('\n').filter((l) => l.trim());
          messageCount += lines.length;
        } catch {
          // Skip on error
        }
      }

      // Estimate total messages based on sample
      if (sampleFiles.length > 0 && sessionFiles.length > sampleFiles.length) {
        const avgPerFile = messageCount / sampleFiles.length;
        messageCount = Math.round(avgPerFile * sessionFiles.length);
      }

      projects.push({
        name: extractProjectName(decodedPath),
        path: decodedPath,
        sessionCount: sessionFiles.length,
        messageCount,
      });
    }

    // Sort by session count descending
    projects.sort((a, b) => b.sessionCount - a.sessionCount);
  } catch {
    // Return empty array on error
  }

  return projects;
}

/**
 * Extract a readable project name from path
 */
function extractProjectName(projectPath: string): string {
  const parts = projectPath.split('/').filter(Boolean);
  // Get the last meaningful part
  const name = parts[parts.length - 1] || 'Unknown';
  return name;
}

/**
 * Filter data for year 2025
 */
export function filterFor2025(dailyActivity: DailyActivity[]): DailyActivity[] {
  return dailyActivity.filter((d) => d.date.startsWith('2025'));
}

/**
 * Calculate total tokens from model usage
 */
export function calculateTotalTokens(
  modelUsage: Record<string, { inputTokens: number; outputTokens: number }>
): number {
  let total = 0;
  for (const usage of Object.values(modelUsage)) {
    total += usage.inputTokens + usage.outputTokens;
  }
  return total;
}

/**
 * Get tokens breakdown by model
 */
export function getTokensByModel(
  modelUsage: Record<
    string,
    {
      inputTokens: number;
      outputTokens: number;
      cacheReadInputTokens?: number;
      cacheCreationInputTokens?: number;
    }
  >
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [model, usage] of Object.entries(modelUsage)) {
    const total =
      usage.inputTokens +
      usage.outputTokens +
      (usage.cacheReadInputTokens || 0) +
      (usage.cacheCreationInputTokens || 0);
    const normalizedName = normalizeModelName(model);
    // Accumulate tokens for models that normalize to the same name
    result[normalizedName] = (result[normalizedName] || 0) + total;
  }

  return result;
}

/**
 * Model pricing per 1M tokens (USD)
 */
const MODEL_PRICING: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  'claude-opus-4-5': { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  'claude-opus-4-1': { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  'claude-sonnet-4-5': { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  'claude-sonnet-4-1': { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  'claude-haiku-4-5': { input: 0.8, output: 4, cacheRead: 0.08, cacheWrite: 1 },
  'claude-haiku': { input: 0.25, output: 1.25, cacheRead: 0.025, cacheWrite: 0.3 },
  'default': { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
};

/**
 * Get pricing tier for a model
 */
function getModelPricing(model: string): { input: number; output: number; cacheRead: number; cacheWrite: number } {
  const lowerModel = model.toLowerCase();
  if (lowerModel.includes('opus-4-5') || lowerModel.includes('opus-4.5')) {
    return MODEL_PRICING['claude-opus-4-5'];
  }
  if (lowerModel.includes('opus-4-1') || lowerModel.includes('opus-4.1') || lowerModel.includes('opus')) {
    return MODEL_PRICING['claude-opus-4-1'];
  }
  if (lowerModel.includes('sonnet-4-5') || lowerModel.includes('sonnet-4.5') || lowerModel.includes('sonnet')) {
    return MODEL_PRICING['claude-sonnet-4-5'];
  }
  if (lowerModel.includes('haiku-4-5') || lowerModel.includes('haiku-4.5')) {
    return MODEL_PRICING['claude-haiku-4-5'];
  }
  if (lowerModel.includes('haiku')) {
    return MODEL_PRICING['claude-haiku'];
  }
  return MODEL_PRICING['default'];
}

/**
 * Calculate estimated cost from model usage
 */
export function calculateEstimatedCost(
  modelUsage: Record<
    string,
    {
      inputTokens: number;
      outputTokens: number;
      cacheReadInputTokens?: number;
      cacheCreationInputTokens?: number;
    }
  >
): { totalCost: number; costByModel: Record<string, number> } {
  let totalCost = 0;
  const costByModel: Record<string, number> = {};

  for (const [model, usage] of Object.entries(modelUsage)) {
    const pricing = getModelPricing(model);
    const normalizedName = normalizeModelName(model);

    const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
    const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;
    const cacheReadCost = ((usage.cacheReadInputTokens || 0) / 1_000_000) * pricing.cacheRead;
    const cacheWriteCost = ((usage.cacheCreationInputTokens || 0) / 1_000_000) * pricing.cacheWrite;

    const modelCost = inputCost + outputCost + cacheReadCost + cacheWriteCost;
    costByModel[normalizedName] = (costByModel[normalizedName] || 0) + modelCost;
    totalCost += modelCost;
  }

  return { totalCost, costByModel };
}

/**
 * Normalize model names for display
 */
export function normalizeModelName(model: string): string {
  if (model.includes('opus-4-5') || model.includes('opus-4.5')) {
    return 'Claude Opus 4.5';
  }
  if (model.includes('opus-4-1') || model.includes('opus-4.1')) {
    return 'Claude Opus 4.1';
  }
  if (model.includes('sonnet-4-5') || model.includes('sonnet-4.5')) {
    return 'Claude Sonnet 4.5';
  }
  if (model.includes('sonnet-4-1') || model.includes('sonnet-4.1')) {
    return 'Claude Sonnet 4.1';
  }
  if (model.includes('haiku-4-5') || model.includes('haiku-4.5')) {
    return 'Claude Haiku 4.5';
  }
  if (model.includes('haiku')) {
    return 'Claude Haiku';
  }
  if (model.includes('sonnet')) {
    return 'Claude Sonnet';
  }
  if (model.includes('opus')) {
    return 'Claude Opus';
  }
  return model;
}
