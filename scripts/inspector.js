#!/usr/bin/env node

import { config } from 'dotenv';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

config({ path: join(projectRoot, '.env') });

// Ensure required environment variables are set
const requiredEnvVars = ['NAME', 'PASSWORD', 'INSTANCE'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease set these variables in your .env file.');
  process.exit(1);
}

// Run the MCP Inspector with environment variables
console.log('🔍 Starting MCP Inspector with environment configuration...');
console.log(`📧 Instance: ${process.env.INSTANCE}.${process.env.NAME}@tai.chat`);
console.log(`🔧 Log Level: ${process.env.LOG_LEVEL || 'info'}`);

const inspectorArgs = [
  'npx',
  '@modelcontextprotocol/inspector',
  join(projectRoot, 'build/src/index.js')
];

const inspector = spawn('npm', ['run', 'build'], { 
  stdio: 'inherit',
  cwd: projectRoot,
  env: process.env
});

inspector.on('close', (buildCode) => {
  if (buildCode !== 0) {
    console.error('❌ Build failed');
    process.exit(buildCode);
  }
  
  console.log('✅ Build completed, starting inspector...');
  
  const inspectorProcess = spawn('npx', [
    '@modelcontextprotocol/inspector',
    join(projectRoot, 'build/src/index.js')
  ], {
    stdio: 'inherit',
    cwd: projectRoot,
    env: process.env
  });
  
  inspectorProcess.on('close', (code) => {
    process.exit(code);
  });
});