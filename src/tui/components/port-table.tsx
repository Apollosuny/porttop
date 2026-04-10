import React from 'react';
import { Box, Text } from 'ink';
import type { PortEntry } from '../../types/port-entry';

type Props = {
  ports: PortEntry[];
  selectedIndex: number;
};

export function PortTable({ ports, selectedIndex }: Props) {
  return (
    <Box borderStyle='round' flexDirection='column' paddingX={1} paddingY={0}>
      <Text bold>
        {'PORT'.padEnd(8)}
        {'PROTO'.padEnd(8)}
        {'PID'.padEnd(10)}
        {'PROCESS'.padEnd(24)}
        ADDRESS
      </Text>

      {ports.map((row, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Text key={`${row.port}-${row.pid}-${index}`} inverse={isSelected}>
            {String(row.port).padEnd(8)}
            {row.protocol.padEnd(8)}
            {String(row.pid).padEnd(10)}
            {row.processName.padEnd(24)}
            {row.address}
          </Text>
        );
      })}
    </Box>
  );
}
