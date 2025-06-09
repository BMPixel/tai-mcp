import { Config } from '../types/tools.js';
import { ApiClient } from '../services/api-client.js';
import { EmailPoller } from '../services/email-poller.js';
import { getInstanceEmail } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export async function liveCommand(config: Config): Promise<void> {
  let apiClient: ApiClient | undefined;
  let emailPoller: EmailPoller | undefined;

  try {
    logger.info('Starting TAI MCP Email Server in live mode', {
      instanceEmail: getInstanceEmail(config),
      pollInterval: config.pollInterval
    });

    // Initialize API client and test connection
    apiClient = new ApiClient(config);
    await apiClient.login();

    console.log('🚀 TAI MCP Email Server - Live Mode');
    console.log(`📧 Monitoring: ${getInstanceEmail(config)}`);
    console.log(`⏱️  Poll interval: ${config.pollInterval}ms`);
    console.log('🤖 Will invoke Claude Code when new emails arrive');
    console.log('Press Ctrl+C to stop\n');

    // Start email polling
    emailPoller = new EmailPoller(config, apiClient);
    await emailPoller.start();

    // Keep the process running
    await new Promise((resolve, reject) => {
      // Graceful shutdown handling
      const shutdown = (signal: string) => {
        logger.info(`Received ${signal}, shutting down gracefully`);
        console.log(`\n🛑 Received ${signal}, shutting down...`);
        resolve(undefined);
      };

      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));
      
      // Handle uncaught errors
      process.on('uncaughtException', (error) => {
        logger.error('Uncaught exception in live mode', { error });
        reject(error);
      });

      process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled rejection in live mode', { reason });
        reject(reason);
      });
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Live mode failed', { error: errorMessage });
    
    console.error('❌ Live mode failed:', errorMessage);
    
    if (errorMessage.includes('INVALID_CREDENTIALS')) {
      console.log('💡 Check your NAME and PASSWORD environment variables');
    } else if (errorMessage.includes('Network')) {
      console.log('💡 Check your internet connection and API endpoint');
    }
    
    process.exit(1);
  } finally {
    // Cleanup
    if (emailPoller) {
      emailPoller.stop();
    }
    
    console.log('✅ Live mode stopped');
    logger.info('Live mode cleanup completed');
  }
}