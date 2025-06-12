---
layout: home

hero:
  name: "tai-mcp"
  text: "Emailing with your agent"
  tagline: Model Context Protocol server enabling AI agents to send, receive, and manage emails seamlessly
  image:
    src: /assets/logo.svg
    alt: TAI MCP Email Server
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View API Reference
      link: /api/
    - theme: alt
      text: GitHub
      link: https://github.com/BMPixel/tai-mcp

features:
  - icon: 🤖
    title: MCP Protocol Support
    details: Built on the Model Context Protocol specification, enabling seamless integration with AI agents like Claude Desktop.
  
  - icon: 📧
    title: Complete Email Management
    details: Send, receive, fetch, and reply to emails with full threading support and HTML/markdown conversion.
  
  - icon: ⚡
    title: Live Mode Operation
    details: Automatically monitor incoming emails and trigger Claude Code to process and respond autonomously.
  
  - icon: 🔒
    title: Secure Authentication  
    details: JWT-based authentication with PBKDF2-SHA256 password hashing for secure API access.
  
  - icon: 🛡️
    title: Secure & Reliable
    details: JWT-based authentication with automatic token refresh and comprehensive error handling for reliable operation.
  
  - icon: 🧪
    title: Comprehensive Testing
    details: Extensive test suite with both unit and integration tests for reliable email workflows.
---

## Quick Start

Get up and running with tai-mcp in minutes:

### 1. Register User

```bash
npx tai-mcp register
```

### 2. Configure Claude Desktop

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

### 3. Restart Claude Desktop

Restart Claude Desktop to load the MCP server, then start emailing with your agent!

## How It Works

tai-mcp provides four powerful email tools for AI agents:

- **send_email** - Send emails with markdown support
- **fetch_email** - Retrieve and read incoming emails  
- **list_inbox** - Browse and manage your inbox
- **reply_email** - Respond with proper email threading

Your agent gets its own email address: `{INSTANCE}.{NAME}@tai.chat`

## Key Features

### Email Tools & Use Cases

**📧 send_email**
- Send notifications and responses
- Share reports and summaries
- Forward processed information
- Compose new conversations

**📥 fetch_email**
- Process customer support requests
- Read user feedback and inquiries
- Retrieve specific emails for context
- Automated email triage

**📋 list_inbox**
- Browse recent messages
- Identify priority emails
- Check for new messages
- Manage email queues

**↩️ reply_email**
- Respond to conversations
- Continue email threads
- Provide follow-up information
- Automated customer support

### Key Features

- **Markdown Support** - Write emails in markdown, automatically converted to HTML
- **Smart Threading** - Proper email conversation threading for all clients
- **Live Mode** - Automatic email monitoring and AI processing
- **Secure Authentication** - JWT-based security with automatic token refresh

## Common Use Cases

**🤖 Personal Email Assistant**
```bash
npx tai-mcp live  # Automatically process incoming emails
```
Your AI agent monitors your inbox and handles emails autonomously.

**🎯 Customer Support Automation**
Process support requests, generate context-aware responses, and maintain conversation threads.

**📊 Report Distribution**
Send automated reports, summaries, and notifications to stakeholders.

**🔄 Workflow Integration**
Integrate email capabilities into existing AI workflows and applications.

## Next Steps

- [📖 **Installation Guide**](/guide/installation) - Complete setup instructions
- [⚙️ **Configuration**](/guide/configuration) - Environment variables and settings  
- [🔧 **API Reference**](/api/) - Complete tool documentation
- [🏗️ **Development**](/development/) - Architecture and implementation details