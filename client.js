import { spawn } from 'child_process';

const mcp = spawn('node', ['build/index.js']);

mcp.stdout.on('data', (data) => {
  console.log(`MCP Server stdout: ${data.toString()}`);
});

mcp.stderr.on('data', (data) => {
  console.error(`MCP Server stderr: ${data.toString()}`);
});

mcp.on('close', (code) => {
  console.log(`MCP Server exited with code ${code}`);
});

mcp.on('error', (err) => {
  console.error(`Failed to start MCP Server process: ${err}`);
});

mcp.on('exit', (code, signal) => {
  console.log(`MCP Server process exited with code ${code} and signal ${signal}`);
});

// Send a ListTools request after a short delay to allow server to initialize
setTimeout(() => {
  const request = {
    mcp_version: '1.0',
    request_id: '123',
    type: 'ListTools',
    params: {},
  };
  if (mcp.stdin.writable) {
    mcp.stdin.write(JSON.stringify(request) + '\n');
    mcp.stdin.end();
  } else {
    console.error('MCP Server stdin not writable.');
  }
}, 5000);