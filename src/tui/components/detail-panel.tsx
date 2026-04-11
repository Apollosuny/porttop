import React from 'react';
import { Box, Text } from 'ink';
import type { PortEntry } from '../../types/port-entry';
import { isPublicBinding, getBindingLabel } from '../../core/services/common-services';

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

          {/* Likely Service */}
          {selectedPort.likelyService ? (
            <Box>
              <Text color="cyanBright">🏷️ SVC    </Text>
              <Text color="blueBright" bold>{selectedPort.likelyService}</Text>
            </Box>
          ) : null}

          {/* Docker Container */}
          {selectedPort.containerName ? (
            <Box flexDirection="column" marginTop={1} borderStyle="single" borderColor="blue" paddingX={1}>
              <Text color="blueBright" bold>🐳 Docker Container</Text>
              <Text><Text color="cyanBright">Name:  </Text><Text color="white">{selectedPort.containerName}</Text></Text>
              <Text><Text color="cyanBright">Image: </Text><Text dimColor>{selectedPort.containerImage ?? 'N/A'}</Text></Text>
            </Box>
          ) : null}

          {/* Resource Usage */}
          {(selectedPort.cpu !== undefined || selectedPort.memory !== undefined) ? (
            <Box marginTop={1} flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
              <Text color="cyanBright" bold>📊 Resources</Text>
              {selectedPort.cpu !== undefined ? (
                <Text>
                  <Text color="cyanBright">CPU:   </Text>
                  <Text color={selectedPort.cpu > 50 ? 'redBright' : selectedPort.cpu > 20 ? 'yellowBright' : 'greenBright'}>
                    {selectedPort.cpu.toFixed(1)}%
                  </Text>
                </Text>
              ) : null}
              {selectedPort.memory !== undefined ? (
                <Text>
                  <Text color="cyanBright">MEM:   </Text>
                  <Text color="white">{selectedPort.memory.toFixed(1)}%</Text>
                </Text>
              ) : null}
            </Box>
          ) : null}

          {/* Binding Info */}
          <Box marginTop={1} flexDirection="column" borderStyle="single" borderColor={isPublicBinding(selectedPort.address) ? 'yellow' : 'gray'} paddingX={1}>
            <Text color="cyanBright" bold>📍 Binding</Text>
            <Text color="white">{selectedPort.address}</Text>
            {isPublicBinding(selectedPort.address) ? (
              <Text color="yellowBright" bold>⚠ Publicly bound — accessible from network</Text>
            ) : (
              <Text color="greenBright">✓ Local only</Text>
            )}
          </Box>

          {/* Fix Suggestion */}
          <Box marginTop={1} flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
            <Text color="cyanBright" bold>💡 Quick Actions</Text>
            <Text dimColor>Kill:  <Text color="cyanBright">porttop kill {selectedPort.port}</Text></Text>
            <Text dimColor>Free:  <Text color="cyanBright">kill {selectedPort.pid}</Text></Text>
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
