import type { PortEntry } from '../../types/port-entry';

/**
 * Parse output from `netstat -ano` (Windows).
 *
 * Example output:
 *   Proto  Local Address          Foreign Address        State           PID
 *   TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       1068
 *   TCP    [::]:445               [::]:0                 LISTENING       4
 */
export function parseNetstatOutput(stdout: string): PortEntry[] {
  const lines = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const results: PortEntry[] = [];

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length < 5) continue;

    const proto = parts[0]?.toUpperCase();
    if (proto !== 'TCP' && proto !== 'UDP') continue;

    const localAddr = parts[1] ?? '';
    const state = parts[3]?.toUpperCase();
    const pid = Number(parts[4] ?? parts[3]);

    if (state !== 'LISTENING' && proto === 'TCP') continue;

    // Parse address:port — handle both IPv4 and IPv6
    const lastColon = localAddr.lastIndexOf(':');
    if (lastColon === -1) continue;

    let address = localAddr.substring(0, lastColon);
    const port = Number(localAddr.substring(lastColon + 1));

    // Handle IPv6 bracket notation
    if (address.startsWith('[') && address.endsWith(']')) {
      address = address.slice(1, -1);
    }

    if (!Number.isFinite(port) || port <= 0 || !Number.isFinite(pid)) continue;

    results.push({
      processName: 'unknown', // Will be enriched by tasklist
      pid,
      protocol: proto === 'TCP' ? 'tcp' : 'udp',
      address: address || '*',
      port,
      state: 'LISTEN',
    });
  }

  return results;
}
