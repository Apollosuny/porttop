import { render } from 'ink';
import { PortDashboardApp } from '../../tui/app';

export async function runDashboardCommand() {
  render(<PortDashboardApp />);
}
