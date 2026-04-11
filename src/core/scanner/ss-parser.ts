import type { PortEntry } from '../../types/port-entry';

/**
 * Parse output from `ss -ltnp` (Linux).
 *
 * Example output:
 * State  Recv-Q Send-Q  Local Address:Port  Peer Address:Port  Process
 * LISTEN 0      128     0.0.0.0:22          0.0.0.0:*          users:(("sshd",pid=1234,fd=3))
 * LISTEN 0      128     [::]:80             [::]:*             users:(("nginx",pid=5678,fd=6))
 */
export function parseSsOutput(stdout: string): PortEntry[] {
  const lines = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  // Skip header line
  if (lines.length <= 1) return [];

  const results: PortEntry[] = [];
  const dataLines = lines.slice(1);

  for (const line of dataLines) {
    const parts = line.split(/\s+/);
    if (parts.length < 5) continue;

    const state = parts[0];
    if (state !== 'LISTEN') continue;

    const localAddr = parts[3] ?? '';
    const processInfo = parts.slice(5).join(' ');

    // Parse address:port
    const addrMatch = localAddr.match(/^(.+):(\d+)$/);
    if (!addrMatch) continue;

    let address = addrMatch[1] ?? '*';
    const port = Number(addrMatch[2]);

    // Handle IPv6 bracket notation
    if (address.startsWith('[') && address.endsWith(']')) {
      address = address.slice(1, -1);
    }

    // Parse process info: users:(("name",pid=1234,fd=3))
    const procMatch = processInfo.match(/\("([^"]+)",pid=(\d+)/);
    const processName = procMatch?.[1] ?? 'unknown';
    const pid = Number(procMatch?.[2] ?? 0);

    if (!Number.isFinite(port) || port <= 0) continue;

    results.push({
      processName,
      pid,
      protocol: 'tcp',
      address: address || '*',
      port,
      state: 'LISTEN',
    });
  }

  return results;
}
