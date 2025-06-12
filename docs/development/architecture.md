# Architecture Guide

This guide provides an in-depth look at tai-mcp's architecture, design patterns, and implementation details. Understanding the architecture helps developers contribute effectively and extend functionality.

## System Overview

tai-mcp is designed as a modular, layered system that bridges AI agents with email functionality through the Model Context Protocol (MCP). The architecture emphasizes separation of concerns, type safety, and maintainability.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AI Agent                             │
│                 (Claude Desktop)                        │
└────────────────────┬────────────────────────────────────┘
                     │ MCP Protocol
┌────────────────────▼────────────────────────────────────┐
│                tai-mcp Server                           │
│  ┌─────────────┬─────────────┬─────────────────────────┐ │
│  │   Tools     │   Services  │       Utilities         │ │
│  │             │             │                         │ │
│  │ send_email  │ api-client  │ config, logger          │ │
│  │ fetch_email │ auth        │ html-to-markdown        │ │
│  │ list_inbox  │ email-      │ mcp-setup              │ │
│  │ reply_email │ poller      │                         │ │
│  └─────────────┴─────────────┴─────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS API
┌────────────────────▼────────────────────────────────────┐
│                Email Service                            │
│              (tai.chat API)                             │
└─────────────────────────────────────────────────────────┘
```

## Architectural Layers

### 1. Entry Layer (`src/index.ts`)

**Purpose:** Application bootstrapping and command routing

**Responsibilities:**
- Command-line argument parsing
- Environment variable validation
- Process lifecycle management
- Signal handling for graceful shutdown
- Command delegation to appropriate handlers

**Key Patterns:**
```typescript
// Command pattern for CLI routing
const commands = {
  register: () => import('./commands/register.js'),
  live: () => import('./commands/live.js'),
  default: () => import('./server.js')
};

// Environment validation with early failure
const config = loadConfig();
validateConfig(config);
```

### 2. Command Layer (`src/commands/`)

**Purpose:** Implement specific operational modes

#### Registration Command (`register.ts`)
- User account creation workflow
- Interactive credential collection
- Account validation and setup
- Success/failure reporting

#### Live Mode Command (`live.ts`)
- Email polling orchestration
- Claude Code integration
- Error handling and recovery
- Performance monitoring

**Design Pattern:** Command pattern with async execution

```typescript
export async function executeCommand(config: Config): Promise<void> {
  // Command-specific implementation
  // Clean error handling and logging
  // Graceful shutdown support
}
```

### 3. MCP Server Layer (`src/server.ts`)

**Purpose:** Model Context Protocol implementation

**Responsibilities:**
- MCP protocol compliance
- Tool registration and exposure
- Server capabilities declaration
- Resource management
- Request/response handling

**Key Components:**
```typescript
// Tool registration pattern
function createServer(config: Config): McpServer {
  const server = new McpServer(/* config */);
  
  // Register all email tools
  registerSendEmailTool(server, apiClient, config);
  registerFetchEmailTool(server, apiClient, config);
  registerListInboxTool(server, apiClient, config);
  registerReplyEmailTool(server, apiClient, config);
  
  return server;
}
```

### 4. Tool Layer (`src/tools/`)

**Purpose:** Individual MCP tool implementations

Each tool follows a consistent pattern:

```typescript
export function registerToolName(
  server: McpServer, 
  apiClient: ApiClient, 
  config: Config
): void {
  server.tool(
    'tool_name',
    'Tool description for AI agents',
    toolSchema.shape,
    async (params): Promise<ToolResponse> => {
      // 1. Parameter validation with Zod
      const validatedParams = toolSchema.parse(params);
      
      // 2. Business logic execution
      const result = await businessLogic(validatedParams);
      
      // 3. Response formatting for AI agents
      return formatResponse(result);
    }
  );
}
```

#### Tool Design Principles

**Consistent Interface:**
- Zod schema validation for all parameters
- Structured error handling with logging
- User-friendly response formatting
- Comprehensive documentation in schemas

**Error Handling:**
```typescript
try {
  // Tool logic
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error('Tool execution failed', { 
    tool: 'send_email',
    error: errorMessage,
    params 
  });
  
  return {
    content: [{
      type: "text",
      text: `Error: ${errorMessage}`
    }]
  };
}
```

### 5. Service Layer (`src/services/`)

**Purpose:** Core business logic and external integrations

#### API Client (`api-client.ts`)

**Architecture Pattern:** Facade with automatic retry

```typescript
export class ApiClient {
  private authService: AuthService;
  private config: Config;
  
  // Centralized request handling
  private async makeRequest(
    method: string, 
    endpoint: string, 
    data?: any
  ): Promise<Response> {
    // 1. Ensure authentication
    await this.authService.ensureAuthenticated();
    
    // 2. Build request with headers
    const request = this.buildRequest(method, endpoint, data);
    
    // 3. Execute with retry logic
    return this.executeWithRetry(request);
  }
}
```

**Key Features:**
- Automatic JWT token management
- Request/response logging
- Retry logic with exponential backoff
- Error classification and handling
- Timeout management

#### Authentication Service (`auth.ts`)

**Architecture Pattern:** Token manager with proactive refresh

```typescript
export class AuthService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  
  async ensureAuthenticated(): Promise<void> {
    // Proactive token refresh (5 minutes before expiry)
    if (this.shouldRefreshToken()) {
      await this.refreshToken();
    }
    
    if (!this.token) {
      await this.login();
    }
  }
}
```

**Security Features:**
- Memory-only token storage
- Proactive token refresh
- Automatic retry on 401 responses
- Secure credential handling

#### Email Poller (`email-poller.ts`)

**Architecture Pattern:** Observer with configurable polling

```typescript
export class EmailPoller {
  private polling = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastCheckedMessageId?: number;
  
  async start(): Promise<void> {
    this.polling = true;
    
    // Initial check
    await this.checkForNewEmails();
    
    // Set up polling interval
    this.pollInterval = setInterval(
      () => this.checkForNewEmails(),
      this.config.pollInterval
    );
  }
}
```

### 6. Utility Layer (`src/utils/`)

**Purpose:** Shared functionality and cross-cutting concerns

#### Configuration Management (`config.ts`)

**Pattern:** Environment-based configuration with validation

```typescript
export function loadConfig(): Config {
  const config = {
    name: getRequiredEnv('NAME'),
    password: getRequiredEnv('PASSWORD'),
    instance: getRequiredEnv('INSTANCE'),
    // Optional with defaults
    logLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
    apiTimeout: parseInt(process.env.API_TIMEOUT || '30000'),
  };
  
  validateConfig(config);
  return config;
}
```

#### Logging (`logger.ts`)

**Pattern:** Structured logging with context

```typescript
export const logger = {
  info: (message: string, context?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }));
  }
};
```

#### Content Conversion (`html-to-markdown.ts`)

**Pattern:** Bidirectional transformation with sanitization

```typescript
export function convertHtmlToMarkdown(html: string): string {
  // Sanitize HTML input
  const sanitized = sanitizeHtml(html);
  
  // Convert to markdown with preserved structure
  return turndownService.turndown(sanitized);
}

export function convertMarkdownToHtml(markdown: string): string {
  // Parse markdown with security considerations
  return marked.parse(markdown, { 
    breaks: true,
    gfm: true 
  });
}
```

## Data Flow Patterns

### Email Sending Flow

```
AI Agent Request
      ↓
Tool Parameter Validation (Zod)
      ↓
Content Processing (Markdown → HTML)
      ↓
API Client Authentication Check
      ↓
HTTP Request to Email Service
      ↓
Response Processing & Logging
      ↓
Formatted Response to AI Agent
```

### Email Receiving Flow

```
Email Polling (Live Mode)
      ↓
New Email Detection
      ↓
Claude Code Invocation
      ↓
MCP Tool Usage (fetch_email)
      ↓
Content Processing (HTML → Markdown)
      ↓
AI Processing & Response Generation
      ↓
Response Sending (reply_email)
```

## Design Patterns

### 1. Factory Pattern (Server Creation)

```typescript
// Centralized server creation with dependency injection
export function createServer(config: Config): McpServer {
  const apiClient = new ApiClient(config);
  const server = new McpServer(/* ... */);
  
  // Register tools with dependencies
  registerAllTools(server, apiClient, config);
  
  return server;
}
```

### 2. Strategy Pattern (Content Processing)

```typescript
// Different strategies for content handling
const contentProcessors = {
  markdown: (content: string) => convertMarkdownToHtml(content),
  html: (content: string) => content,
  text: (content: string) => escapeHtml(content)
};

const processor = contentProcessors[format] || contentProcessors.markdown;
const processedContent = processor(content);
```

### 3. Observer Pattern (Email Polling)

```typescript
// Email poller notifies handlers of new emails
class EmailPoller {
  private handlers: EmailHandler[] = [];
  
  addHandler(handler: EmailHandler): void {
    this.handlers.push(handler);
  }
  
  private async notifyHandlers(email: Email): Promise<void> {
    await Promise.all(
      this.handlers.map(handler => handler.handleEmail(email))
    );
  }
}
```

### 4. Decorator Pattern (API Client)

```typescript
// Wrap HTTP client with authentication and retry logic
class AuthenticatedApiClient {
  constructor(private baseClient: HttpClient) {}
  
  async request(...args): Promise<Response> {
    return this.withAuth(
      this.withRetry(
        this.baseClient.request(...args)
      )
    );
  }
}
```

## Error Handling Architecture

### Error Classification

```typescript
// Hierarchical error types for appropriate handling
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Error Propagation Strategy

```typescript
// Consistent error handling across layers
async function toolExecution(params: any): Promise<ToolResponse> {
  try {
    // Business logic
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Trigger re-authentication
      return retryWithAuth();
    } else if (error instanceof ValidationError) {
      // User-friendly validation message
      return formatValidationError(error);
    } else {
      // Generic error handling
      return formatGenericError(error);
    }
  }
}
```

## Security Architecture

### Authentication Flow

```
Environment Variables → Config Validation → AuthService
                                                ↓
JWT Token Request → Memory Storage → API Requests
                                                ↓
Proactive Refresh → Token Validation → Retry Logic
```

### Input Validation

```typescript
// Multi-layer validation approach
export const emailSchema = z.object({
  to: z.string()
    .email('Must be valid email')
    .refine(email => !email.includes('..'), 'Invalid email format'),
  subject: z.string()
    .max(998, 'Subject too long')
    .refine(subject => !subject.includes('\n'), 'No newlines in subject'),
  content: z.string()
    .max(1048576, 'Content too large (1MB limit)')
});
```

### Security Boundaries

1. **Input Validation** - Zod schemas at tool entry points
2. **Authentication** - JWT tokens for all API calls
3. **Authorization** - User-scoped data access
4. **Content Sanitization** - HTML cleaning and validation
5. **Error Information** - No sensitive data in error messages

## Performance Considerations

### Memory Management

```typescript
// Streaming for large content
async function processLargeEmail(email: Email): Promise<string> {
  if (email.size > LARGE_EMAIL_THRESHOLD) {
    return streamProcessContent(email);
  }
  return processContent(email.content);
}
```

### Caching Strategy

```typescript
// Intelligent token caching
class AuthService {
  private tokenCache = new Map<string, TokenInfo>();
  
  async getToken(username: string): Promise<string> {
    const cached = this.tokenCache.get(username);
    if (cached && !this.isNearExpiry(cached)) {
      return cached.token;
    }
    
    return this.refreshToken(username);
  }
}
```

### Connection Pooling

```typescript
// Reuse HTTP connections for API efficiency
const apiClient = new ApiClient({
  keepAlive: true,
  maxSockets: 10,
  timeout: 30000
});
```

## Extension Points

### Adding New Tools

1. **Create Tool Implementation:**
   ```typescript
   // src/tools/new-tool.ts
   export function registerNewTool(
     server: McpServer, 
     apiClient: ApiClient, 
     config: Config
   ): void {
     // Implementation following established patterns
   }
   ```

2. **Define Schema:**
   ```typescript
   // src/types/tools.ts
   export const newToolSchema = z.object({
     // Parameter definitions with descriptions
   });
   ```

3. **Register in Server:**
   ```typescript
   // src/server.ts
   import { registerNewTool } from './tools/new-tool.js';
   registerNewTool(server, apiClient, config);
   ```

### Extending API Client

```typescript
// src/services/api-client.ts
export class ApiClient {
  async newEndpoint(params: NewParams): Promise<NewResponse> {
    return this.makeRequest('POST', '/api/v1/new-endpoint', params);
  }
}
```

### Adding New Commands

```typescript
// src/commands/new-command.ts
export async function executeNewCommand(config: Config): Promise<void> {
  // Command implementation following patterns
}

// src/index.ts - Register command
const commands = {
  // existing commands...
  'new-command': () => import('./commands/new-command.js')
};
```

## Testing Architecture

### Test Structure

```
tests/
├── integration/          # End-to-end API tests
│   └── api.test.ts      # Real API workflows
├── unit/                # Isolated component tests
│   ├── services/        # Service layer tests
│   ├── tools/           # Tool implementation tests  
│   └── utils/           # Utility function tests
└── mocks/               # Test fixtures
    └── api-responses.ts # Mock API data
```

### Test Patterns

**Integration Tests:**
```typescript
// Two-account testing pattern
describe('Email workflow', () => {
  test('send and receive email', async () => {
    // Sender account sends email
    const sendResult = await senderClient.sendEmail({
      to: 'receiver@tai.chat',
      subject: 'Test Email',
      content: 'Test content'
    });
    
    // Receiver account fetches email
    const fetchResult = await receiverClient.fetchEmail();
    
    // Verify email received correctly
    expect(fetchResult).toContain('Test content');
  });
});
```

**Unit Tests:**
```typescript
// Mock external dependencies
jest.mock('../services/api-client.js');

describe('EmailTool', () => {
  test('validates parameters correctly', () => {
    const result = emailSchema.safeParse(invalidParams);
    expect(result.success).toBe(false);
  });
});
```

## Deployment Architecture

### Build Process

```typescript
// TypeScript compilation with ES modules
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "outDir": "./build"
  }
}
```

### Distribution

```bash
# NPM package with executable
{
  "bin": {
    "tai-mcp": "./build/src/index.js"
  },
  "files": ["build/", "README.md", "package.json"]
}
```

### Runtime Dependencies

```
Node.js 18+ Runtime
      ↓
NPX Package Manager
      ↓
tai-mcp Executable
      ↓
Environment Configuration
      ↓
Email Service API
```

## Monitoring and Observability

### Structured Logging

```typescript
// Consistent log format across all components
logger.info('Operation completed', {
  operation: 'send_email',
  messageId: 'msg_123',
  recipient: 'user@example.com',
  duration: 1250,
  success: true
});
```

### Performance Metrics

```typescript
// Built-in performance tracking
const startTime = Date.now();
await performOperation();
const duration = Date.now() - startTime;

logger.info('Performance metric', {
  operation: 'api_request',
  endpoint: '/api/v1/messages',
  duration,
  status: 'success'
});
```

### Health Monitoring

```typescript
// Regular health checks in live mode
class EmailPoller {
  private async healthCheck(): Promise<boolean> {
    try {
      await this.apiClient.ping();
      return true;
    } catch (error) {
      logger.warn('Health check failed', { error: error.message });
      return false;
    }
  }
}
```

This architecture provides a solid foundation for email automation while maintaining flexibility for future enhancements and integrations.

## Next Steps

- [Testing Guide](/development/testing) - Comprehensive testing strategies
- [Development Guide](/development/) - Setup and contribution guidelines
- [API Reference](/api/) - Tool implementation details