import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { getListeningPorts } from '../core/services/ports-service';
import type { PortEntry } from '../types/port-entry';
import { PortTable } from './components/port-table';
import { DetailPanel } from './components/detail-panel';

export function PortDashboardApp() {
  const { exit } = useApp();

  const [ports, setPorts] = useState<PortEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPorts() {
    try {
      setLoading(true);
      setError(null);
      const data = await getListeningPorts();
      setPorts(data);
      setSelectedIndex((prev) => {
        if (data.length === 0) return 0;
        return Math.min(prev, data.length - 1);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ports');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPorts();
  }, []);

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }

    if (input === 'r') {
      void loadPorts();
      return;
    }

    if (key.upArrow || input === 'k') {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow || input === 'j') {
      setSelectedIndex((prev) => Math.min(ports.length - 1, prev + 1));
    }
  });

  const selectedPort = useMemo(() => {
    return ports[selectedIndex] ?? null;
  }, [ports, selectedIndex]);

  return (
    <Box flexDirection='column' paddingX={1} paddingY={1}>
      <Text bold>Porttop</Text>
      <Text dimColor>Terminal dashboard for listening ports</Text>
      <Text> </Text>

      {loading ? <Text>Loading ports...</Text> : null}
      {error ? <Text color='red'>Error: {error}</Text> : null}

      {!loading && !error && ports.length === 0 ? (
        <Text color='yellow'>No listening ports found.</Text>
      ) : null}

      {!loading && !error && ports.length > 0 ? (
        <>
          <PortTable ports={ports} selectedIndex={selectedIndex} />

          <Text> </Text>

          <DetailPanel selectedPort={selectedPort} />

          <Text> </Text>
          <Text dimColor>↑/↓ or j/k • r refresh • q quit</Text>
        </>
      ) : null}
    </Box>
  );
}
