import { spawn } from 'child_process';

const mcp = spawn('npx', ['@kinhunt/coinpaprika-mcp@latest']);

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
}, 2000);

