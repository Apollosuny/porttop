import pc from 'picocolors';
import { getListeningPorts } from '../../core/services/ports-service';

type FreeOptions = {
  from?: string;
  to?: string;
  json?: boolean;
};

export async function runFreeCommand(portArg: string | undefined, options: FreeOptions) {
  const allPorts = await getListeningPorts();
  const occupiedSet = new Set(allPorts.map((p) => p.port));

  // Range mode
  if (options.from && options.to) {
    const from = Number(options.from);
    const to = Number(options.to);

    if (!Number.isFinite(from) || !Number.isFinite(to) || from < 1 || to > 65535 || from > to) {
      console.error(pc.redBright('Invalid range. Must be 1-65535 with from ≤ to.'));
      process.exit(2);
      return;
    }

    const freePorts: number[] = [];
    for (let port = from; port <= to; port++) {
      if (!occupiedSet.has(port)) {
        freePorts.push(port);
      }
    }

    if (options.json) {
      console.log(JSON.stringify({ range: { from, to }, freePorts, count: freePorts.length }, null, 2));
      return;
    }

    if (freePorts.length === 0) {
      console.log(pc.redBright(`No free ports in range ${from}-${to}.`));
      process.exit(1);
      return;
    }

    console.log(pc.greenBright(`First free port: ${freePorts[0]}`));
    if (freePorts.length > 1) {
      console.log(pc.dim(`${freePorts.length} total free ports in range. Others: ${freePorts.slice(1, 10).join(', ')}${freePorts.length > 11 ? '...' : ''}`));
    }
    return;
  }

  // Single port mode
  if (!portArg) {
    console.error(pc.redBright('Please provide a port number or use --from/--to.'));
    process.exit(2);
    return;
  }

  const port = Number(portArg);
  if (!Number.isFinite(port) || port < 1 || port > 65535) {
    console.error(pc.redBright('Invalid port number.'));
    process.exit(2);
    return;
  }

  if (!occupiedSet.has(port)) {
    if (options.json) {
      console.log(JSON.stringify({ port, available: true }, null, 2));
    } else {
      console.log(pc.greenBright(`✓ Port ${port} is free.`));
    }
    return;
  }

  // Port is taken — find nearest free port
  let lower = port - 1;
  let upper = port + 1;
  let suggestion: number | null = null;

  while (lower >= 1 || upper <= 65535) {
    if (upper <= 65535 && !occupiedSet.has(upper)) {
      suggestion = upper;
      break;
    }
    if (lower >= 1 && !occupiedSet.has(lower)) {
      suggestion = lower;
      break;
    }
    lower--;
    upper++;
  }

  if (options.json) {
    console.log(JSON.stringify({ port, available: false, suggestion }, null, 2));
    return;
  }

  console.log(pc.yellowBright(`✗ Port ${port} is taken.`));
  if (suggestion !== null) {
    console.log(pc.greenBright(`  Nearest free port: ${suggestion}`));
  }
}
