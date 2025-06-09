import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { loadConfig, validateConfig, getInstanceEmail } from '../../../src/utils/config.js';

describe('Config Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should load config from environment variables', () => {
      process.env.NAME = 'testuser';
      process.env.PASSWORD = 'testpassword';
      process.env.INSTANCE = 'desktop';
      process.env.USEREMAIL = 'user@example.com';
      process.env.LOG_LEVEL = 'debug';

      const config = loadConfig();

      expect(config.name).toBe('testuser');
      expect(config.password).toBe('testpassword');
      expect(config.instance).toBe('desktop');
      expect(config.userEmail).toBe('user@example.com');
      expect(config.logLevel).toBe('debug');
    });

    it('should use default values for optional environment variables', () => {
      process.env.NAME = 'testuser';
      process.env.PASSWORD = 'testpassword';
      process.env.INSTANCE = 'desktop';

      const config = loadConfig();

      expect(config.logLevel).toBe('info');
      expect(config.apiTimeout).toBe(30000);
      expect(config.pollInterval).toBe(5000);
      expect(config.baseUrl).toBe('https://tai.chat');
    });

    it('should throw error for missing required environment variables', () => {
      process.env.NAME = 'testuser';
      // Missing PASSWORD and INSTANCE

      expect(() => loadConfig()).toThrow('Missing required environment variables: PASSWORD, INSTANCE');
    });
  });

  describe('validateConfig', () => {
    const validConfig = {
      name: 'testuser',
      password: 'testpassword',
      instance: 'desktop',
      userEmail: 'user@example.com',
      logLevel: 'info' as const,
      apiTimeout: 30000,
      pollInterval: 5000,
      baseUrl: 'https://tai.chat'
    };

    it('should pass validation for valid config', () => {
      expect(() => validateConfig(validConfig)).not.toThrow();
    });

    it('should throw error for short username', () => {
      const config = { ...validConfig, name: 'ab' };
      expect(() => validateConfig(config)).toThrow('NAME must be at least 3 characters long');
    });

    it('should throw error for short password', () => {
      const config = { ...validConfig, password: '1234567' };
      expect(() => validateConfig(config)).toThrow('PASSWORD must be at least 8 characters long');
    });

    it('should throw error for invalid API timeout', () => {
      const config = { ...validConfig, apiTimeout: 500 };
      expect(() => validateConfig(config)).toThrow('API_TIMEOUT must be between 1000 and 300000 milliseconds');
    });

    it('should throw error for invalid poll interval', () => {
      const config = { ...validConfig, pollInterval: 500 };
      expect(() => validateConfig(config)).toThrow('POLL_INTERVAL must be between 1000 and 60000 milliseconds');
    });
  });

  describe('getInstanceEmail', () => {
    it('should generate correct instance email', () => {
      const config = {
        name: 'alice',
        instance: 'desktop',
        password: 'password',
        logLevel: 'info' as const,
        apiTimeout: 30000,
        pollInterval: 5000,
        baseUrl: 'https://tai.chat'
      };

      const email = getInstanceEmail(config);
      expect(email).toBe('desktop.alice@tai.chat');
    });
  });
});