import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerReplyEmailTool } from '../../../src/tools/reply-email.js';
import { ApiClient } from '../../../src/services/api-client.js';
import { Config } from '../../../src/types/tools.js';

// Mock the dependencies
jest.mock('../../../src/services/api-client.js');
jest.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Reply Email Tool', () => {
  let mockServer: McpServer;
  let mockApiClient: jest.Mocked<ApiClient>;
  let mockConfig: Config;
  let toolHandler: any;

  beforeEach(() => {
    // Create mocks
    mockServer = {
      tool: jest.fn()
    } as any;

    mockApiClient = {
      replyToMessage: jest.fn()
    } as any;

    mockConfig = {
      name: 'testuser',
      password: 'testpass',
      instance: 'testinstance',
      userEmail: 'test@example.com',
      logLevel: 'info',
      apiTimeout: 30000,
      pollInterval: 5000,
      baseUrl: 'https://tai.chat'
    } as Config;

    // Register the tool and capture the handler
    registerReplyEmailTool(mockServer, mockApiClient, mockConfig);
    toolHandler = (mockServer.tool as jest.Mock).mock.calls[0][3];
  });

  describe('New Format Field Implementation (TDD - these should pass after implementation)', () => {
    it('should reply with markdown content converted to HTML', async () => {
      const mockResponse = {
        messageId: 'reply-message-id',
        original_message_id: 123,
        subject: 'Re: Original Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.replyToMessage.mockResolvedValue(mockResponse);

      const params = {
        message_id: '123',
        content: '# Reply\n\nThis is a **markdown** reply with some formatting.',
        format: 'markdown'
      };

      const result = await toolHandler(params);

      // Should convert markdown to HTML and send it
      expect(mockApiClient.replyToMessage).toHaveBeenCalledWith('123', {
        html: expect.stringContaining('<h1>Reply</h1>')
      });

      expect(mockApiClient.replyToMessage).toHaveBeenCalledWith('123', {
        html: expect.stringContaining('<strong>markdown</strong>')
      });

      expect(result.content[0].text).toContain('Reply sent successfully');
      expect(result.content[0].text).toContain('reply-message-id');
    });

    it('should default to markdown format when not specified', async () => {
      const mockResponse = {
        messageId: 'reply-message-id',
        original_message_id: 123,
        subject: 'Re: Original Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.replyToMessage.mockResolvedValue(mockResponse);

      const params = {
        message_id: '123',
        content: '## Thank you\n\nI received your message.'
      };

      const result = await toolHandler(params);

      // Should convert markdown to HTML by default
      expect(mockApiClient.replyToMessage).toHaveBeenCalledWith('123', {
        html: expect.stringContaining('<h2>Thank you</h2>')
      });
    });

    it('should send HTML directly when format is "html"', async () => {
      const mockResponse = {
        messageId: 'reply-message-id',
        original_message_id: 123,
        subject: 'Re: Original Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.replyToMessage.mockResolvedValue(mockResponse);

      const params = {
        message_id: '123',
        content: '<h2>HTML Reply</h2><p>This is <em>HTML</em> content.</p>',
        format: 'html',
        subject: 'Custom Reply Subject'
      };

      const result = await toolHandler(params);

      // Should pass HTML through directly
      expect(mockApiClient.replyToMessage).toHaveBeenCalledWith('123', {
        html: '<h2>HTML Reply</h2><p>This is <em>HTML</em> content.</p>',
        subject: 'Custom Reply Subject'
      });
    });

    it('should validate format field accepts only markdown or html', async () => {
      const params = {
        message_id: '123',
        content: 'Test reply content',
        format: 'invalid-format'
      };

      const result = await toolHandler(params);

      // Should return error for invalid format
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('Invalid format');
    });

    it('should handle complex markdown with lists, links, and code blocks', async () => {
      const mockResponse = {
        messageId: 'reply-message-id',
        original_message_id: 123,
        subject: 'Re: Technical Discussion',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.replyToMessage.mockResolvedValue(mockResponse);

      const complexMarkdown = `# Response to Technical Discussion

## Analysis

I've reviewed your proposal and here are my thoughts:

- **Architecture**: Looks solid overall
- **Performance**: Some concerns about scalability
- **Security**: Need to add authentication

### Code Suggestions

\`\`\`typescript
interface EmailConfig {
  baseUrl: string;
  timeout: number;
}
\`\`\`

Please see [the documentation](https://docs.example.com) for more details.

> Remember: "Premature optimization is the root of all evil."`;

      const params = {
        message_id: '123',
        content: complexMarkdown,
        format: 'markdown',
        subject: 'Technical Review Complete'
      };

      const result = await toolHandler(params);

      // Should convert all markdown elements
      expect(mockApiClient.replyToMessage).toHaveBeenCalledWith('123', {
        html: expect.stringContaining('<h1>Response to Technical Discussion</h1>'),
        subject: 'Technical Review Complete'
      });

      const htmlCall = mockApiClient.replyToMessage.mock.calls[0][1];
      expect(htmlCall.html).toContain('<ul>');
      expect(htmlCall.html).toContain('<strong>Architecture</strong>');
      expect(htmlCall.html).toContain('<pre>');
      expect(htmlCall.html).toContain('interface EmailConfig');
      expect(htmlCall.html).toContain('<a href="https://docs.example.com">');
      expect(htmlCall.html).toContain('<blockquote>');
    });

    it('should provide default content when content is empty', async () => {
      const mockResponse = {
        messageId: 'reply-message-id',
        original_message_id: 123,
        subject: 'Re: Original Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.replyToMessage.mockResolvedValue(mockResponse);

      const params = {
        message_id: '123'
        // No content provided
      };

      const result = await toolHandler(params);

      // Should use default content
      expect(mockApiClient.replyToMessage).toHaveBeenCalledWith('123', {
        html: expect.stringContaining('This reply was sent via the TAI MCP Email Server')
      });
    });

    it('should maintain backward compatibility with html field', async () => {
      const mockResponse = {
        messageId: 'reply-message-id',
        original_message_id: 123,
        subject: 'Re: Original Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.replyToMessage.mockResolvedValue(mockResponse);

      const params = {
        message_id: '123',
        html: '<p>Legacy HTML reply content</p>'
      };

      const result = await toolHandler(params);

      // Should still work with old html field
      expect(mockApiClient.replyToMessage).toHaveBeenCalledWith('123', {
        html: '<p>Legacy HTML reply content</p>'
      });
    });

    it('should prioritize html field over content field for backward compatibility', async () => {
      const mockResponse = {
        messageId: 'reply-message-id',
        original_message_id: 123,
        subject: 'Re: Original Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.replyToMessage.mockResolvedValue(mockResponse);

      const params = {
        message_id: '123',
        content: '# This should be ignored',
        html: '<p>This HTML should be used</p>'
      };

      const result = await toolHandler(params);

      // Should use html field and ignore content field
      expect(mockApiClient.replyToMessage).toHaveBeenCalledWith('123', {
        html: '<p>This HTML should be used</p>'
      });
    });

    it('should handle empty message_id validation', async () => {
      const params = {
        message_id: '',
        content: 'Reply content'
      };

      const result = await toolHandler(params);

      // Should return validation error
      expect(result.content[0].text).toContain('Error');
    });

    it('should handle API client errors gracefully', async () => {
      mockApiClient.replyToMessage.mockRejectedValue(new Error('API Error: Message not found'));

      const params = {
        message_id: '123',
        content: 'Reply content'
      };

      const result = await toolHandler(params);

      expect(result.content[0].text).toContain('Error sending reply');
      expect(result.content[0].text).toContain('Message not found');
    });

    it('should pass through subject parameter correctly', async () => {
      const mockResponse = {
        messageId: 'reply-message-id',
        original_message_id: 123,
        subject: 'Custom Reply Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.replyToMessage.mockResolvedValue(mockResponse);

      const params = {
        message_id: '123',
        content: 'Reply with custom subject',
        subject: 'Custom Reply Subject'
      };

      const result = await toolHandler(params);

      expect(mockApiClient.replyToMessage).toHaveBeenCalledWith('123', {
        html: expect.any(String),
        subject: 'Custom Reply Subject'
      });
    });
  });

  describe('Legacy Implementation Compatibility', () => {
    it('should work with old text field (for existing tests)', async () => {
      const mockResponse = {
        messageId: 'reply-message-id',
        original_message_id: 123,
        subject: 'Re: Original Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.replyToMessage.mockResolvedValue(mockResponse);

      const params = {
        message_id: '123',
        text: 'Plain text reply content'
      };

      const result = await toolHandler(params);

      // Should handle text field as markdown
      expect(mockApiClient.replyToMessage).toHaveBeenCalledWith('123', {
        html: expect.stringContaining('Plain text reply content')
      });
    });
  });
});