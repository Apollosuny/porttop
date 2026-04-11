import { execa } from 'execa';
import { parseNetstatOutput } from './windows-parser';
import type { PortEntry } from '../../types/port-entry';

/**
 * Get process names for PIDs using `tasklist` on Windows.
 */
async function getProcessNames(): Promise<Map<number, string>> {
  const names = new Map<number, string>();

  try {
    const { stdout } = await execa('tasklist', ['/FO', 'CSV', '/NH']);
    const lines = stdout.split('\n').filter(Boolean);

    for (const line of lines) {
      // CSV format: "name.exe","PID","Session Name","Session#","Mem Usage"
      const match = line.match(/"([^"]+)","(\d+)"/);
      if (match) {
        const name = match[1]!;
        const pid = Number(match[2]);
        if (Number.isFinite(pid)) {
          names.set(pid, name);
        }
      }
    }
  } catch {
    // tasklist failed
  }

  return names;
}

export async function scanListeningPortsWindows(): Promise<PortEntry[]> {
  const { stdout } = await execa('netstat', ['-ano']);
  const entries = parseNetstatOutput(stdout);

  // Enrich process names
  const names = await getProcessNames();
  for (const entry of entries) {
    const name = names.get(entry.pid);
    if (name) {
      entry.processName = name;
    }
  }

  return entries;
}
