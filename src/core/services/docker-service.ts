import { execa } from 'execa';

export type DockerPortMapping = {
  containerName: string;
  containerImage: string;
  hostPort: number;
};

const DOCKER_PROCESS_NAMES = new Set([
  'com.docker.backend',
  'com.docker.proxy',
  'docker-proxy',
  'docker',
  'containerd',
  'dockerd',
]);

/**
 * Check if a process name looks like a Docker process.
 */
export function isDockerProcess(processName: string): boolean {
  const lower = processName.toLowerCase();
  return DOCKER_PROCESS_NAMES.has(lower) || lower.includes('docker');
}

/**
 * Check if Docker is available on the system.
 */
async function isDockerAvailable(): Promise<boolean> {
  try {
    await execa('docker', ['info', '--format', '{{.ServerVersion}}']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all Docker port mappings by parsing `docker ps` output.
 * Caches per invocation to avoid repeated calls.
 */
export async function getDockerPortMappings(): Promise<Map<number, DockerPortMapping>> {
  const mappings = new Map<number, DockerPortMapping>();

  if (!(await isDockerAvailable())) {
    return mappings;
  }

  try {
    const { stdout } = await execa('docker', [
      'ps',
      '--format',
      '{{.Names}}\t{{.Image}}\t{{.Ports}}',
    ]);

    const lines = stdout.split('\n').filter(Boolean);

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 3) continue;

      const containerName = parts[0]!;
      const containerImage = parts[1]!;
      const portsStr = parts[2]!;

      // Parse port mappings like "0.0.0.0:3000->3000/tcp, :::3000->3000/tcp"
      const portMatches = portsStr.matchAll(
        /(?:[\d.]+|::):(\d+)->(\d+)\/\w+/g,
      );

      for (const match of portMatches) {
        const hostPort = Number(match[1]);
        if (Number.isFinite(hostPort)) {
          mappings.set(hostPort, {
            containerName,
            containerImage,
            hostPort,
          });
        }
      }
    }
  } catch {
    // Docker command failed — return empty mappings
  }

  return mappings;
}
