import { describe, expect, test } from 'bun:test';
import { parseLsofListeningOutput } from './parser';
import { parseSsOutput } from './ss-parser';
import { parseNetstatOutput } from './windows-parser';

describe('parseLsofListeningOutput', () => {
  test('should parse standard IPv4 output', () => {
    const output = [
      'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME',
      'node    12345 user   22u  IPv4 0x1234      0t0  TCP 127.0.0.1:3000 (LISTEN)',
    ].join('\n');

    const result = parseLsofListeningOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      processName: 'node',
      pid: 12345,
      protocol: 'tcp',
      address: '127.0.0.1',
      port: 3000,
      state: 'LISTEN',
    });
  });

  test('should parse IPv6 output', () => {
    const output = [
      'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME',
      'nginx    5678 root   10u  IPv6 0xabcd      0t0  TCP [::1]:8080 (LISTEN)',
    ].join('\n');

    const result = parseLsofListeningOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0]!.address).toBe('[::1]');
    expect(result[0]!.port).toBe(8080);
    expect(result[0]!.processName).toBe('nginx');
  });

  test('should parse wildcard address (*)', () => {
    const output = [
      'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME',
      'postgres  777 pg     5u   IPv4 0x5678      0t0  TCP *:5432 (LISTEN)',
    ].join('\n');

    const result = parseLsofListeningOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0]!.address).toBe('*');
    expect(result[0]!.port).toBe(5432);
  });

  test('should handle long process names', () => {
    const output = [
      'COMMAND                PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME',
      'com.docker.backend   9999 user   15u  IPv4 0xdead      0t0  TCP 0.0.0.0:2375 (LISTEN)',
    ].join('\n');

    const result = parseLsofListeningOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0]!.processName).toBe('com.docker.backend');
  });

  test('should skip invalid lines gracefully', () => {
    const output = [
      'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME',
      'this is not a valid line',
      '',
      'short',
      'node    12345 user   22u  IPv4 0x1234      0t0  TCP 127.0.0.1:3000 (LISTEN)',
      'node    12345 user   23u  IPv4 0x1234      0t0  TCP 127.0.0.1:3001 (ESTABLISHED)',
    ].join('\n');

    const result = parseLsofListeningOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0]!.port).toBe(3000);
  });

  test('should handle multiple processes on the same port', () => {
    const output = [
      'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME',
      'node    11111 user   22u  IPv4 0x1234      0t0  TCP 127.0.0.1:3000 (LISTEN)',
      'node    22222 user   22u  IPv4 0x5678      0t0  TCP 0.0.0.0:3000 (LISTEN)',
    ].join('\n');

    const result = parseLsofListeningOutput(output);
    expect(result).toHaveLength(2);
    expect(result[0]!.pid).toBe(11111);
    expect(result[1]!.pid).toBe(22222);
  });

  test('should return empty array for empty output', () => {
    expect(parseLsofListeningOutput('')).toEqual([]);
    expect(parseLsofListeningOutput('\n')).toEqual([]);
  });

  test('should return empty array for header-only output', () => {
    const output = 'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME';
    expect(parseLsofListeningOutput(output)).toEqual([]);
  });

  test('should handle 0.0.0.0 address', () => {
    const output = [
      'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME',
      'redis    6379 user   5u   IPv4 0x1234      0t0  TCP 0.0.0.0:6379 (LISTEN)',
    ].join('\n');

    const result = parseLsofListeningOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0]!.address).toBe('0.0.0.0');
  });
});

describe('parseSsOutput', () => {
  test('should parse standard ss output', () => {
    const output = [
      'State  Recv-Q Send-Q  Local Address:Port  Peer Address:Port  Process',
      'LISTEN 0      128     0.0.0.0:22          0.0.0.0:*          users:(("sshd",pid=1234,fd=3))',
    ].join('\n');

    const result = parseSsOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0]!.port).toBe(22);
    expect(result[0]!.pid).toBe(1234);
    expect(result[0]!.processName).toBe('sshd');
  });

  test('should parse IPv6 ss output', () => {
    const output = [
      'State  Recv-Q Send-Q  Local Address:Port  Peer Address:Port  Process',
      'LISTEN 0      128     [::]:80             [::]:*             users:(("nginx",pid=5678,fd=6))',
    ].join('\n');

    const result = parseSsOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0]!.port).toBe(80);
    expect(result[0]!.processName).toBe('nginx');
  });

  test('should return empty for empty output', () => {
    expect(parseSsOutput('')).toEqual([]);
  });
});

describe('parseNetstatOutput', () => {
  test('should parse standard Windows netstat output', () => {
    const output = [
      '  Proto  Local Address          Foreign Address        State           PID',
      '  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       1068',
    ].join('\n');

    const result = parseNetstatOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0]!.port).toBe(135);
    expect(result[0]!.pid).toBe(1068);
  });

  test('should parse IPv6 Windows netstat output', () => {
    const output = [
      '  Proto  Local Address          Foreign Address        State           PID',
      '  TCP    [::]:445               [::]:0                 LISTENING       4',
    ].join('\n');

    const result = parseNetstatOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0]!.port).toBe(445);
  });

  test('should skip non-LISTENING entries', () => {
    const output = [
      '  Proto  Local Address          Foreign Address        State           PID',
      '  TCP    127.0.0.1:3000         127.0.0.1:49152        ESTABLISHED     1234',
      '  TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING       5678',
    ].join('\n');

    const result = parseNetstatOutput(output);
    expect(result).toHaveLength(1);
    expect(result[0]!.port).toBe(8080);
  });

  test('should return empty for empty output', () => {
    expect(parseNetstatOutput('')).toEqual([]);
  });
});
