# TAI MCP Email Server - Detailed Project Plan

## Usage Overview

The TAI MCP Email Server enables AI agents (like Claude Code) to interact with email through the CF Mail Bridge API. The server provides two primary modes of operation:

### 1. MCP Mode (Default)
When launched without arguments, the server starts as an MCP server that can be integrated with Claude Desktop or other MCP-compatible clients. The agent can:
- Send emails to any recipient (with USEREMAIL as the suggested default)
- Fetch unread emails one at a time from their instance address
- List recent emails in their inbox

### 2. Live Mode
When launched with the `live` subcommand, the server:
- Polls the CF Mail Bridge API every 5 seconds for unread emails
- When a new email is detected, automatically invokes Claude Code with:
  ```bash
  claude code -p "Please resolve the unread email and send the response back to the user after the email is resolved"
  ```
- Claude Code, equipped with this same MCP server, can then fetch the email, process it, and send a response

### 3. Registration Mode
The `register` subcommand allows manual user registration with the CF Mail Bridge API, useful for initial setup or testing.

## Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    TAI MCP Email Server                      │
├─────────────────────────────────────────────────────────────┤
│  Environment Variables:                                      │
│  - NAME: Username (e.g., "alice")                           │
│  - PASSWORD: Authentication password                         │
│  - INSTANCE: Agent instance (e.g., "desktop")              │
│  - USEREMAIL: Default recipient email                       │
│                                                             │
│  Derived Email: desktop.alice@tai.chat                      │
└─────────────────┬───────────────┬───────────────────────────┘
                  │               │
                  ▼               ▼
         ┌────────────────┐  ┌────────────────┐
         │   MCP Mode     │  │   Live Mode    │
         │                │  │                │
         │ - send_email   │  │ - Poll API     │
         │ - fetch_email  │  │ - Invoke       │
         │ - list_inbox   │  │   Claude Code  │
         └────────────────┘  └────────────────┘
                  │               │
                  └───────┬───────┘
                          ▼
              ┌──────────────────────┐
              │  CF Mail Bridge API  │
              │   https://tai.chat   │
              └──────────────────────┘
```

### Project Structure
```
tai-mcp-email-server/
├── package.json                 # NPM package configuration
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest test configuration
├── README.md                   # User documentation
├── LICENSE                     # License file
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore patterns
│
├── src/
│   ├── index.ts                # Main entry point & CLI router
│   ├── server.ts               # MCP server implementation
│   ├── commands/
│   │   ├── register.ts         # Registration subcommand
│   │   └── live.ts             # Live polling subcommand
│   │
│   ├── tools/
│   │   ├── send-email.ts       # send_email tool implementation
│   │   ├── fetch-email.ts      # fetch_email tool implementation
│   │   └── list-inbox.ts       # list_inbox tool implementation
│   │
│   ├── services/
│   │   ├── auth.ts             # Authentication service
│   │   ├── api-client.ts       # CF Mail Bridge API client
│   │   └── email-poller.ts     # Email polling service for live mode
│   │
│   ├── utils/
│   │   ├── logger.ts           # Multi-level logging utility
│   │   ├── html-to-markdown.ts # HTML to markdown converter
│   │   └── config.ts           # Configuration management
│   │
│   └── types/
│       ├── api.ts              # API response type definitions
│       └── tools.ts            # Tool parameter schemas
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── tools/
│   │   └── utils/
│   │
│   ├── integration/
│   │   └── api.test.ts         # API integration tests
│   │
│   └── mocks/
│       └── api-responses.ts    # Mocked API responses
│
└── build/                      # Compiled JavaScript output
```

## Core Components

### 1. Authentication Service
- **Purpose**: Manage authentication with CF Mail Bridge API
- **Key Functions**:
  - `register(username, password)`: Register new user
  - `login(username, password)`: Authenticate and get JWT token
  - `getAuthHeaders()`: Return current auth headers with JWT
- **Token Management**: Store JWT in memory, auto-refresh on 401 errors

### 2. API Client Service
- **Purpose**: Centralized API communication with CF Mail Bridge
- **Base URL**: `https://tai.chat`
- **Key Methods**:
  - `sendEmail(params)`: POST /api/v1/send-email
  - `fetchMessages(params)`: GET /api/v1/messages
  - `markAsRead(messageId)`: PUT /api/v1/messages/{id}/read
- **Error Handling**: Return structured error messages for agent retry

### 3. Email Poller Service
- **Purpose**: Poll for unread emails in live mode
- **Configuration**:
  - Polling interval: 5 seconds
  - Filter: Only emails to `${INSTANCE}.${NAME}@tai.chat`
  - Query: `prefix=${INSTANCE}&show_read=false`
- **Action**: Execute `claude code` command when new email detected

### 4. HTML to Markdown Converter
- **Purpose**: Convert HTML email content to readable markdown
- **Features**:
  - Preserve links and formatting
  - Handle common email HTML patterns
  - Strip unnecessary styling and scripts
  - Fallback to plain text if available

## Tool Specifications

### 1. send_email

**Description**: Send an email through the CF Mail Bridge API

**Parameters**:
```typescript
{
  to: {
    type: "string",
    description: "Recipient email address. Defaults to USEREMAIL if not specified.",
    required: false
  },
  subject: {
    type: "string", 
    description: "Email subject line",
    required: false,
    default: "Email from CF Mail Bridge"
  },
  html: {
    type: "string",
    description: "HTML message body content",
    required: false
  }
}
```

**Returns**:
```typescript
{
  content: [{
    type: "text",
    text: "Email sent successfully to {recipient} with subject: {subject}"
  }]
}
```

**Error Cases**:
- Invalid recipient email format
- Authentication failure
- API rate limit exceeded
- Network timeout

### 2. fetch_email

**Description**: Retrieve the oldest unread email sent to the instance address and mark it as read

**Parameters**:
```typescript
{
  email_id: {
    type: "string",
    description: "Optional email ID to fetch a specific email. If not provided, fetches the oldest unread email.",
    required: false
  }
}
```

**Returns**:
```typescript
{
  content: [{
    type: "text",
    text: `From: {sender}
To: {instance}.{name}@tai.chat
Subject: {subject}
Date: {timestamp}
ID: {email_id}

---

{markdown_body}`
  }]
}
```

**Error Cases**:
- No unread emails available
- Email ID not found
- Email not addressed to instance
- Authentication failure

### 3. list_inbox

**Description**: List recent emails sent to the instance address

**Parameters**:
```typescript
{
  limit: {
    type: "number",
    description: "Number of messages to return",
    required: false,
    default: 10,
    minimum: 1,
    maximum: 200
  },
  offset: {
    type: "number",
    description: "Number of messages to skip for pagination",
    required: false,
    default: 0,
    minimum: 0
  },
  show_read: {
    type: "boolean",
    description: "Whether to include read emails in the list",
    required: false,
    default: false
  }
}
```

**Returns**:
```typescript
{
  content: [{
    type: "text",
    text: `# Email Inbox (${instance}.${name}@tai.chat)

| ID | From | Subject | Date | Status |
|---|---|---|---|---|
| {id1} | {from1} | {subject1} | {date1} | {read_status1} |
| {id2} | {from2} | {subject2} | {date2} | {read_status2} |
...

Showing {count} of {total} emails`
  }]
}
```

**Error Cases**:
- Invalid pagination parameters
- Authentication failure

## Configuration

### Environment Variables
```bash
# Required
NAME=alice                      # CF Mail Bridge username
PASSWORD=secure_password123     # Authentication password
INSTANCE=desktop               # Agent instance identifier

# Optional
USEREMAIL=user@example.com     # Default recipient for send_email
LOG_LEVEL=info                 # Logging level: error|warn|info|debug
API_TIMEOUT=30000              # API request timeout in ms
POLL_INTERVAL=5000             # Live mode polling interval in ms
```

### Logging Levels
- **error**: Critical errors that prevent operation
- **warn**: Non-critical issues and retryable failures
- **info**: Normal operation events (default)
- **debug**: Detailed debugging information

## Development Guidelines

### API Integration
- All API calls should use the centralized API client
- Include proper error context for agent debugging
- Return user-friendly error messages

### Testing Strategy
- Mock all API responses for unit tests
- Use environment variable TEST_MODE to enable mocks
- Integration tests should be clearly marked and skippable

### Error Handling
- Never throw unhandled exceptions to the MCP runtime
- Return descriptive error messages in tool responses
- Log all errors with appropriate context

### Type Safety
- Use TypeScript strict mode
- Define all API response types
- Use Zod schemas for runtime validation