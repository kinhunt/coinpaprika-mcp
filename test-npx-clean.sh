#!/bin/bash

echo "Testing npx @kinhunt/coinpaprika-mcp@1.1.1..."

# Create a temporary directory for clean testing
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo "Working in: $PWD"

# Create test request
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' > request.json

echo "Request content:"
cat request.json

echo -e "\n--- Running npx command ---"
timeout 10 npx @kinhunt/coinpaprika-mcp@1.1.1 < request.json 2>&1

echo -e "\n--- Test completed ---"

# Clean up
rm -rf "$TEMP_DIR"