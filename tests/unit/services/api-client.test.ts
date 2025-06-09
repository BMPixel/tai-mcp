import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ApiClient } from '../../../src/services/api-client.js';
import { Config } from '../../../src/types/tools.js';
import { 
  mockLoginResponse, 
  mockMessagesResponse, 
  mockEmptyMessagesResponse,
  mockSendEmailResponse,
  mockMessage,
  mockErrorResponse 
} from '../../mocks/api-responses.js';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockConfig: Config;

  beforeEach(() => {
    mockConfig = {
      name: 'testuser',
      password: 'testpassword',
      instance: 'desktop',
      logLevel: 'info',
      apiTimeout: 30000,
      pollInterval: 5000,
      baseUrl: 'https://tai.chat'
    };

    apiClient = new ApiClient(mockConfig);
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      // Mock login
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLoginResponse
        } as Response)
        // Mock send email
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSendEmailResponse
        } as Response);

      const result = await apiClient.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>'
      });

      expect(result).toEqual(mockSendEmailResponse.data);
      
      // Check that send email was called with correct parameters
      const sendEmailCall = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls.find(
        call => call[0].toString().includes('/send-email')
      );
      expect(sendEmailCall).toBeDefined();
    });

    it('should throw error on send email failure', async () => {
      // Mock login
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLoginResponse
        } as Response)
        // Mock send email failure
        .mockResolvedValueOnce({
          ok: false,
          json: async () => mockErrorResponse
        } as Response);

      await expect(apiClient.sendEmail({
        to: 'test@example.com'
      })).rejects.toThrow('Failed to send email: Test error message');
    });
  });

  describe('fetchMessages', () => {
    it('should fetch messages successfully', async () => {
      // Mock login
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLoginResponse
        } as Response)
        // Mock fetch messages
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMessagesResponse
        } as Response);

      const result = await apiClient.fetchMessages({
        prefix: 'desktop',
        limit: 10,
        show_read: false
      });

      expect(result).toEqual(mockMessagesResponse.data);
    });

    it('should handle empty messages response', async () => {
      // Mock login
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLoginResponse
        } as Response)
        // Mock empty messages
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockEmptyMessagesResponse
        } as Response);

      const result = await apiClient.fetchMessages();

      expect(result).toEqual(mockEmptyMessagesResponse.data);
      expect(result.messages).toHaveLength(0);
    });

    it('should include query parameters in request', async () => {
      // Mock login
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLoginResponse
        } as Response)
        // Mock fetch messages
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMessagesResponse
        } as Response);

      await apiClient.fetchMessages({
        prefix: 'desktop',
        limit: 5,
        offset: 10,
        show_read: true
      });

      const messagesCall = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls.find(
        call => call[0].toString().includes('/messages')
      );
      
      expect(messagesCall![0].toString()).toContain('prefix=desktop');
      expect(messagesCall![0].toString()).toContain('limit=5');
      expect(messagesCall![0].toString()).toContain('offset=10');
      expect(messagesCall![0].toString()).toContain('show_read=true');
    });
  });

  describe('fetchMessageById', () => {
    it('should fetch specific message by ID', async () => {
      // Mock login
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLoginResponse
        } as Response)
        // Mock fetch specific message
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockMessage })
        } as Response);

      const result = await apiClient.fetchMessageById('123');

      expect(result).toEqual(mockMessage);
      
      const messageCall = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls.find(
        call => call[0].toString().includes('/messages/123')
      );
      expect(messageCall).toBeDefined();
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      // Mock login
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLoginResponse
        } as Response)
        // Mock mark as read
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        } as Response);

      await apiClient.markAsRead('123');

      const markReadCall = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls.find(
        call => call[0].toString().includes('/messages/123/read')
      );
      expect(markReadCall).toBeDefined();
      expect(markReadCall![1]?.method).toBe('PUT');
    });
  });

  describe('deleteMessage', () => {
    it('should delete message', async () => {
      // Mock login
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLoginResponse
        } as Response)
        // Mock delete message
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        } as Response);

      await apiClient.deleteMessage('123');

      const deleteCall = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls.find(
        call => call[0].toString().includes('/messages/123') && 
                !call[0].toString().includes('/read')
      );
      expect(deleteCall).toBeDefined();
      expect(deleteCall![1]?.method).toBe('DELETE');
    });
  });
});