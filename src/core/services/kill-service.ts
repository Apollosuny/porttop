import { execa } from 'execa';
import { getListeningPorts } from './ports-service';

export type KillResult = {
  pid: number;
  success: boolean;
  error?: string;
};

/**
 * Kill a process by PID.
 * Uses SIGTERM by default (graceful). Use force=true for SIGKILL.
 */
export async function killByPid(pid: number, force = false): Promise<KillResult> {
  try {
    const signal = force ? 'KILL' : 'TERM';
    await execa('kill', [`-${signal}`, String(pid)]);
    return { pid, success: true };
  } catch (err) {
    return {
      pid,
      success: false,
      error: err instanceof Error ? err.message : `Failed to kill PID ${pid}`,
    };
  }
}

/**
 * Kill all processes listening on a specific port.
 * Returns results for each PID found on that port.
 */
export async function killByPort(port: number, force = false): Promise<KillResult[]> {
  const ports = await getListeningPorts();
  const matches = ports.filter((p) => p.port === port);

  if (matches.length === 0) {
    return [{ pid: 0, success: false, error: `No process found on port ${port}` }];
  }

  const uniquePids = [...new Set(matches.map((m) => m.pid))];
  const results = await Promise.all(uniquePids.map((pid) => killByPid(pid, force)));
  return results;
}
