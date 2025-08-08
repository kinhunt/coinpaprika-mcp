#!/bin/bash

echo "=== Testing npx @kinhunt/coinpaprika-mcp@1.1.2 ==="

REQUEST='{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'

echo "Sending request: $REQUEST"
echo ""

# Test with timeout and capture all output
echo "Running: echo '$REQUEST' | npx @kinhunt/coinpaprika-mcp@1.1.2"
OUTPUT=$(timeout 15 bash -c "echo '$REQUEST' | npx @kinhunt/coinpaprika-mcp@1.1.2 2>&1")
EXITCODE=$?

echo "=== Output ==="
echo "$OUTPUT"
echo ""
echo "Exit code: $EXITCODE"

# Check for success indicators
if echo "$OUTPUT" | grep -q '"result"'; then
    echo "✅ SUCCESS: Got JSON-RPC result!"
    if echo "$OUTPUT" | grep -q '"name":"get_coin_price"'; then
        TOOL_COUNT=$(echo "$OUTPUT" | grep -o '"name":"[^"]*"' | wc -l)
        echo "✅ Found $TOOL_COUNT tools in response"
    else
        echo "⚠️  Result found but no tools detected"
    fi
else
    echo "❌ No JSON-RPC result found"
fi