import React from 'react';
import { Box, Text } from 'ink';

type Props = {
  visible: boolean;
};

const SHORTCUTS = [
  { key: '↑ / ↓ / k / j', desc: 'Navigate through port list' },
  { key: 'Enter', desc: 'Inspect selected port' },
  { key: '/', desc: 'Start filtering (search)' },
  { key: 'Esc', desc: 'Exit filter / inspect / help' },
  { key: 's', desc: 'Cycle sort field (Port → PID → Process → Proto → Addr)' },
  { key: 'S', desc: 'Reverse sort direction' },
  { key: 'g', desc: 'Toggle grouped view (by PID)' },
  { key: 'x', desc: 'Kill selected process (with confirmation)' },
  { key: 'c', desc: 'Copy port to clipboard' },
  { key: 'C', desc: 'Copy PID to clipboard' },
  { key: 'y', desc: 'Copy full row info to clipboard' },
  { key: 'r', desc: 'Refresh port list' },
  { key: '?', desc: 'Toggle this help' },
  { key: 'q', desc: 'Quit' },
];

const FILTER_SYNTAX = [
  { syntax: 'port:3000', desc: 'Filter by port number' },
  { syntax: 'pid:1234', desc: 'Filter by PID' },
  { syntax: 'proc:node', desc: 'Filter by process name' },
  { syntax: 'proto:tcp', desc: 'Filter by protocol' },
  { syntax: 'addr:localhost', desc: 'Filter by address' },
  { syntax: 'any text', desc: 'Search across all fields' },
];

export function HelpModal({ visible }: Props) {
  if (!visible) return null;

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      marginY={1}
    >
      <Box marginBottom={1} justifyContent="center">
        <Text bold underline color="cyanBright">
          ❓ KEYBOARD SHORTCUTS
        </Text>
      </Box>

      <Box flexDirection="row" gap={4}>
        {/* Shortcuts Column */}
        <Box flexDirection="column" flexGrow={1}>
          <Text bold color="magentaBright">
            Navigation & Actions
          </Text>
          {SHORTCUTS.map((s) => (
            <Box key={s.key}>
              <Text>
                <Text color="yellowBright" bold>
                  {s.key.padEnd(16)}
                </Text>
                <Text color="white">{s.desc}</Text>
              </Text>
            </Box>
          ))}
        </Box>

        {/* Filter Syntax Column */}
        <Box flexDirection="column" width={36}>
          <Text bold color="magentaBright">
            Filter Syntax
          </Text>
          {FILTER_SYNTAX.map((f) => (
            <Box key={f.syntax}>
              <Text>
                <Text color="cyanBright" bold>
                  {f.syntax.padEnd(16)}
                </Text>
                <Text color="white">{f.desc}</Text>
              </Text>
            </Box>
          ))}
        </Box>
      </Box>

      <Box marginTop={1} justifyContent="center">
        <Text dimColor>
          Press <Text bold color="white">?</Text> or <Text bold color="white">Esc</Text> to close
        </Text>
      </Box>
    </Box>
  );
}
