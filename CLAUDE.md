# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TAI MCP Email Server is a Model Context Protocol (MCP) server that enables AI agents to interact with email through the CF Mail Bridge API. The server operates in multiple modes and provides email functionality to MCP-compatible clients like Claude Desktop.

## Development Commands

### Build and Test
```bash
npm run build              # Compile TypeScript and make executable
npm run dev               # Development mode with watch
npm test                  # Run all tests (unit + integration)
npm run test:unit         # Run unit tests only (no API calls)
npm run test:integration  # Run integration tests only
npm run test:watch        # Run tests in watch mode
npm run lint              # ESLint validation
npm run clean             # Remove build directory
```

### Server Operations
```bash
npm start                 # Start as MCP server (default)
npm start live           # Start in live polling mode
npm start register       # Register new user
npm run inspector        # Launch MCP inspector for debugging
```

## Architecture

### Core Structure
The codebase follows a modular architecture:

- **Entry Point**: `src/index.ts` - CLI router and environment validation
- **MCP Server**: `src/server.ts` - Main MCP server implementation with tool registration
- **Tools**: `src/tools/` - MCP tool implementations (send_email, fetch_email, list_inbox, reply_email)
- **Services**: `src/services/` - Core business logic (auth, api-client, email-poller)
- **Commands**: `src/commands/` - CLI command implementations (register, live)

### Key Services
- **ApiClient** (`src/services/api-client.ts`): Centralized CF Mail Bridge API communication with JWT authentication
- **AuthService** (`src/services/auth.ts`): User registration and login with token management  
- **EmailPoller** (`src/services/email-poller.ts`): Monitors for new emails in live mode
- **Markdown Conversion** (`src/utils/html-to-markdown.ts`): Bidirectional markdown ↔ HTML conversion

### Operating Modes
1. **MCP Mode** (default): Provides email tools for MCP clients
2. **Live Mode**: Polls for new emails and auto-invokes Claude Code
3. **Registration Mode**: Registers new users with the API

## Configuration

### Required Environment Variables
```bash
NAME=username          # CF Mail Bridge username
PASSWORD=password      # Authentication password
INSTANCE=instance      # Agent instance identifier (e.g., "desktop")
```

### Optional Environment Variables
```bash
USEREMAIL=user@example.com    # Default recipient for send_email
LOG_LEVEL=info                # error|warn|info|debug
API_TIMEOUT=30000             # API request timeout in ms
POLL_INTERVAL=5000            # Live mode polling interval in ms
API_BASE_URL=https://tai.chat # API base URL
```

The instance email format is: `{INSTANCE}.{NAME}@tai.chat`

## Testing Strategy

### Integration Tests (Default)
- **Primary Focus**: End-to-end email workflows with real API calls
- **Two-Account Testing**: Sender account sends email to receiver account  
- **Complete Flow Validation**: Send → Receive → Parse → Process → Mark Read
- **Bug Detection**: Tests authorization, filtering, and content parsing
- **Real API Behavior**: Uses actual CF Mail Bridge API endpoints
- **Automatic**: Run by default with `npm test`

### Unit Tests
- **Secondary Focus**: Isolated component testing with mocks
- **Fast Execution**: No external API dependencies
- **Business Logic**: Test individual service methods and utilities
- **CI/CD Friendly**: Run with `npm run test:unit`

### Configuration
- **Framework**: Jest with ES modules support
- **Import Format**: All imports use `.js` extensions for TypeScript files
- **Environment**: Integration tests use unique test accounts per run
- **Opt-out**: Set `TEST_INTEGRATION=false` to skip integration tests

## Code Patterns

### Tool Implementation
Each MCP tool follows a consistent pattern:
1. Zod schema validation with comprehensive parameter descriptions
2. Structured error handling with logging
3. Type-safe parameter processing
4. MCP-compliant response format

### Error Handling
- Comprehensive validation using Zod schemas
- Structured logging with context
- User-friendly error messages for agents
- Authentication retry on 401 errors

### API Integration
- Centralized API client with JWT token management
- Automatic token refresh
- Request/response logging
- Timeout and retry handling

## Key Files to Understand

- `src/server.ts:26-33` - Tool registration pattern
- `src/services/api-client.ts` - API communication layer
- `src/utils/config.ts` - Environment variable validation
- `src/types/tools.ts` - Type definitions and schemas

## Live Mode Operation

When running in live mode, the server:
1. Polls CF Mail Bridge API every 5 seconds for unread emails
2. Executes `claude code -p "Please resolve the unread email and send the response back to the user after the email is resolved"` when new emails are detected
3. Claude Code uses the same MCP server to fetch, process, and respond to emails

This creates a fully automated email processing workflow where Claude Code can handle incoming emails autonomously.

## Development Notes
- Current codebase is in active development, there is no need for backward compatibility or mention features that no longer exists