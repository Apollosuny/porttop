import pc from 'picocolors';
import { getListeningPorts } from '../../core/services/ports-service';
import { getServiceName, isPublicBinding } from '../../core/services/common-services';
import { formatAsJson } from '../../core/services/export-service';

export async function runCheckCommand(port: number, options: { json?: boolean }) {
  const rows = await getListeningPorts({ services: true });
  const matches = rows.filter((row) => row.port === port);

  if (options.json) {
    console.log(
      JSON.stringify({
        port,
        available: matches.length === 0,
        processes: matches,
      }, null, 2),
    );
    process.exit(matches.length === 0 ? 0 : 1);
    return;
  }

  if (matches.length === 0) {
    console.log(pc.greenBright(`✓ Port ${port} is available.`));

    const service = getServiceName(port);
    if (service) {
      console.log(pc.dim(`  Common service: ${service}`));
    }

    process.exit(0);
  } else {
    console.log(pc.redBright(`✗ Port ${port} is occupied.`));
    console.log('');

    for (const row of matches) {
      console.log(pc.bold(`  Process: ${row.processName}`));
      console.log(`  PID:     ${row.pid}`);
      console.log(`  Proto:   ${row.protocol.toUpperCase()}`);
      console.log(`  Address: ${row.address}`);
      console.log(`  State:   ${row.state ?? 'unknown'}`);
      console.log(`  Command: ${row.command ?? 'N/A'}`);

      if (isPublicBinding(row.address)) {
        console.log(pc.yellowBright('  ⚠ Publicly bound (accessible from network)'));
      }

      console.log('');
    }

    console.log(pc.dim('  Fix: ') + pc.cyanBright(`porttop kill ${port}`));
    console.log(pc.dim('  Or:  ') + pc.cyanBright(`kill ${matches[0]!.pid}`));

    process.exit(1);
  }
}
