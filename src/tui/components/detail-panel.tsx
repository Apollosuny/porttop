import React from 'react';
import { Box, Text } from 'ink';
import type { PortEntry } from '../../types/port-entry';

type Props = {
  selectedPort: PortEntry | null;
};

export function DetailPanel({ selectedPort }: Props) {
  return (
    <Box borderStyle='round' flexDirection='column' paddingX={1}>
      <Text bold>Selected</Text>

      {selectedPort ? (
        <>
          <Text>Port: {selectedPort.port}</Text>
          <Text>Protocol: {selectedPort.protocol}</Text>
          <Text>PID: {selectedPort.pid}</Text>
          <Text>Process: {selectedPort.processName}</Text>
          <Text>Address: {selectedPort.address}</Text>
          <Text>State: {selectedPort.state ?? 'unknown'}</Text>
        </>
      ) : (
        <Text dimColor>No selection</Text>
      )}
    </Box>
  );
}
