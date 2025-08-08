#!/usr/bin/env node

import { spawn } from 'child_process';

const npxProc = spawn('npx', ['@kinhunt/coinpaprika-mcp@1.1.1'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';
let hasOutput = false;

npxProc.stdout.on('data', (data) => {
  stdout += data.toString();
  hasOutput = true;
  console.log('STDOUT:', data.toString());
});

npxProc.stderr.on('data', (data) => {
  stderr += data.toString();
  console.log('STDERR:', data.toString());
});

npxProc.on('close', (code) => {
  console.log(`\n=== Process closed with code: ${code} ===`);
  console.log(`Has output: ${hasOutput}`);
  console.log(`STDOUT length: ${stdout.length}`);
  console.log(`STDERR length: ${stderr.length}`);
  
  if (stdout.includes('get_coin_price')) {
    console.log('✅ SUCCESS: Tools found in npx output!');
  } else {
    console.log('❌ No tools found');
  }
  
  process.exit(0);
});

npxProc.on('error', (err) => {
  console.error('Process error:', err);
  process.exit(1);
});

// Send request after short delay
setTimeout(() => {
  const request = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  }) + '\n';
  
  console.log('Sending request:', request.trim());
  npxProc.stdin.write(request);
  
  // Kill after timeout
  setTimeout(() => {
    console.log('Killing process...');
    npxProc.kill('SIGTERM');
  }, 5000);
  
}, 2000);