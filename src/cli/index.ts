import { Command } from 'commander';
import { runListCommand } from './commands/list';
import { runDashboardCommand } from './commands/dashboard';
import { runInspectCommand } from './commands/inspect';
import { runHomeCommand } from './commands/home';

export async function runCli() {
  const program = new Command();

  program
    .name('porttop')
    .description('Terminal toolkit for inspecting active ports')
    .version('0.1.0');

  program
    .command('dashboard')
    .description('Open the live dashboard')
    .action(async () => {
      await runDashboardCommand();
    });

  program
    .command('list')
    .description('List listening ports')
    .action(async () => {
      await runListCommand();
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
    await runHomeCommand();
  });

  await program.parseAsync(process.argv);
}
