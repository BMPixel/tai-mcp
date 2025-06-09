import { Config } from '../types/tools.js';
import { ApiResponse, LoginResponse, RegisterResponse, LoginRequest, RegisterRequest } from '../types/api.js';
import { logger } from '../utils/logger.js';

export class AuthService {
  private token?: string;
  private tokenExpiry?: Date;

  constructor(private config: Config) {}

  async register(username?: string, password?: string): Promise<RegisterResponse> {
    const requestBody: RegisterRequest = {
      username: username || this.config.name,
      password: password || this.config.password
    };

    logger.info('Registering user', { username: requestBody.username });

    const response = await this.makeRequest('/api/v1/register', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    if (!response.success || !response.data) {
      throw new Error(`Registration failed: ${response.error?.message || 'Unknown error'}`);
    }

    // Store the token from registration
    this.token = response.data.token;
    this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    logger.info('User registered successfully', { username: requestBody.username });
    return response.data;
  }

  async login(): Promise<LoginResponse> {
    const requestBody: LoginRequest = {
      username: this.config.name,
      password: this.config.password
    };

    logger.info('Logging in user', { username: requestBody.username });

    const response = await this.makeRequest('/api/v1/login', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    if (!response.success || !response.data) {
      throw new Error(`Login failed: ${response.error?.message || 'Unknown error'}`);
    }

    this.token = response.data.token;
    this.tokenExpiry = new Date(response.data.expires_at);

    logger.info('User logged in successfully', { username: requestBody.username });
    return response.data;
  }

  async ensureAuthenticated(): Promise<void> {
    if (!this.token || this.isTokenExpired()) {
      await this.login();
    }
  }

  getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    return {
      'Authorization': `Bearer ${this.token}`
    };
  }

  isAuthenticated(): boolean {
    return !!this.token && !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) {
      return true;
    }
    // Add 5 minute buffer to avoid token expiry during requests
    return new Date() > new Date(this.tokenExpiry.getTime() - 5 * 60 * 1000);
  }

  private async makeRequest(path: string, options: RequestInit): Promise<ApiResponse<any>> {
    const url = `${this.config.baseUrl}${path}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(this.config.apiTimeout)
    });

    const data = await response.json() as ApiResponse<any>;
    
    if (!response.ok) {
      logger.error('API request failed', { 
        url, 
        status: response.status, 
        error: data.error 
      });
    }

    return data;
  }

  clearToken(): void {
    this.token = undefined;
    this.tokenExpiry = undefined;
  }
}