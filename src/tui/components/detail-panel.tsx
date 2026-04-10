import React from 'react';
import { Box, Text } from 'ink';
import type { PortEntry } from '../../types/port-entry';
import { theme } from '../theme';

type Props = {
  selectedPort: PortEntry | null;
};

export function DetailPanel({ selectedPort }: Props) {
  return (
    <Box borderStyle='round' flexDirection='column' paddingX={1}>
      <Text>{theme.accent('Selected')}</Text>

      {selectedPort ? (
        <>
          <Text>
            <Text>{theme.info('Port:')}</Text> {selectedPort.port}
          </Text>
          <Text>
            <Text>{theme.info('Protocol:')}</Text> {selectedPort.protocol}
          </Text>
          <Text>
            <Text>{theme.info('PID:')}</Text> {selectedPort.pid}
          </Text>
          <Text>
            <Text>{theme.info('Process:')}</Text> {selectedPort.processName}
          </Text>
          <Text>
            <Text>{theme.info('Address:')}</Text> {selectedPort.address}
          </Text>
          <Text>
            <Text>{theme.info('State:')}</Text>{' '}
            {selectedPort.state ?? 'unknown'}
          </Text>
        </>
      ) : (
        <Text>{theme.muted('No selection')}</Text>
      )}
    </Box>
  );
}
