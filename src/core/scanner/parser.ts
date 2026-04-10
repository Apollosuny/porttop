import type { PortEntry } from '../../types/port-entry';

export function parseLsofListeningOutput(stdout: string): PortEntry[] {
  const lines = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const dataLines = lines.slice(1);
  const results: PortEntry[] = [];

  for (const line of dataLines) {
    const parts = line.split(/\s+/);
    if (parts.length < 9) continue;

    const processName = parts[0] ?? 'unknown';
    const pid = Number(parts[1]);
    const protocolRaw = parts[7]?.toLowerCase() ?? 'tcp';
    const nameField = parts.slice(8).join(' ');

    const match = nameField.match(/^(.*):(\d+)\s+\(LISTEN\)$/);
    if (!match) continue;

    const address = match[1] || '*';
    const port = Number(match[2]);

    if (!Number.isFinite(pid) || !Number.isFinite(port)) continue;

    results.push({
      processName,
      pid,
      protocol: protocolRaw.includes('tcp') ? 'tcp' : 'udp',
      address,
      port,
      state: 'LISTEN',
    });
  }

  return results;
}
