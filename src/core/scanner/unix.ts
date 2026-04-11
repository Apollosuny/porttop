import { execa } from 'execa';
import { parseLsofListeningOutput } from './parser';
import type { PortEntry } from '../../types/port-entry';

export async function scanListeningPortsUnix(): Promise<PortEntry[]> {
  try {
    const { stdout } = await execa('lsof', ['-iTCP', '-sTCP:LISTEN', '-P', '-n']);
    return parseLsofListeningOutput(stdout);
  } catch (err: unknown) {
    // Check if lsof is not found (as opposed to a permission error or no results)
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('ENOENT') || message.includes('not found')) {
      throw new Error(
        'lsof was not found. Please install lsof or ensure it is in your PATH.\n' +
        'On Linux, try: sudo apt install lsof\n' +
        'On macOS, lsof should be pre-installed.',
      );
    }
    // lsof can exit with code 1 when there are no results
    if (message.includes('exit code 1') || message.includes('Command failed')) {
      return [];
    }
    throw err;
  }
}
