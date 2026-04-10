import { execa } from 'execa';
import { parseLsofListeningOutput } from './parser';
import type { PortEntry } from '../../types/port-entry';

export async function scanListeningPortsUnix(): Promise<PortEntry[]> {
  const { stdout } = await execa('lsof', ['-iTCP', '-sTCP:LISTEN', '-P', '-n']);
  return parseLsofListeningOutput(stdout);
}
