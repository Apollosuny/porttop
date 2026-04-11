import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { PortEntry } from '../../types/port-entry';

type Props = {
  port: PortEntry;
  force?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function KillConfirm({ port, force, onConfirm, onCancel }: Props) {
  useInput((input, key) => {
    if (input === 'y' || input === 'Y') {
      onConfirm();
      return;
    }
    if (input === 'n' || input === 'N' || key.escape) {
      onCancel();
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="red"
      paddingX={2}
      paddingY={1}
      marginY={1}
    >
      <Box marginBottom={1}>
        <Text bold color="redBright">
          ⚠️ KILL PROCESS CONFIRMATION
        </Text>
      </Box>

      <Box flexDirection="column">
        <Text>
          <Text color="white">Process: </Text>
          <Text bold color="yellowBright">{port.processName}</Text>
        </Text>
        <Text>
          <Text color="white">PID:     </Text>
          <Text bold color="yellowBright">{port.pid}</Text>
        </Text>
        <Text>
          <Text color="white">Port:    </Text>
          <Text bold color="yellowBright">{port.port}</Text>
        </Text>
        <Text>
          <Text color="white">Signal:  </Text>
          <Text bold color={force ? 'redBright' : 'yellowBright'}>
            {force ? 'SIGKILL (force)' : 'SIGTERM (graceful)'}
          </Text>
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text>
          <Text color="white">Kill this process? </Text>
          <Text color="greenBright" bold>[Y]</Text>
          <Text color="white">es / </Text>
          <Text color="redBright" bold>[N]</Text>
          <Text color="white">o</Text>
        </Text>
      </Box>
    </Box>
  );
}
