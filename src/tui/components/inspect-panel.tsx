import React from 'react';
import { Box, Text } from 'ink';
import type { PortEntry } from '../../types/port-entry';

type Props = {
  port: PortEntry | null;
};

export function InspectPanel({ port }: Props) {
  return (
    <Box borderStyle='double' borderColor="cyan" flexDirection='column' paddingX={2} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold underline color="cyanBright">🔍 INSPECT MODE</Text>
      </Box>

      {!port ? (
        <Text dimColor italic>No port selected for inspection.</Text>
      ) : (
        <Box flexDirection="column">
          <Box flexDirection="row" gap={4}>
            <Box flexDirection="column">
              <Text color="gray">Basic Info</Text>
              <Text>Port:     <Text bold color="white">{port.port}</Text></Text>
              <Text>Protocol: <Text color="white">{port.protocol.toUpperCase()}</Text></Text>
              <Text>PID:      <Text color="white">{port.pid}</Text></Text>
            </Box>
            <Box flexDirection="column" flexGrow={1}>
              <Text color="gray">System Context</Text>
              <Text>Process:  <Text color="yellowBright" bold>{port.processName}</Text></Text>
              <Text>State:    <Text color="greenBright">{port.state ?? 'N/A'}</Text></Text>
              <Text>Address:  <Text dimColor>{port.address}</Text></Text>
            </Box>
          </Box>
          
          <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
             <Text color="blueBright">CMD: </Text>
             <Text italic color="white">{port.command || 'No command details found.'}</Text>
          </Box>
          
          <Box marginTop={1} justifyContent="center">
            <Text dimColor>Press <Text bold color="white">ESC</Text> or <Text bold color="white">ENTER</Text> to close inspection</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}

