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
    try {
      await this.checkForNewEmails();
    } catch (error) {
      // Enhanced error logging for initial check
      const errorDetails: any = {
        operation: 'initialCheck',
        timestamp: new Date().toISOString()
      };

      if (error instanceof Error) {
        errorDetails.errorMessage = error.message;
        errorDetails.errorName = error.name;
        errorDetails.stack = error.stack;
      } else {
        errorDetails.error = error;
      }

      logger.error('Error during initial email check', errorDetails);
    }

    // Set up polling interval
    this.pollInterval = setInterval(async () => {
      try {
        await this.checkForNewEmails();
      } catch (error) {
        // Enhanced error logging for polling interval errors
        const errorDetails: any = {
          operation: 'pollingInterval',
          timestamp: new Date().toISOString(),
          isPolling: this.polling
        };

        if (error instanceof Error) {
          errorDetails.errorMessage = error.message;
          errorDetails.errorName = error.name;
          errorDetails.stack = error.stack;
        } else {
          errorDetails.error = error;
        }

        logger.error('Error during email polling interval', errorDetails);
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
      // Enhanced error logging for API failures
      const errorDetails: any = {
        operation: 'checkForNewEmails',
        timestamp: new Date().toISOString(),
        config: {
          instance: this.config.instance,
          pollInterval: this.config.pollInterval
        }
      };

      if (error instanceof Error) {
        errorDetails.errorMessage = error.message;
        errorDetails.errorName = error.name;
        errorDetails.stack = error.stack;
      } else {
        errorDetails.error = error;
      }

      logger.error('Failed to check for new emails - API call failed', errorDetails);
    }
  }

  private async processNewEmail(message: any): Promise<void> {
    // Invoke Claude with the specified prompt
    const command = 'claude --dangerously-skip-permissions -p "Please resolve the unread email and send the response back to the user after the email is resolved"';
    
    try {
      logger.info('Processing new email', {
        messageId: message.id,
        from: message.from,
        subject: message.subject
      });
      
      logger.info('Invoking Claude', { command });
      
      const { stdout, stderr } = await execAsync(command, {
        timeout: 300000, // 5 minute timeout
        env: {
          ...process.env,
          // Pass through current environment variables so Claude has access to the same config
        }
      });

      // Log both stdout and stderr for better debugging
      if (stderr) {
        logger.warn('Claude stderr output', { 
          messageId: message.id,
          stderr: stderr.substring(0, 1000) // Log first 1000 chars of stderr
        });
      }

      if (stdout) {
        logger.info('Claude stdout output', { 
          messageId: message.id,
          stdout: stdout.substring(0, 500) // Log first 500 chars of stdout
        });
      }

      logger.info('Claude invocation completed successfully', { 
        messageId: message.id,
        hasStdout: !!stdout,
        hasStderr: !!stderr
      });
    } catch (error) {
      // Enhanced error logging for Claude execution failures
      const errorDetails: any = {
        messageId: message.id,
        command,
        timestamp: new Date().toISOString()
      };

      if (error instanceof Error) {
        errorDetails.errorMessage = error.message;
        errorDetails.errorName = error.name;
        errorDetails.stack = error.stack;
        
        // Check if it's an exec error with additional properties
        if ('code' in error) {
          errorDetails.exitCode = (error as any).code;
        }
        if ('signal' in error) {
          errorDetails.signal = (error as any).signal;
        }
        if ('stdout' in error) {
          errorDetails.stdout = (error as any).stdout;
        }
        if ('stderr' in error) {
          errorDetails.stderr = (error as any).stderr;
        }
      } else {
        errorDetails.error = error;
      }

      logger.error('Failed to process new email - Claude execution failed', errorDetails);
    }
  }

  isPolling(): boolean {
    return this.polling;
  }

  getLastCheckedMessageId(): number | undefined {
    return this.lastCheckedMessageId;
  }
}