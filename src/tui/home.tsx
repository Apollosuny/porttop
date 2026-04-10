import React from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { theme } from './theme';

type Props = {
  onOpenDashboard: () => void;
  onOpenList: () => void;
};

export function HomeScreenApp({ onOpenDashboard, onOpenList }: Props) {
  const { exit } = useApp();

  useInput((input) => {
    if (input === 'q') {
      exit();
      return;
    }

    if (input === 'd') {
      onOpenDashboard();
      return;
    }

    if (input === 'l') {
      onOpenList();
      return;
    }
  });

  return (
    <Box flexDirection='column' paddingX={2} paddingY={1}>
      <Text>{theme.brand('┌──────────────────────────────┐')}</Text>
      <Text>{theme.brand('│           Porttop            │')}</Text>
      <Text>{theme.brand('└──────────────────────────────┘')}</Text>

      <Text>
        {theme.muted('Terminal toolkit for inspecting active listening ports')}
      </Text>

      <Text> </Text>

      <Box borderStyle='round' flexDirection='column' paddingX={1}>
        <Text>{theme.accent('Welcome')}</Text>
        <Text>
          Check which ports are running, inspect local processes, and debug
          development conflicts faster from your terminal.
        </Text>
      </Box>

      <Text> </Text>

      <Box borderStyle='round' flexDirection='column' paddingX={1}>
        <Text>{theme.info('Commands')}</Text>

        <Text>{theme.strong('porttop')}</Text>
        <Text>{theme.muted('  Open the home screen')}</Text>

        <Text>{theme.strong('porttop dashboard')}</Text>
        <Text>{theme.muted('  Open the interactive dashboard')}</Text>

        <Text>{theme.strong('porttop list')}</Text>
        <Text>{theme.muted('  Print listening ports in plain text')}</Text>

        <Text>{theme.strong('porttop inspect 3000')}</Text>
        <Text>{theme.muted('  Inspect a specific port')}</Text>
      </Box>

      <Text> </Text>

      <Box borderStyle='round' flexDirection='column' paddingX={1}>
        <Text>{theme.success('Quick start')}</Text>

        <Text>{theme.warning('d')} Open dashboard</Text>
        <Text>{theme.warning('l')} Open list view</Text>
        <Text>{theme.warning('q')} Quit</Text>
      </Box>

      <Text> </Text>
      <Text>
        {theme.muted('Press ')}
        {theme.warning('d')}
        {theme.muted(' for dashboard, ')}
        {theme.warning('l')}
        {theme.muted(' for list, ')}
        {theme.warning('q')}
        {theme.muted(' to quit')}
      </Text>
    </Box>
  );
}
