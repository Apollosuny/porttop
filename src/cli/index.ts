import { Command } from 'commander';
import { runListCommand } from './commands/list';
import { runDashboardCommand } from './commands/dashboard';

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

  program.action(async () => {
    await runDashboardCommand();
  });

  await program.parseAsync(process.argv);
}
