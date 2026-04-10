import React from 'react';
import { Box, Text } from 'ink';
import type { PortEntry } from '../../types/port-entry';
import { theme } from '../theme';

type Props = {
  ports: PortEntry[];
  selectedIndex: number;
};

export function PortTable({ ports, selectedIndex }: Props) {
  return (
    <Box borderStyle='round' flexDirection='column' paddingX={1} paddingY={0}>
      <Text>
        {theme.info('PORT'.padEnd(8))}
        {theme.info('PROTO'.padEnd(8))}
        {theme.info('PID'.padEnd(10))}
        {theme.info('PROCESS'.padEnd(24))}
        {theme.info('ADDRESS')}
      </Text>

      {ports.map((row, index) => {
        const isSelected = index === selectedIndex;

        const content =
          String(row.port).padEnd(8) +
          row.protocol.padEnd(8) +
          String(row.pid).padEnd(10) +
          row.processName.padEnd(24) +
          row.address;

        return (
          <Text key={`${row.port}-${row.pid}-${index}`} inverse={isSelected}>
            {isSelected ? theme.strong(content) : content}
          </Text>
        );
      })}
    </Box>
  );
}
