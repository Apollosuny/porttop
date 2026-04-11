import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';

type Props = {
  onOpenDashboard: () => void;
  onOpenList: () => void;
};

const BANNER = `
  ____   ___  ____ _____ _____ ___  ____  
 |  _ \\ / _ \\|  _ \\_   _|_   _/ _ \\|  _ \\ 
 | |_) | | | | |_) || |   | || | | | |_) |
 |  __/| |_| |  _ < | |   | || |_| |  __/ 
 |_|    \\___/|_| \\_\\|_|   |_| \\___/|_|    
`;

export function HomeScreenApp({ onOpenDashboard, onOpenList }: Props) {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const menuItems = [
    { label: 'Open Dashboard', key: 'd', action: onOpenDashboard },
    { label: 'List Ports', key: 'l', action: onOpenList },
    { label: 'Quit Session', key: 'q', action: exit },
  ];

  useInput((input, key) => {
    const lowerInput = input.toLowerCase();
    if (lowerInput === 'q') {
      exit();
      return;
    }
    if (lowerInput === 'd') {
      onOpenDashboard();
      return;
    }
    if (lowerInput === 'l') {
      onOpenList();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
      return;
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
      return;
    }

    if (key.return) {
      menuItems[selectedIndex]?.action();
    }
  });

  return (
    <Box flexDirection='column' paddingX={2} paddingY={1}>
      {/* Header */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyanBright">{BANNER}</Text>
        <Box justifyContent="center">
           <Text color="magentaBright">═══ THE ULTIMATE PORT MONITORING TOOLKIT ═══</Text>
        </Box>
      </Box>

      {/* Welcome Card */}
      <Box borderStyle='single' borderColor="magenta" flexDirection='column' paddingX={2} marginBottom={1}>
        <Text color="cyanBright" bold>👋 WELCOME TO PORTTOP</Text>
        <Text color="white">
          The most aesthetic way to check which ports are running, inspect processes,
          and resolve network conflicts directly from your terminal.
        </Text>
      </Box>

      <Box flexDirection="row" gap={2}>
        {/* Commands Card */}
        <Box borderStyle='single' borderColor="magenta" flexDirection='column' paddingX={2} flexGrow={1}>
          <Text color="cyanBright" bold>⚡ AVAILABLE COMMANDS</Text>
          <Box flexDirection="column" marginTop={1}>
            <Text>• <Text color="yellowBright">porttop</Text>            <Text dimColor>Home screen</Text></Text>
            <Text>• <Text color="yellowBright">porttop dashboard</Text>  <Text dimColor>Live Dashboard</Text></Text>
            <Text>• <Text color="yellowBright">porttop list</Text>       <Text dimColor>List ports (--json/--csv/--watch)</Text></Text>
            <Text>• <Text color="yellowBright">porttop inspect</Text>    <Text dimColor>Port details (--json/--copy)</Text></Text>
            <Text>• <Text color="yellowBright">porttop check</Text>      <Text dimColor>Check port availability</Text></Text>
            <Text>• <Text color="yellowBright">porttop scan</Text>       <Text dimColor>Scan port range</Text></Text>
            <Text>• <Text color="yellowBright">porttop kill</Text>       <Text dimColor>Kill process on port</Text></Text>
            <Text>• <Text color="yellowBright">porttop free</Text>       <Text dimColor>Find free port</Text></Text>
          </Box>
        </Box>

        {/* Quick Start Card (Interactive) */}
        <Box borderStyle='single' borderColor="magenta" flexDirection='column' paddingX={1} width={35}>
          <Text color="cyanBright" bold>🚀 QUICK START</Text>
          <Box flexDirection="column" marginTop={1}>
            {menuItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <Box key={item.key}>
                  <Text
                    backgroundColor={isSelected ? 'cyan' : undefined}
                    color={isSelected ? 'black' : 'white'}
                    bold={isSelected}
                  >
                    {isSelected ? ' ▶ ' : '   '}
                    <Text color={isSelected ? 'black' : 'magentaBright'} bold>[{item.key.toUpperCase()}]</Text> {item.label}
                  </Text>
                </Box>

              );
            })}
          </Box>
        </Box>
      </Box>

      <Box marginTop={1} justifyContent="center">
        <Text dimColor>
          Use <Text color="cyanBright">↑↓</Text> and <Text color="cyanBright">Enter</Text> or press <Text color="magentaBright" bold>D/L/Q</Text>
        </Text>
      </Box>
    </Box>
  );
}
