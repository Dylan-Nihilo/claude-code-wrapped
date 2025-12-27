// Core data types for Claude Code Wrapped

export interface DailyActivity {
  date: string;
  messageCount: number;
  sessionCount: number;
  toolCallCount: number;
}

export interface DailyModelTokens {
  date: string;
  tokensByModel: Record<string, number>;
}

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  webSearchRequests: number;
  costUSD: number;
  contextWindow: number;
}

export interface LongestSession {
  sessionId: string;
  duration: number;
  messageCount: number;
  timestamp: string;
}

export interface StatsCache {
  version: number;
  lastComputedDate: string;
  dailyActivity: DailyActivity[];
  dailyModelTokens: DailyModelTokens[];
  modelUsage: Record<string, ModelUsage>;
  totalSessions: number;
  totalMessages: number;
  longestSession: LongestSession;
  firstSessionDate: string;
  hourCounts: Record<string, number>;
}

export interface HistoryEntry {
  display: string;
  pastedContents: Record<string, unknown>;
  timestamp: number;
  project: string;
  sessionId: string;
}

export interface ProjectStats {
  name: string;
  path: string;
  sessionCount: number;
  messageCount: number;
}

export interface WrappedStats {
  // Overview
  totalSessions: number;
  totalMessages: number;
  totalToolCalls: number;
  activeDays: number;
  firstSessionDate: Date;
  lastSessionDate: Date;

  // Tokens
  totalTokens: number;
  tokensByModel: Record<string, number>;
  primaryModel: string;

  // Time patterns
  hourlyDistribution: Record<number, number>;
  peakHour: number;
  dailyActivity: DailyActivity[];

  // Sessions
  longestSession: LongestSession;
  avgMessagesPerSession: number;
  avgSessionDuration: number;

  // Projects
  projects: ProjectStats[];
  topProjects: ProjectStats[];
  totalProjects: number;

  // Streaks
  longestStreak: number;
  currentStreak: number;

  // Achievements / Title
  userTitle: string;
  userLevel: string;
  achievements: string[];

  // Cost estimation
  estimatedCost: number;
  costByModel: Record<string, number>;
}

export interface ClaudeDataPaths {
  root: string;
  statsCache: string;
  history: string;
  projects: string;
  telemetry: string;
  todos: string;
}
