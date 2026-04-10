import { isUnixLike } from '../../utils/platform';
import { scanListeningPortsUnix } from './unix';
import type { PortEntry } from '../../types/port-entry';

export async function scanListeningPorts(): Promise<PortEntry[]> {
  if (isUnixLike()) {
    return scanListeningPortsUnix();
  }

  throw new Error('Current platform is not supported yet.');
}

export type { PortEntry };
