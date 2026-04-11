import React from 'react';
import { Box, Text } from 'ink';
import type { PortEntry } from '../../types/port-entry';
import { theme } from '../theme';

type Props = {
  ports: PortEntry[];
};

export function SummaryBar({ ports }: Props) {
  const tcpCount = ports.filter((p) => p.protocol.toLowerCase() === 'tcp').length;
  const udpCount = ports.filter((p) => p.protocol.toLowerCase() === 'udp').length;
  const uniqueProcesses = new Set(ports.map((p) => p.pid)).size;

  return (
    <Box marginY={0}>
      <Box borderStyle="single" borderColor="magenta" paddingX={1} marginRight={1}>
        <Text>
          <Text color="cyanBright" bold>⚡ Ports: </Text>
          <Text bold color="yellowBright">{ports.length}</Text>
        </Text>
      </Box>

      <Box borderStyle="single" borderColor="magenta" paddingX={1} marginRight={1}>
        <Text>
          <Text color="cyanBright" bold>🌐 TCP/UDP: </Text>
          <Text bold color="yellowBright">{tcpCount}</Text>
          <Text color="magenta"> / </Text>
          <Text bold color="yellowBright">{udpCount}</Text>
        </Text>
      </Box>

      <Box borderStyle="single" borderColor="magenta" paddingX={1}>
        <Text>
          <Text color="cyanBright" bold>⚙️ Procs: </Text>
          <Text bold color="yellowBright">{uniqueProcesses}</Text>
        </Text>
      </Box>
    </Box>
  );
}

