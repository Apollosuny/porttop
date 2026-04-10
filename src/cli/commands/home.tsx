import { render } from 'ink';
import React from 'react';
import { RootApp } from '../../tui/root';

export async function runHomeCommand() {
  render(<RootApp />);
}
