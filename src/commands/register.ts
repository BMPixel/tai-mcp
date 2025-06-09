import { Config } from '../types/tools.js';
import { ApiClient } from '../services/api-client.js';
import { logger } from '../utils/logger.js';

export async function registerCommand(config: Config, username?: string, password?: string): Promise<void> {
  try {
    const apiClient = new ApiClient(config);
    
    logger.info('Starting user registration', { 
      username: username || config.name 
    });

    await apiClient.register(username, password);
    
    console.log('✅ Registration successful!');
    console.log(`Username: ${username || config.name}`);
    console.log(`Email: ${(username || config.name)}@tai.chat`);
    console.log('You can now use the MCP server or live mode.');
    
    logger.info('User registration completed successfully', { 
      username: username || config.name
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Registration failed', { error: errorMessage });
    
    console.error('❌ Registration failed:', errorMessage);
    
    if (errorMessage.includes('USER_EXISTS')) {
      console.log('💡 User already exists. You can proceed with login.');
    } else if (errorMessage.includes('INVALID_USERNAME')) {
      console.log('💡 Username must be 3-50 characters, lowercase letters/numbers/hyphens only');
    } else if (errorMessage.includes('INVALID_PASSWORD')) {
      console.log('💡 Password must be 8-128 characters');
    }
    
    process.exit(1);
  }
}