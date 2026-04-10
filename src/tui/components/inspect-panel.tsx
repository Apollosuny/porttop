import React from 'react';
import { Box, Text } from 'ink';
import type { PortEntry } from '../../types/port-entry';

type Props = {
  port: PortEntry | null;
};

export function InspectPanel({ port }: Props) {
  return (
    <Box borderStyle='double' flexDirection='column' paddingX={1} paddingY={0}>
      <Text bold>Inspect</Text>

      {!port ? (
        <Text dimColor>No selection</Text>
      ) : (
        <>
          <Text>Port: {port.port}</Text>
          <Text>Protocol: {port.protocol}</Text>
          <Text>PID: {port.pid}</Text>
          <Text>Process: {port.processName}</Text>
          <Text>Address: {port.address}</Text>
          <Text>State: {port.state ?? 'unknown'}</Text>
          <Text>Command: {port.command ?? 'N/A'}</Text>
        </>
      )}
    </Box>
  );
}
