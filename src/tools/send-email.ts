import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { sendEmailSchema, type SendEmailParams, type ToolResponse } from '../types/tools.js';
import { ApiClient } from '../services/api-client.js';
import { Config } from '../types/tools.js';
import { logger } from '../utils/logger.js';

export function registerSendEmailTool(server: McpServer, apiClient: ApiClient, config: Config): void {
  server.tool(
    'send_email',
    'Send an email through the CF Mail Bridge API',
    sendEmailSchema.shape,
    async (params): Promise<ToolResponse> => {
      try {
        logger.info('Executing send_email tool', { params });
        
        const validatedParams = sendEmailSchema.parse(params);
        
        // Prepare the email request
        const emailRequest = {
          to: validatedParams.to || config.userEmail || '',
          from: `${config.instance}.${config.name}@tai.chat`,
          subject: validatedParams.subject || 'Email from CF Mail Bridge',
          html: validatedParams.html || '<p>This email was sent via the TAI MCP Email Server.</p>'
        };

        // Validate that we have a recipient
        if (!emailRequest.to) {
          throw new Error('No recipient specified. Provide "to" parameter or set USEREMAIL environment variable.');
        }

        // Send the email
        const result = await apiClient.sendEmail(emailRequest);
        
        const successMessage = `Email sent successfully to ${result.to} with subject: "${result.subject}"\nMessage ID: ${result.messageId}\nTimestamp: ${result.timestamp}`;

        logger.info('Email sent successfully', { 
          messageId: result.messageId, 
          to: result.to,
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
        logger.error('Failed to send email', { 
          error: errorMessage,
          params 
        });
        
        return {
          content: [{
            type: "text",
            text: `Error sending email: ${errorMessage}`
          }]
        };
      }
    }
  );
}