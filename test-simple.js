#!/usr/bin/env node

import { execSync } from 'child_process';

try {
  console.log('Testing npx @kinhunt/coinpaprika-mcp...');
  
  // First test if npx can find and execute the package
  const result = execSync('echo \'{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}\' | timeout 5 npx @kinhunt/coinpaprika-mcp@1.1.1', {
    encoding: 'utf8',
    timeout: 10000
  });
  
  console.log('SUCCESS! npx execution worked:');
  console.log(result);
  
} catch (error) {
  console.log('Error details:');
  console.log('stdout:', error.stdout);
  console.log('stderr:', error.stderr);
  console.log('status:', error.status);
}