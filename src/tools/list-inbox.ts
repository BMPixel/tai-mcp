import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listInboxSchema, type ListInboxParams, type ToolResponse } from '../types/tools.js';
import { ApiClient } from '../services/api-client.js';
import { Config } from '../types/tools.js';
import { getInstanceEmail } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export function registerListInboxTool(server: McpServer, apiClient: ApiClient, config: Config): void {
  server.tool(
    'list_inbox',
    'List recent emails in the assistant\'s inbox',
    listInboxSchema.shape,
    async (params): Promise<ToolResponse> => {
      try {
        logger.info('Executing list_inbox tool', { params });
        
        const validatedParams = listInboxSchema.parse(params);
        const instanceEmail = getInstanceEmail(config);

        // Fetch messages with the specified parameters
        // Note: show_read parameter doesn't work in the API, so we fetch more and filter client-side
        const fetchLimit = validatedParams.show_read === false ? 100 : validatedParams.limit; // Fetch more if filtering needed
        const messages = await apiClient.fetchMessages({
          prefix: config.instance,
          limit: fetchLimit,
          offset: validatedParams.offset
        });

        if (!messages.messages || messages.messages.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No emails found for ${instanceEmail}`
            }]
          };
        }

        // Client-side filtering since API show_read parameter doesn't work
        let filteredMessages = messages.messages;
        if (validatedParams.show_read === false) {
          filteredMessages = messages.messages.filter(msg => !msg.is_read);
          // Apply limit after filtering
          filteredMessages = filteredMessages.slice(0, validatedParams.limit);
          
          if (filteredMessages.length === 0) {
            return {
              content: [{
                type: "text",
                text: `No unread emails found for ${instanceEmail}`
              }]
            };
          }
        }

        // Format the email list as a markdown table
        const tableHeader = `# Email Inbox (${instanceEmail})

| ID | From | Subject | Date | Status |
|---|---|---|---|---|`;

        const tableRows = filteredMessages.map(msg => {
          const subject = (msg.subject || '(No subject)').substring(0, 50);
          const from = msg.from.substring(0, 30);
          const date = new Date(msg.received_at).toLocaleString();
          const status = msg.is_read ? '✓ Read' : '✉ Unread';
          
          return `| ${msg.id} | ${from} | ${subject} | ${date} | ${status} |`;
        }).join('\n');

        const filteredSuffix = validatedParams.show_read === false ? ' unread' : '';
        const summary = `\nShowing ${filteredMessages.length}${filteredSuffix} of ${messages.count} total emails`;
        const pagination = messages.has_more ? '\n\n*Use offset parameter to load more emails*' : '';

        const inboxContent = `${tableHeader}\n${tableRows}${summary}${pagination}`;

        logger.info('Email list retrieved successfully', { 
          filtered: filteredMessages.length,
          total: messages.count,
          showRead: validatedParams.show_read,
          hasMore: messages.has_more
        });

        return {
          content: [{
            type: "text",
            text: inboxContent
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error('Failed to list inbox', { 
          error: errorMessage,
          params 
        });
        
        return {
          content: [{
            type: "text",
            text: `Error listing inbox: ${errorMessage}`
          }]
        };
      }
    }
  );
}