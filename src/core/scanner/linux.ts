import { execa } from 'execa';
import { parseSsOutput } from './ss-parser';
import type { PortEntry } from '../../types/port-entry';

export async function scanListeningPortsSs(): Promise<PortEntry[]> {
  const { stdout } = await execa('ss', ['-ltnp']);
  return parseSsOutput(stdout);
}
