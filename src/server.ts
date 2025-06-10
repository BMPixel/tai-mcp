import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Config } from './types/tools.js';
import { ApiClient } from './services/api-client.js';
import { registerSendEmailTool } from './tools/send-email.js';
import { registerFetchEmailTool } from './tools/fetch-email.js';
import { registerListInboxTool } from './tools/list-inbox.js';
import { registerReplyEmailTool } from './tools/reply-email.js';
import { getInstanceEmail } from './utils/config.js';
import { logger } from './utils/logger.js';

export class McpEmailServer {
  private server: McpServer;
  private apiClient: ApiClient;

  constructor(private config: Config) {
    this.server = new McpServer({
      name: 'tai-mcp-email-server',
      version: '1.0.0'
    });
    
    this.apiClient = new ApiClient(config);
    this.setupTools();
    this.setupResources();
  }

  private setupTools(): void {
    // Register all MCP tools
    registerSendEmailTool(this.server, this.apiClient, this.config);
    registerFetchEmailTool(this.server, this.apiClient, this.config);
    registerListInboxTool(this.server, this.apiClient, this.config);
    registerReplyEmailTool(this.server, this.apiClient, this.config);
    
    logger.info('All MCP tools registered successfully');
  }

  private setupResources(): void {
    // Server information resource
    this.server.resource(
      'server-info',
      'tai-mcp://info',
      async (uri) => ({
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            name: 'TAI MCP Email Server',
            version: '1.0.0',
            description: 'Enables AI agents to interact with email through CF Mail Bridge API',
            instanceEmail: getInstanceEmail(this.config),
            configuration: {
              instance: this.config.instance,
              username: this.config.name,
              baseUrl: this.config.baseUrl,
              defaultRecipient: this.config.userEmail || 'Not configured',
              logLevel: this.config.logLevel
            },
            availableTools: [
              'send_email',
              'fetch_email', 
              'list_inbox',
              'reply_email'
            ],
            capabilities: {
              sendEmails: true,
              receiveEmails: true,
              markAsRead: true,
              listMessages: true,
              replyToEmails: true
            }
          }, null, 2)
        }]
      })
    );

    logger.info('Server resources configured');
  }

  async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      logger.info('TAI MCP Email Server started successfully', {
        instanceEmail: getInstanceEmail(this.config),
        baseUrl: this.config.baseUrl
      });
    } catch (error) {
      logger.error('Failed to start MCP server', { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await this.server.close();
      logger.info('TAI MCP Email Server stopped');
    } catch (error) {
      logger.error('Error stopping MCP server', { error });
      throw error;
    }
  }
}