#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('=== Testing MCP Protocol Handshake ===\n');

const mcpServer = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';
let requestId = 1;

mcpServer.stdout.on('data', (data) => {
  stdout += data.toString();
  console.log('SERVER RESPONSE:', data.toString());
});

mcpServer.stderr.on('data', (data) => {
  stderr += data.toString();
  console.log('SERVER ERROR:', data.toString());
});

mcpServer.on('close', (code) => {
  console.log(`\n=== Server closed with code: ${code} ===`);
  
  if (stdout.includes('"serverInfo"') && stdout.includes('"protocolVersion"')) {
    console.log('✅ SUCCESS: MCP initialization handshake working!');
  } else {
    console.log('❌ FAILED: No proper initialization response');
  }
  
  if (stdout.includes('"name":"get_coin_price"')) {
    const toolCount = (stdout.match(/"name":"[^"]+"/g) || []).length;
    console.log(`✅ SUCCESS: Found ${toolCount} tools`);
  } else {
    console.log('❌ FAILED: No tools found');
  }
  
  process.exit(0);
});

// Step 1: Send initialization request
setTimeout(() => {
  const initRequest = {
    jsonrpc: "2.0",
    id: requestId++,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  };
  
  console.log('SENDING INIT:', JSON.stringify(initRequest, null, 2));
  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // Step 2: Send tools list request after initialization
  setTimeout(() => {
    const toolsRequest = {
      jsonrpc: "2.0", 
      id: requestId++,
      method: "tools/list",
      params: {}
    };
    
    console.log('SENDING TOOLS REQUEST:', JSON.stringify(toolsRequest, null, 2));
    mcpServer.stdin.write(JSON.stringify(toolsRequest) + '\n');
    
    // Close after getting responses
    setTimeout(() => {
      mcpServer.kill('SIGTERM');
    }, 2000);
    
  }, 1000);
  
}, 500);