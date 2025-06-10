import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { replyEmailSchema, type ReplyEmailParams, type ToolResponse } from '../types/tools.js';
import { ApiClient } from '../services/api-client.js';
import { Config } from '../types/tools.js';
import { logger } from '../utils/logger.js';

export function registerReplyEmailTool(server: McpServer, apiClient: ApiClient, config: Config): void {
  server.tool(
    'reply_email',
    'Reply to an email message with proper threading and email client compatibility',
    replyEmailSchema.shape,
    async (params): Promise<ToolResponse> => {
      try {
        logger.info('Executing reply_email tool', { 
          message_id: params.message_id,
          subject: params.subject 
        });
        
        const validatedParams = replyEmailSchema.parse(params);
        
        // Prepare the reply request
        const replyRequest = {
          text: validatedParams.text,
          html: validatedParams.html,
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