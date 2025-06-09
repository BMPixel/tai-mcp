import { Config } from '../types/tools.js';
import { 
  ApiResponse, 
  MessagesResponse, 
  MessageResponse, 
  SendEmailResponse, 
  UnreadCountResponse,
  SendEmailRequest 
} from '../types/api.js';
import { AuthService } from './auth.js';
import { logger } from '../utils/logger.js';

export class ApiClient {
  private authService: AuthService;

  constructor(private config: Config) {
    this.authService = new AuthService(config);
  }

  async sendEmail(params: SendEmailRequest): Promise<SendEmailResponse> {
    await this.authService.ensureAuthenticated();
    
    logger.info('Sending email', { to: params.to, subject: params.subject });

    const response = await this.makeAuthenticatedRequest('/api/v1/send-email', {
      method: 'POST',
      body: JSON.stringify(params)
    });

    if (!response.success || !response.data) {
      throw new Error(`Failed to send email: ${response.error?.message || 'Unknown error'}`);
    }

    logger.info('Email sent successfully', { messageId: response.data.messageId });
    return response.data;
  }

  async fetchMessages(params: {
    limit?: number;
    offset?: number;
    prefix?: string;
    show_read?: boolean;
  } = {}): Promise<MessagesResponse> {
    await this.authService.ensureAuthenticated();
    
    const queryParams = new URLSearchParams();
    if (params.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params.offset !== undefined) queryParams.set('offset', params.offset.toString());
    if (params.prefix) queryParams.set('prefix', params.prefix);
    if (params.show_read !== undefined) queryParams.set('show_read', params.show_read.toString());

    const url = `/api/v1/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    logger.debug('Fetching messages', { params });

    const response = await this.makeAuthenticatedRequest(url, {
      method: 'GET'
    });

    if (!response.success || !response.data) {
      throw new Error(`Failed to fetch messages: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  async fetchMessageById(messageId: string): Promise<MessageResponse> {
    await this.authService.ensureAuthenticated();
    
    logger.debug('Fetching message by ID', { messageId });

    const response = await this.makeAuthenticatedRequest(`/api/v1/messages/${messageId}`, {
      method: 'GET'
    });

    if (!response.success || !response.data) {
      throw new Error(`Failed to fetch message: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.authService.ensureAuthenticated();
    
    logger.debug('Marking message as read', { messageId });

    const response = await this.makeAuthenticatedRequest(`/api/v1/messages/${messageId}/read`, {
      method: 'PUT'
    });

    if (!response.success) {
      throw new Error(`Failed to mark message as read: ${response.error?.message || 'Unknown error'}`);
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.authService.ensureAuthenticated();
    
    logger.debug('Deleting message', { messageId });

    const response = await this.makeAuthenticatedRequest(`/api/v1/messages/${messageId}`, {
      method: 'DELETE'
    });

    if (!response.success) {
      throw new Error(`Failed to delete message: ${response.error?.message || 'Unknown error'}`);
    }
  }

  async getUnreadCount(to: string, from: string): Promise<UnreadCountResponse> {
    const queryParams = new URLSearchParams({ to, from });
    const url = `/api/v1/unread?${queryParams.toString()}`;
    
    logger.debug('Getting unread count', { to, from });

    const response = await this.makeRequest(url, {
      method: 'GET'
    });

    if (!response.success || !response.data) {
      throw new Error(`Failed to get unread count: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  async register(username?: string, password?: string): Promise<void> {
    await this.authService.register(username, password);
  }

  async login(): Promise<void> {
    await this.authService.login();
  }

  private async makeAuthenticatedRequest(path: string, options: RequestInit): Promise<ApiResponse<any>> {
    try {
      const headers = {
        ...this.authService.getAuthHeaders(),
        ...options.headers
      };

      return await this.makeRequest(path, {
        ...options,
        headers
      });
    } catch (error) {
      // If we get an auth error, try to re-authenticate once
      if (error instanceof Error && error.message.includes('401')) {
        logger.warn('Authentication failed, attempting to re-login');
        await this.authService.login();
        
        const headers = {
          ...this.authService.getAuthHeaders(),
          ...options.headers
        };

        return await this.makeRequest(path, {
          ...options,
          headers
        });
      }
      throw error;
    }
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
      
      if (response.status === 401) {
        throw new Error('Authentication failed (401)');
      }
      
      throw new Error(`API request failed: ${data.error?.message || response.statusText}`);
    }

    return data;
  }
}