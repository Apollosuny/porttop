import React from 'react';
import { Box, Text } from 'ink';
import type { PortEntry } from '../../types/port-entry';
import { isPublicBinding } from '../../core/services/common-services';

export type SortField = 'port' | 'pid' | 'processName' | 'protocol' | 'address';
export type SortDirection = 'asc' | 'desc';

type Props = {
  ports: PortEntry[];
  selectedIndex: number;
  sortField?: SortField;
  sortDirection?: SortDirection;
  viewportStart?: number;
  viewportSize?: number;
};

function getSortIndicator(
  column: SortField,
  activeField?: SortField,
  direction?: SortDirection,
): string {
  if (column !== activeField) return '';
  return direction === 'asc' ? ' ▲' : ' ▼';
}

export function sortPorts(
  ports: PortEntry[],
  field: SortField,
  direction: SortDirection,
): PortEntry[] {
  const sorted = [...ports];
  const dir = direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    switch (field) {
      case 'port':
        return (a.port - b.port) * dir;
      case 'pid':
        return (a.pid - b.pid) * dir;
      case 'processName':
        return a.processName.localeCompare(b.processName) * dir;
      case 'protocol':
        return a.protocol.localeCompare(b.protocol) * dir;
      case 'address':
        return a.address.localeCompare(b.address) * dir;
      default:
        return 0;
    }
  });

  return sorted;
}

export function PortTable({
  ports,
  selectedIndex,
  sortField,
  sortDirection,
  viewportStart = 0,
  viewportSize,
}: Props) {
  const visiblePorts = viewportSize
    ? ports.slice(viewportStart, viewportStart + viewportSize)
    : ports;

  return (
    <Box borderStyle='single' borderColor="magenta" flexDirection='column'>
      {/* Header */}
      <Box paddingX={1} borderStyle="single" borderTop={false} borderLeft={false} borderRight={false} borderColor="magenta">
        <Box flexDirection="row">
          <Text bold color="cyanBright">🚢 PORT{getSortIndicator('port', sortField, sortDirection)}  </Text>
          <Box width={1} />
          <Text bold color="cyanBright">🌐 PROTO{getSortIndicator('protocol', sortField, sortDirection)} </Text>
          <Box width={1} />
          <Text bold color="cyanBright">📄 PID{getSortIndicator('pid', sortField, sortDirection)}   </Text>
          <Box width={1} />
          <Text bold color="cyanBright">⚙️ PROCESS{getSortIndicator('processName', sortField, sortDirection)}           </Text>
          <Box width={1} />
          <Text bold color="cyanBright">📍 ADDRESS{getSortIndicator('address', sortField, sortDirection)}</Text>
        </Box>
      </Box>

      {/* Viewport indicator */}
      {viewportSize && ports.length > viewportSize ? (
        <Box paddingX={1}>
          <Text dimColor>
            Showing {viewportStart + 1}-{Math.min(viewportStart + viewportSize, ports.length)} of {ports.length}
          </Text>
        </Box>
      ) : null}

      {/* Rows */}
      {visiblePorts.map((row, visibleIdx) => {
        const actualIndex = viewportStart + visibleIdx;
        const isSelected = actualIndex === selectedIndex;
        const protoIcon = row.protocol.toLowerCase() === 'tcp' ? '🟦' : '🟧';
        const publicWarning = isPublicBinding(row.address) ? ' ⚠' : '';
        const serviceTag = row.likelyService ? ` [${row.likelyService}]` : '';

        return (
          <Box
            key={`${row.port}-${row.pid}-${actualIndex}`}
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
              {'  '}{row.address}{publicWarning}
            </Text>
            {serviceTag ? (
              <Text dimColor>{serviceTag}</Text>
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
