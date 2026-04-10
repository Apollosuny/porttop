import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { HomeScreenApp } from './home';
import { PortDashboardApp } from './app';
import { getListeningPorts } from '../core/services/ports-service';

type Screen = 'home' | 'dashboard' | 'list';

function ListScreen({
  lines,
  error,
  loading,
  onGoHome,
  onOpenDashboard,
}: {
  lines: string[] | null;
  error: string | null;
  loading: boolean;
  onGoHome: () => void;
  onOpenDashboard: () => void;
}) {
  const { exit } = useApp();

  useInput((input) => {
    if (input === 'q') {
      exit();
      return;
    }

    if (input === 'h') {
      onGoHome();
      return;
    }

    if (input === 'd') {
      onOpenDashboard();
    }
  });

  return (
    <Box flexDirection='column' paddingX={2} paddingY={1}>
      <Text bold color='cyan'>
        Porttop List
      </Text>
      <Text dimColor>Listening ports in plain text view</Text>

      <Text> </Text>

      {loading ? <Text>Loading...</Text> : null}
      {error ? <Text color='red'>Error: {error}</Text> : null}
      {lines?.map((line, index) => (
        <Text key={index}>{line}</Text>
      ))}

      <Text> </Text>
      <Text dimColor>Press h for home, d for dashboard, q to quit</Text>
    </Box>
  );
}

export function RootApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [listOutput, setListOutput] = useState<string[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  async function handleOpenList() {
    try {
      setLoadingList(true);
      setListError(null);

      const rows = await getListeningPorts();

      if (rows.length === 0) {
        setListOutput(['No listening ports found.']);
      } else {
        const output = [
          [
            'PORT'.padEnd(8),
            'PROTO'.padEnd(8),
            'PID'.padEnd(10),
            'PROCESS'.padEnd(24),
            'ADDRESS',
          ].join(' '),
          ...rows.map((row) =>
            [
              String(row.port).padEnd(8),
              row.protocol.padEnd(8),
              String(row.pid).padEnd(10),
              row.processName.padEnd(24),
              row.address,
            ].join(' '),
          ),
        ];

        setListOutput(output);
      }

      setScreen('list');
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load list');
      setScreen('list');
    } finally {
      setLoadingList(false);
    }
  }

  if (screen === 'dashboard') {
    return <PortDashboardApp />;
  }

  if (screen === 'list') {
    return (
      <ListScreen
        lines={listOutput}
        error={listError}
        loading={loadingList}
        onGoHome={() => setScreen('home')}
        onOpenDashboard={() => setScreen('dashboard')}
      />
    );
  }

  return (
    <HomeScreenApp
      onOpenDashboard={() => setScreen('dashboard')}
      onOpenList={() => {
        void handleOpenList();
      }}
    />
  );
}
