import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { ApiClient } from '../../src/services/api-client.js';
import { Config } from '../../src/types/tools.js';

// Integration tests - these test against a real API endpoint
// They can be skipped in CI by setting TEST_INTEGRATION=false

const shouldRunIntegrationTests = process.env.TEST_INTEGRATION !== 'false';

describe('API Integration Tests', () => {
  let apiClient: ApiClient;
  let testConfig: Config;
  let testUsername: string;

  beforeAll(() => {
    if (!shouldRunIntegrationTests) {
      console.log('Skipping integration tests (TEST_INTEGRATION=false)');
      return;
    }

    // Generate unique test username to avoid conflicts
    testUsername = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    testConfig = {
      name: testUsername,
      password: 'testpassword123',
      instance: 'testinstance',
      logLevel: 'info',
      apiTimeout: 30000,
      pollInterval: 5000,
      baseUrl: process.env.TEST_API_URL || 'https://tai.chat'
    };

    apiClient = new ApiClient(testConfig);
  });

  afterAll(async () => {
    if (!shouldRunIntegrationTests) {
      return;
    }

    // Cleanup: could delete test user if API supports it
    // For now, we'll just let the test user remain
  });

  describe('User Registration and Authentication', () => {
    it('should register a new user', async () => {
      if (!shouldRunIntegrationTests) {
        console.log('Skipping integration test');
        return;
      }

      await expect(apiClient.register()).resolves.not.toThrow();
    }, 10000);

    it('should login with registered user', async () => {
      if (!shouldRunIntegrationTests) {
        console.log('Skipping integration test');
        return;
      }

      await expect(apiClient.login()).resolves.not.toThrow();
    }, 10000);
  });

  describe('Email Operations', () => {
    it('should fetch messages (empty initially)', async () => {
      if (!shouldRunIntegrationTests) {
        console.log('Skipping integration test');
        return;
      }

      const messages = await apiClient.fetchMessages({
        prefix: testConfig.instance,
        show_read: false
      });

      expect(messages).toBeDefined();
      expect(Array.isArray(messages.messages)).toBe(true);
      expect(messages.count).toBeGreaterThanOrEqual(0);
    }, 10000);

    it('should handle pagination parameters', async () => {
      if (!shouldRunIntegrationTests) {
        console.log('Skipping integration test');
        return;
      }

      const messages = await apiClient.fetchMessages({
        prefix: testConfig.instance,
        limit: 5,
        offset: 0,
        show_read: true
      });

      expect(messages).toBeDefined();
      expect(messages.messages.length).toBeLessThanOrEqual(5);
    }, 10000);

    // Note: Send email test is commented out because it requires Resend configuration
    // and might fail in test environments
    /*
    it('should send email', async () => {
      if (!shouldRunIntegrationTests) {
        console.log('Skipping integration test');
        return;
      }

      await expect(apiClient.sendEmail({
        to: 'test@example.com',
        subject: 'Integration Test Email',
        html: '<p>This is a test email from the integration tests.</p>'
      })).resolves.not.toThrow();
    }, 15000);
    */
  });

  describe('Error Handling', () => {
    it('should handle invalid message ID gracefully', async () => {
      if (!shouldRunIntegrationTests) {
        console.log('Skipping integration test');
        return;
      }

      await expect(apiClient.fetchMessageById('invalid-id')).rejects.toThrow();
    }, 10000);

    it('should handle invalid authentication gracefully', async () => {
      if (!shouldRunIntegrationTests) {
        console.log('Skipping integration test');
        return;
      }

      const invalidConfig = {
        ...testConfig,
        name: 'nonexistent-user',
        password: 'wrongpassword'
      };

      const invalidApiClient = new ApiClient(invalidConfig);
      
      await expect(invalidApiClient.fetchMessages()).rejects.toThrow();
    }, 10000);
  });
});