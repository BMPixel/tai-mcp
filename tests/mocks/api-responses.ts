import { ApiResponse, LoginResponse, RegisterResponse, MessagesResponse, MessageResponse, SendEmailResponse } from '../../src/types/api.js';

export const mockLoginResponse: ApiResponse<LoginResponse> = {
  success: true,
  data: {
    token: 'mock-jwt-token',
    expires_at: '2025-06-10T12:00:00.000Z'
  }
};

export const mockRegisterResponse: ApiResponse<RegisterResponse> = {
  success: true,
  data: {
    username: 'testuser',
    email: 'testuser@tai.chat',
    token: 'mock-jwt-token'
  }
};

export const mockSendEmailResponse: ApiResponse<SendEmailResponse> = {
  success: true,
  data: {
    messageId: 'mock-message-id',
    to: 'test@example.com',
    subject: 'Test Email',
    timestamp: '2025-06-09T12:00:00.000Z'
  }
};

export const mockMessage: MessageResponse = {
  id: 1,
  message_id: 'mock-msg-id',
  from: 'sender@example.com',
  to: 'desktop.testuser@tai.chat',
  subject: 'Test Subject',
  body_text: 'Test body text',
  body_html: '<p>Test body HTML</p>',
  is_read: false,
  received_at: '2025-06-09T12:00:00.000Z',
  size: 1024
};

export const mockMessagesResponse: ApiResponse<MessagesResponse> = {
  success: true,
  data: {
    messages: [mockMessage],
    count: 1,
    has_more: false
  }
};

export const mockEmptyMessagesResponse: ApiResponse<MessagesResponse> = {
  success: true,
  data: {
    messages: [],
    count: 0,
    has_more: false
  }
};

export const mockErrorResponse: ApiResponse<never> = {
  success: false,
  error: {
    code: 'TEST_ERROR',
    message: 'Test error message'
  }
};

export const mockAuthErrorResponse: ApiResponse<never> = {
  success: false,
  error: {
    code: 'UNAUTHORIZED',
    message: 'Authentication failed'
  }
};