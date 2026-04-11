import type { PortEntry } from '../../types/port-entry';

/**
 * Format port entries as JSON string.
 */
export function formatAsJson(ports: PortEntry[]): string {
  return JSON.stringify(ports, null, 2);
}

/**
 * Format port entries as CSV string with headers.
 */
export function formatAsCsv(ports: PortEntry[]): string {
  const headers = [
    'port',
    'protocol',
    'pid',
    'processName',
    'address',
    'state',
    'command',
    'likelyService',
  ];

  const rows = ports.map((p) =>
    [
      p.port,
      p.protocol,
      p.pid,
      csvEscape(p.processName),
      csvEscape(p.address),
      csvEscape(p.state ?? ''),
      csvEscape(p.command ?? ''),
      csvEscape(p.likelyService ?? ''),
    ].join(','),
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Format port entries as a Markdown table.
 */
export function formatAsMarkdown(ports: PortEntry[]): string {
  const header = '| Port | Proto | PID | Process | Address | State | Service |';
  const separator = '|------|-------|-----|---------|---------|-------|---------|';

  const rows = ports.map(
    (p) =>
      `| ${p.port} | ${p.protocol.toUpperCase()} | ${p.pid} | ${p.processName} | ${p.address} | ${p.state ?? ''} | ${p.likelyService ?? ''} |`,
  );

  return [header, separator, ...rows].join('\n');
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
