import { Command } from 'commander';
import { runListCommand } from './commands/list';
import { runDashboardCommand } from './commands/dashboard';
import { runInspectCommand } from './commands/inspect';

export async function runCli() {
  const program = new Command();

  program
    .name('porttop')
    .description('Terminal dashboard for active ports')
    .version('0.1.0');

  program
    .command('list')
    .description('List listening ports')
    .action(async () => {
      await runListCommand();
    });

  program
    .command('dashboard')
    .description('Open terminal dashboard')
    .action(async () => {
      await runDashboardCommand();
    });

  program
    .command('inspect')
    .description('Inspect processes listening on a port')
    .argument('<port>', 'Port number')
    .action(async (portArg: string) => {
      const port = Number(portArg);

      if (!Number.isInteger(port) || port <= 0) {
        console.error('Invalid port.');
        process.exit(1);
      }

      await runInspectCommand(port);
    });

  program.action(async () => {
    await runDashboardCommand();
  });

  await program.parseAsync(process.argv);
}
