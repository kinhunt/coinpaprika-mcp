#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as readline from 'readline';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { type AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface CoinPaprikaClient {
  getTickers(): Promise<any[]>;
  getCoinById(coinId: string): Promise<any>;
  getExchanges(): Promise<any[]>;
  getCoinMarkets(coinId: string): Promise<any[]>;
  getCoinEvents(coinId: string): Promise<any[]>;
  getGlobal(): Promise<any>;
}

class CoinPaprikaMCPServer {
  private server: Server;
  private apiClient: AxiosInstance;
  private coinPaprikaClient: CoinPaprikaClient;

  constructor() {
    this.server = new Server(
      {
        name: 'coinpaprika-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Setup HTTP client with optional proxy support
    const proxyUrl = process.env.PROXY_URL || process.env.HTTP_PROXY;
    const axiosConfig: any = {
      baseURL: 'https://api.coinpaprika.com/v1',
      timeout: 30000,
      headers: {
        'User-Agent': 'coinpaprika-mcp/1.0.0',
      },
    };

    // Add proxy support if proxy URL is provided
    if (proxyUrl) {
      console.error(`Using proxy: ${proxyUrl}`);
      axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
      axiosConfig.proxy = false; // Disable axios built-in proxy handling
    }

    this.apiClient = axios.create(axiosConfig);
    this.coinPaprikaClient = this.createCoinPaprikaClient();

    this.setupHandlers();
  }

  private createCoinPaprikaClient(): CoinPaprikaClient {
    return {
      getTickers: async () => {
        const response = await this.apiClient.get('/tickers');
        return response.data;
      },

      getCoinById: async (coinId: string) => {
        const response = await this.apiClient.get(`/coins/${coinId}`);
        return response.data;
      },

      getExchanges: async () => {
        const response = await this.apiClient.get('/exchanges');
        return response.data;
      },

      getCoinMarkets: async (coinId: string) => {
        const response = await this.apiClient.get(`/coins/${coinId}/markets`);
        return response.data;
      },

      getCoinEvents: async (coinId: string) => {
        const response = await this.apiClient.get(`/coins/${coinId}/events`);
        return response.data;
      },

      getGlobal: async () => {
        const response = await this.apiClient.get('/global');
        return response.data;
      },
    };
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_coin_price',
            description: 'Get current price and market data for a specific cryptocurrency',
            inputSchema: {
              type: 'object',
              properties: {
                coinId: {
                  type: 'string',
                  description: 'Coin ID (e.g., btc-bitcoin, eth-ethereum)',
                },
              },
              required: ['coinId'],
            },
          },
          {
            name: 'get_top_coins',
            description: 'Get top cryptocurrencies by market capitalization',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Number of coins to return (default: 10, max: 100)',
                  default: 10,
                },
                sort: {
                  type: 'string',
                  description: 'Sort by: rank, id, name, symbol, price_usd, price_btc, volume_24h_usd, market_cap_usd, circulating_supply, total_supply, max_supply, percent_change_1h, percent_change_24h, percent_change_7d',
                  default: 'rank',
                },
              },
            },
          },
          {
            name: 'get_coin_markets',
            description: 'Get markets for a specific cryptocurrency',
            inputSchema: {
              type: 'object',
              properties: {
                coinId: {
                  type: 'string',
                  description: 'Coin ID (e.g., btc-bitcoin)',
                },
              },
              required: ['coinId'],
            },
          },
          {
            name: 'get_exchanges',
            description: 'Get list of cryptocurrency exchanges',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_global_stats',
            description: 'Get global cryptocurrency market statistics',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_coin_events',
            description: 'Get events for a specific cryptocurrency',
            inputSchema: {
              type: 'object',
              properties: {
                coinId: {
                  type: 'string',
                  description: 'Coin ID (e.g., btc-bitcoin)',
                },
              },
              required: ['coinId'],
            },
          },
          {
            name: 'search_coins',
            description: 'Search for cryptocurrencies by name or symbol',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search term (name or symbol)',
                },
                limit: {
                  type: 'number',
                  description: 'Number of results to return (default: 10)',
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      try {
        const { name, arguments: args } = request.params;

        if (!args) {
          throw new Error('Arguments are required');
        }

        switch (name) {
          case 'get_coin_price':
            return await this.handleGetCoinPrice(args.coinId as string);
          
          case 'get_top_coins':
            return await this.handleGetTopCoins(args.limit as number, args.sort as string);
          
          case 'get_coin_markets':
            return await this.handleGetCoinMarkets(args.coinId as string);
          
          case 'get_exchanges':
            return await this.handleGetExchanges();
          
          case 'get_global_stats':
            return await this.handleGetGlobalStats();
          
          case 'get_coin_events':
            return await this.handleGetCoinEvents(args.coinId as string);
          
          case 'search_coins':
            return await this.handleSearchCoins(args.query as string, args.limit as number);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleGetCoinPrice(coinId: string) {
    const ticker = await this.apiClient.get(`/tickers/${coinId}`);
    const coin = await this.apiClient.get(`/coins/${coinId}`);
    
    const data = ticker.data;
    const coinInfo = coin.data;
    
    const result = {
      id: data.id,
      name: data.name,
      symbol: data.symbol,
      rank: data.rank,
      price_usd: data.quotes.USD.price,
      price_btc: data.quotes.USD.price_btc,
      volume_24h_usd: data.quotes.USD.volume_24h,
      market_cap_usd: data.quotes.USD.market_cap,
      percent_change_1h: data.quotes.USD.percent_change_1h,
      percent_change_24h: data.quotes.USD.percent_change_24h,
      percent_change_7d: data.quotes.USD.percent_change_7d,
      circulating_supply: data.circulating_supply,
      total_supply: data.total_supply,
      max_supply: data.max_supply,
      description: coinInfo.description,
      website: coinInfo.links?.website?.[0],
      explorer: coinInfo.links?.explorer?.[0],
      last_updated: data.last_updated,
    };

    return {
      content: [
        {
          type: 'text',
          text: `📈 **${result.name} (${result.symbol})**

**Current Price:** $${result.price_usd?.toFixed(6)} USD
**Rank:** #${result.rank}
**Market Cap:** $${result.market_cap_usd?.toLocaleString()}
**24h Volume:** $${result.volume_24h_usd?.toLocaleString()}

**Price Changes:**
• 1h: ${result.percent_change_1h?.toFixed(2)}%
• 24h: ${result.percent_change_24h?.toFixed(2)}%
• 7d: ${result.percent_change_7d?.toFixed(2)}%

**Supply:**
• Circulating: ${result.circulating_supply?.toLocaleString()}
• Total: ${result.total_supply?.toLocaleString()}
• Max: ${result.max_supply?.toLocaleString() || 'N/A'}

**Links:**
• Website: ${result.website || 'N/A'}
• Explorer: ${result.explorer || 'N/A'}

*Last Updated: ${result.last_updated}*`,
        },
      ],
    };
  }

  private async handleGetTopCoins(limit: number = 10, sort: string = 'rank') {
    const params: any = {};
    if (limit) params.limit = Math.min(limit, 100);
    if (sort) params.sort = sort;

    const response = await this.apiClient.get('/tickers', { params });
    const coins = response.data;

    let result = `📊 **Top ${coins.length} Cryptocurrencies**\n\n`;
    
    coins.forEach((coin: any, index: number) => {
      result += `**${index + 1}. ${coin.name} (${coin.symbol})**\n`;
      result += `   💰 $${coin.quotes.USD.price?.toFixed(6)} USD\n`;
      result += `   📈 24h: ${coin.quotes.USD.percent_change_24h?.toFixed(2)}%\n`;
      result += `   🏆 Market Cap: $${coin.quotes.USD.market_cap?.toLocaleString()}\n\n`;
    });

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private async handleGetCoinMarkets(coinId: string) {
    const markets = await this.coinPaprikaClient.getCoinMarkets(coinId);
    
    if (!markets.length) {
      return {
        content: [
          {
            type: 'text',
            text: `No markets found for ${coinId}`,
          },
        ],
      };
    }

    let result = `🏪 **Markets for ${coinId.toUpperCase()}**\n\n`;
    
    markets.slice(0, 10).forEach((market: any, index: number) => {
      result += `**${index + 1}. ${market.exchange_name}**\n`;
      result += `   💰 Price: $${market.quotes?.USD?.price?.toFixed(6)} USD\n`;
      result += `   📊 Volume: $${market.quotes?.USD?.volume_24h?.toLocaleString()}\n`;
      result += `   🔗 Pair: ${market.pair}\n\n`;
    });

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private async handleGetExchanges() {
    const exchanges = await this.coinPaprikaClient.getExchanges();
    
    let result = `🏪 **Top Cryptocurrency Exchanges**\n\n`;
    
    exchanges.slice(0, 15).forEach((exchange: any, index: number) => {
      result += `**${index + 1}. ${exchange.name}**\n`;
      result += `   📊 24h Volume: $${exchange.quotes?.USD?.volume_24h?.toLocaleString() || 'N/A'}\n`;
      result += `   🌐 Website: ${exchange.links?.website?.[0] || 'N/A'}\n\n`;
    });

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private async handleGetGlobalStats() {
    const global = await this.coinPaprikaClient.getGlobal();
    
    const result = `🌍 **Global Cryptocurrency Market Statistics**

**Market Capitalization:** $${global.market_cap_usd?.toLocaleString()} USD
**24h Volume:** $${global.volume_24h_usd?.toLocaleString()} USD
**Bitcoin Dominance:** ${global.bitcoin_dominance_percentage?.toFixed(2)}%
**Active Cryptocurrencies:** ${global.cryptocurrencies_number?.toLocaleString()}
**Active Exchanges:** ${global.exchanges_number?.toLocaleString()}
**Active Markets:** ${global.market_cap_ath_value?.toLocaleString()}

**Market Cap Change 24h:** ${global.market_cap_change_24h?.toFixed(2)}%
**Volume Change 24h:** ${global.volume_24h_change_24h?.toFixed(2)}%

*Last Updated: ${global.last_updated}*`;

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private async handleGetCoinEvents(coinId: string) {
    const events = await this.coinPaprikaClient.getCoinEvents(coinId);
    
    if (!events.length) {
      return {
        content: [
          {
            type: 'text',
            text: `No events found for ${coinId}`,
          },
        ],
      };
    }

    let result = `📅 **Events for ${coinId.toUpperCase()}**\n\n`;
    
    events.slice(0, 10).forEach((event: any, index: number) => {
      result += `**${index + 1}. ${event.name}**\n`;
      result += `   📅 Date: ${event.date || 'TBD'}\n`;
      result += `   📝 Description: ${event.description || 'No description'}\n`;
      result += `   🔗 Link: ${event.link || 'N/A'}\n\n`;
    });

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private async handleSearchCoins(query: string, limit: number = 10) {
    // Since CoinPaprika doesn't have a direct search endpoint, we'll get all tickers and filter
    const tickers = await this.coinPaprikaClient.getTickers();
    
    const searchResults = tickers.filter((coin: any) =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase()) ||
      coin.id.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);

    if (!searchResults.length) {
      return {
        content: [
          {
            type: 'text',
            text: `No coins found for query: "${query}"`,
          },
        ],
      };
    }

    let result = `🔍 **Search Results for "${query}"**\n\n`;
    
    searchResults.forEach((coin: any, index: number) => {
      result += `**${index + 1}. ${coin.name} (${coin.symbol})**\n`;
      result += `   🆔 ID: ${coin.id}\n`;
      result += `   💰 Price: $${coin.quotes.USD.price?.toFixed(6)} USD\n`;
      result += `   🏆 Rank: #${coin.rank}\n\n`;
    });

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  async run() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('Coinpaprika MCP Server running on stdio');
    // Keep the server running by listening to stdin end event
    process.stdin.on('end', () => {
      // Do nothing, just keep the process alive
    });
  }
}

// Main execution
async function main() {
  const server = new CoinPaprikaMCPServer();
  await server.run();
}

// Check if this is the main module (ES module equivalent)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
  });
}