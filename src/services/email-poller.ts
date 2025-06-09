import { exec } from 'child_process';
import { promisify } from 'util';
import { Config } from '../types/tools.js';
import { ApiClient } from './api-client.js';
import { getInstanceEmail } from '../utils/config.js';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

export class EmailPoller {
  private polling = false;
  private pollInterval?: NodeJS.Timeout;
  private lastCheckedMessageId?: number;

  constructor(private config: Config, private apiClient: ApiClient) {}

  async start(): Promise<void> {
    if (this.polling) {
      logger.warn('Email poller is already running');
      return;
    }

    this.polling = true;
    logger.info('Starting email poller', {
      interval: this.config.pollInterval,
      instanceEmail: getInstanceEmail(this.config)
    });

    // Initial check
    await this.checkForNewEmails();

    // Set up polling interval
    this.pollInterval = setInterval(async () => {
      try {
        await this.checkForNewEmails();
      } catch (error) {
        logger.error('Error during email polling', { error });
      }
    }, this.config.pollInterval);
  }

  stop(): void {
    if (!this.polling) {
      return;
    }

    this.polling = false;
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }

    logger.info('Email poller stopped');
  }

  private async checkForNewEmails(): Promise<void> {
    try {
      logger.debug('Checking for new emails');

      // Fetch unread messages for our instance
      const messages = await this.apiClient.fetchMessages({
        prefix: this.config.instance,
        show_read: false,
        limit: 10,
        offset: 0
      });

      if (!messages.messages || messages.messages.length === 0) {
        logger.debug('No unread emails found');
        return;
      }

      // Find new messages (those we haven't seen before)
      const newMessages = this.lastCheckedMessageId 
        ? messages.messages.filter(msg => msg.id > this.lastCheckedMessageId!)
        : messages.messages;

      if (newMessages.length === 0) {
        logger.debug('No new emails since last check');
        return;
      }

      logger.info('New emails detected', { count: newMessages.length });

      // Update the last checked message ID
      const latestMessageId = Math.max(...messages.messages.map(msg => msg.id));
      this.lastCheckedMessageId = latestMessageId;

      // Process each new email
      for (const message of newMessages) {
        await this.processNewEmail(message);
      }
    } catch (error) {
      logger.error('Failed to check for new emails', { error });
    }
  }

  private async processNewEmail(message: any): Promise<void> {
    try {
      logger.info('Processing new email', {
        messageId: message.id,
        from: message.from,
        subject: message.subject
      });

      // Invoke Claude Code with the specified prompt
      const command = 'claude code -p "Please resolve the unread email and send the response back to the user after the email is resolved"';
      
      logger.info('Invoking Claude Code', { command });
      
      const { stdout, stderr } = await execAsync(command, {
        timeout: 300000, // 5 minute timeout
        env: {
          ...process.env,
          // Pass through current environment variables so Claude Code has access to the same config
        }
      });

      if (stderr) {
        logger.warn('Claude Code stderr output', { stderr });
      }

      logger.info('Claude Code invocation completed', { 
        messageId: message.id,
        stdout: stdout.substring(0, 200) // Log first 200 chars
      });
    } catch (error) {
      logger.error('Failed to process new email', {
        messageId: message.id,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  isPolling(): boolean {
    return this.polling;
  }

  getLastCheckedMessageId(): number | undefined {
    return this.lastCheckedMessageId;
  }
}