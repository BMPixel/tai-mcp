export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
  last_access?: string;
}

export interface Message {
  id: number;
  user_id: number;
  message_id?: string;
  from_address: string;
  to_address: string;
  subject?: string;
  body_text?: string;
  body_html?: string;
  raw_headers?: string;
  raw_size?: number;
  is_read?: boolean;
  received_at: string;
}

export interface MessageResponse {
  id: number;
  message_id?: string;
  from: string;
  to: string;
  subject?: string;
  body_text?: string;
  body_html?: string;
  is_read?: boolean;
  received_at: string;
  size?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface LoginResponse {
  token: string;
  expires_at: string;
}

export interface RegisterResponse {
  username: string;
  email: string;
  token: string;
}

export interface MessagesResponse {
  messages: MessageResponse[];
  count: number;
  has_more: boolean;
}

export interface SendEmailResponse {
  messageId: string;
  to: string;
  subject: string;
  timestamp: string;
}

export interface UnreadCountResponse {
  to: string;
  from: string;
  unread_count: number;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
}

export interface SendEmailRequest {
  to: string;
  from?: string;
  subject?: string;
  message?: string;
  html?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}