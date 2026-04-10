import { scanListeningPorts } from '../scanner';
import type { PortEntry } from '../../types/port-entry';
import { getProcessDetails } from './process-service';

export async function getListeningPorts(): Promise<PortEntry[]> {
  const ports = await scanListeningPorts();

  const enriched = await Promise.all(
    ports.map(async (row) => {
      const details = await getProcessDetails(row.pid);

      return {
        ...row,
        command: details?.command,
      };
    }),
  );

  return enriched.sort((a, b) => {
    if (a.port !== b.port) return a.port - b.port;
    return a.pid - b.pid;
  });
}
