import React from 'react';
import { Box, Text } from 'ink';
import type { PortEntry } from '../../types/port-entry';

export type ChangeEntry = {
  type: 'added' | 'removed';
  port: number;
  processName: string;
  pid: number;
};

type Props = {
  changes: ChangeEntry[];
};

/**
 * Compute diff between two port snapshots.
 */
export function computePortChanges(
  previous: PortEntry[],
  current: PortEntry[],
): ChangeEntry[] {
  const prevKeys = new Set(previous.map((p) => `${p.port}:${p.pid}`));
  const currKeys = new Set(current.map((p) => `${p.port}:${p.pid}`));
  const changes: ChangeEntry[] = [];

  for (const entry of current) {
    const key = `${entry.port}:${entry.pid}`;
    if (!prevKeys.has(key)) {
      changes.push({
        type: 'added',
        port: entry.port,
        processName: entry.processName,
        pid: entry.pid,
      });
    }
  }

  for (const entry of previous) {
    const key = `${entry.port}:${entry.pid}`;
    if (!currKeys.has(key)) {
      changes.push({
        type: 'removed',
        port: entry.port,
        processName: entry.processName,
        pid: entry.pid,
      });
    }
  }

  return changes;
}

export function ChangeLog({ changes }: Props) {
  if (changes.length === 0) return null;

  // Show only the latest N changes
  const visible = changes.slice(-8);

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="magenta"
      paddingX={1}
      marginBottom={1}
    >
      <Text bold color="magentaBright">
        📋 Port Changes
      </Text>
      {visible.map((change, i) => (
        <Text key={`${change.type}-${change.port}-${change.pid}-${i}`}>
          <Text
            color={change.type === 'added' ? 'greenBright' : 'redBright'}
            bold
          >
            {change.type === 'added' ? '+ ' : '- '}
          </Text>
          <Text color="yellowBright">{String(change.port).padEnd(6)}</Text>
          <Text color="white">{change.processName.padEnd(18)}</Text>
          <Text dimColor>PID {change.pid}</Text>
        </Text>
      ))}
    </Box>
  );
}
