import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSendEmailTool } from '../../../src/tools/send-email.js';
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

describe('Send Email Tool', () => {
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
      sendEmail: jest.fn()
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
    registerSendEmailTool(mockServer, mockApiClient, mockConfig);
    toolHandler = (mockServer.tool as jest.Mock).mock.calls[0][3];
  });

  describe('Current Implementation (before changes)', () => {
    it('should send HTML email successfully', async () => {
      const mockResponse = {
        messageId: 'test-message-id',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.sendEmail.mockResolvedValue(mockResponse);

      const params = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>'
      };

      const result = await toolHandler(params);

      expect(mockApiClient.sendEmail).toHaveBeenCalledWith({
        to: 'recipient@example.com',
        from: 'testinstance.testuser@tai.chat',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>'
      });

      expect(result.content[0].text).toContain('Email sent successfully');
      expect(result.content[0].text).toContain('test-message-id');
    });

    it('should use default values when not provided', async () => {
      const mockResponse = {
        messageId: 'test-message-id',
        to: 'test@example.com',
        subject: 'Email from CF Mail Bridge',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.sendEmail.mockResolvedValue(mockResponse);

      const params = {};

      const result = await toolHandler(params);

      expect(mockApiClient.sendEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: 'testinstance.testuser@tai.chat',
        subject: 'Email from testinstance',
        html: '<p>This email was sent via the TAI MCP Email Server.</p>'
      });
    });
  });

  describe('Updated Format Field Implementation (TDD - removing legacy html field)', () => {
    it('should send markdown email when format is "markdown"', async () => {
      const mockResponse = {
        messageId: 'test-message-id',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.sendEmail.mockResolvedValue(mockResponse);

      const params = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        content: '# Hello\n\nThis is **markdown** content.',
        format: 'markdown'
      };

      const result = await toolHandler(params);

      // Should convert markdown to HTML
      expect(mockApiClient.sendEmail).toHaveBeenCalledWith({
        to: 'recipient@example.com',
        from: 'testinstance.testuser@tai.chat',
        subject: 'Test Subject',
        html: expect.stringContaining('<h1>Hello</h1>')
      });

      expect(mockApiClient.sendEmail).toHaveBeenCalledWith({
        to: 'recipient@example.com',
        from: 'testinstance.testuser@tai.chat',
        subject: 'Test Subject',
        html: expect.stringContaining('<strong>markdown</strong>')
      });
    });

    it('should default to markdown format when not specified', async () => {
      const mockResponse = {
        messageId: 'test-message-id',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.sendEmail.mockResolvedValue(mockResponse);

      const params = {
        to: 'recipient@example.com',
        content: '# Hello\n\nThis is **markdown** content.'
      };

      const result = await toolHandler(params);

      // Should convert markdown to HTML by default
      expect(mockApiClient.sendEmail).toHaveBeenCalledWith({
        to: 'recipient@example.com',
        from: 'testinstance.testuser@tai.chat',
        subject: expect.stringContaining('Email from testinstance'),
        html: expect.stringContaining('<h1>Hello</h1>')
      });
    });

    it('should send HTML directly when format is "html"', async () => {
      const mockResponse = {
        messageId: 'test-message-id',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.sendEmail.mockResolvedValue(mockResponse);

      const params = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        content: '<h1>Hello</h1><p>This is <strong>HTML</strong> content.</p>',
        format: 'html'
      };

      const result = await toolHandler(params);

      // Should pass HTML through directly
      expect(mockApiClient.sendEmail).toHaveBeenCalledWith({
        to: 'recipient@example.com',
        from: 'testinstance.testuser@tai.chat',
        subject: 'Test Subject',
        html: '<h1>Hello</h1><p>This is <strong>HTML</strong> content.</p>'
      });
    });

    it('should use instance name in default subject', async () => {
      const mockResponse = {
        messageId: 'test-message-id',
        to: 'test@example.com',
        subject: 'Email from testinstance',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.sendEmail.mockResolvedValue(mockResponse);

      const params = {
        content: 'Test content'
      };

      const result = await toolHandler(params);

      expect(mockApiClient.sendEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: 'testinstance.testuser@tai.chat',
        subject: 'Email from testinstance',
        html: expect.any(String)
      });
    });

    it('should reject html field parameter (legacy feature removed)', async () => {
      const params = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Legacy HTML content should not work</p>'
      };

      const result = await toolHandler(params);

      // Should return validation error for html field
      expect(result.content[0].text).toContain('Error');
    });

    it('should validate format field accepts only markdown or html', async () => {
      const params = {
        to: 'recipient@example.com',
        content: 'Test content',
        format: 'invalid-format'
      };

      const result = await toolHandler(params);

      // Should return error for invalid format
      expect(result.content[0].text).toContain('Error');
    });

    it('should handle complex markdown with lists, links, and code', async () => {
      const mockResponse = {
        messageId: 'test-message-id',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockApiClient.sendEmail.mockResolvedValue(mockResponse);

      const complexMarkdown = `# Project Update

## Progress Report

We've made significant progress on:

- **Feature A**: 90% complete
- **Feature B**: In testing phase
- **Feature C**: Just started

### Code Example

\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\`

For more details, visit [our documentation](https://example.com/docs).

> "The best way to predict the future is to invent it." - Alan Kay`;

      const params = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        content: complexMarkdown,
        format: 'markdown'
      };

      const result = await toolHandler(params);

      // Should convert all markdown elements
      expect(mockApiClient.sendEmail).toHaveBeenCalledWith({
        to: 'recipient@example.com',
        from: 'testinstance.testuser@tai.chat',
        subject: 'Test Subject',
        html: expect.stringContaining('<h1>Project Update</h1>')
      });

      const htmlCall = mockApiClient.sendEmail.mock.calls[0][0];
      expect(htmlCall.html).toContain('<ul>');
      expect(htmlCall.html).toContain('<strong>Feature A</strong>');
      expect(htmlCall.html).toContain('<pre>');
      expect(htmlCall.html).toContain('const greeting');
      expect(htmlCall.html).toContain('<a href="https://example.com/docs">');
      expect(htmlCall.html).toContain('<blockquote>');
    });
  });
});