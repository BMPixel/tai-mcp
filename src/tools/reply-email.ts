import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { replyEmailSchema, type ReplyEmailParams, type ToolResponse } from '../types/tools.js';
import { ApiClient } from '../services/api-client.js';
import { Config } from '../types/tools.js';
import { logger } from '../utils/logger.js';
import { convertMarkdownToHtml, extractPlainText } from '../utils/html-to-markdown.js';

export function registerReplyEmailTool(server: McpServer, apiClient: ApiClient, config: Config): void {
  server.tool(
    'reply_email',
    'Reply to an email message from the assistant\'s mailbox with proper threading',
    replyEmailSchema.shape,
    async (params): Promise<ToolResponse> => {
      try {
        logger.info('Executing reply_email tool', { 
          message_id: params.message_id,
          subject: params.subject 
        });
        
        const validatedParams = replyEmailSchema.parse(params);
        
        // Determine content and format
        let htmlContent: string;
        
        if (validatedParams.html) {
          // Backward compatibility: use legacy html field directly
          htmlContent = validatedParams.html;
        } else if (validatedParams.text) {
          // Backward compatibility: treat text field as markdown
          htmlContent = convertMarkdownToHtml(validatedParams.text);
        } else if (validatedParams.content) {
          // Use new content field with format conversion
          const format = validatedParams.format || 'markdown';
          
          if (format === 'markdown') {
            htmlContent = convertMarkdownToHtml(validatedParams.content);
          } else if (format === 'html') {
            htmlContent = validatedParams.content;
          } else {
            throw new Error(`Invalid format: ${format}. Must be "markdown" or "html".`);
          }
        } else {
          // Default content
          htmlContent = '<p>This reply was sent via the TAI MCP Email Server.</p>';
        }
        
        // Prepare the reply request (API requires both text and html)
        const replyRequest = {
          text: extractPlainText(htmlContent),
          html: htmlContent,
          subject: validatedParams.subject
        };

        // Send the reply
        const result = await apiClient.replyToMessage(validatedParams.message_id, replyRequest);
        
        const successMessage = `Reply sent successfully!
Original Message ID: ${result.original_message_id}
Reply Message ID: ${result.messageId}
Subject: ${result.subject}
Timestamp: ${result.timestamp}

The reply includes proper email threading headers (In-Reply-To, References, Message-ID) that will be recognized by email clients for conversation grouping.`;

        logger.info('Reply sent successfully', { 
          replyMessageId: result.messageId,
          originalMessageId: result.original_message_id,
          subject: result.subject
        });

        return {
          content: [{
            type: "text",
            text: successMessage
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error('Failed to send reply', { 
          error: errorMessage,
          params 
        });
        
        return {
          content: [{
            type: "text",
            text: `Error sending reply: ${errorMessage}`
          }]
        };
      }
    }
  );
}