#!/usr/bin/env node

import { loadConfig, validateConfig } from './utils/config.js';
import { logger } from './utils/logger.js';
import { McpEmailServer } from './server.js';
import { registerCommand } from './commands/register.js';
import { liveCommand } from './commands/live.js';

function printUsage(): void {
  console.log(`
TAI MCP Email Server v1.0.0

Usage:
  tai-mcp-email-server [command] [options]

Commands:
  (no command)    Start as MCP server (default mode)
  live           Start in live polling mode - monitors for new emails and invokes Claude Code
  register       Register a new user with the CF Mail Bridge API

Examples:
  tai-mcp-email-server                    # Start MCP server
  tai-mcp-email-server live              # Start live mode
  tai-mcp-email-server register          # Register with env variables
  tai-mcp-email-server register alice    # Register specific username

Environment Variables (required):
  NAME=username          # CF Mail Bridge username
  PASSWORD=password      # Authentication password  
  INSTANCE=instance      # Agent instance identifier (e.g., "desktop")

Environment Variables (optional):
  USEREMAIL=user@example.com    # Default recipient for send_email
  LOG_LEVEL=info                # Logging level: error|warn|info|debug
  API_TIMEOUT=30000             # API request timeout in ms
  POLL_INTERVAL=5000            # Live mode polling interval in ms
  API_BASE_URL=https://tai.chat # API base URL

Your instance email will be: {INSTANCE}.{NAME}@tai.chat
`);
}

function validateEnvironment(): void {
  try {
    const config = loadConfig();
    validateConfig(config);
    logger.setLevel(config.logLevel);
    logger.info('Environment validation successful', {
      instance: config.instance,
      username: config.name,
      instanceEmail: `${config.instance}.${config.name}@tai.chat`
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Environment validation failed', { error: errorMessage });
    console.error('❌ Configuration Error:', errorMessage);
    console.error('💡 Please check your environment variables\n');
    printUsage();
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  // Handle help requests
  if (command === 'help' || command === '--help' || command === '-h') {
    printUsage();
    process.exit(0);
  }

  try {
    // Validate environment for all commands
    validateEnvironment();
    const config = loadConfig();

    switch (command) {
      case 'register': {
        const username = args[1]; // Optional custom username
        await registerCommand(config, username);
        break;
      }
      
      case 'live': {
        await liveCommand(config);
        break;
      }
      
      case undefined: {
        // Default: Start MCP server
        logger.info('Starting TAI MCP Email Server in MCP mode');
        const server = new McpEmailServer(config);
        await server.start();
        break;
      }
      
      default: {
        console.error(`❌ Unknown command: ${command}\n`);
        printUsage();
        process.exit(1);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Application error', { error: errorMessage, command });
    console.error('❌ Error:', errorMessage);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  logger.error('Unhandled error in main', { error });
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});