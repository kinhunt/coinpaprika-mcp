# Coinpaprika MCP Server

[![npm version](https://badge.fury.io/js/@kinhunt%2Fcoinpaprika-mcp.svg)](https://badge.fury.io/js/@kinhunt%2Fcoinpaprika-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that provides access to cryptocurrency market data using the [Coinpaprika API](https://api.coinpaprika.com/). This server enables Claude and other MCP-compatible clients to retrieve real-time cryptocurrency prices, market statistics, and related information.

## Features

🚀 **Real-time Cryptocurrency Data**
- Current prices and market data for 3000+ cryptocurrencies
- Top coins by market capitalization
- Market statistics and global crypto metrics
- Exchange listings and trading pairs
- Historical events and project information

🔧 **MCP Tools**
- `get_coin_price` - Get detailed price and market data for a specific cryptocurrency
- `get_top_coins` - Retrieve top cryptocurrencies by market cap or other criteria
- `get_coin_markets` - List markets and exchanges where a coin is traded
- `get_exchanges` - Get information about cryptocurrency exchanges
- `get_global_stats` - Fetch global cryptocurrency market statistics
- `get_coin_events` - Retrieve upcoming and past events for a cryptocurrency
- `search_coins` - Search for cryptocurrencies by name or symbol

🌐 **Proxy Support**
- Built-in support for HTTP/HTTPS proxy servers
- Configurable via environment variables
- Perfect for corporate networks or restricted environments

## Installation

### Using npx (Recommended)

The easiest way to use this MCP server is with `npx`:

```bash
npx @kinhunt/coinpaprika-mcp
```

### Global Installation

```bash
npm install -g @kinhunt/coinpaprika-mcp
```

### Local Installation

```bash
npm install @kinhunt/coinpaprika-mcp
```

## Usage

### Running the Server

#### Direct execution
```bash
npx @kinhunt/coinpaprika-mcp
```

#### With proxy support
```bash
PROXY_URL=http://localhost:9080 npx @kinhunt/coinpaprika-mcp
# or
HTTP_PROXY=http://localhost:9080 npx @kinhunt/coinpaprika-mcp
```

### MCP Client Configuration

#### Claude Desktop Configuration

To use this server with Claude Desktop, add the following configuration to your `claude_desktop_config.json` file:

**Location of config file:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "coinpaprika": {
      "command": "npx",
      "args": ["@kinhunt/coinpaprika-mcp"],
      "env": {
        "PROXY_URL": "http://localhost:9080"
      }
    }
  }
}
```

**For global installation:**
```json
{
  "mcpServers": {
    "coinpaprika": {
      "command": "coinpaprika-mcp"
    }
  }
}
```

**With proxy support:**
```json
{
  "mcpServers": {
    "coinpaprika": {
      "command": "npx",
      "args": ["@kinhunt/coinpaprika-mcp"],
      "env": {
        "PROXY_URL": "http://localhost:9080"
      }
    }
  }
}
```

#### Other MCP Clients

For other MCP clients that support the stdio transport, use:

```bash
coinpaprika-mcp
```

## Available Tools

### `get_coin_price`

Get current price and detailed market data for a specific cryptocurrency.

**Parameters:**
- `coinId` (string, required): Coin ID from Coinpaprika (e.g., "btc-bitcoin", "eth-ethereum")

**Example:**
```
Get the current price of Bitcoin
```

### `get_top_coins`

Retrieve top cryptocurrencies by market capitalization or other criteria.

**Parameters:**
- `limit` (number, optional): Number of coins to return (default: 10, max: 100)
- `sort` (string, optional): Sort criteria - "rank", "name", "price_usd", "volume_24h_usd", "market_cap_usd", etc.

**Example:**
```
Show me the top 20 cryptocurrencies by market cap
```

### `get_coin_markets`

Get markets and exchanges where a specific cryptocurrency is traded.

**Parameters:**
- `coinId` (string, required): Coin ID from Coinpaprika

**Example:**
```
Where can I trade Ethereum?
```

### `get_exchanges`

Get information about cryptocurrency exchanges.

**Example:**
```
Show me the top cryptocurrency exchanges
```

### `get_global_stats`

Fetch global cryptocurrency market statistics.

**Example:**
```
What's the current state of the crypto market?
```

### `get_coin_events`

Retrieve upcoming and past events for a cryptocurrency.

**Parameters:**
- `coinId` (string, required): Coin ID from Coinpaprika

**Example:**
```
What events are coming up for Bitcoin?
```

### `search_coins`

Search for cryptocurrencies by name or symbol.

**Parameters:**
- `query` (string, required): Search term (name or symbol)
- `limit` (number, optional): Number of results to return (default: 10)

**Example:**
```
Search for coins related to "ethereum"
```

## Environment Variables

### Proxy Configuration

- `PROXY_URL`: HTTP/HTTPS proxy URL (e.g., `http://localhost:9080`)
- `HTTP_PROXY`: Alternative proxy configuration (standard environment variable)

### Example Usage with Proxy

```bash
# Using PROXY_URL
PROXY_URL=http://proxy.company.com:8080 npx @kinhunt/coinpaprika-mcp

# Using HTTP_PROXY
HTTP_PROXY=http://proxy.company.com:8080 npx @kinhunt/coinpaprika-mcp
```

## API Information

This server uses the free tier of the [Coinpaprika API](https://api.coinpaprika.com/), which provides:

- ✅ **Free access** - No API key required
- ✅ **20,000 calls/month** - Generous rate limits
- ✅ **Real-time data** - Up-to-date market information
- ✅ **3000+ cryptocurrencies** - Comprehensive coverage
- ✅ **Global data** - Exchanges, markets, and statistics

For higher usage requirements, consider upgrading to a paid Coinpaprika plan.

## Development

### Building from Source

```bash
git clone https://github.com/kinhunt/coinpaprika-mcp.git
cd coinpaprika-mcp
npm install
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
# Test the server with a simple client
npx @modelcontextprotocol/inspector @kinhunt/coinpaprika-mcp
```

## Troubleshooting

### Common Issues

1. **Connection timeout behind proxy**
   - Make sure to set `PROXY_URL` or `HTTP_PROXY` environment variable
   - Verify your proxy settings and credentials

2. **Permission denied errors**
   - Try using `npx` instead of global installation
   - Check Node.js permissions in your system

3. **Module not found errors**
   - Ensure you're using Node.js 18 or higher
   - Try clearing npm cache: `npm cache clean --force`

### Debug Mode

Run with debug logging:

```bash
DEBUG=* npx @kinhunt/coinpaprika-mcp
```

## Examples

### Basic Usage with Claude

After configuring Claude Desktop, you can ask questions like:

- "What's the current price of Bitcoin?"
- "Show me the top 10 cryptocurrencies by market cap"
- "Where can I trade Ethereum?"
- "What's the total cryptocurrency market cap right now?"
- "Search for coins related to 'defi'"
- "What events are coming up for Cardano?"

### Example Responses

**Bitcoin Price Query:**
```
📈 Bitcoin (BTC)

Current Price: $43,250.123456 USD
Rank: #1
Market Cap: $847,234,567,890
24h Volume: $28,456,789,012

Price Changes:
• 1h: +0.25%
• 24h: +2.15%
• 7d: -1.87%

Supply:
• Circulating: 19,687,431
• Total: 19,687,431  
• Max: 21,000,000

Links:
• Website: https://bitcoin.org
• Explorer: https://blockchair.com/bitcoin

Last Updated: 2024-01-15T10:30:00Z
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Make your changes
5. Build the project: `npm run build`
6. Test your changes
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Coinpaprika](https://coinpaprika.com/) for providing the free cryptocurrency API
- [Anthropic](https://www.anthropic.com/) for creating the Model Context Protocol
- [Claude](https://claude.ai/) for MCP client support

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/) - Official MCP documentation
- [MCP Servers](https://github.com/modelcontextprotocol/servers) - Collection of MCP servers
- [Coinpaprika API](https://api.coinpaprika.com/) - Cryptocurrency API documentation

---

**Disclaimer**: This tool is for informational purposes only. Cryptocurrency investments carry risk, and you should do your own research before making any investment decisions.