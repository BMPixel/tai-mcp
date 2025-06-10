import { z } from 'zod';

// send_email tool schema
export const sendEmailSchema = z.object({
  to: z.string()
    .email('Must be a valid email address')
    .optional()
    .describe('Recipient email address. Uses USEREMAIL if not specified.'),
  subject: z.string()
    .optional()
    .describe('Email subject line. Uses default if not provided.'),
  content: z.string()
    .optional()
    .describe('Email message content'),
  format: z.enum(['markdown', 'html'])
    .default('markdown')
    .optional()
    .describe('Content format: markdown (default) or html')
});

// fetch_email tool schema
export const fetchEmailSchema = z.object({
  email_id: z.string()
    .optional()
    .describe('Email ID to fetch a specific email. Fetches oldest unread if not provided.')
});

// list_inbox tool schema
export const listInboxSchema = z.object({
  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(200, 'Limit cannot exceed 200')
    .default(10)
    .optional()
    .describe('Number of messages to return (1-200, default: 10)'),
  offset: z.number()
    .min(0, 'Offset must be non-negative')
    .default(0)
    .optional()
    .describe('Number of messages to skip for pagination'),
  show_read: z.boolean()
    .default(false)
    .optional()
    .describe('Include read emails in the list (default: false)')
});

// reply_email tool schema
export const replyEmailSchema = z.object({
  message_id: z.string()
    .min(1, 'Message ID is required')
    .describe('ID of the original message to reply to'),
  content: z.string()
    .optional()
    .describe('Reply message content'),
  format: z.enum(['markdown', 'html'])
    .default('markdown')
    .optional()
    .describe('Content format: markdown (default) or html'),
  text: z.string()
    .optional()
    .describe('Legacy plain text content'),
  html: z.string()
    .optional()
    .describe('Legacy HTML content'),
  subject: z.string()
    .optional()
    .describe('Custom subject line. Uses "Re: Original Subject" if not provided.')
});

// Type inference
export type SendEmailParams = z.infer<typeof sendEmailSchema>;
export type FetchEmailParams = z.infer<typeof fetchEmailSchema>;
export type ListInboxParams = z.infer<typeof listInboxSchema>;
export type ReplyEmailParams = z.infer<typeof replyEmailSchema>;

// MCP tool response interface
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

// Configuration interface
export interface Config {
  name: string;
  password: string;
  instance: string;
  userEmail?: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  apiTimeout: number;
  pollInterval: number;
  baseUrl: string;
}