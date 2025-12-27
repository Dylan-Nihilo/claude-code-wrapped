// CLI entry point for Claude Code Wrapped
import { Command } from 'commander';
import ora from 'ora';
import open from 'open';
import chalk from 'chalk';
import { validateClaudeData } from './paths.js';
import { analyzeData } from './analyzer.js';
import { printTUI, printError, printSuccess } from './tui.js';
import { generateHTML } from './html.js';
import { exportToPNG, checkPuppeteerAvailable } from './export.js';
import { setLanguage, detectLanguage, t, type Language } from './i18n.js';

const program = new Command();

program
  .name('claude-code-wrapped')
  .description('Generate your Claude Code 2025 year-in-review wrapped report')
  .version('1.0.0')
  .option('--no-tui', 'Skip TUI output in terminal')
  .option('--no-html', 'Skip opening HTML report in browser')
  .option('--export-png', 'Export report as PNG image')
  .option('--json', 'Output stats as JSON')
  .option('-l, --lang <language>', 'Language: en (English) or zh (Chinese)', '')
  .action(async (options) => {
    try {
      // Set language
      if (options.lang && ['en', 'zh'].includes(options.lang)) {
        setLanguage(options.lang as Language);
      } else {
        setLanguage(detectLanguage());
      }

      const i = t();

      // Validate data exists
      const validation = validateClaudeData();

      if (!validation.valid) {
        printError(i.dataNotFound);
        console.log();
        console.log(chalk.dim(i.expectedLocation), validation.paths.root);
        console.log();
        console.log(chalk.dim(i.installHint));
        process.exit(1);
      }

      // Analyze data
      const spinner = ora({
        text: i.analyzing,
        color: 'yellow',
      }).start();

      const stats = await analyzeData();

      spinner.succeed(i.analysisComplete);
      console.log();

      // JSON output mode
      if (options.json) {
        console.log(JSON.stringify(stats, null, 2));
        return;
      }

      // TUI output
      if (options.tui !== false) {
        printTUI(stats);
      }

      // Generate and open HTML
      if (options.html !== false) {
        const htmlSpinner = ora({
          text: i.generatingHtml,
          color: 'yellow',
        }).start();

        const htmlPath = await generateHTML(stats);
        htmlSpinner.succeed(i.htmlGenerated);

        console.log();
        console.log(chalk.dim(i.openingBrowser));

        await open(htmlPath);
        printSuccess(`${i.reportSaved} ${htmlPath}`);
      }

      // Export PNG if requested
      if (options.exportPng) {
        console.log();
        const pngSpinner = ora({
          text: i.checkingPuppeteer,
          color: 'yellow',
        }).start();

        const puppeteerAvailable = await checkPuppeteerAvailable();

        if (!puppeteerAvailable) {
          pngSpinner.fail(i.puppeteerNotAvailable);
          console.log(chalk.dim(i.exportHint));
        } else {
          pngSpinner.text = i.generatingPng;

          const htmlPath = await generateHTML(stats);
          const pngPath = await exportToPNG(htmlPath);

          pngSpinner.succeed(i.pngExported);
          printSuccess(`${i.pngSaved} ${pngPath}`);
        }
      }

      console.log();
      console.log(chalk.hex('#ff7f50')(i.thankYou));
    } catch (error) {
      printError(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      process.exit(1);
    }
  });

program.parse();
