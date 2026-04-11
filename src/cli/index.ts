import { Command } from 'commander';
import { runListCommand } from './commands/list';
import { runDashboardCommand } from './commands/dashboard';
import { runInspectCommand } from './commands/inspect';
import { runHomeCommand } from './commands/home';
import { runCheckCommand } from './commands/check';
import { runScanCommand } from './commands/scan';
import { runKillCommand } from './commands/kill';
import { runFreeCommand } from './commands/free';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function getVersion(): string {
  try {
    // Try multiple resolution strategies for bundled vs dev mode
    const possiblePaths = [
      join(process.cwd(), 'package.json'),
      join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'),
      join(dirname(fileURLToPath(import.meta.url)), 'package.json'),
    ];

    for (const p of possiblePaths) {
      try {
        const pkg = JSON.parse(readFileSync(p, 'utf-8'));
        if (pkg.version) return pkg.version;
      } catch {
        // Try next path
      }
    }
  } catch {
    // Fallback
  }
  return '0.1.3';
}

export async function runCli() {
  const program = new Command();

  program
    .name('porttop')
    .description('Terminal toolkit for inspecting active ports')
    .version(getVersion());

  program
    .command('dashboard')
    .description('Open the live dashboard')
    .action(async () => {
      await runDashboardCommand();
    });

  program
    .command('list')
    .description('List listening ports')
    .option('--json', 'Output as JSON')
    .option('--csv', 'Output as CSV')
    .option('--markdown', 'Output as Markdown table')
    .option('-w, --watch', 'Watch mode — refresh periodically')
    .option('-i, --interval <seconds>', 'Refresh interval for watch mode (default: 2)')
    .option('--ignore-process <name...>', 'Ignore processes by name')
    .option('--ignore-port <port...>', 'Ignore specific ports')
    .action(async (options) => {
      await runListCommand(options);
    });

  program
    .command('inspect')
    .description('Inspect processes listening on a port')
    .argument('<port>', 'Port number')
    .option('--json', 'Output as JSON')
    .option('--copy <field>', 'Copy a field to clipboard (pid, port)')
    .action(async (portArg: string, options) => {
      const port = Number(portArg);

      if (!Number.isInteger(port) || port <= 0) {
        console.error('Invalid port.');
        process.exit(1);
      }

      await runInspectCommand(port, options);
    });

  program
    .command('check')
    .description('Check if a port is available or occupied')
    .argument('<port>', 'Port number to check')
    .option('--json', 'Output as JSON')
    .action(async (portArg: string, options) => {
      const port = Number(portArg);

      if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        console.error('Invalid port. Must be 1-65535.');
        process.exit(2);
      }

      await runCheckCommand(port, options);
    });

  program
    .command('scan')
    .description('Scan a range of ports')
    .argument('[range]', 'Port range (e.g., 3000-3010)')
    .option('--from <port>', 'Start of port range')
    .option('--to <port>', 'End of port range')
    .option('--show-free', 'Also show free ports in range')
    .option('--json', 'Output as JSON')
    .action(async (rangeArg: string | undefined, options) => {
      if (!rangeArg && !(options.from && options.to)) {
        console.error('Provide a range (e.g., 3000-3010) or --from/--to.');
        process.exit(2);
      }

      await runScanCommand(rangeArg ?? '', options);
    });

  program
    .command('kill')
    .description('Kill process(es) on a port or by PID')
    .argument('[port]', 'Port number')
    .option('--pid <pid>', 'Kill by PID instead of port')
    .option('-f, --force', 'Use SIGKILL instead of SIGTERM')
    .option('-y, --yes', 'Skip confirmation prompt')
    .option('--json', 'Output as JSON')
    .action(async (portArg: string | undefined, options) => {
      await runKillCommand(portArg, options);
    });

  program
    .command('free')
    .description('Find a free port')
    .argument('[port]', 'Port to check (suggests nearest free if taken)')
    .option('--from <port>', 'Start of range to search')
    .option('--to <port>', 'End of range to search')
    .option('--json', 'Output as JSON')
    .action(async (portArg: string | undefined, options) => {
      await runFreeCommand(portArg, options);
    });

  program.action(async () => {
    await runHomeCommand();
  });

  await program.parseAsync(process.argv);
}
