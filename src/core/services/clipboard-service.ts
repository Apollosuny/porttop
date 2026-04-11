import { execa } from 'execa';
import { isMac, isLinux, isWindows } from '../../utils/platform';

export type ClipboardResult = {
  success: boolean;
  fallbackText?: string;
  error?: string;
};

/**
 * Detect the available clipboard command for the current platform.
 */
async function getClipboardCommand(): Promise<string[] | null> {
  if (isMac()) {
    return ['pbcopy'];
  }

  if (isWindows()) {
    return ['clip'];
  }

  if (isLinux()) {
    // Try Wayland first, then X11
    for (const cmd of ['wl-copy', 'xclip', 'xsel']) {
      try {
        await execa('which', [cmd]);
        if (cmd === 'xclip') return ['xclip', '-selection', 'clipboard'];
        if (cmd === 'xsel') return ['xsel', '--clipboard', '--input'];
        return [cmd];
      } catch {
        // Command not found, try next
      }
    }
  }

  return null;
}

/**
 * Copy text to the system clipboard.
 * Falls back gracefully if no clipboard tool is available.
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  const cmd = await getClipboardCommand();

  if (!cmd) {
    return {
      success: false,
      fallbackText: text,
      error: 'No clipboard tool found. Value: ' + text,
    };
  }

  try {
    const [command, ...args] = cmd;
    await execa(command!, args, { input: text });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      fallbackText: text,
      error: err instanceof Error ? err.message : 'Clipboard write failed',
    };
  }
}
