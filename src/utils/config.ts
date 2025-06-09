import { Config } from '../types/tools.js';

export function loadConfig(): Config {
  const requiredEnvVars = ['NAME', 'PASSWORD', 'INSTANCE'];
  const missing = requiredEnvVars.filter(name => !process.env[name]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    name: process.env.NAME!,
    password: process.env.PASSWORD!,
    instance: process.env.INSTANCE!,
    userEmail: process.env.USEREMAIL,
    logLevel: (process.env.LOG_LEVEL as Config['logLevel']) || 'info',
    apiTimeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
    pollInterval: parseInt(process.env.POLL_INTERVAL || '5000', 10),
    baseUrl: process.env.API_BASE_URL || 'https://tai.chat'
  };
}

export function validateConfig(config: Config): void {
  if (!config.name || config.name.length < 3) {
    throw new Error('NAME must be at least 3 characters long');
  }
  
  if (!config.password || config.password.length < 8) {
    throw new Error('PASSWORD must be at least 8 characters long');
  }
  
  if (!config.instance || config.instance.length < 1) {
    throw new Error('INSTANCE must be provided');
  }
  
  if (config.apiTimeout < 1000 || config.apiTimeout > 300000) {
    throw new Error('API_TIMEOUT must be between 1000 and 300000 milliseconds');
  }
  
  if (config.pollInterval < 1000 || config.pollInterval > 60000) {
    throw new Error('POLL_INTERVAL must be between 1000 and 60000 milliseconds');
  }
}

export function getInstanceEmail(config: Config): string {
  return `${config.instance}.${config.name}@tai.chat`;
}