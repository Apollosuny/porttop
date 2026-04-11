import { scanListeningPorts } from '../scanner';
import type { PortEntry } from '../../types/port-entry';
import { getProcessDetails } from './process-service';
import { getServiceNameWithCustom } from './common-services';
import { isDockerProcess, getDockerPortMappings } from './docker-service';
import { getProcessResources } from './resource-service';

export type EnrichmentOptions = {
  /** Include likely service name detection (default: true) */
  services?: boolean;
  /** Include Docker container identification (default: false for CLI speed) */
  docker?: boolean;
  /** Include CPU/memory resource usage (default: false for CLI speed) */
  resources?: boolean;
  /** Custom service mappings from config */
  customServices?: Record<number, string>;
};

const DEFAULT_OPTIONS: EnrichmentOptions = {
  services: true,
  docker: false,
  resources: false,
};

export async function getListeningPorts(
  options: EnrichmentOptions = DEFAULT_OPTIONS,
): Promise<PortEntry[]> {
  const ports = await scanListeningPorts();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Batch fetch process details
  const enriched = await Promise.all(
    ports.map(async (row) => {
      const details = await getProcessDetails(row.pid);
      return {
        ...row,
        command: details?.command,
      };
    }),
  );

  // Enrich with service names
  if (opts.services) {
    for (const entry of enriched) {
      entry.likelyService =
        getServiceNameWithCustom(entry.port, opts.customServices) ?? undefined;
    }
  }

  // Enrich with Docker container info
  if (opts.docker) {
    const dockerMappings = await getDockerPortMappings();
    for (const entry of enriched) {
      if (isDockerProcess(entry.processName)) {
        const mapping = dockerMappings.get(entry.port);
        if (mapping) {
          entry.containerName = mapping.containerName;
          entry.containerImage = mapping.containerImage;
        }
      }
    }
  }

  // Enrich with CPU/memory
  if (opts.resources) {
    const uniquePids = [...new Set(enriched.map((e) => e.pid))];
    const resourceMap = await getProcessResources(uniquePids);
    for (const entry of enriched) {
      const res = resourceMap.get(entry.pid);
      if (res) {
        entry.cpu = res.cpu;
        entry.memory = res.memory;
      }
    }
  }

  return enriched.sort((a, b) => {
    if (a.port !== b.port) return a.port - b.port;
    return a.pid - b.pid;
  });
}
