# Development Guide

Welcome to the tai-mcp development guide. This documentation covers architecture, development setup, testing strategies, and contribution guidelines for developers working on tai-mcp.

## Project Overview

tai-mcp is a TypeScript-based Model Context Protocol (MCP) server that provides email functionality to AI agents. The project emphasizes clean architecture, comprehensive testing, and developer-friendly workflows.

### Key Design Principles

- **Modular Architecture** - Clean separation of concerns across layers
- **Type Safety** - Full TypeScript coverage with strict typing
- **Testing First** - Comprehensive integration and unit test coverage
- **Security Focus** - Secure authentication and input validation
- **Developer Experience** - Clear APIs, good logging, and debugging tools

## Technology Stack

### Core Technologies
- **TypeScript 5.3+** - Type-safe JavaScript with modern features
- **Node.js 18+** - Runtime environment with ES modules support
- **Zod** - Runtime type validation and schema definition
- **Jest** - Testing framework with ES modules support

### Email & Content Processing
- **node-fetch** - HTTP client for API communication
- **marked** - Markdown to HTML conversion
- **turndown** - HTML to markdown conversion

### Developer Tools
- **ESLint** - Code linting with TypeScript rules
- **VitePress** - Documentation site generation
- **MCP Inspector** - Tool debugging and introspection

## Architecture Overview

tai-mcp follows a layered architecture pattern:

```
┌─────────────────────────────────────────┐
│              CLI Interface              │
│            (src/index.ts)               │
├─────────────────────────────────────────┤
│             Command Layer               │
│          (src/commands/)                │
├─────────────────────────────────────────┤
│              MCP Server                 │
│           (src/server.ts)               │
├─────────────────────────────────────────┤
│              Tool Layer                 │
│            (src/tools/)                 │
├─────────────────────────────────────────┤
│            Service Layer                │
│          (src/services/)                │
├─────────────────────────────────────────┤
│           Utility Layer                 │
│           (src/utils/)                  │
└─────────────────────────────────────────┘
```

### Layer Responsibilities

**CLI Interface (`src/index.ts`)**
- Command-line argument parsing
- Environment validation
- Process lifecycle management
- Error handling and graceful shutdown

**Command Layer (`src/commands/`)**
- User registration workflows
- Live mode email polling
- Command-specific logic and validation

**MCP Server (`src/server.ts`)**
- MCP protocol implementation
- Tool registration and exposure
- Server resources and capabilities

**Tool Layer (`src/tools/`)**
- Individual MCP tool implementations
- Parameter validation with Zod schemas
- Response formatting for AI agents

**Service Layer (`src/services/`)**
- Core business logic
- External API communication
- Authentication and token management

**Utility Layer (`src/utils/`)**
- Shared functionality
- Configuration management
- Logging and debugging utilities

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Git for version control

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/BMPixel/tai-mcp.git
   cd tai-mcp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Create .env file for development
   cp .env.example .env
   
   # Edit with your development credentials
   NAME=dev-username
   PASSWORD=dev-password
   INSTANCE=dev
   LOG_LEVEL=debug
   ```

4. **Build Project**
   ```bash
   npm run build
   ```

5. **Verify Setup**
   ```bash
   npm test
   ```

### Development Workflow

**Development Mode with Watch:**
```bash
npm run dev
```
- TypeScript compilation with watch mode
- Automatic rebuilds on file changes
- Real-time error reporting

**Testing During Development:**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests  
npm run test:integration
```

**Code Quality:**
```bash
# Lint code
npm run lint

# Fix auto-fixable lint issues
npm run lint -- --fix
```

**Documentation:**
```bash
# Start documentation dev server
npm run docs:dev

# Build documentation
npm run docs:build
```

## Project Structure

```
src/
├── index.ts              # Main entry point & CLI router
├── server.ts             # MCP server implementation
├── commands/             # CLI command implementations
│   ├── register.ts       # User registration command
│   └── live.ts           # Live polling command
├── tools/                # MCP tool implementations
│   ├── send-email.ts     # send_email tool
│   ├── fetch-email.ts    # fetch_email tool
│   ├── list-inbox.ts     # list_inbox tool
│   └── reply-email.ts    # reply_email tool
├── services/             # Core business logic
│   ├── auth.ts           # Authentication service
│   ├── api-client.ts     # API communication
│   └── email-poller.ts   # Email polling for live mode
├── utils/                # Utility modules
│   ├── logger.ts         # Logging utility
│   ├── config.ts         # Configuration management
│   ├── html-to-markdown.ts # Content conversion
│   └── mcp-setup.ts      # MCP configuration helpers
└── types/                # TypeScript type definitions
    ├── api.ts            # API response types
    └── tools.ts          # Tool parameter schemas
```

### Key Files Explained

**`src/index.ts`** - Application entry point
- Parses command-line arguments
- Validates environment variables
- Routes to appropriate command handlers
- Manages process lifecycle and signals

**`src/server.ts`** - MCP server core
- Implements MCP protocol
- Registers all email tools
- Handles server capabilities and resources
- Manages tool execution context

**`src/services/api-client.ts`** - API communication hub
- Centralized HTTP client with authentication
- Automatic JWT token management
- Request/response logging and error handling
- Retry logic and timeout management

**`src/types/tools.ts`** - Type definitions and validation
- Zod schemas for all tool parameters
- TypeScript interfaces for type safety
- Runtime validation and error messages
- Parameter documentation for AI agents

## Development Best Practices

### Code Style

**TypeScript Configuration:**
- Strict mode enabled for maximum type safety
- ES modules with modern JavaScript features
- Explicit return types for public functions
- Comprehensive type definitions

**Naming Conventions:**
```typescript
// Use descriptive, self-documenting names
const authenticatedApiClient = new ApiClient(config);
const emailValidationSchema = z.object({...});

// Functions should be verbs
async function sendEmailToRecipient(params: SendEmailParams): Promise<void>

// Classes should be nouns
class EmailPollingService implements PollingService
```

**Error Handling:**
```typescript
// Use structured error logging
try {
  await apiClient.sendEmail(emailRequest);
} catch (error) {
  logger.error('Failed to send email', {
    error: error instanceof Error ? error.message : error,
    emailRequest: { to: emailRequest.to, subject: emailRequest.subject }
  });
  throw error;
}
```

### Testing Strategy

tai-mcp uses a dual testing approach:

**Integration Tests (Primary)**
- Test complete workflows with real API calls
- Two-account testing pattern (sender/receiver)
- End-to-end validation of email functionality
- Real network conditions and API behavior

**Unit Tests (Secondary)**
- Test individual components in isolation
- Mock external dependencies
- Fast execution for development workflow
- Business logic validation

**Test Structure:**
```
tests/
├── integration/          # End-to-end tests
│   └── api.test.ts      # Complete email workflows
├── unit/                # Component tests
│   ├── services/        # Service layer tests
│   ├── tools/           # Tool implementation tests
│   └── utils/           # Utility function tests
└── mocks/               # Test fixtures and mocks
    └── api-responses.ts # Mock API responses
```

### Development Tools

**MCP Inspector:**
```bash
npm run inspector
```
- Interactive tool debugging
- Parameter validation testing
- Response format verification
- Real-time MCP protocol inspection

**Debug Logging:**
```bash
LOG_LEVEL=debug npm run dev
```
- Detailed operation logging
- API request/response details
- Authentication flow tracking
- Error context and stack traces

**Type Checking:**
```bash
# TypeScript compilation check
npx tsc --noEmit

# Watch mode for continuous checking
npx tsc --noEmit --watch
```

## Contributing Guidelines

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/tai-mcp.git
   cd tai-mcp
   git remote add upstream https://github.com/BMPixel/tai-mcp.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow existing code patterns
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure type safety

4. **Test Changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

5. **Submit Pull Request**
   - Clear description of changes
   - Reference related issues
   - Include test coverage
   - Update documentation

### Code Review Process

**Required Checks:**
- All tests passing (integration + unit)
- ESLint validation without errors
- TypeScript compilation successful
- Documentation updates included

**Review Criteria:**
- Code follows project patterns
- Appropriate test coverage
- Security considerations addressed
- Performance impact assessed

## Common Development Tasks

### Adding New MCP Tools

1. **Create Tool Implementation:**
   ```typescript
   // src/tools/new-tool.ts
   export function registerNewTool(server: McpServer, apiClient: ApiClient, config: Config): void {
     server.tool(
       'new_tool',
       'Description of the new tool',
       newToolSchema.shape,
       async (params): Promise<ToolResponse> => {
         // Implementation
       }
     );
   }
   ```

2. **Define Parameter Schema:**
   ```typescript
   // src/types/tools.ts
   export const newToolSchema = z.object({
     parameter: z.string().describe('Parameter description')
   });
   ```

3. **Register Tool:**
   ```typescript
   // src/server.ts
   import { registerNewTool } from './tools/new-tool.js';
   
   // In createServer function
   registerNewTool(server, apiClient, config);
   ```

4. **Add Tests:**
   ```typescript
   // tests/unit/tools/new-tool.test.ts
   describe('new_tool', () => {
     test('should handle valid parameters', async () => {
       // Test implementation
     });
   });
   ```

### Extending API Client

```typescript
// src/services/api-client.ts
export class ApiClient {
  async newApiMethod(params: NewApiParams): Promise<NewApiResponse> {
    const response = await this.makeRequest('POST', '/api/v1/new-endpoint', params);
    return response.json();
  }
}
```

### Adding Configuration Options

1. **Update Config Interface:**
   ```typescript
   // src/types/tools.ts
   export interface Config {
     // existing fields...
     newOption: string;
   }
   ```

2. **Add Environment Variable Loading:**
   ```typescript
   // src/utils/config.ts
   export function loadConfig(): Config {
     return {
       // existing fields...
       newOption: process.env.NEW_OPTION || 'default-value'
     };
   }
   ```

3. **Update Documentation:**
   - Add to configuration guide
   - Update environment variable reference
   - Include usage examples

## Debugging and Troubleshooting

### Common Development Issues

**TypeScript Compilation Errors:**
```bash
# Check for type errors
npx tsc --noEmit

# Common issues:
# - Missing type imports
# - Incorrect interface implementations
# - Import path issues with .js extensions
```

**Test Failures:**
```bash
# Run specific test file
npm test -- tests/integration/api.test.ts

# Debug test with verbose output
npm test -- --verbose

# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest
```

**Runtime Issues:**
```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# Check environment variables
env | grep -E "(NAME|PASSWORD|INSTANCE)"

# Verify API connectivity
curl https://tai.chat/api/v1/health
```

### Performance Profiling

```bash
# Profile memory usage
node --inspect build/src/index.js

# Monitor API performance
LOG_LEVEL=debug npm start 2>&1 | grep "API request"

# Check bundle size
npm run build && du -h build/
```

## Release Process

### Version Management

tai-mcp follows semantic versioning:
- **Major** (1.0.0) - Breaking changes
- **Minor** (0.1.0) - New features, backward compatible
- **Patch** (0.0.1) - Bug fixes, backward compatible

### Release Checklist

1. **Pre-release Testing**
   ```bash
   npm test
   npm run lint
   npm run build
   npm run docs:build
   ```

2. **Version Update**
   ```bash
   npm version patch|minor|major
   ```

3. **Documentation Update**
   - Update CHANGELOG.md
   - Verify documentation accuracy
   - Update API documentation if needed

4. **Publish Release**
   ```bash
   git push origin main --tags
   npm publish
   ```

## Next Steps

Explore specific development topics:

- [Architecture Guide](/development/architecture) - Detailed architectural patterns
- [Testing Guide](/development/testing) - Comprehensive testing strategies
- [API Reference](/api/) - Tool implementation patterns
- [GitHub Repository](https://github.com/BMPixel/tai-mcp) - Source code and issues