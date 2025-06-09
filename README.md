# TAI MCP Email Server

A Model Context Protocol (MCP) server that enables AI agents to interact with email through the CF Mail Bridge API.

## Features

- **MCP Mode (Default)**: Provides email tools for MCP-compatible clients like Claude Desktop
- **Live Mode**: Monitors for new emails and automatically invokes Claude Code to process them
- **Registration**: Register new users with the CF Mail Bridge API

## MCP Tools

### send_email
Send an email through the CF Mail Bridge API.

**Parameters:**
- `to` (optional): Recipient email address (defaults to USEREMAIL env var)
- `subject` (optional): Email subject line (defaults to "Email from CF Mail Bridge")
- `html` (optional): HTML message body content

### fetch_email
Retrieve the oldest unread email and mark it as read.

**Parameters:**
- `email_id` (optional): Specific email ID to fetch (if not provided, fetches oldest unread)

### list_inbox
List recent emails sent to the instance address.

**Parameters:**
- `limit` (optional): Number of messages to return (default: 10, max: 200)
- `offset` (optional): Number of messages to skip for pagination (default: 0)
- `show_read` (optional): Include read emails in the list (default: false)

## Installation

```bash
npm install
npm run build
```

## Configuration

Set the following environment variables:

### Required
```bash
NAME=alice                    # CF Mail Bridge username
PASSWORD=secure_password123   # Authentication password
INSTANCE=desktop             # Agent instance identifier
```

### Optional
```bash
USEREMAIL=user@example.com   # Default recipient for send_email
LOG_LEVEL=info               # Logging level: error|warn|info|debug
API_TIMEOUT=30000            # API request timeout in ms
POLL_INTERVAL=5000           # Live mode polling interval in ms
API_BASE_URL=https://tai.chat # API base URL (default)
```

Your instance email will be: `{INSTANCE}.{NAME}@tai.chat`

## Usage

### MCP Mode (Default)
Start as an MCP server:
```bash
npm start
# or
./build/src/index.js
```

### Live Mode
Monitor for new emails and auto-invoke Claude Code:
```bash
npm start live
# or
./build/src/index.js live
```

### Register User
Register a new user with the CF Mail Bridge API:
```bash
npm start register
# or with custom username
npm start register alice
```

## MCP Client Configuration

Add to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "tai-email": {
      "command": "/path/to/tai-mcp-email-server/build/src/index.js",
      "env": {
        "NAME": "your-username",
        "PASSWORD": "your-password", 
        "INSTANCE": "desktop",
        "USEREMAIL": "default@example.com"
      }
    }
  }
}
```

## Development

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Project Structure

```
src/
├── index.ts              # Main entry point & CLI router
├── server.ts             # MCP server implementation
├── commands/             # CLI commands
│   ├── register.ts       # Registration command
│   └── live.ts           # Live polling command
├── tools/                # MCP tool implementations
│   ├── send-email.ts     # send_email tool
│   ├── fetch-email.ts    # fetch_email tool
│   └── list-inbox.ts     # list_inbox tool
├── services/             # Core services
│   ├── auth.ts           # Authentication service
│   ├── api-client.ts     # CF Mail Bridge API client
│   └── email-poller.ts   # Email polling service
├── utils/                # Utility modules
│   ├── logger.ts         # Logging utility
│   ├── config.ts         # Configuration management
│   └── html-to-markdown.ts # HTML to markdown converter
└── types/                # TypeScript type definitions
    ├── api.ts            # API response types
    └── tools.ts          # Tool parameter schemas
```

## API Integration

This server integrates with the CF Mail Bridge API at `https://tai.chat`. Key endpoints used:

- `POST /api/v1/register` - User registration
- `POST /api/v1/login` - User authentication  
- `GET /api/v1/messages` - Fetch messages with filtering
- `POST /api/v1/send-email` - Send emails
- `PUT /api/v1/messages/{id}/read` - Mark messages as read

## Live Mode Operation

In live mode, the server:
1. Polls the API every 5 seconds for unread emails
2. When new emails are detected, executes:
   ```bash
   claude code -p "Please resolve the unread email and send the response back to the user after the email is resolved"
   ```
3. Claude Code can then use the same MCP server to fetch, process, and respond to emails

## Error Handling

The server implements comprehensive error handling:
- Validates environment variables on startup
- Handles API authentication failures with automatic retry
- Provides user-friendly error messages
- Logs all operations for debugging

## Security

- JWT tokens are stored in memory only
- Auto-refresh tokens before expiration
- Validate all user inputs with Zod schemas
- No secrets are logged or exposed

## License

MIT License