import React from 'react';
import { Box, Text } from 'ink';
import type { PortEntry } from '../../types/port-entry';
import { theme } from '../theme';

type Props = {
  selectedPort: PortEntry | null;
};

export function DetailPanel({ selectedPort }: Props) {
  return (
    <Box borderStyle='single' borderColor="magenta" flexDirection='column' paddingX={1} minWidth={30}>
      <Box marginBottom={1}>
        <Text bold color="magentaBright">📑 Port Metadata</Text>
      </Box>

      {selectedPort ? (
        <Box flexDirection="column" gap={0}>
          <Box>
            <Text color="cyanBright">🔢 PORT   </Text>
            <Text bold color="yellowBright">{selectedPort.port}</Text>
          </Box>
          <Box>
            <Text color="cyanBright">🌐 PROTO  </Text>
            <Text color="white">{selectedPort.protocol.toUpperCase()}</Text>
          </Box>
          <Box>
            <Text color="cyanBright">📄 PID    </Text>
            <Text color="yellowBright">{selectedPort.pid}</Text>
          </Box>
          <Box>
            <Text color="cyanBright">⚙️ PROC   </Text>
            <Text color="magentaBright" bold>{selectedPort.processName}</Text>
          </Box>
          <Box>
             <Text color="cyanBright">🛠️ STATE  </Text>
             <Text color={selectedPort.state?.toLowerCase() === 'listen' ? 'greenBright' : 'yellow'}>
               {selectedPort.state ?? 'UNKNOWN'}
             </Text>
          </Box>
          <Box marginTop={1} flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
            <Text color="cyanBright" bold>📍 ADDRESS_BIND</Text>
            <Text color="white">{selectedPort.address}</Text>
          </Box>
        </Box>
      ) : (
        <Box justifyContent="center" alignItems="center" flexGrow={1}>
          <Text dimColor italic>--- NO SELECTION ---</Text>
        </Box>
      )}
    </Box>
  );
}


