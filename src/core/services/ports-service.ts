import { scanListeningPorts } from '../scanner';
import type { PortEntry } from '../../types/port-entry';

export async function getListeningPorts(): Promise<PortEntry[]> {
  const ports = await scanListeningPorts();

  return ports.sort((a, b) => {
    if (a.port !== b.port) return a.port - b.port;
    return a.pid - b.pid;
  });
}
