import { z } from 'zod';

// send_email tool schema
export const sendEmailSchema = z.object({
  to: z.string()
    .email('Must be a valid email address')
    .optional()
    .describe('Recipient email address. Defaults to USEREMAIL if not specified.'),
  subject: z.string()
    .optional()
    .describe('Email subject line. Defaults to "Email from {instance name}" if not provided.'),
  content: z.string()
    .optional()
    .describe('Email message content (markdown or HTML based on format parameter)'),
  format: z.enum(['markdown', 'html'])
    .default('markdown')
    .optional()
    .describe('Content format: "markdown" (default) converts content to HTML, "html" uses content as-is'),
  html: z.string()
    .optional()
    .describe('Legacy HTML message body content (for backward compatibility)')
});

// fetch_email tool schema
export const fetchEmailSchema = z.object({
  email_id: z.string()
    .optional()
    .describe('Optional email ID to fetch a specific email. If not provided, fetches the oldest unread email.')
});

// list_inbox tool schema
export const listInboxSchema = z.object({
  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(200, 'Limit cannot exceed 200')
    .default(10)
    .optional()
    .describe('Number of messages to return (default: 10, max: 200)'),
  offset: z.number()
    .min(0, 'Offset must be non-negative')
    .default(0)
    .optional()
    .describe('Number of messages to skip for pagination (default: 0)'),
  show_read: z.boolean()
    .default(false)
    .optional()
    .describe('Whether to include read emails in the list (default: false)')
});

// reply_email tool schema
export const replyEmailSchema = z.object({
  message_id: z.string()
    .min(1, 'Message ID is required')
    .describe('The ID of the original message to reply to'),
  text: z.string()
    .min(1, 'Reply text content is required')
    .describe('Plain text content for the reply message'),
  html: z.string()
    .optional()
    .describe('Optional HTML content for the reply message'),
  subject: z.string()
    .optional()
    .describe('Optional custom subject line. If not provided, will default to "Re: Original Subject"')
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