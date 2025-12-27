// Internationalization module for Claude Code Wrapped
import * as os from 'os';

export type Language = 'en' | 'zh';

export interface Translations {
  // CLI
  analyzing: string;
  analysisComplete: string;
  generatingHtml: string;
  htmlGenerated: string;
  openingBrowser: string;
  reportSaved: string;
  checkingPuppeteer: string;
  puppeteerNotAvailable: string;
  exportHint: string;
  generatingPng: string;
  pngExported: string;
  pngSaved: string;
  thankYou: string;
  dataNotFound: string;
  expectedLocation: string;
  installHint: string;

  // Stats labels
  totalSessions: string;
  activeDays: string;
  peakMessages: string;
  toolCalls: string;
  totalMessages: string;
  tokens: string;
  primaryModel: string;
  level: string;
  cumulativeIntelligence: string;
  activityDistribution: string;
  timeZone: string;
  activeRegistry: string;
  totalProjects: string;
  longestStreak: string;
  currentStreak: string;
  avgMsgsPerSession: string;
  days: string;

  // Time ranges
  morning: string;
  afternoon: string;
  evening: string;
  night: string;

  // Titles
  identified: string;
  neuralLinkEstablished: string;
  marathonSession: string;
  systemRecognizes: string;
  terminalReady: string;
  sysRef: string;

  // User titles
  titles: {
    neuralArchitect: string;
    prolificArchitect: string;
    seniorCollaborator: string;
    codeArtisan: string;
    digitalCraftsman: string;
    codeApprentice: string;
  };

  // Levels
  levels: {
    legendary: string;
    master: string;
    expert: string;
    advanced: string;
    intermediate: string;
    novice: string;
  };

  // Messages
  collaborationDensity: string;
  exceededProtocols: string;
}

const en: Translations = {
  // CLI
  analyzing: 'Analyzing your Claude Code journey...',
  analysisComplete: 'Analysis complete!',
  generatingHtml: 'Generating HTML report...',
  htmlGenerated: 'HTML report generated!',
  openingBrowser: 'Opening report in browser...',
  reportSaved: 'Report saved to:',
  checkingPuppeteer: 'Checking Puppeteer availability...',
  puppeteerNotAvailable: 'Puppeteer not available. PNG export requires a browser.',
  exportHint: 'You can still export by opening the HTML and using the EXPORT_PNG button.',
  generatingPng: 'Generating PNG export...',
  pngExported: 'PNG exported!',
  pngSaved: 'PNG saved to:',
  thankYou: 'Thank you for using Claude Code in 2025!',
  dataNotFound: 'Claude Code data not found!',
  expectedLocation: 'Expected location:',
  installHint: 'Make sure you have Claude Code installed and have used it at least once.',

  // Stats labels
  totalSessions: 'Total_Sessions',
  activeDays: 'Active_Days',
  peakMessages: 'Peak_Messages',
  toolCalls: 'Tool_Calls',
  totalMessages: 'total messages',
  tokens: 'TOKENS',
  primaryModel: 'Primary Model',
  level: 'LEVEL',
  cumulativeIntelligence: 'CUMULATIVE_INTELLIGENCE',
  activityDistribution: 'ACTIVITY_DISTRIBUTION',
  timeZone: 'TIME_ZONE: LOCAL',
  activeRegistry: 'Active_Registry_2025',
  totalProjects: 'Total Projects',
  longestStreak: 'Longest_Streak',
  currentStreak: 'Current_Streak',
  avgMsgsPerSession: 'Avg_Msgs/Session',
  days: 'DAYS',

  // Time ranges
  morning: '09:00-12:00',
  afternoon: '13:00-18:00',
  evening: '19:00-23:00',
  night: '00:00-08:00',

  // Titles
  identified: 'IDENTIFIED',
  neuralLinkEstablished: 'Neural Link Established',
  marathonSession: 'Your {duration} marathon session ({messages} messages) has been archived in the central neural core.',
  systemRecognizes: 'The system recognizes your persistence.',
  terminalReady: 'TERMINAL_READY',
  sysRef: 'SYS_REF: 0xFF-2025-RECAP',

  // User titles
  titles: {
    neuralArchitect: 'Neural Architect',
    prolificArchitect: 'Prolific Architect',
    seniorCollaborator: 'Senior Collaborator',
    codeArtisan: 'Code Artisan',
    digitalCraftsman: 'Digital Craftsman',
    codeApprentice: 'Code Apprentice',
  },

  // Levels
  levels: {
    legendary: 'LEGENDARY',
    master: 'MASTER',
    expert: 'EXPERT',
    advanced: 'ADVANCED',
    intermediate: 'INTERMEDIATE',
    novice: 'NOVICE',
  },

  // Messages
  collaborationDensity: 'Your collaboration density exceeds standard protocols.',
  exceededProtocols: 'Total messages exchanged with core intelligence.',
};

const zh: Translations = {
  // CLI
  analyzing: '正在分析你的 Claude Code 之旅...',
  analysisComplete: '分析完成！',
  generatingHtml: '正在生成 HTML 报告...',
  htmlGenerated: 'HTML 报告已生成！',
  openingBrowser: '正在浏览器中打开报告...',
  reportSaved: '报告已保存至:',
  checkingPuppeteer: '正在检查 Puppeteer 可用性...',
  puppeteerNotAvailable: 'Puppeteer 不可用，PNG 导出需要浏览器支持。',
  exportHint: '你仍可以打开 HTML 并使用 EXPORT_PNG 按钮导出。',
  generatingPng: '正在生成 PNG 导出...',
  pngExported: 'PNG 已导出！',
  pngSaved: 'PNG 已保存至:',
  thankYou: '感谢你在 2025 年使用 Claude Code！',
  dataNotFound: '未找到 Claude Code 数据！',
  expectedLocation: '预期位置:',
  installHint: '请确保已安装 Claude Code 并至少使用过一次。',

  // Stats labels
  totalSessions: '总会话数',
  activeDays: '活跃天数',
  peakMessages: '单日峰值',
  toolCalls: '工具调用',
  totalMessages: '条消息交互',
  tokens: 'TOKENS',
  primaryModel: '主力模型',
  level: '等级',
  cumulativeIntelligence: '累计智能消耗',
  activityDistribution: '活动时间分布',
  timeZone: '时区: 本地',
  activeRegistry: '2025 项目档案',
  totalProjects: '项目总数',
  longestStreak: '最长连续',
  currentStreak: '当前连续',
  avgMsgsPerSession: '场均消息',
  days: '天',

  // Time ranges
  morning: '上午 09-12',
  afternoon: '下午 13-18',
  evening: '晚间 19-23',
  night: '深夜 00-08',

  // Titles
  identified: '身份识别',
  neuralLinkEstablished: '神经链路建立于',
  marathonSession: '你那场 {duration} 的马拉松会话（{messages} 条消息）已被归档至中央神经核心。',
  systemRecognizes: '系统认可你的坚持。',
  terminalReady: '终端就绪',
  sysRef: '系统参考: 0xFF-2025-回顾',

  // User titles
  titles: {
    neuralArchitect: '神经架构师',
    prolificArchitect: '高产架构师',
    seniorCollaborator: '资深协作者',
    codeArtisan: '代码工匠',
    digitalCraftsman: '数字匠人',
    codeApprentice: '代码学徒',
  },

  // Levels
  levels: {
    legendary: '传奇',
    master: '大师',
    expert: '专家',
    advanced: '进阶',
    intermediate: '中级',
    novice: '新手',
  },

  // Messages
  collaborationDensity: '你的协作强度超越了标准协议。',
  exceededProtocols: '与核心智能交换的消息总数。',
};

const translations: Record<Language, Translations> = { en, zh };

let currentLanguage: Language = 'en';

/**
 * Detect system language
 */
export function detectLanguage(): Language {
  const locale = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || '';
  if (locale.toLowerCase().startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}

/**
 * Set the current language
 */
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

/**
 * Get current language
 */
export function getLanguage(): Language {
  return currentLanguage;
}

/**
 * Get translations for current language
 */
export function t(): Translations {
  return translations[currentLanguage];
}

/**
 * Get a specific translation with interpolation
 */
export function tr(key: string, params?: Record<string, string | number>): string {
  const trans = translations[currentLanguage];
  let text = (trans as Record<string, unknown>)[key] as string || key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }

  return text;
}

/**
 * Get user title based on language
 */
export function getUserTitle(titleKey: string): string {
  const trans = translations[currentLanguage];
  const titles = trans.titles as Record<string, string>;
  return titles[titleKey] || titleKey;
}

/**
 * Get level based on language
 */
export function getLevel(levelKey: string): string {
  const trans = translations[currentLanguage];
  const levels = trans.levels as Record<string, string>;
  return levels[levelKey.toLowerCase()] || levelKey;
}
