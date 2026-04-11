import { execa } from 'execa';

export type ProcessResources = {
  pid: number;
  cpu: number;
  memory: number;
};

/**
 * Get CPU and memory usage for a list of PIDs in a single `ps` call.
 * Returns a map of PID → { cpu, memory }.
 */
export async function getProcessResources(
  pids: number[],
): Promise<Map<number, ProcessResources>> {
  const result = new Map<number, ProcessResources>();

  if (pids.length === 0) return result;

  try {
    const { stdout } = await execa('ps', [
      '-p',
      pids.join(','),
      '-o',
      'pid=,pcpu=,pmem=',
    ]);

    const lines = stdout.split('\n').filter(Boolean);

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 3) continue;

      const pid = Number(parts[0]);
      const cpu = Number(parts[1]);
      const memory = Number(parts[2]);

      if (Number.isFinite(pid) && Number.isFinite(cpu) && Number.isFinite(memory)) {
        result.set(pid, { pid, cpu, memory });
      }
    }
  } catch {
    // ps command failed — return empty map
  }

  return result;
}
