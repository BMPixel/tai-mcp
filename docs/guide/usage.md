# Usage Guide

This guide covers practical workflows, operating modes, and automation patterns for tai-mcp. Learn how to make the most of your AI email agent.

## Operating Modes

tai-mcp operates in three distinct modes, each optimized for different use cases:

### MCP Mode (Default)
Provides email tools to MCP-compatible clients like Claude Desktop.

```bash
npx tai-mcp
```

**Use Cases:**
- Interactive email management with Claude Desktop
- Manual email processing and responses
- On-demand email workflows
- Testing and development

### Live Mode
Automatically monitors for new emails and invokes Claude Code to process them.

```bash
npx tai-mcp live
```

**Use Cases:**
- Automated email assistant
- 24/7 email monitoring
- Hands-free email processing
- Customer support automation

### Registration Mode
Creates new user accounts and configures email addresses.

```bash
npx tai-mcp register [username]
```

**Use Cases:**
- Initial setup
- Creating multiple accounts
- Account management

## Email Workflows

### Basic Email Sending

**Scenario:** Send a notification email with markdown content.

```markdown
Send an email to john@example.com with the subject "Project Update" and this content:

# Weekly Project Update

## Completed Tasks
- Feature implementation ✅
- Testing phase ✅
- Documentation updates ✅

## Next Week
- Deployment preparation
- User training sessions

Best regards,
Your AI Assistant
```

tai-mcp automatically:
1. Converts markdown to HTML
2. Sends email with proper formatting
3. Returns confirmation with message ID

### Reading Incoming Emails

**Scenario:** Check for and process new emails.

```markdown
Check my inbox for new emails and show me any unread messages.
```

tai-mcp will:
1. List unread emails in a formatted table
2. Show sender, subject, date, and status
3. Provide email IDs for further processing

**Follow-up:** Process a specific email.

```markdown
Fetch and read email ID 12345
```

tai-mcp will:
1. Retrieve the full email content
2. Convert HTML to markdown for AI processing
3. Mark the email as read
4. Display formatted content

### Email Conversations

**Scenario:** Reply to an email with context.

```markdown
Reply to email ID 12345 with:

Thank you for your inquiry. I've reviewed your request and here's the information you need:

## Product Information
- **Model:** XYZ-Pro
- **Price:** $299.99
- **Availability:** In stock

Would you like me to process your order?
```

tai-mcp will:
1. Maintain proper email threading
2. Add RFC-compliant headers (In-Reply-To, References)
3. Convert markdown to HTML
4. Send reply with conversation context

## Live Mode Workflows

Live mode enables fully automated email processing. Here's how it works:

### Setup Live Mode

1. **Configure Environment:**
   ```bash
   export NAME=your-username
   export PASSWORD=your-password
   export INSTANCE=assistant
   export LOG_LEVEL=info
   ```

2. **Start Live Mode:**
   ```bash
   npx tai-mcp live
   ```

3. **Monitor Logs:**
   ```
   🚀 Email poller starting...
   📧 Instance email: assistant.your-username@tai.chat
   ⏰ Polling every 5 seconds
   ✅ Ready for incoming emails
   ```

### Automated Processing Flow

When a new email arrives:

1. **Detection:** tai-mcp polls every 5 seconds for new emails
2. **Trigger:** New email detected, logs message details
3. **Invocation:** Executes `claude-code` with processing prompt
4. **Processing:** Claude Code uses MCP tools to read and respond
5. **Completion:** Response sent, conversation archived

### Live Mode Example

**Incoming Email:**
```
From: customer@example.com
Subject: Question about product return
Body: Hi, I bought product XYZ last week but it's not working properly. Can I return it?
```

**Automated Response Process:**
1. tai-mcp detects new email
2. Invokes Claude Code with prompt: "Please resolve the unread email and send the response back to the user after the email is resolved"
3. Claude Code reads email content
4. Generates appropriate response
5. Sends reply with return policy information

### Live Mode Configuration

**Adjust Polling Frequency:**
```bash
# Check every 2 seconds (more responsive)
export POLL_INTERVAL=2000

# Check every 30 seconds (less resource intensive)
export POLL_INTERVAL=30000
```

**Customize Processing Prompt:**
The default prompt can be customized in the email-poller service for specific use cases.

## Advanced Workflows

### Multi-Instance Email Management

Manage multiple email contexts with different instances:

**Customer Support Instance:**
```bash
export INSTANCE=support
npx tai-mcp live
# Emails: support.yourname@tai.chat
```

**Personal Assistant Instance:**
```bash
export INSTANCE=personal
npx tai-mcp live
# Emails: personal.yourname@tai.chat
```

**Development Instance:**
```bash
export INSTANCE=dev
npx tai-mcp
# Emails: dev.yourname@tai.chat
```

### Batch Email Processing

**Scenario:** Process multiple emails efficiently.

```markdown
1. List all unread emails in my inbox
2. For each unread email, read the content and categorize it as:
   - Support request
   - Business inquiry  
   - Newsletter/promotional
   - Personal message
3. Provide a summary of each category
```

### Email Filtering and Organization

**Scenario:** Intelligent email management.

```markdown
Check my inbox and:
1. Identify urgent emails (keywords: urgent, asap, important)
2. Categorize by sender domain
3. Flag emails that need immediate response
4. Create a priority action list
```

### Content Processing Workflows

**Scenario:** Extract and process email content.

```markdown
Read the latest email and:
1. Extract any dates mentioned
2. Identify action items or tasks
3. Create a follow-up reminder
4. Draft a response acknowledging receipt
```

## Integration Patterns

### With Claude Desktop

tai-mcp integrates seamlessly with Claude Desktop, providing natural email interactions:

**Example Conversations:**
- "Send a meeting reminder to the team"
- "Check if there are any urgent emails"
- "Reply to Sarah's email about the project deadline"
- "Forward the budget report to finance team"

### With External Systems

**Webhook Integration:**
Trigger external systems based on email events.

**CRM Integration:**
Automatically create support tickets from customer emails.

**Calendar Integration:**
Extract meeting requests and create calendar events.

## Error Handling and Recovery

### Common Scenarios

**Authentication Failure:**
```
Error: Invalid credentials
```
**Recovery:** Verify NAME and PASSWORD environment variables

**Network Issues:**
```
Error: Unable to connect to API
```
**Recovery:** Check internet connection and API_BASE_URL

**Rate Limiting:**
```
Error: Too many requests
```
**Recovery:** Increase POLL_INTERVAL to reduce API calls

### Debugging Workflows

**Enable Debug Logging:**
```bash
export LOG_LEVEL=debug
npx tai-mcp
```

**Monitor API Calls:**
Debug logs show detailed API request/response information.

**Test Connectivity:**
```bash
curl https://tai.chat/api/v1/health
```

## Performance Optimization

### Email Processing Performance

**Optimize Polling:**
- Use appropriate POLL_INTERVAL (default: 5000ms)
- Monitor system resources
- Adjust based on email volume

**Content Processing:**
- tai-mcp automatically converts HTML to markdown for faster AI processing
- Large emails are handled efficiently with streaming

### Resource Management

**Memory Usage:**
- tai-mcp uses minimal memory footprint
- JWT tokens stored in memory only
- No persistent local storage

**Network Usage:**
- Efficient API calls with automatic retry
- Compressed responses when supported
- Connection pooling for multiple requests

## Security Considerations

### Email Security

**Content Safety:**
- All email content is processed securely
- No content stored locally
- Automatic HTML sanitization

**Authentication Security:**
- JWT tokens with automatic refresh
- No credentials logged or exposed
- Secure environment variable handling

### Best Practices

1. **Use Strong Passwords:** 8+ characters with mixed types
2. **Secure Environment Variables:** Never commit credentials
3. **Regular Updates:** Keep tai-mcp updated via npx
4. **Monitor Logs:** Watch for unusual activity
5. **Network Security:** Use HTTPS endpoints only

## Troubleshooting

### Common Issues

**Emails Not Sending:**
1. Check authentication credentials
2. Verify recipient email address
3. Check network connectivity
4. Review error logs

**Live Mode Not Working:**
1. Verify polling interval configuration
2. Check Claude Code installation
3. Monitor system resources
4. Review process permissions

**Content Not Processing:**
1. Check email content format
2. Verify markdown conversion
3. Test with simple content first
4. Review API response logs

### Getting Help

1. **Enable Debug Logging:** `LOG_LEVEL=debug`
2. **Review Error Messages:** Full error context in logs
3. **Check Network Connectivity:** Test API endpoints
4. **File GitHub Issues:** Include logs and reproduction steps

## Next Steps

Master tai-mcp with these advanced resources:

- [API Reference](/api/) - Complete tool documentation with examples
- [Development Guide](/development/) - Architecture and implementation details
- [GitHub Repository](https://github.com/BMPixel/tai-mcp) - Source code and issue tracking