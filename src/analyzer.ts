// Statistics analyzer - calculates wrapped stats from raw data
import {
  readStatsCache,
  readHistory,
  getProjectStats,
  filterFor2025,
  calculateTotalTokens,
  getTokensByModel,
  normalizeModelName,
  calculateEstimatedCost,
} from './collector.js';
import type { WrappedStats, DailyActivity } from './types.js';
import { t } from './i18n.js';

/**
 * Analyze all Claude Code data and generate wrapped stats
 */
export async function analyzeData(): Promise<WrappedStats> {
  const statsCache = await readStatsCache();
  const history = await readHistory();
  const projects = await getProjectStats();

  if (!statsCache) {
    throw new Error('Could not read Claude Code stats cache');
  }

  // Filter for 2025 data
  const dailyActivity2025 = filterFor2025(statsCache.dailyActivity);

  // Calculate totals
  const totalMessages = dailyActivity2025.reduce(
    (sum, d) => sum + d.messageCount,
    0
  );
  const totalSessions = dailyActivity2025.reduce(
    (sum, d) => sum + d.sessionCount,
    0
  );
  const totalToolCalls = dailyActivity2025.reduce(
    (sum, d) => sum + d.toolCallCount,
    0
  );
  const activeDays = dailyActivity2025.length;

  // Date range
  const dates = dailyActivity2025.map((d) => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime());
  const firstSessionDate = dates[0] || new Date();
  const lastSessionDate = dates[dates.length - 1] || new Date();

  // Token stats
  const totalTokens = calculateTotalTokens(statsCache.modelUsage);
  const tokensByModel = getTokensByModel(statsCache.modelUsage);
  const primaryModel = findPrimaryModel(tokensByModel);

  // Cost estimation
  const { totalCost, costByModel } = calculateEstimatedCost(statsCache.modelUsage);

  // Hourly distribution
  const hourlyDistribution = statsCache.hourCounts || {};
  const peakHour = findPeakHour(hourlyDistribution);

  // Session stats
  const avgMessagesPerSession =
    totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;
  const avgSessionDuration = statsCache.longestSession
    ? Math.round(statsCache.longestSession.duration / totalSessions / 1000 / 60)
    : 0;

  // Streak calculation
  const { longestStreak, currentStreak } = calculateStreaks(dailyActivity2025);

  // User title and achievements
  const { userTitle, userLevel, achievements } = calculateAchievements({
    totalMessages,
    totalSessions,
    totalToolCalls,
    activeDays,
    longestStreak,
    totalTokens,
    longestSessionMessages: statsCache.longestSession?.messageCount || 0,
  });

  return {
    totalSessions,
    totalMessages,
    totalToolCalls,
    activeDays,
    firstSessionDate,
    lastSessionDate,
    totalTokens,
    tokensByModel,
    primaryModel,
    hourlyDistribution: Object.fromEntries(
      Object.entries(hourlyDistribution).map(([k, v]) => [parseInt(k), v as number])
    ),
    peakHour,
    dailyActivity: dailyActivity2025,
    longestSession: statsCache.longestSession,
    avgMessagesPerSession,
    avgSessionDuration,
    projects,
    topProjects: projects.slice(0, 8),
    totalProjects: projects.length,
    longestStreak,
    currentStreak,
    userTitle,
    userLevel,
    achievements,
    estimatedCost: totalCost,
    costByModel,
  };
}

/**
 * Find the most used model
 */
function findPrimaryModel(tokensByModel: Record<string, number>): string {
  let maxTokens = 0;
  let primaryModel = 'Claude';

  for (const [model, tokens] of Object.entries(tokensByModel)) {
    if (tokens > maxTokens) {
      maxTokens = tokens;
      primaryModel = model;
    }
  }

  return primaryModel;
}

/**
 * Find peak activity hour
 */
function findPeakHour(hourCounts: Record<string, number>): number {
  let maxCount = 0;
  let peakHour = 12;

  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count > maxCount) {
      maxCount = count;
      peakHour = parseInt(hour);
    }
  }

  return peakHour;
}

/**
 * Calculate usage streaks
 */
function calculateStreaks(dailyActivity: DailyActivity[]): {
  longestStreak: number;
  currentStreak: number;
} {
  if (dailyActivity.length === 0) {
    return { longestStreak: 0, currentStreak: 0 };
  }

  const dates = dailyActivity
    .map((d) => d.date)
    .sort()
    .map((d) => new Date(d));

  let longestStreak = 1;
  let currentStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const diff =
      (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // Calculate current streak from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate = dates[dates.length - 1];
  lastDate.setHours(0, 0, 0, 0);

  const daysSinceLastActivity = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastActivity <= 1) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }

  return { longestStreak, currentStreak };
}

/**
 * Calculate user title and achievements based on stats
 */
function calculateAchievements(stats: {
  totalMessages: number;
  totalSessions: number;
  totalToolCalls: number;
  activeDays: number;
  longestStreak: number;
  totalTokens: number;
  longestSessionMessages: number;
}): {
  userTitle: string;
  userLevel: string;
  achievements: string[];
} {
  const i = t();
  const achievements: string[] = [];

  // Determine user title based on usage intensity
  let userTitle = i.titles.codeApprentice;
  let userLevel = i.levels.novice;

  if (stats.totalMessages >= 50000) {
    userTitle = i.titles.neuralArchitect;
    userLevel = i.levels.legendary;
  } else if (stats.totalMessages >= 30000) {
    userTitle = i.titles.prolificArchitect;
    userLevel = i.levels.master;
  } else if (stats.totalMessages >= 15000) {
    userTitle = i.titles.seniorCollaborator;
    userLevel = i.levels.expert;
  } else if (stats.totalMessages >= 5000) {
    userTitle = i.titles.codeArtisan;
    userLevel = i.levels.advanced;
  } else if (stats.totalMessages >= 1000) {
    userTitle = i.titles.digitalCraftsman;
    userLevel = i.levels.intermediate;
  }

  // Achievements
  if (stats.totalMessages >= 10000) {
    achievements.push('10K_MESSAGES');
  }
  if (stats.totalMessages >= 1000) {
    achievements.push('1K_MESSAGES');
  }
  if (stats.totalSessions >= 500) {
    achievements.push('500_SESSIONS');
  }
  if (stats.totalSessions >= 100) {
    achievements.push('100_SESSIONS');
  }
  if (stats.activeDays >= 30) {
    achievements.push('MONTHLY_ACTIVE');
  }
  if (stats.activeDays >= 7) {
    achievements.push('WEEKLY_ACTIVE');
  }
  if (stats.longestStreak >= 7) {
    achievements.push('WEEK_STREAK');
  }
  if (stats.longestStreak >= 3) {
    achievements.push('3_DAY_STREAK');
  }
  if (stats.totalToolCalls >= 5000) {
    achievements.push('TOOL_MASTER');
  }
  if (stats.totalToolCalls >= 1000) {
    achievements.push('TOOL_USER');
  }
  if (stats.longestSessionMessages >= 1000) {
    achievements.push('MARATHON_SESSION');
  }
  if (stats.longestSessionMessages >= 500) {
    achievements.push('LONG_SESSION');
  }
  if (stats.totalTokens >= 100000000) {
    achievements.push('100M_TOKENS');
  }
  if (stats.totalTokens >= 10000000) {
    achievements.push('10M_TOKENS');
  }

  return { userTitle, userLevel, achievements };
}

/**
 * Format large numbers with abbreviations
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Pad number with leading zeros
 */
export function padNumber(num: number, digits: number = 6): string {
  return num.toString().padStart(digits, '0');
}
