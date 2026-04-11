import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { getListeningPorts } from '../core/services/ports-service';
import type { PortEntry } from '../types/port-entry';
import { PortTable } from './components/port-table';
import { DetailPanel } from './components/detail-panel';
import { InspectPanel } from './components/inspect-panel';
import { SummaryBar } from './components/summary-bar';
import { theme } from './theme';

const BANNER = `
  ____   ___  ____ _____ _____ ___  ____  
 |  _ \\ / _ \\|  _ \\_   _|_   _/ _ \\|  _ \\ 
 | |_) | | | | |_) || |   | || | | | |_) |
 |  __/| |_| |  _ < | |   | || |_| |  __/ 
 |_|    \\___/|_| \\_\|_|   |_| \\___/|_|    
`;

export function PortDashboardApp() {
  const { exit } = useApp();

  const [ports, setPorts] = useState<PortEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState('');
  const [isFilterMode, setIsFilterMode] = useState(false);

  const [isInspectMode, setIsInspectMode] = useState(false);

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
    const interval = setInterval(() => void loadPorts(), 5000);
    return () => clearInterval(interval);
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

    if (isInspectMode) {
      if (key.escape || key.return || input === 'q') {
        setIsInspectMode(false);
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

    if (key.return) {
      if (selectedPort) {
        setIsInspectMode(true);
      }
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
    <Box flexDirection='column' minHeight={20} paddingX={2} paddingY={0}>
      {/* Header Banner */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyanBright">{BANNER}</Text>
        <Box justifyContent="center">
           <Text color="magentaBright">═══ Terminal dashboard for active listening ports ═══</Text>
        </Box>
      </Box>

      {/* Summary Section */}
      <Box marginBottom={1} flexDirection="column">
         <Box marginBottom={0}>
            <Text color="magentaBright" bold>📚 Resource Overview</Text>
         </Box>
         <SummaryBar ports={ports} />
      </Box>

      {/* Search Bar */}
      <Box marginBottom={1} flexDirection="column">
        <Box borderStyle="single" borderColor={isFilterMode ? "cyan" : "magenta"} paddingX={1} width="100%">
          <Text>
            <Text color="cyanBright" bold> 🔍 SEARCH: </Text>
            <Text color="yellow">{filter}</Text>
            {isFilterMode ? <Text color="cyanBright">▋</Text> : null}
            {!isFilterMode && !filter ? <Text dimColor italic> Press / to start filtering ports...</Text> : null}
          </Text>
        </Box>
      </Box>

      {/* Main Content Title */}
      <Box marginBottom={0}>
         <Text color="magentaBright" bold>📡 Active Port Inventory</Text>
      </Box>

      {/* Main Content */}
      <Box flexGrow={1} flexDirection="column">
        {loading && ports.length === 0 ? (
          <Box justifyContent="center" paddingY={2}>
             <Text color="yellowBright">Loading network metadata...</Text>
          </Box>
        ) : null}

        {error ? (
          <Box borderStyle="double" borderColor="red" paddingX={1} marginY={1}>
            <Text color="redBright" bold>CRITICAL_ERROR: </Text>
            <Text color="white">{error}</Text>
          </Box>
        ) : null}

        {!loading && ports.length === 0 ? (
          <Box paddingY={2} justifyContent="center">
            <Text color="yellow">No active listening ports found on this system.</Text>
          </Box>
        ) : null}

        {ports.length > 0 && filteredPorts.length === 0 ? (
          <Box paddingY={2} justifyContent="center" borderStyle="round" borderColor="yellow">
            <Text color="yellow">NO MATCHES FOUND FOR "{filter}"</Text>
          </Box>
        ) : null}

        {filteredPorts.length > 0 && (
          <Box flexDirection="row" gap={2}>
            <Box flexGrow={2}>
              <PortTable ports={filteredPorts} selectedIndex={selectedIndex} />
            </Box>
            <Box flexGrow={1} width={35}>
              <DetailPanel selectedPort={selectedPort} />
            </Box>
          </Box>
        )}

      </Box>

      {/* Inspection Modal */}
      {isInspectMode && selectedPort && (
        <Box marginTop={1}>
          <InspectPanel port={selectedPort} />
        </Box>
      )}

      {/* Footer / Shortcut Bar */}
      <Box marginTop={1} paddingX={1} justifyContent="space-between">
        <Box gap={2}>
          <Text backgroundColor="magenta" color="black" bold> ⌨️ </Text>
          <Text backgroundColor="magenta" color="black" bold>↑↓</Text><Text color="white">Nav</Text>
          <Text backgroundColor="magenta" color="black" bold>/</Text><Text color="white">Search</Text>
          <Text backgroundColor="magenta" color="black" bold>↵</Text><Text color="white">Inspect</Text>
          <Text backgroundColor="magenta" color="black" bold>r</Text><Text color="white">Refresh</Text>
        </Box>
        <Box>
          <Text backgroundColor="magenta" color="black" bold>q</Text><Text color="white">Exit</Text>
        </Box>
      </Box>


    </Box>
  );
}


