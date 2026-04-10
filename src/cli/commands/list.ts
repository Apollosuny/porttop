import pc from 'picocolors';
import { getListeningPorts } from '../../core/services/ports-service';

export async function runListCommand() {
  const rows = await getListeningPorts();

  if (rows.length === 0) {
    console.log(pc.yellow('No listening ports found.'));
    return;
  }

  console.log(
    [
      'PORT'.padEnd(8),
      'PROTO'.padEnd(8),
      'PID'.padEnd(10),
      'PROCESS'.padEnd(24),
      'ADDRESS',
    ].join(' '),
  );

  for (const row of rows) {
    console.log(
      [
        String(row.port).padEnd(8),
        row.protocol.padEnd(8),
        String(row.pid).padEnd(10),
        row.processName.padEnd(24),
        row.address,
      ].join(' '),
    );
  }
}
