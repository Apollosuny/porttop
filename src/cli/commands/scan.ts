import pc from 'picocolors';
import { getListeningPorts } from '../../core/services/ports-service';

export type ScanOptions = {
  showFree?: boolean;
  json?: boolean;
};

function parseRange(range: string): { from: number; to: number } | null {
  // Support "3000-3010" or "3000..3010"
  const match = range.match(/^(\d+)[-.]+(\d+)$/);
  if (!match) return null;

  const from = Number(match[1]);
  const to = Number(match[2]);

  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  if (from < 1 || to > 65535 || from > to) return null;

  return { from, to };
}

export async function runScanCommand(
  rangeStr: string,
  options: ScanOptions & { from?: string; to?: string },
) {
  let from: number;
  let to: number;

  if (options.from && options.to) {
    from = Number(options.from);
    to = Number(options.to);
  } else {
    const parsed = parseRange(rangeStr);
    if (!parsed) {
      console.error(pc.redBright('Invalid range format. Use: 3000-3010'));
      process.exit(2);
      return;
    }
    from = parsed.from;
    to = parsed.to;
  }

  if (!Number.isFinite(from) || !Number.isFinite(to) || from < 1 || to > 65535 || from > to) {
    console.error(pc.redBright('Invalid port range. Must be 1-65535 with from ≤ to.'));
    process.exit(2);
    return;
  }

  const rangeSize = to - from + 1;
  if (rangeSize > 1000) {
    console.log(pc.yellowBright(`⚠ Scanning ${rangeSize} ports. This may take a moment...`));
  }

  const allPorts = await getListeningPorts({ services: true });

  // Filter ports within the scan range
  const portsInRange = allPorts.filter((p) => p.port >= from && p.port <= to);
  const occupiedSet = new Set(portsInRange.map((p) => p.port));

  if (options.json) {
    const result: { port: number; status: string; processes?: typeof portsInRange }[] = [];

    for (let port = from; port <= to; port++) {
      const processes = portsInRange.filter((p) => p.port === port);
      if (processes.length > 0) {
        result.push({ port, status: 'occupied', processes });
      } else if (options.showFree) {
        result.push({ port, status: 'free' });
      }
    }

    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(pc.bold(`Scanning ports ${from}-${to}...\n`));

  if (portsInRange.length === 0) {
    console.log(pc.greenBright(`All ${rangeSize} ports in range are available.`));
    return;
  }

  // Show occupied ports
  console.log(
    [
      pc.bold('PORT'.padEnd(8)),
      pc.bold('PROTO'.padEnd(8)),
      pc.bold('PID'.padEnd(10)),
      pc.bold('PROCESS'.padEnd(24)),
      pc.bold('ADDRESS'),
    ].join(' '),
  );

  for (const row of portsInRange) {
    console.log(
      [
        pc.redBright(String(row.port).padEnd(8)),
        row.protocol.padEnd(8),
        String(row.pid).padEnd(10),
        row.processName.padEnd(24),
        row.address,
      ].join(' '),
    );
  }

  const freeCount = rangeSize - occupiedSet.size;
  console.log('');
  console.log(
    `${pc.redBright(String(occupiedSet.size))} occupied, ${pc.greenBright(String(freeCount))} free out of ${rangeSize} ports.`,
  );

  if (options.showFree) {
    const freePorts: number[] = [];
    for (let port = from; port <= to; port++) {
      if (!occupiedSet.has(port)) freePorts.push(port);
    }
    if (freePorts.length > 0) {
      console.log(pc.greenBright('\nFree ports: ') + freePorts.join(', '));
    }
  }
}
