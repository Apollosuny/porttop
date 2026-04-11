import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';

type Props = {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss?: () => void;
};

export function StatusBar({ message, type = 'info', duration = 3000, onDismiss }: Props) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!visible || !message) return null;

  const colorMap = {
    success: 'greenBright' as const,
    error: 'redBright' as const,
    info: 'cyanBright' as const,
  };

  const iconMap = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
  };

  return (
    <Box paddingX={1} marginY={0}>
      <Text color={colorMap[type]} bold>
        {iconMap[type]} {message}
      </Text>
    </Box>
  );
}
