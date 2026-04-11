import pc from 'picocolors';
import { getListeningPorts } from '../../core/services/ports-service';
import { isPublicBinding, getBindingLabel } from '../../core/services/common-services';
import { copyToClipboard } from '../../core/services/clipboard-service';

type InspectOptions = {
  json?: boolean;
  copy?: string;
};

export async function runInspectCommand(port: number, options: InspectOptions = {}) {
  const rows = await getListeningPorts({ services: true, docker: true, resources: true });
  const matches = rows.filter((row) => row.port === port);

  if (matches.length === 0) {
    if (options.json) {
      console.log(JSON.stringify({ port, found: false, processes: [] }, null, 2));
    } else {
      console.log(pc.yellow(`No listening process found on port ${port}.`));
    }
    return;
  }

  // Handle --copy
  if (options.copy) {
    const first = matches[0]!;
    let value = '';
    if (options.copy === 'pid') value = String(first.pid);
    else if (options.copy === 'port') value = String(first.port);
    else {
      console.error(pc.redBright(`Invalid --copy value. Use: pid, port`));
      process.exit(2);
      return;
    }

    const result = await copyToClipboard(value);
    if (result.success) {
      console.log(pc.greenBright(`✓ Copied ${options.copy}: ${value}`));
    } else {
      console.log(pc.yellowBright(`Clipboard unavailable. Value: ${value}`));
    }
    return;
  }

  if (options.json) {
    console.log(JSON.stringify({ port, found: true, processes: matches }, null, 2));
    return;
  }

  for (const row of matches) {
    console.log(pc.bold(`Port ${row.port}`));
    console.log(`  Protocol:  ${row.protocol.toUpperCase()}`);
    console.log(`  PID:       ${row.pid}`);
    console.log(`  Process:   ${row.processName}`);
    console.log(`  Address:   ${row.address}`);
    console.log(`  State:     ${row.state ?? 'unknown'}`);
    console.log(`  Command:   ${row.command ?? 'N/A'}`);

    if (row.likelyService) {
      console.log(`  Service:   ${pc.cyanBright(row.likelyService)}`);
    }

    // Docker info
    if (row.containerName) {
      console.log(`  Container: ${pc.magentaBright(row.containerName)}`);
      console.log(`  Image:     ${pc.dim(row.containerImage ?? 'N/A')}`);
    }

    // Resource usage
    if (row.cpu !== undefined) {
      const cpuColor = row.cpu > 50 ? pc.redBright : row.cpu > 20 ? pc.yellowBright : pc.greenBright;
      console.log(`  CPU:       ${cpuColor(row.cpu.toFixed(1) + '%')}`);
    }
    if (row.memory !== undefined) {
      console.log(`  Memory:    ${row.memory.toFixed(1)}%`);
    }

    // Binding warning
    const bindLabel = getBindingLabel(row.address);
    if (isPublicBinding(row.address)) {
      console.log(pc.yellowBright(`  ⚠ Binding:  ${bindLabel} — accessible from network`));
    } else {
      console.log(pc.greenBright(`  ✓ Binding:  ${bindLabel}`));
    }

    console.log('');
  }

  // Fix suggestion
  console.log(pc.dim('Quick actions:'));
  console.log(pc.dim('  Kill:  ') + pc.cyanBright(`porttop kill ${port}`));
  console.log(pc.dim('  Copy:  ') + pc.cyanBright(`porttop inspect ${port} --copy pid`));
}
