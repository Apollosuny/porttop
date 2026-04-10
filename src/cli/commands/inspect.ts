import pc from 'picocolors';
import { getListeningPorts } from '../../core/services/ports-service';

export async function runInspectCommand(port: number) {
  const rows = await getListeningPorts();
  const matches = rows.filter((row) => row.port === port);

  if (matches.length === 0) {
    console.log(pc.yellow(`No listening process found on port ${port}.`));
    return;
  }

  for (const row of matches) {
    console.log(pc.bold(`Port ${row.port}`));
    console.log(`Protocol: ${row.protocol}`);
    console.log(`PID: ${row.pid}`);
    console.log(`Process: ${row.processName}`);
    console.log(`Address: ${row.address}`);
    console.log(`State: ${row.state ?? 'unknown'}`);
    console.log(`Command: ${row.command ?? 'N/A'}`);
    console.log('');
  }
}
