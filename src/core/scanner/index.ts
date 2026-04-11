import { execa } from 'execa';
import { isMac, isLinux, isWindows } from '../../utils/platform';
import { scanListeningPortsUnix } from './unix';
import type { PortEntry } from '../../types/port-entry';

/**
 * Check if a command is available on the system.
 */
async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    await execa('which', [command]);
    return true;
  } catch {
    return false;
  }
}

export async function scanListeningPorts(): Promise<PortEntry[]> {
  if (isWindows()) {
    const { scanListeningPortsWindows } = await import('./windows');
    return scanListeningPortsWindows();
  }

  if (isMac()) {
    // macOS always has lsof
    return scanListeningPortsUnix();
  }

  if (isLinux()) {
    // Try lsof first, fall back to ss
    if (await isCommandAvailable('lsof')) {
      try {
        return await scanListeningPortsUnix();
      } catch {
        // lsof failed, try ss
      }
    }

    if (await isCommandAvailable('ss')) {
      const { scanListeningPortsSs } = await import('./linux');
      return scanListeningPortsSs();
    }

    throw new Error(
      'Neither lsof nor ss was found.\n' +
      'Install one of them:\n' +
      '  sudo apt install lsof\n' +
      '  (ss is usually part of iproute2)',
    );
  }

  throw new Error('Current platform is not supported yet.');
}

export type { PortEntry };
