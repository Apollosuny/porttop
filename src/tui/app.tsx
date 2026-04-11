import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Text, useApp, useInput, useStdout } from 'ink';
import { getListeningPorts } from '../core/services/ports-service';
import type { PortEntry } from '../types/port-entry';
import { PortTable, sortPorts } from './components/port-table';
import type { SortField, SortDirection } from './components/port-table';
import { DetailPanel } from './components/detail-panel';
import { InspectPanel } from './components/inspect-panel';
import { SummaryBar } from './components/summary-bar';
import { HelpModal } from './components/help-modal';
import { KillConfirm } from './components/kill-confirm';
import { StatusBar } from './components/status-bar';
import { ChangeLog, computePortChanges } from './components/change-log';
import type { ChangeEntry } from './components/change-log';
import { killByPid } from '../core/services/kill-service';
import { copyToClipboard } from '../core/services/clipboard-service';

const BANNER = `
  ____   ___  ____ _____ _____ ___  ____  
 |  _ \\ / _ \\|  _ \\_   _|_   _/ _ \\|  _ \\ 
 | |_) | | | | |_) || |   | || | | | |_) |
 |  __/| |_| |  _ < | |   | || |_| |  __/ 
 |_|    \\___/|_| \\_\\|_|   |_| \\___/|_|    
`;

const SORT_FIELDS: SortField[] = ['port', 'pid', 'processName', 'protocol', 'address'];

/**
 * Parse advanced filter syntax: port:3000, pid:1234, proc:node, proto:tcp, addr:localhost
 */
function applyAdvancedFilter(ports: PortEntry[], filter: string): PortEntry[] {
  const keyword = filter.trim().toLowerCase();
  if (!keyword) return ports;

  // Check for advanced syntax
  const advancedMatch = keyword.match(/^(port|pid|proc|proto|addr):(.+)$/);
  if (advancedMatch) {
    const [, field, value] = advancedMatch;
    return ports.filter((row) => {
      switch (field) {
        case 'port':
          return String(row.port).includes(value!);
        case 'pid':
          return String(row.pid).includes(value!);
        case 'proc':
          return row.processName.toLowerCase().includes(value!);
        case 'proto':
          return row.protocol.toLowerCase().includes(value!);
        case 'addr':
          return row.address.toLowerCase().includes(value!);
        default:
          return true;
      }
    });
  }

  // Fallback: search all fields
  return ports.filter((row) => {
    return (
      String(row.port).includes(keyword) ||
      String(row.pid).includes(keyword) ||
      row.processName.toLowerCase().includes(keyword) ||
      row.address.toLowerCase().includes(keyword) ||
      row.protocol.toLowerCase().includes(keyword) ||
      (row.likelyService?.toLowerCase().includes(keyword) ?? false)
    );
  });
}

/**
 * Group ports by PID for grouped view.
 */
function groupByPid(ports: PortEntry[]): Map<number, PortEntry[]> {
  const groups = new Map<number, PortEntry[]>();
  for (const p of ports) {
    const group = groups.get(p.pid) ?? [];
    group.push(p);
    groups.set(p.pid, group);
  }
  return groups;
}

export function PortDashboardApp() {
  const { exit } = useApp();
  const { stdout } = useStdout();

  const [ports, setPorts] = useState<PortEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [filter, setFilter] = useState('');
  const [isFilterMode, setIsFilterMode] = useState(false);

  // Modes
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [killTarget, setKillTarget] = useState<PortEntry | null>(null);
  const [isGroupedView, setIsGroupedView] = useState(false);

  // Sort
  const [sortField, setSortField] = useState<SortField>('port');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Status messages
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  // Change log
  const [changes, setChanges] = useState<ChangeEntry[]>([]);
  const prevPortsRef = useRef<PortEntry[]>([]);

  // Viewport / Pagination
  const terminalRows = stdout?.rows ?? 40;
  const viewportSize = Math.max(5, terminalRows - 25); // Reserve space for header, summary, etc.

  const filteredPorts = useMemo(() => {
    const filtered = applyAdvancedFilter(ports, filter);
    return sortPorts(filtered, sortField, sortDirection);
  }, [ports, filter, sortField, sortDirection]);

  const viewportStart = useMemo(() => {
    if (filteredPorts.length <= viewportSize) return 0;
    // Center the selected item in viewport
    const half = Math.floor(viewportSize / 2);
    const start = Math.max(0, selectedIndex - half);
    return Math.min(start, filteredPorts.length - viewportSize);
  }, [selectedIndex, filteredPorts.length, viewportSize]);

  async function loadPorts() {
    try {
      setLoading(true);
      setError(null);
      const data = await getListeningPorts({
        services: true,
        docker: true,
        resources: true,
      });

      // Track changes
      if (prevPortsRef.current.length > 0) {
        const newChanges = computePortChanges(prevPortsRef.current, data);
        if (newChanges.length > 0) {
          setChanges((prev) => [...prev, ...newChanges].slice(-20));
        }
      }
      prevPortsRef.current = data;

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

  function showStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
    setStatusMessage(message);
    setStatusType(type);
  }

  async function handleKillConfirm() {
    if (!killTarget) return;

    const result = await killByPid(killTarget.pid);
    setKillTarget(null);

    if (result.success) {
      showStatus(`Process ${killTarget.processName} (PID ${killTarget.pid}) killed`, 'success');
      void loadPorts();
    } else {
      showStatus(`Failed to kill PID ${killTarget.pid}: ${result.error}`, 'error');
    }
  }

  async function handleCopy(type: 'port' | 'pid' | 'row') {
    const selected = filteredPorts[selectedIndex];
    if (!selected) return;

    let value = '';
    let label = '';

    switch (type) {
      case 'port':
        value = String(selected.port);
        label = 'Port';
        break;
      case 'pid':
        value = String(selected.pid);
        label = 'PID';
        break;
      case 'row':
        value = `${selected.port} ${selected.protocol} PID ${selected.pid} ${selected.processName} ${selected.address}`;
        label = 'Row';
        break;
    }

    const result = await copyToClipboard(value);
    if (result.success) {
      showStatus(`Copied ${label}: ${value}`, 'success');
    } else {
      showStatus(`${label}: ${value} (clipboard unavailable)`, 'info');
    }
  }

  useInput((input, key) => {
    // Kill confirmation mode
    if (killTarget) {
      // KillConfirm handles its own input
      return;
    }

    // Filter mode
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

    // Help mode
    if (isHelpVisible) {
      if (key.escape || input === '?') {
        setIsHelpVisible(false);
      }
      return;
    }

    // Inspect mode
    if (isInspectMode) {
      if (key.escape || key.return || input === 'q') {
        setIsInspectMode(false);
      }
      return;
    }

    // Normal mode
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

    if (input === '?') {
      setIsHelpVisible(true);
      return;
    }

    if (key.return) {
      const selected = filteredPorts[selectedIndex];
      if (selected) {
        setIsInspectMode(true);
      }
      return;
    }

    // Sort controls
    if (input === 's') {
      setSortField((prev) => {
        const idx = SORT_FIELDS.indexOf(prev);
        return SORT_FIELDS[(idx + 1) % SORT_FIELDS.length]!;
      });
      return;
    }

    if (input === 'S') {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    // Grouping
    if (input === 'g') {
      setIsGroupedView((prev) => !prev);
      return;
    }

    // Kill
    if (input === 'x') {
      const selected = filteredPorts[selectedIndex];
      if (selected) {
        setKillTarget(selected);
      }
      return;
    }

    // Clipboard
    if (input === 'c') {
      void handleCopy('port');
      return;
    }

    if (input === 'C') {
      void handleCopy('pid');
      return;
    }

    if (input === 'y') {
      void handleCopy('row');
      return;
    }

    // Navigation
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

  // Grouped view rendering
  const groupedContent = useMemo(() => {
    if (!isGroupedView) return null;
    const groups = groupByPid(filteredPorts);
    return Array.from(groups.entries());
  }, [filteredPorts, isGroupedView]);

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

      {/* Status Bar */}
      <StatusBar
        message={statusMessage}
        type={statusType}
        onDismiss={() => setStatusMessage(null)}
      />

      {/* Change Log */}
      {changes.length > 0 && <ChangeLog changes={changes} />}

      {/* Search Bar */}
      <Box marginBottom={1} flexDirection="column">
        <Box borderStyle="single" borderColor={isFilterMode ? "cyan" : "magenta"} paddingX={1} width="100%">
          <Text>
            <Text color="cyanBright" bold> 🔍 SEARCH: </Text>
            <Text color="yellow">{filter}</Text>
            {isFilterMode ? <Text color="cyanBright">▋</Text> : null}
            {!isFilterMode && !filter ? <Text dimColor italic> Press / to filter (supports port:3000, pid:1234, proc:node)</Text> : null}
          </Text>
        </Box>
      </Box>

      {/* Main Content Title */}
      <Box marginBottom={0} justifyContent="space-between">
         <Text color="magentaBright" bold>
           📡 Active Port Inventory
           {isGroupedView ? ' (Grouped by PID)' : ''}
         </Text>
         <Text dimColor>
           Sort: {sortField} {sortDirection === 'asc' ? '▲' : '▼'}
         </Text>
      </Box>

      {/* Help Modal */}
      <HelpModal visible={isHelpVisible} />

      {/* Kill Confirmation */}
      {killTarget && (
        <KillConfirm
          port={killTarget}
          onConfirm={() => void handleKillConfirm()}
          onCancel={() => setKillTarget(null)}
        />
      )}

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

        {filteredPorts.length > 0 && !isGroupedView && (
          <Box flexDirection="row" gap={2}>
            <Box flexGrow={2}>
              <PortTable
                ports={filteredPorts}
                selectedIndex={selectedIndex}
                sortField={sortField}
                sortDirection={sortDirection}
                viewportStart={viewportStart}
                viewportSize={viewportSize}
              />
            </Box>
            <Box flexGrow={1} width={35}>
              <DetailPanel selectedPort={selectedPort} />
            </Box>
          </Box>
        )}

        {/* Grouped View */}
        {filteredPorts.length > 0 && isGroupedView && groupedContent && (
          <Box flexDirection="row" gap={2}>
            <Box flexGrow={2} flexDirection="column" borderStyle="single" borderColor="magenta">
              <Box paddingX={1} borderStyle="single" borderTop={false} borderLeft={false} borderRight={false} borderColor="magenta">
                <Text bold color="cyanBright">⚙️ PROCESS / PID</Text>
                <Box width={2} />
                <Text bold color="cyanBright">PORTS</Text>
              </Box>
              {groupedContent.map(([pid, entries]) => (
                <Box key={pid} flexDirection="column" paddingX={1} marginBottom={0}>
                  <Text bold color="yellowBright">
                    {entries[0]!.processName} <Text color="magentaBright">PID {pid}</Text>
                    <Text dimColor> ({entries.length} port{entries.length > 1 ? 's' : ''})</Text>
                  </Text>
                  {entries.map((entry, i) => (
                    <Text key={`${entry.port}-${i}`} color="white">
                      {'  '}{entry.protocol.toUpperCase()} {String(entry.port).padEnd(8)}{entry.address}
                      {entry.likelyService ? <Text dimColor> [{entry.likelyService}]</Text> : null}
                    </Text>
                  ))}
                </Box>
              ))}
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
          <Text backgroundColor="magenta" color="black" bold>s</Text><Text color="white">Sort</Text>
          <Text backgroundColor="magenta" color="black" bold>g</Text><Text color="white">Group</Text>
          <Text backgroundColor="magenta" color="black" bold>x</Text><Text color="white">Kill</Text>
          <Text backgroundColor="magenta" color="black" bold>c</Text><Text color="white">Copy</Text>
          <Text backgroundColor="magenta" color="black" bold>?</Text><Text color="white">Help</Text>
          <Text backgroundColor="magenta" color="black" bold>r</Text><Text color="white">Refresh</Text>
        </Box>
        <Box>
          <Text backgroundColor="magenta" color="black" bold>q</Text><Text color="white">Exit</Text>
        </Box>
      </Box>

    </Box>
  );
}
