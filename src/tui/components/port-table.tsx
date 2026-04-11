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
    <Box borderStyle='single' borderColor="magenta" flexDirection='column'>
      {/* Header Grid */}
      <Box paddingX={1} borderStyle="single" borderTop={false} borderLeft={false} borderRight={false} borderColor="magenta">
        <Box flexDirection="row">
          <Text bold color="cyanBright">🚢 PORT  </Text>
          <Box width={1} />
          <Text bold color="cyanBright">🌐 PROTO </Text>
          <Box width={1} />
          <Text bold color="cyanBright">📄 PID   </Text>
          <Box width={1} />
          <Text bold color="cyanBright">⚙️ PROCESS           </Text>
          <Box width={1} />
          <Text bold color="cyanBright">📍 ADDRESS</Text>
        </Box>
      </Box>


      {/* Rows */}
      {ports.map((row, index) => {
        const isSelected = index === selectedIndex;
        const protoIcon = row.protocol.toLowerCase() === 'tcp' ? '🟦' : '🟧';

        return (
          <Box 
            key={`${row.port}-${row.pid}-${index}`} 
            paddingX={1}
          >
             <Text 
               backgroundColor={isSelected ? 'magenta' : undefined} 
               color={isSelected ? 'black' : 'white'} 
               bold={isSelected}
             >
              {String(row.port).padEnd(8)}
              {protoIcon} {row.protocol.toUpperCase().padEnd(5)}
              {String(row.pid).padEnd(8)}
              {row.processName.length > 18 ? row.processName.substring(0, 15) + '...' : row.processName.padEnd(18)}
              {'  '}{row.address}
            </Text>
          </Box>
        );

      })}
    </Box>
  );
}


