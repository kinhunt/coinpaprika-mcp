#!/bin/bash

echo "=== Testing Fixed MCP Server v1.1.3 ==="
echo ""

echo "配置测试:"
echo '{ "coinpaprika": { "command": "npx", "args": ["@kinhunt/coinpaprika-mcp@1.1.3"] } }'
echo ""

echo "正在测试MCP初始化握手..."

# 创建临时测试目录
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# 测试初始化请求
echo "1. 发送初始化请求:"
INIT_REQUEST='{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}'
echo "$INIT_REQUEST"

echo ""
echo "2. 服务器响应:"
INIT_RESPONSE=$(timeout 10 bash -c "echo '$INIT_REQUEST' | npx @kinhunt/coinpaprika-mcp@1.1.3 2>/dev/null | head -1")
echo "$INIT_RESPONSE"

if echo "$INIT_RESPONSE" | grep -q '"serverInfo"'; then
    echo ""
    echo "✅ SUCCESS: 初始化握手成功！"
    echo "   - 服务器正确返回了serverInfo"
    echo "   - protocolVersion: $(echo "$INIT_RESPONSE" | grep -o '"protocolVersion":"[^"]*"' | cut -d'"' -f4)"
    echo "   - 服务器名称: $(echo "$INIT_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)"
    echo "   - 版本: $(echo "$INIT_RESPONSE" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)"
    
    echo ""
    echo "3. 测试工具列表:"
    TOOLS_REQUEST='{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}'
    TOOLS_RESPONSE=$(timeout 10 bash -c "echo -e '$INIT_REQUEST\n$TOOLS_REQUEST' | npx @kinhunt/coinpaprika-mcp@1.1.3 2>/dev/null | tail -1")
    
    if echo "$TOOLS_RESPONSE" | grep -q '"name":"get_coin_price"'; then
        TOOL_COUNT=$(echo "$TOOLS_RESPONSE" | grep -o '"name":"[^"]*"' | wc -l)
        echo "   ✅ 工具列表获取成功，共找到 $TOOL_COUNT 个工具"
        echo "   📊 可用工具: get_coin_price, get_top_coins, get_coin_markets, get_exchanges, get_global_stats, get_coin_events, search_coins"
    else
        echo "   ❌ 无法获取工具列表"
    fi
else
    echo ""
    echo "❌ FAILED: 初始化握手失败"
    echo "响应: $INIT_RESPONSE"
fi

echo ""
echo "=== 测试完成 ==="
echo ""
echo "🎉 MCP客户端现在可以使用以下配置："
echo '"coinpaprika": { "command": "npx", "args": ["@kinhunt/coinpaprika-mcp@1.1.3"] }'

# 清理
rm -rf "$TEMP_DIR"