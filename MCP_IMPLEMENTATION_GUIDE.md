# MCP Implementation Guide

A comprehensive guide to building Model Context Protocol (MCP) servers using TypeScript and modern development practices.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Core Architecture](#core-architecture)
3. [Tool Implementation](#tool-implementation)
4. [Schema Design](#schema-design)
5. [Error Handling](#error-handling)
6. [Testing Strategy](#testing-strategy)
7. [Resource Management](#resource-management)
8. [Production Considerations](#production-considerations)

## Project Setup

### 1. Package Configuration

Create a modern Node.js project with ES modules support:

```json
{
  "name": "your-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "./build/src/index.js",
  "bin": {
    "your-mcp-server": "./build/src/index.js"
  },
  "scripts": {
    "build": "tsc && chmod +x build/src/index.js",
    "dev": "tsc --watch",
    "start": "node build/src/index.js",
    "inspector": "npm run build && npx @modelcontextprotocol/inspector build/src/index.js",
    "test": "node --experimental-vm-modules node_modules/.bin/jest"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.1",
    "zod": "^3.25.56"
  }
}
```

### 2. TypeScript Configuration

Configure TypeScript for ES modules with proper module resolution:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "./build",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "build"]
}
```

**Critical**: All imports must use `.js` extensions for compiled TypeScript files, even when importing `.ts` files.

## Core Architecture

### 1. Server Bootstrap

Create a robust server entry point with proper error handling:

```typescript
#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './utils/logger.js';

// Import tool registration functions
import { registerYourTool } from './tools/your-tool.js';

const server = new McpServer({
  name: 'your-mcp-server',
  version: '1.0.0'
});

// Register all tools
registerYourTool(server);

async function main(): Promise<void> {
  try {
    // Perform platform checks and validation
    validateEnvironment();
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    logger.info('MCP server started successfully');
  } catch (error) {
    logger.error('Failed to start server', { error });
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

main().catch((error) => {
  logger.error('Unhandled error in main', { error });
  process.exit(1);
});
```

### 2. Directory Structure

Organize your codebase for maintainability and scalability:

```
src/
├── index.ts              # Server entry point
├── tools/                # Tool implementations
│   ├── tool-one.ts
│   └── tool-two.ts
├── types/                # TypeScript type definitions
│   └── schemas.ts
├── utils/                # Utility functions
│   ├── logger.ts
│   ├── validation.ts
│   └── error-handling.ts
└── resources/            # Resource handlers (optional)
    └── info.ts

tests/
├── unit/
├── integration/
└── fixtures/
```

## Tool Implementation

### 1. Tool Registration Pattern

Each tool should follow a consistent registration pattern:

```typescript
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.js';

// Define schema with comprehensive validation
const yourToolSchema = z.object({
  requiredParam: z.string()
    .min(1)
    .describe('Clear description of what this parameter does'),
  optionalParam: z.string()
    .optional()
    .describe('Optional parameter with specific use case'),
  enumParam: z.enum(['option1', 'option2', 'option3'])
    .optional()
    .describe('Enumerated values with clear choices'),
  arrayParam: z.array(z.string().min(1))
    .max(10)
    .optional()
    .describe('Array parameter with reasonable limits')
});

export function registerYourTool(server: McpServer): void {
  server.tool(
    'your_tool_name',
    'Clear, action-oriented description of what the tool does',
    yourToolSchema.shape,
    async (params) => {
      try {
        logger.info('Executing tool', { toolName: 'your_tool_name', params });
        
        // Validate parameters (additional validation if needed)
        const validatedParams = yourToolSchema.parse(params);
        
        // Perform the actual operation
        const result = await performOperation(validatedParams);
        
        // Return MCP-compliant response
        return {
          content: [{
            type: "text",
            text: `Operation completed successfully: ${result}`
          }]
        };
      } catch (error) {
        logger.error('Tool execution failed', { 
          toolName: 'your_tool_name', 
          error: error instanceof Error ? error.message : error 
        });
        throw error;
      }
    }
  );
}

async function performOperation(params: z.infer<typeof yourToolSchema>) {
  // Implementation details
  return "success";
}
```

### 2. Tool Categories

Organize tools by functional categories:

**Creation Tools**: No authentication required, simple operations
```typescript
// Pattern: Direct parameter mapping, minimal validation
const createSchema = z.object({
  title: z.string().min(1).describe('Item title'),
  description: z.string().optional().describe('Optional description')
});
```

**Update Tools**: Authentication required, complex state changes
```typescript
// Pattern: ID-based operations, comprehensive validation
const updateSchema = z.object({
  id: z.string().min(1).describe('Unique identifier for the item'),
  updates: z.object({
    title: z.string().optional(),
    status: z.enum(['active', 'completed', 'archived']).optional()
  }).describe('Fields to update')
});
```

**Query Tools**: Read-only operations, filtering and searching
```typescript
// Pattern: Flexible filtering, pagination support
const querySchema = z.object({
  filters: z.object({
    status: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
    }).optional()
  }).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});
```

## Schema Design

### 1. Comprehensive Parameter Validation

Use Zod for robust schema definition with clear descriptions:

```typescript
const comprehensiveSchema = z.object({
  // String validation with constraints
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title too long')
    .describe('Item title (required, 1-200 characters)'),
  
  // Optional fields with defaults
  priority: z.enum(['low', 'medium', 'high'])
    .default('medium')
    .describe('Priority level (default: medium)'),
  
  // Date validation with regex
  dueDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional()
    .describe('Due date in ISO format (YYYY-MM-DD)'),
  
  // Array validation with limits
  tags: z.array(z.string().min(1))
    .max(20, 'Too many tags')
    .optional()
    .describe('Array of tags for categorization (max 20)'),
  
  // Complex nested objects
  metadata: z.object({
    source: z.string().optional(),
    externalId: z.string().optional(),
    customFields: z.record(z.string(), z.any()).optional()
  }).optional().describe('Additional metadata')
});
```

### 2. Type Safety

Generate TypeScript types from schemas:

```typescript
// Generate types from schemas
type YourToolInput = z.infer<typeof yourToolSchema>;
type YourToolOutput = {
  content: Array<{
    type: "text";
    text: string;
  }>;
};

// Use types in implementation
async function processInput(input: YourToolInput): Promise<YourToolOutput> {
  // Type-safe implementation
  return {
    content: [{
      type: "text",
      text: `Processed: ${input.requiredParam}`
    }]
  };
}
```

## Error Handling

### 1. Structured Error Handling

Implement consistent error handling across all tools:

```typescript
class McpToolError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'McpToolError';
  }
}

async function safeToolExecution<T>(
  operation: () => Promise<T>,
  context: { toolName: string; params?: any }
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof McpToolError) {
      logger.error('Tool error', { ...context, error: error.message, code: error.code });
      throw error;
    }
    
    logger.error('Unexpected error', { ...context, error });
    throw new McpToolError(
      'An unexpected error occurred',
      'INTERNAL_ERROR',
      500
    );
  }
}
```

### 2. Validation Error Handling

Handle Zod validation errors gracefully:

```typescript
function handleValidationError(error: z.ZodError): never {
  const issues = error.issues.map(issue => 
    `${issue.path.join('.')}: ${issue.message}`
  ).join(', ');
  
  throw new McpToolError(
    `Validation failed: ${issues}`,
    'VALIDATION_ERROR',
    400
  );
}

// Usage in tool implementation
try {
  const validatedParams = yourToolSchema.parse(params);
} catch (error) {
  if (error instanceof z.ZodError) {
    handleValidationError(error);
  }
  throw error;
}
```

## Testing Strategy

### 1. Jest Configuration for ES Modules

Configure Jest for ES module support:

```javascript
// jest.config.js
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true
    }]
  },
  testEnvironment: 'node'
};
```

### 2. Tool Registration Testing

Test tool registration without execution:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { registerYourTool } from '../src/tools/your-tool.js';

describe('Tool Registration', () => {
  let server: McpServer;

  beforeEach(() => {
    server = new McpServer({
      name: 'test-server',
      version: '1.0.0'
    });
  });

  it('should register tool without errors', () => {
    expect(() => registerYourTool(server)).not.toThrow();
  });

  it('should validate tool schema', () => {
    registerYourTool(server);
    // Test that tool is properly registered
    expect(server).toBeDefined();
  });
});
```

### 3. Integration Testing

Test complete tool workflows:

```typescript
describe('Tool Integration', () => {
  it('should handle valid parameters', async () => {
    const mockParams = {
      requiredParam: 'test-value',
      optionalParam: 'optional-value'
    };
    
    // Mock external dependencies
    jest.mock('../src/utils/external-service.js');
    
    const result = await executeToolDirectly(mockParams);
    
    expect(result).toEqual({
      content: [{
        type: "text",
        text: expect.stringContaining('success')
      }]
    });
  });

  it('should handle validation errors', async () => {
    const invalidParams = {
      requiredParam: '' // Invalid: empty string
    };
    
    await expect(executeToolDirectly(invalidParams))
      .rejects.toThrow('Validation failed');
  });
});
```

## Resource Management

### 1. Server Information Resource

Provide server metadata through resources:

```typescript
server.resource(
  'server-info',
  'your-mcp://info',
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify({
        name: 'Your MCP Server',
        version: '1.0.0',
        description: 'Description of server capabilities',
        platform: process.platform,
        availableTools: [
          'tool_one',
          'tool_two'
        ],
        configuration: {
          requiresAuth: !!process.env.AUTH_TOKEN,
          supportedFormats: ['json', 'text']
        }
      }, null, 2)
    }]
  })
);
```

### 2. Dynamic Resource Handling

Handle parameterized resources:

```typescript
server.resource(
  'data-export',
  'your-mcp://export/{format}',
  async (uri) => {
    const format = uri.pathname.split('/').pop();
    
    if (!['json', 'csv', 'xml'].includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }
    
    const data = await exportData(format);
    
    return {
      contents: [{
        uri: uri.href,
        text: data,
        mimeType: getMimeType(format)
      }]
    };
  }
);
```

## Production Considerations

### 1. Environment Validation

Validate runtime environment and dependencies:

```typescript
function validateEnvironment(): void {
  // Platform checks
  if (process.platform !== 'darwin' && requiresMacOS()) {
    logger.warn('Some features require macOS', { platform: process.platform });
  }
  
  // Required environment variables
  const requiredEnvVars = ['AUTH_TOKEN', 'API_ENDPOINT'];
  const missing = requiredEnvVars.filter(name => !process.env[name]);
  
  if (missing.length > 0) {
    logger.warn('Missing environment variables', { missing });
  }
  
  // Dependency validation
  validateDependencies();
}

function validateDependencies(): void {
  try {
    // Check if required external tools are available
    execSync('which your-required-tool', { stdio: 'ignore' });
  } catch (error) {
    logger.warn('External dependency not found', { tool: 'your-required-tool' });
  }
}
```

### 2. Logging Strategy

Implement structured logging for production debugging:

```typescript
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'your-mcp-server' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Usage with context
logger.info('Operation completed', {
  toolName: 'your_tool',
  duration: Date.now() - startTime,
  itemsProcessed: results.length
});
```

### 3. Performance Monitoring

Add performance monitoring for tool execution:

```typescript
function withPerformanceMonitoring<T>(
  operation: () => Promise<T>,
  context: { toolName: string }
): Promise<T> {
  const startTime = Date.now();
  
  return operation()
    .then(result => {
      const duration = Date.now() - startTime;
      logger.info('Tool execution completed', {
        ...context,
        duration,
        status: 'success'
      });
      return result;
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      logger.error('Tool execution failed', {
        ...context,
        duration,
        status: 'error',
        error: error.message
      });
      throw error;
    });
}
```

### 4. Security Best Practices

- **Input Validation**: Always validate and sanitize inputs using Zod schemas
- **Authentication**: Implement proper authentication for sensitive operations
- **Rate Limiting**: Consider implementing rate limiting for resource-intensive operations
- **Secret Management**: Never log or expose sensitive data like API keys or tokens
- **Permission Checks**: Validate permissions before executing operations

```typescript
// Example secure operation
async function secureOperation(params: SecureParams): Promise<Result> {
  // Validate authentication
  if (!isAuthenticated(params.authToken)) {
    throw new McpToolError('Authentication required', 'AUTH_REQUIRED', 401);
  }
  
  // Check permissions
  if (!hasPermission(params.authToken, 'write')) {
    throw new McpToolError('Insufficient permissions', 'FORBIDDEN', 403);
  }
  
  // Sanitize inputs
  const sanitized = sanitizeInput(params);
  
  // Execute with monitoring
  return withPerformanceMonitoring(
    () => performSecureOperation(sanitized),
    { toolName: 'secure_operation' }
  );
}
```

## Conclusion

This guide provides a foundation for building robust, maintainable MCP servers. Key principles:

1. **Consistency**: Follow established patterns across all tools
2. **Validation**: Use comprehensive schema validation with clear error messages
3. **Type Safety**: Leverage TypeScript for compile-time safety
4. **Error Handling**: Implement structured error handling and logging
5. **Testing**: Write comprehensive tests for both unit and integration scenarios
6. **Security**: Always validate inputs and implement proper authentication
7. **Performance**: Monitor execution times and resource usage
8. **Documentation**: Provide clear descriptions for all tools and parameters

Following these patterns will result in MCP servers that are reliable, secure, and easy to maintain in production environments.