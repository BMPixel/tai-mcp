---
layout: home

hero:
  name: "TAI MCP Email Server"
  text: "AI Email Interaction Made Simple"
  tagline: Model Context Protocol server enabling AI agents to interact with email through the CF Mail Bridge API
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
      link: https://github.com/anthropics/tai-mcp

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
  
  - icon: 🌐
    title: Cloudflare Integration
    details: Seamlessly integrates with CF Mail Bridge API running on Cloudflare Workers with D1 database.
  
  - icon: 🧪
    title: Comprehensive Testing
    details: Extensive test suite with both unit and integration tests for reliable email workflows.
---

## Quick Start

Get up and running with TAI MCP Email Server in minutes:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Required environment variables
export NAME=username          # CF Mail Bridge username  
export PASSWORD=password      # Authentication password
export INSTANCE=desktop       # Agent instance identifier
```

### 3. Register User

```bash
npm start register
```

### 4. Start MCP Server

```bash
npm start
```

### 5. Test with Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "tai-email": {
      "command": "npx",
      "args": ["tai-mcp-email-server"]
    }
  }
}
```

## Architecture Overview

TAI MCP Email Server consists of two main components:

- **CF Mail Bridge** - Cloudflare Workers email service providing REST API
- **TAI MCP Server** - MCP server exposing email tools to AI agents

```mermaid
graph TB
    A[AI Agent/Claude] --> B[MCP Server]
    B --> C[CF Mail Bridge API]
    C --> D[Cloudflare D1 Database]
    C --> E[Resend Email Service]
    F[Incoming Email] --> C
```

## Key Features

### MCP Tools Available

- **`send_email`** - Send emails with markdown support and automatic HTML conversion
- **`fetch_email`** - Retrieve and mark emails as read with content filtering
- **`list_inbox`** - Browse emails with pagination and filtering options  
- **`reply_email`** - Reply to emails with proper threading and conversation context

### Operating Modes

- **MCP Mode** (Default) - Provides email tools for MCP clients
- **Live Mode** - Monitors for new emails and auto-invokes Claude Code
- **Registration Mode** - Register new users with the API

### Email Features

- HTML ↔ Markdown conversion for AI-friendly content processing
- RFC-compliant email threading with proper Message-ID generation
- Content filtering and formatting for optimal AI interaction
- Support for both plain text and HTML email content

## Use Cases

### Automated Email Assistant
Set up live mode to automatically process incoming emails and generate appropriate responses using AI.

### Email Integration for AI Apps
Embed email capabilities directly into your AI applications using the MCP protocol.

### Customer Support Automation
Process support emails automatically with context-aware AI responses.

### Email Workflow Automation
Create complex email workflows with AI decision-making and response generation.

## Next Steps

- [📖 **Installation Guide**](/guide/installation) - Complete setup instructions
- [⚙️ **Configuration**](/guide/configuration) - Environment variables and settings  
- [🔧 **API Reference**](/api/) - Complete tool and endpoint documentation
- [🏗️ **Development**](/development/) - Architecture and implementation details
- [📋 **Examples**](/examples/) - Real-world usage scenarios