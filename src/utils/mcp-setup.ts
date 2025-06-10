import { exec } from 'child_process';
import { promisify } from 'util';
import { Config } from '../types/tools.js';
import { logger } from './logger.js';

const execAsync = promisify(exec);

/**
 * Check if Claude Code CLI is available
 */
async function checkClaudeCodeAvailable(): Promise<boolean> {
  try {
    await execAsync('which claude');
    return true;
  } catch {
    try {
      await execAsync('claude --version');
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Check if TAI-MCP server is already configured
 */
async function isMcpConfigured(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('claude mcp list');
    return stdout.includes('tai-mcp');
  } catch {
    return false;
  }
}

/**
 * Configure TAI-MCP server with Claude Code
 */
async function configureMcpServer(config: Config): Promise<void> {
  const executablePath = process.argv[1];
  
  // Build environment variables string
  const envVars = [
    `-e NAME=${config.name}`,
    `-e PASSWORD=${config.password}`,
    `-e INSTANCE=${config.instance}`,
    config.userEmail ? `-e USEREMAIL=${config.userEmail}` : '',
    `-e LOG_LEVEL=${config.logLevel}`,
    `-e API_TIMEOUT=${config.apiTimeout}`,
    `-e POLL_INTERVAL=${config.pollInterval}`,
    `-e API_BASE_URL=${config.baseUrl}`,
    `-e LIVE_PROMPT="${config.livePrompt}"`,
    `-e MAX_RETRIES=${config.maxRetries}`,
    `-e RETRY_DELAY=${config.retryDelay}`,
    `-e CLAUDE_TIMEOUT=${config.claudeTimeout}`,
    `-e ENABLE_ACKNOWLEDGMENT=${config.enableAcknowledgment}`
  ].filter(Boolean).join(' ');

  const command = `claude mcp add --scope local tai-mcp ${envVars} -- "${executablePath}"`;
  
  logger.debug('Configuring MCP server', { command, executablePath });
  
  await execAsync(command);
}

/**
 * Ensure Claude Code MCP is configured for TAI-MCP
 */
export async function ensureMcpSetup(config: Config): Promise<void> {
  try {
    console.log('🔧 Setting up Claude Code MCP integration...');
    
    // Check if Claude Code is available
    const claudeAvailable = await checkClaudeCodeAvailable();
    if (!claudeAvailable) {
      console.log('⚠️  Claude Code CLI not found - MCP integration skipped');
      console.log('💡 Install Claude Code to enable email tools: https://claude.ai/code');
      return;
    }

    // Check if already configured
    const alreadyConfigured = await isMcpConfigured();
    if (alreadyConfigured) {
      console.log('✅ MCP server "tai-mcp" already configured');
      return;
    }

    // Configure MCP server
    await configureMcpServer(config);
    console.log('✅ MCP server "tai-mcp" configured successfully');
    console.log('🔗 Claude Code can now use email tools when invoked');
    
    logger.info('MCP server configured successfully', {
      executablePath: process.argv[1],
      instance: config.instance,
      name: config.name
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('❌ MCP setup failed:', errorMessage);
    console.log('📧 Live mode will continue, but Claude Code won\'t have email tools');
    
    logger.warn('MCP setup failed, continuing without MCP integration', { 
      error: errorMessage,
      executablePath: process.argv[1]
    });
  }
}