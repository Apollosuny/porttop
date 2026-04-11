import pc from 'picocolors';
import { getListeningPorts } from '../../core/services/ports-service';
import { isPublicBinding } from '../../core/services/common-services';
import { formatAsJson, formatAsCsv, formatAsMarkdown } from '../../core/services/export-service';
import { loadConfig } from '../../core/services/config-service';

type ListOptions = {
  json?: boolean;
  csv?: boolean;
  markdown?: boolean;
  watch?: boolean;
  interval?: string;
  ignoreProcess?: string[];
  ignorePort?: string[];
};

function applyFilters(
  rows: Awaited<ReturnType<typeof getListeningPorts>>,
  ignoreProcesses: string[],
  ignorePorts: number[],
) {
  return rows.filter((row) => {
    if (ignorePorts.includes(row.port)) return false;
    const processLower = row.processName.toLowerCase();
    if (ignoreProcesses.some((p) => processLower.includes(p.toLowerCase()))) return false;
    return true;
  });
}

function printTable(rows: Awaited<ReturnType<typeof getListeningPorts>>) {
  console.log(
    [
      'PORT'.padEnd(8),
      'PROTO'.padEnd(8),
      'PID'.padEnd(10),
      'PROCESS'.padEnd(24),
      'ADDRESS'.padEnd(20),
      'SERVICE',
    ].join(' '),
  );

  for (const row of rows) {
    const bindingWarning = isPublicBinding(row.address) ? pc.yellowBright(' ⚠') : '';
    console.log(
      [
        String(row.port).padEnd(8),
        row.protocol.padEnd(8),
        String(row.pid).padEnd(10),
        row.processName.padEnd(24),
        (row.address + bindingWarning).padEnd(20),
        pc.dim(row.likelyService ?? ''),
      ].join(' '),
    );
  }
}

export async function runListCommand(options: ListOptions = {}) {
  const config = loadConfig();

  // Merge ignore lists: CLI args override config
  const ignoreProcesses = [
    ...(config.ignoreProcesses ?? []),
    ...(options.ignoreProcess ?? []),
  ];
  const ignorePorts = [
    ...(config.ignorePorts ?? []),
    ...(options.ignorePort ?? []).map(Number).filter(Number.isFinite),
  ];

  const intervalMs = (Number(options.interval) || config.refreshInterval || 2) * 1000;

  async function run() {
    const rows = await getListeningPorts({ services: true });
    const filtered = applyFilters(rows, ignoreProcesses, ignorePorts);

    if (filtered.length === 0) {
      console.log(pc.yellow('No listening ports found.'));
      return;
    }

    if (options.json) {
      console.log(formatAsJson(filtered));
      return;
    }

    if (options.csv) {
      console.log(formatAsCsv(filtered));
      return;
    }

    if (options.markdown) {
      console.log(formatAsMarkdown(filtered));
      return;
    }

    printTable(filtered);
  }

  if (options.watch) {
    // Clear screen and run in loop
    const runWatch = async () => {
      console.clear();
      console.log(pc.dim(`[Watching every ${intervalMs / 1000}s — Ctrl+C to stop]\n`));
      await run();
    };

    await runWatch();
    const timer = setInterval(() => void runWatch(), intervalMs);

    // Graceful cleanup
    process.on('SIGINT', () => {
      clearInterval(timer);
      process.exit(0);
    });

    // Keep process alive
    await new Promise(() => {}); // never resolves — process kept alive until SIGINT
  } else {
    await run();
  }
}
