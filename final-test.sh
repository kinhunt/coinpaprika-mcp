#!/bin/bash

echo "=== Testing npx @kinhunt/coinpaprika-mcp@1.1.1 ==="

# Create request
REQUEST='{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'

echo "Sending request: $REQUEST"
echo ""

# Run the command and capture output
OUTPUT=$(timeout 10 bash -c "echo '$REQUEST' | npx @kinhunt/coinpaprika-mcp@1.1.1" 2>&1)

echo "=== Output ==="
echo "$OUTPUT"
echo ""

# Check if we got tools in response
if echo "$OUTPUT" | grep -q '"name":"get_coin_price"'; then
    echo "✅ SUCCESS: Found tools in response!"
    TOOL_COUNT=$(echo "$OUTPUT" | grep -o '"name":"[^"]*"' | wc -l)
    echo "   Found $TOOL_COUNT tools"
else
    echo "❌ FAILED: No tools found in response"
fi

echo ""
echo "=== Test completed ==="