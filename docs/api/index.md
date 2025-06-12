# API Reference

tai-mcp provides four powerful email tools through the Model Context Protocol (MCP). These tools enable AI agents to handle complete email workflows with professional features like threading, markdown support, and content processing.

## Overview

### Email Tools

tai-mcp exposes four core email tools to AI agents:

| Tool | Purpose | Key Features |
|------|---------|--------------|
| **send_email** | Send new emails | Markdown support, auto HTML conversion |
| **fetch_email** | Retrieve emails | Auto-read marking, content processing |
| **list_inbox** | Browse inbox | Pagination, filtering, formatted display |
| **reply_email** | Reply to emails | Proper threading, conversation context |

### Tool Integration

All tools are designed for natural AI interaction:

```markdown
# Natural language requests work seamlessly
"Send an email to john@example.com about the project update"
"Check my inbox for any urgent messages"
"Reply to Sarah's email with the requested information"
"Show me all unread emails from this week"
```

## Common Workflows

### Basic Email Management

**Send → Receive → Reply Pattern:**
1. **send_email** - Send initial communication
2. **list_inbox** - Monitor for responses  
3. **fetch_email** - Read incoming replies
4. **reply_email** - Continue conversation

### Automated Email Processing

**Monitor → Process → Respond Pattern:**
1. **list_inbox** with `show_read=false` - Find unread emails
2. **fetch_email** by ID - Get specific email content
3. **reply_email** - Respond with context

### Content Processing Workflow

**Retrieve → Analyze → Act Pattern:**
1. **fetch_email** - Get email with markdown conversion
2. AI processes content and determines action
3. **send_email** or **reply_email** - Take appropriate action

## Email Address Format

Your AI agent operates with a unique email address:

```
{INSTANCE}.{NAME}@tai.chat
```

**Examples:**
- `desktop.alice@tai.chat` - Alice's desktop instance
- `support.company@tai.chat` - Company support instance  
- `dev.engineer@tai.chat` - Development environment

## Content Handling

### Markdown Support

tai-mcp provides seamless markdown integration:

**Input:** Markdown content
```markdown
# Weekly Report

## Completed Tasks
- Feature implementation ✅
- Code review ✅
- Documentation ✅

## Next Steps
- Deploy to staging
- User acceptance testing
```

**Output:** Professional HTML email with proper formatting

### Content Conversion

**HTML to Markdown:** Incoming emails are automatically converted to markdown for better AI processing:

```html
<!-- Original HTML -->
<h1>Meeting Reminder</h1>
<p>Don't forget about our <strong>important meeting</strong> tomorrow at 2 PM.</p>
```

```markdown
# Meeting Reminder

Don't forget about our **important meeting** tomorrow at 2 PM.
```

### Content Filtering

tai-mcp optimizes email content for AI processing:
- Removes tracking pixels and scripts
- Preserves essential formatting
- Extracts plain text when needed
- Maintains email structure and context

## Authentication & Security

### JWT Authentication

tai-mcp uses secure JWT-based authentication:
- **Automatic token refresh** before expiration
- **Memory-only storage** (no persistent credentials)
- **Retry logic** for authentication failures
- **Secure environment variable handling**

### Input Validation

All tool parameters are validated using Zod schemas:
- **Email address validation** with proper format checking
- **Parameter type checking** with helpful error messages
- **Content sanitization** for security
- **Error recovery** with detailed logging

## Error Handling

### Common Error Patterns

**Authentication Errors:**
```
Error: Invalid credentials - please check NAME and PASSWORD
```

**Network Errors:**
```
Error: Unable to connect to email service
```

**Validation Errors:**
```
Error: Invalid email address format
```

**Content Errors:**
```
Error: Email content too large (max 1MB)
```

### Error Recovery

tai-mcp implements comprehensive error recovery:
- **Automatic retry** for transient failures
- **Fallback options** when possible
- **Detailed error logging** for debugging
- **User-friendly error messages** for AI agents

## Rate Limiting & Performance

### API Limits

tai-mcp respects API rate limits:
- **Automatic backoff** when limits are reached
- **Request queuing** for high-volume scenarios
- **Efficient polling** in live mode
- **Connection pooling** for performance

### Performance Optimization

**Email Processing:**
- Streaming for large emails
- Compressed responses when supported
- Efficient content conversion
- Memory management for attachments

**Network Efficiency:**
- Connection reuse
- Timeout configuration
- Retry with exponential backoff
- Health check monitoring

## Integration Examples

### With Claude Desktop

Add tai-mcp to your Claude Desktop configuration:

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

### Natural Language Usage

Claude Desktop users can interact naturally:

```markdown
User: "Send a follow-up email to our client about the project timeline"

Claude: I'll send a follow-up email about the project timeline. Let me compose and send that for you.

[Uses send_email tool with appropriate content]

✅ Email sent successfully to client@example.com
Subject: "Project Timeline Follow-up"
Message ID: msg_abc123
```

### Live Mode Integration

For automated processing:

```bash
# Start live mode
npx tai-mcp live

# tai-mcp monitors for new emails and automatically:
# 1. Detects incoming email
# 2. Invokes Claude Code
# 3. Claude Code uses MCP tools to process and respond
# 4. Response sent automatically
```

## Best Practices

### Email Composition

1. **Use Markdown:** Take advantage of automatic HTML conversion
2. **Clear Subjects:** Provide descriptive subject lines
3. **Structured Content:** Use headers and lists for clarity
4. **Professional Tone:** Maintain appropriate communication style

### Inbox Management

1. **Regular Monitoring:** Check for new emails frequently
2. **Categorization:** Use consistent patterns for organization
3. **Timely Responses:** Process emails promptly
4. **Archive Management:** Keep inbox organized

### Error Prevention

1. **Validate Recipients:** Double-check email addresses
2. **Test Content:** Verify formatting with small tests
3. **Monitor Logs:** Watch for warnings and errors
4. **Handle Failures:** Implement retry logic where appropriate

## Tool Reference

Detailed documentation for each tool:

- [MCP Tools](/api/tools) - Complete parameter reference and examples
- [Authentication](/api/authentication) - Security and token management details

## Next Steps

- [Tools Reference](/api/tools) - Detailed tool documentation with examples
- [Usage Guide](/guide/usage) - Practical workflows and patterns
- [Development Guide](/development/) - Architecture and implementation details