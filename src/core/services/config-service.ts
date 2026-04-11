import { z } from 'zod';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const ConfigSchema = z.object({
  ignoreProcesses: z.array(z.string()).default([]),
  ignorePorts: z.array(z.number()).default([]),
  customServices: z.record(z.coerce.number(), z.string()).default({}),
  theme: z.enum(['cyberpunk', 'matrix', 'minimal']).default('cyberpunk'),
  scannerPreference: z.enum(['auto', 'lsof', 'ss', 'netstat']).default('auto'),
  refreshInterval: z.number().min(1).max(60).default(5),
}).partial();

export type PorttopConfig = z.infer<typeof ConfigSchema>;

const CONFIG_FILENAME = '.porttoprc';

/**
 * Load config from .porttoprc file.
 * Search order: $PWD/.porttoprc → $HOME/.porttoprc
 * Returns an empty config object if no file is found.
 */
export function loadConfig(): PorttopConfig {
  const searchPaths = [
    join(process.cwd(), CONFIG_FILENAME),
    join(homedir(), CONFIG_FILENAME),
  ];

  for (const configPath of searchPaths) {
    if (existsSync(configPath)) {
      try {
        const raw = readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        const result = ConfigSchema.safeParse(parsed);

        if (result.success) {
          return result.data;
        }

        // Log validation error but don't crash
        console.error(`Warning: Invalid config at ${configPath}: ${result.error.message}`);
      } catch {
        // JSON parse error — ignore and continue
      }
    }
  }

  return {};
}

/**
 * Get the custom service mappings from config, already as a Record<number, string>.
 */
export function getCustomServiceMappings(config: PorttopConfig): Record<number, string> {
  const result: Record<number, string> = {};
  if (config.customServices) {
    for (const [key, value] of Object.entries(config.customServices)) {
      const port = Number(key);
      if (Number.isFinite(port)) {
        result[port] = value;
      }
    }
  }
  return result;
}
