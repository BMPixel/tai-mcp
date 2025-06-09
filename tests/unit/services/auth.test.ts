import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AuthService } from '../../../src/services/auth.js';
import { Config } from '../../../src/types/tools.js';
import { mockLoginResponse, mockRegisterResponse, mockAuthErrorResponse } from '../../mocks/api-responses.js';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('AuthService', () => {
  let authService: AuthService;
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

    authService = new AuthService(mockConfig);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegisterResponse
      } as Response);

      const result = await authService.register();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://tai.chat/api/v1/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            password: 'testpassword'
          })
        })
      );

      expect(result).toEqual(mockRegisterResponse.data);
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should register with custom username and password', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegisterResponse
      } as Response);

      await authService.register('customuser', 'custompass');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://tai.chat/api/v1/register',
        expect.objectContaining({
          body: JSON.stringify({
            username: 'customuser',
            password: 'custompass'
          })
        })
      );
    });

    it('should throw error on registration failure', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => mockAuthErrorResponse
      } as Response);

      await expect(authService.register()).rejects.toThrow('Registration failed: Authentication failed');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse
      } as Response);

      const result = await authService.login();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://tai.chat/api/v1/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            password: 'testpassword'
          })
        })
      );

      expect(result).toEqual(mockLoginResponse.data);
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should throw error on login failure', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => mockAuthErrorResponse
      } as Response);

      await expect(authService.login()).rejects.toThrow('Login failed: Authentication failed');
    });
  });

  describe('ensureAuthenticated', () => {
    it('should login if not authenticated', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse
      } as Response);

      await authService.ensureAuthenticated();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should not login if already authenticated', async () => {
      // First login
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse
      } as Response);

      await authService.login();
      jest.clearAllMocks();

      // Ensure authenticated should not make another call
      await authService.ensureAuthenticated();

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('getAuthHeaders', () => {
    it('should return auth headers with token', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse
      } as Response);

      await authService.login();
      const headers = authService.getAuthHeaders();

      expect(headers).toEqual({
        'Authorization': `Bearer ${mockLoginResponse.data!.token}`
      });
    });

    it('should throw error if no token available', () => {
      expect(() => authService.getAuthHeaders()).toThrow('No authentication token available');
    });
  });

  describe('clearToken', () => {
    it('should clear authentication token', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse
      } as Response);

      await authService.login();
      expect(authService.isAuthenticated()).toBe(true);

      authService.clearToken();
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});