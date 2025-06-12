import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { fetchEmailSchema, type FetchEmailParams, type ToolResponse } from '../types/tools.js';
import { ApiClient } from '../services/api-client.js';
import { Config } from '../types/tools.js';
import { getInstanceEmail } from '../utils/config.js';
import { convertHtmlToMarkdown } from '../utils/html-to-markdown.js';
import { logger } from '../utils/logger.js';

export function registerFetchEmailTool(server: McpServer, apiClient: ApiClient, config: Config): void {
  server.tool(
    'fetch_email',
    'Retrieve and mark as read the oldest unread email from the assistant\'s mailbox',
    fetchEmailSchema.shape,
    async (params): Promise<ToolResponse> => {
      try {
        logger.info('Executing fetch_email tool', { params });
        
        const validatedParams = fetchEmailSchema.parse(params);
        const instanceEmail = getInstanceEmail(config);

        let message;

        if (validatedParams.email_id) {
          // Fetch specific email by ID
          logger.debug('Fetching specific email', { emailId: validatedParams.email_id });
          message = await apiClient.fetchMessageById(validatedParams.email_id);
          
          // Verify the email is addressed to our instance
          if (message.to !== instanceEmail) {
            throw new Error(`Email ${validatedParams.email_id} is not addressed to ${instanceEmail}`);
          }
        } else {
          // Fetch oldest unread email
          logger.debug('Fetching oldest unread email', { instanceEmail });
          
          // Since show_read parameter doesn't work in the API, we need to fetch more messages
          // and filter client-side to find unread ones
          const messages = await apiClient.fetchMessages({
            prefix: config.instance,
            limit: 50, // Fetch more messages to find unread ones
            offset: 0
          });

          if (!messages.messages || messages.messages.length === 0) {
            return {
              content: [{
                type: "text",
                text: `No emails found for ${instanceEmail}`
              }]
            };
          }

          // Filter for unread messages (client-side filtering since API parameter doesn't work)
          const unreadMessages = messages.messages.filter(msg => !msg.is_read);
          
          if (unreadMessages.length === 0) {
            return {
              content: [{
                type: "text",
                text: `No unread emails found for ${instanceEmail}`
              }]
            };
          }

          // Get the oldest unread message (they should be sorted by received_at)
          message = unreadMessages[unreadMessages.length - 1];
          logger.debug('Found unread email', { messageId: message.id, subject: message.subject });
        }

        // Mark the message as read
        await apiClient.markAsRead(message.id.toString());
        
        // Convert HTML to markdown if available
        let bodyContent = '';
        if (message.body_html) {
          bodyContent = convertHtmlToMarkdown(message.body_html);
        } else if (message.body_text) {
          bodyContent = message.body_text;
        } else {
          bodyContent = '(No content)';
        }

        // Format the response
        const emailContent = `From: ${message.from}
To: ${message.to}
Subject: ${message.subject || '(No subject)'}
Date: ${message.received_at}
ID: ${message.id}
Status: ${message.is_read ? 'Read' : 'Unread'}

---

${bodyContent}`;

        logger.info('Email fetched and marked as read', { 
          messageId: message.id,
          from: message.from,
          subject: message.subject
        });

        return {
          content: [{
            type: "text",
            text: emailContent
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error('Failed to fetch email', { 
          error: errorMessage,
          params 
        });
        
        return {
          content: [{
            type: "text",
            text: `Error fetching email: ${errorMessage}`
          }]
        };
      }
    }
  );
}