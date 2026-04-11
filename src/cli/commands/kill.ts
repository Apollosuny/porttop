import pc from 'picocolors';
import { createInterface } from 'node:readline';
import { killByPid, killByPort } from '../../core/services/kill-service';
import { getListeningPorts } from '../../core/services/ports-service';

type KillOptions = {
  pid?: string;
  force?: boolean;
  yes?: boolean;
  json?: boolean;
};

async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} [y/N] `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

export async function runKillCommand(portArg: string | undefined, options: KillOptions) {
  // Kill by PID
  if (options.pid) {
    const pid = Number(options.pid);
    if (!Number.isFinite(pid) || pid <= 0) {
      console.error(pc.redBright('Invalid PID.'));
      process.exit(2);
      return;
    }

    if (!options.yes) {
      const confirmed = await confirm(
        pc.yellowBright(`Kill PID ${pid}${options.force ? ' (FORCE)' : ''}?`),
      );
      if (!confirmed) {
        console.log(pc.dim('Cancelled.'));
        return;
      }
    }

    const result = await killByPid(pid, options.force);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else if (result.success) {
      console.log(pc.greenBright(`✓ Process ${pid} killed.`));
    } else {
      console.log(pc.redBright(`✗ Failed to kill PID ${pid}: ${result.error}`));
      process.exit(1);
    }

    return;
  }

  // Kill by port
  if (!portArg) {
    console.error(pc.redBright('Please provide a port number or use --pid.'));
    process.exit(2);
    return;
  }

  const port = Number(portArg);
  if (!Number.isFinite(port) || port <= 0) {
    console.error(pc.redBright('Invalid port number.'));
    process.exit(2);
    return;
  }

  // Show what we're about to kill
  const ports = await getListeningPorts({ services: true });
  const matches = ports.filter((p) => p.port === port);

  if (matches.length === 0) {
    console.log(pc.yellowBright(`No process found on port ${port}.`));
    return;
  }

  console.log(pc.bold(`Found on port ${port}:`));
  for (const m of matches) {
    console.log(`  PID ${m.pid} — ${m.processName} (${m.protocol.toUpperCase()}) ${m.address}`);
  }
  console.log('');

  if (!options.yes) {
    const confirmed = await confirm(
      pc.yellowBright(
        `Kill ${matches.length} process(es) on port ${port}${options.force ? ' (FORCE)' : ''}?`,
      ),
    );
    if (!confirmed) {
      console.log(pc.dim('Cancelled.'));
      return;
    }
  }

  const results = await killByPort(port, options.force);

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  for (const result of results) {
    if (result.success) {
      console.log(pc.greenBright(`✓ PID ${result.pid} killed.`));
    } else {
      console.log(pc.redBright(`✗ PID ${result.pid}: ${result.error}`));
    }
  }
}
