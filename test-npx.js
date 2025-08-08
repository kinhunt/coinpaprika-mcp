#!/usr/bin/env node
import { spawn } from 'child_process';

console.log('Testing npx @kinhunt/coinpaprika-mcp...');

const npx = spawn('npx', ['@kinhunt/coinpaprika-mcp@1.1.1'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

npx.stdout.on('data', (data) => {
  stdout += data.toString();
});

npx.stderr.on('data', (data) => {
  stderr += data.toString();
});

npx.on('close', (code) => {
  console.log(`\n--- Results ---`);
  console.log(`Exit code: ${code}`);
  console.log(`\nSTDOUT:`);
  console.log(stdout);
  console.log(`\nSTDERR:`);
  console.log(stderr);
});

// Send JSON-RPC request
setTimeout(() => {
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  };
  npx.stdin.write(JSON.stringify(request) + '\n');
  
  setTimeout(() => {
    npx.kill('SIGTERM');
  }, 3000);
}, 1000);