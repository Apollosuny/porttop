/**
 * Well-known port → service name mapping.
 * Used to enrich port entries with likely service identification.
 */
const WELL_KNOWN_SERVICES: Record<number, string> = {
  // Web servers
  80: 'HTTP',
  443: 'HTTPS',
  8080: 'HTTP Dev Server',
  8443: 'HTTPS Alt',

  // Development servers
  3000: 'React / Next.js / Express',
  3001: 'React / Next.js (alt)',
  4200: 'Angular',
  4321: 'Astro',
  5173: 'Vite',
  5174: 'Vite (alt)',
  5000: 'Flask / ASP.NET',
  5500: 'Live Server',
  8000: 'Django / Python HTTP',
  8888: 'Jupyter Notebook',
  9000: 'PHP-FPM / SonarQube',
  9090: 'Prometheus',
  9229: 'Node.js Debugger',

  // Databases
  3306: 'MySQL',
  5432: 'PostgreSQL',
  6379: 'Redis',
  27017: 'MongoDB',
  27018: 'MongoDB (alt)',
  5984: 'CouchDB',
  9200: 'Elasticsearch',
  9300: 'Elasticsearch (transport)',
  7474: 'Neo4j',
  8529: 'ArangoDB',
  26257: 'CockroachDB',

  // Message queues
  5672: 'RabbitMQ',
  15672: 'RabbitMQ Management',
  9092: 'Kafka',
  2181: 'Zookeeper',
  4222: 'NATS',
  6650: 'Pulsar',

  // Infrastructure
  2375: 'Docker (unencrypted)',
  2376: 'Docker (TLS)',
  2379: 'etcd',
  6443: 'Kubernetes API',
  8500: 'Consul',
  8200: 'Vault',
  4040: 'Spark UI',

  // Mail
  25: 'SMTP',
  587: 'SMTP (submission)',
  143: 'IMAP',
  993: 'IMAPS',
  110: 'POP3',
  995: 'POP3S',
  1025: 'MailHog SMTP',
  8025: 'MailHog UI',

  // Other
  22: 'SSH',
  53: 'DNS',
  3389: 'RDP',
  1433: 'MSSQL',
  1521: 'Oracle DB',
  11211: 'Memcached',
  6660: 'IRC',
};

const PUBLIC_ADDRESSES = new Set(['0.0.0.0', '::', '*', '[::]', '0:0:0:0:0:0:0:0']);

/**
 * Returns the likely service name for a given port number.
 */
export function getServiceName(port: number): string | null {
  return WELL_KNOWN_SERVICES[port] ?? null;
}

/**
 * Returns whether the address binds to all interfaces (publicly accessible).
 */
export function isPublicBinding(address: string): boolean {
  return PUBLIC_ADDRESSES.has(address);
}

/**
 * Returns a human-readable binding label.
 */
export function getBindingLabel(address: string): 'Public' | 'Local' {
  return isPublicBinding(address) ? 'Public' : 'Local';
}

/**
 * Allows users to register custom service mappings (from config).
 */
export function getServiceNameWithCustom(
  port: number,
  customMappings?: Record<number, string>,
): string | null {
  if (customMappings?.[port]) {
    return customMappings[port]!;
  }
  return WELL_KNOWN_SERVICES[port] ?? null;
}
