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

  const [filter, setFilter] = useState('');
  const [isFilterMode, setIsFilterMode] = useState(false);

  const filteredPorts = useMemo(() => {
    const keyword = filter.trim().toLowerCase();

    if (!keyword) return ports;

    return ports.filter((row) => {
      return (
        String(row.port).includes(keyword) ||
        String(row.pid).includes(keyword) ||
        row.processName.toLowerCase().includes(keyword) ||
        row.address.toLowerCase().includes(keyword) ||
        row.protocol.toLowerCase().includes(keyword)
      );
    });
  }, [ports, filter]);

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
    if (isFilterMode) {
      if (key.escape || key.return) {
        setIsFilterMode(false);
        return;
      }

      if (key.backspace || key.delete) {
        setFilter((prev) => prev.slice(0, -1));
        return;
      }

      if (!key.ctrl && !key.meta && input) {
        setFilter((prev) => prev + input);
      }

      return;
    }

    if (input === 'q') {
      exit();
      return;
    }

    if (input === 'r') {
      void loadPorts();
      return;
    }

    if (input === '/') {
      setIsFilterMode(true);
      return;
    }

    if (key.upArrow || input === 'k') {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow || input === 'j') {
      setSelectedIndex((prev) => Math.min(filteredPorts.length - 1, prev + 1));
    }
  });

  const selectedPort = useMemo(() => {
    return filteredPorts[selectedIndex] ?? null;
  }, [filteredPorts, selectedIndex]);

  useEffect(() => {
    setSelectedIndex((prev) => {
      if (filteredPorts.length === 0) return 0;
      return Math.min(prev, filteredPorts.length - 1);
    });
  }, [filteredPorts]);

  return (
    <Box flexDirection='column' paddingX={1} paddingY={1}>
      <Text bold>Porttop</Text>
      <Text dimColor>Terminal dashboard for listening ports</Text>
      <Text> </Text>
      <Box flexDirection='column'>
        <Text>
          Search: {filter}
          {isFilterMode ? '▋' : ''}
        </Text>
        <Text dimColor>
          Press / to search, Enter or Esc to exit search mode
        </Text>
      </Box>

      <Text> </Text>

      {loading ? <Text>Loading ports...</Text> : null}
      {error ? <Text color='red'>Error: {error}</Text> : null}

      {!loading && !error && ports.length === 0 ? (
        <Text color='yellow'>No listening ports found.</Text>
      ) : null}
      {!loading && !error && ports.length > 0 && filteredPorts.length === 0 ? (
        <>
          <Text color='yellow'>No matching ports found.</Text>
          <Text dimColor>Try another keyword.</Text>
        </>
      ) : null}

      {!loading && !error && filteredPorts.length > 0 ? (
        <>
          <PortTable ports={filteredPorts} selectedIndex={selectedIndex} />

          <Text> </Text>

          <DetailPanel selectedPort={selectedPort} />

          <Text> </Text>
          <Text dimColor>
            {isFilterMode
              ? 'Type to search • Backspace delete • Enter/Esc exit'
              : '↑/↓ or j/k • / search • r refresh • q quit'}
          </Text>
        </>
      ) : null}
    </Box>
  );
}
