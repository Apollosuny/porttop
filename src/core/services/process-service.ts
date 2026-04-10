import { execa } from 'execa';

export type ProcessDetails = {
  pid: number;
  command: string;
};

export async function getProcessDetails(
  pid: number,
): Promise<ProcessDetails | null> {
  try {
    const { stdout } = await execa('ps', ['-p', String(pid), '-o', 'command=']);
    const command = stdout.trim();

    if (!command) return null;

    return {
      pid,
      command,
    };
  } catch {
    return null;
  }
}
