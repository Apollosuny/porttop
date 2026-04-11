export type PortEntry = {
  port: number;
  protocol: 'tcp' | 'udp';
  address: string;
  pid: number;
  processName: string;
  state?: string;
  command?: string;
  likelyService?: string;
  containerName?: string;
  containerImage?: string;
  cpu?: number;
  memory?: number;
};
