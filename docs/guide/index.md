# Getting Started with tai-mcp

tai-mcp is a Model Context Protocol (MCP) server that gives AI agents the power to send, receive, and manage emails. Your agent gets its own email address and can handle email workflows autonomously.

## What is tai-mcp?

tai-mcp bridges the gap between AI agents and email communication. It provides four essential email tools through the MCP protocol:

- **send_email** - Send emails with markdown support
- **fetch_email** - Retrieve and read incoming emails
- **list_inbox** - Browse and manage your inbox  
- **reply_email** - Respond with proper email threading

Your agent operates with its own unique email address: `{INSTANCE}.{NAME}@tai.chat`

## Key Features

### 🤖 AI-Friendly Design
- **Markdown Support** - Write emails naturally, automatically converted to HTML
- **Smart Content Processing** - HTML to markdown conversion for better AI understanding
- **Structured Data** - Clean, parsed email content optimized for AI processing

### 📧 Professional Email Features
- **Proper Threading** - RFC-compliant conversation threading for all email clients
- **Auto-formatting** - Automatic HTML generation from markdown content
- **Content Filtering** - Clean, focused email content for AI processing

### 🔒 Secure & Reliable
- **JWT Authentication** - Secure API access with automatic token refresh
- **Input Validation** - Comprehensive parameter validation and error handling
- **Environment Isolation** - Clean separation between different agent instances

### ⚡ Multiple Operating Modes
- **MCP Mode** (Default) - Provides email tools for AI agents via Claude Desktop
- **Live Mode** - Automatically monitors and processes incoming emails
- **Registration Mode** - Easy user setup and account creation

## Quick Setup Guide

### 1. User Registration
```bash
npx tai-mcp register
```
Creates your account and assigns your unique email address.

### 2. Claude Desktop Configuration
Add to your Claude Desktop MCP configuration:
```json
{
  "mcpServers": {
    "tai-email": {
      "command": "npx",
      "args": ["-y", "tai-mcp"],
      "env": {
        "NAME": "your-username",
        "PASSWORD": "your-password",
        "INSTANCE": "desktop"
      }
    }
  }
}
```

### 3. Start Using
Restart Claude Desktop and start emailing with your agent!

## Common Use Cases

### Personal Email Assistant
Your AI agent can automatically process incoming emails, understand context, and generate appropriate responses.

### Customer Support Automation
Handle support requests with context-aware AI responses while maintaining proper conversation threading.

### Workflow Integration
Embed email capabilities into existing AI workflows for notifications, reports, and communication.

### Content Distribution
Automatically send reports, summaries, and updates to stakeholders.

## Next Steps

Choose your path based on your needs:

### For Quick Setup
- [Installation Guide](/guide/installation) - Step-by-step setup instructions
- [Configuration Guide](/guide/configuration) - Environment variables and MCP setup

### For Advanced Usage  
- [Usage Guide](/guide/usage) - Workflows, live mode, and automation patterns
- [API Reference](/api/) - Complete tool documentation with examples

### For Developers
- [Development Guide](/development/) - Architecture, testing, and contribution guidelines

## Support

- **GitHub Issues** - [Report bugs and request features](https://github.com/BMPixel/tai-mcp/issues)
- **Documentation** - Browse these guides for detailed information
- **MCP Community** - Join the Model Context Protocol community discussions

Ready to get started? Head to the [Installation Guide](/guide/installation) for detailed setup instructions.