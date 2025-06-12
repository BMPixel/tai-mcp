# MCP Tools Reference

This page provides comprehensive documentation for all four email tools provided by tai-mcp. Each tool includes parameter details, examples, and common use cases.

## send_email

Send emails with markdown support and automatic HTML conversion.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | No | Recipient email address. Uses USEREMAIL env var if not specified |
| `subject` | string | No | Email subject line. Uses default if not provided |
| `content` | string | No | Email message content |
| `format` | enum | No | Content format: "markdown" (default) or "html" |

### Response Format

```
Email sent successfully to {recipient} with subject: "{subject}"
Message ID: {messageId}
Timestamp: {timestamp}
```

### Examples

#### Basic Email with Markdown

```markdown
Send an email to john@example.com with this content:

# Weekly Status Update

## Completed This Week
- ✅ Database migration
- ✅ User interface updates  
- ✅ Testing phase complete

## Next Week Goals
- Deploy to staging environment
- User acceptance testing
- Documentation finalization

Let me know if you have any questions!
```

**Result:**
- Markdown automatically converted to HTML
- Professional email formatting
- Proper headers and structure preserved

#### HTML Email

```markdown
Send an HTML email to marketing@company.com:

Subject: "Product Launch Announcement"
Format: HTML
Content: 
<h1 style="color: #2563eb;">New Product Launch! 🚀</h1>
<p>We're excited to announce our latest innovation...</p>
<div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
  <strong>Launch Date:</strong> March 15, 2024
</div>
```

#### Using Default Recipient

```markdown
Send a quick update email with subject "Task Completed":

The data analysis report has been completed and is ready for review. All findings have been compiled into the final document.
```

**Note:** Uses USEREMAIL environment variable as recipient.

### Use Cases

**📊 Report Distribution**
- Weekly status reports
- Performance metrics
- Project updates
- Financial summaries

**🔔 Notifications**
- Task completion alerts
- System status updates
- Deadline reminders
- Event notifications

**📝 Documentation Sharing**
- Meeting notes distribution
- Process documentation
- Training materials
- Policy updates

**💼 Professional Communication**
- Client communications
- Vendor correspondence
- Internal announcements
- Follow-up messages

### Error Handling

**No Recipient Specified:**
```
Error: No recipient specified. Provide "to" parameter or set USEREMAIL environment variable.
```

**Invalid Email Format:**
```
Error: Invalid email address format: invalid-email
```

**Content Too Large:**
```
Error: Email content exceeds maximum size limit (1MB)
```

---

## fetch_email

Retrieve and automatically mark emails as read, with optional email ID targeting.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email_id` | string | No | Specific email ID to fetch. Fetches oldest unread if not provided |

### Response Format

```
From: {sender}
To: {recipient}  
Subject: {subject}
Date: {timestamp}
ID: {message_id}
Status: {Read/Unread}

---

{email_content_in_markdown}
```

### Examples

#### Fetch Oldest Unread Email

```markdown
Check for new emails and show me the oldest unread message
```

**Response:**
```
From: client@example.com
To: support.company@tai.chat
Subject: Question about billing
Date: 2024-03-15 14:30:00
ID: 12345
Status: Read

---

# Billing Inquiry

Hi there,

I have a question about my recent invoice. Could you please clarify the charges for:

- Professional services: $500
- Additional features: $200

Thanks for your help!

Best regards,
John Client
```

#### Fetch Specific Email

```markdown
Fetch and read email ID 67890
```

**Use Case:** Process a specific email identified from list_inbox results.

#### No Unread Emails

```markdown
Check for new emails
```

**Response:**
```
No unread emails found for desktop.alice@tai.chat
```

### Use Cases

**🎯 Targeted Email Processing**
- Read specific high-priority emails
- Process emails in custom order
- Handle tagged or flagged messages
- Follow up on specific conversations

**📥 Inbox Monitoring**
- Check for new customer inquiries
- Monitor support requests
- Process automated notifications
- Handle subscription confirmations

**🔄 Workflow Automation**
- Trigger actions based on email content
- Extract data from incoming emails
- Process form submissions
- Handle API notifications

**🧹 Email Triage**
- Categorize incoming messages
- Identify urgent communications
- Sort by sender or subject patterns
- Archive processed emails

### Content Processing

**HTML to Markdown Conversion:**
- Complex HTML emails converted to clean markdown
- Tables preserved with markdown syntax
- Links maintained with proper formatting
- Images referenced with alt text

**Content Optimization:**
- Tracking pixels and scripts removed
- Essential formatting preserved
- Plain text fallback when needed
- Email headers included for context

### Error Handling

**Email Not Found:**
```
Error: Email with ID 12345 not found
```

**Access Denied:**
```
Error: Email 12345 is not addressed to desktop.alice@tai.chat
```

**No Emails Available:**
```
No emails found for desktop.alice@tai.chat
```

---

## list_inbox

Browse and manage inbox with pagination, filtering, and formatted display.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 10 | Number of messages to return (1-200) |
| `offset` | number | No | 0 | Number of messages to skip for pagination |
| `show_read` | boolean | No | false | Include read emails in the list |

### Response Format

```markdown
# Email Inbox ({instance_email})

| ID | From | Subject | Date | Status |
|---|---|---|---|---|
| 123 | sender@example.com | Email subject... | 2024-01-01 12:00:00 | ✉ Unread |
| 124 | another@example.com | Another subject... | 2024-01-01 13:00:00 | ✓ Read |

Showing X of Y total emails

*Use offset parameter to load more emails*
```

### Examples

#### Basic Inbox View

```markdown
Show me my recent emails
```

**Response:**
```markdown
# Email Inbox (desktop.alice@tai.chat)

| ID | From | Subject | Date | Status |
|---|---|---|---|---|
| 567 | boss@company.com | Quarterly Review Meeting | 2024-03-15 09:15:00 | ✉ Unread |
| 566 | team@company.com | Project Milestone Achieved | 2024-03-15 08:30:00 | ✓ Read |
| 565 | client@example.com | Contract Renewal Discussion | 2024-03-14 16:45:00 | ✉ Unread |

Showing 3 unread of 15 total emails
```

#### Show All Emails (Including Read)

```markdown
List all emails in my inbox, including the ones I've already read
```

**Parameters:** `show_read=true`

#### Pagination Example

```markdown
Show me the next 20 emails starting from position 50
```

**Parameters:** `limit=20, offset=50`

#### Large Inbox Management

```markdown
Show me the last 100 emails to review my recent activity
```

**Parameters:** `limit=100, show_read=true`

### Use Cases

**📋 Inbox Overview**
- Daily email review
- Identify priority messages
- Monitor email volume
- Track response patterns

**🔍 Email Discovery**
- Find specific conversations
- Locate emails by sender
- Search by date ranges
- Filter by read status

**📊 Email Analytics**
- Monitor inbox health
- Track response times
- Analyze email patterns
- Identify bottlenecks

**⚡ Quick Triage**
- Rapid email assessment
- Batch processing workflows
- Priority identification
- Workload planning

### Filtering and Display

**Unread Focus (Default):**
- Shows only unread emails
- Optimized for immediate action
- Reduced information overload
- Clear priority indication

**Complete View:**
- All emails when `show_read=true`
- Full conversation history
- Archive browsing
- Comprehensive search

**Pagination Support:**
- Handle large inboxes efficiently
- Navigate through email history
- Batch processing capabilities
- Memory-efficient loading

### Error Handling

**Invalid Parameters:**
```
Error: Limit must be between 1 and 200
```

**Offset Out of Range:**
```
Error: Offset exceeds total message count
```

**No Emails Found:**
```
No emails found for desktop.alice@tai.chat
```

---

## reply_email

Reply to emails with proper threading and conversation context.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message_id` | string | Yes | ID of the original message to reply to |
| `content` | string | No | Reply message content |
| `format` | enum | No | Content format: "markdown" (default) or "html" |
| `subject` | string | No | Custom subject line. Uses "Re: Original Subject" if not provided |
| `text` | string | No | Legacy plain text content (backward compatibility) |
| `html` | string | No | Legacy HTML content (backward compatibility) |

### Response Format

```
Reply sent successfully!
Original Message ID: {original_id}
Reply Message ID: {new_message_id}
Subject: {subject}
Timestamp: {timestamp}

The reply includes proper email threading headers (In-Reply-To, References, Message-ID) that will be recognized by email clients for conversation grouping.
```

### Examples

#### Basic Reply with Markdown

```markdown
Reply to email ID 12345 with:

Thank you for your inquiry about our services. I'd be happy to provide the information you requested.

## Our Service Offerings

### Basic Package ($99/month)
- Email support
- Basic features
- 5GB storage

### Premium Package ($199/month)  
- Priority support
- Advanced features
- 50GB storage
- Custom integrations

Would you like to schedule a call to discuss your specific needs?

Best regards,
AI Assistant
```

#### Custom Subject Reply

```markdown
Reply to email ID 67890 with subject "Updated Project Timeline":

Based on our discussion, here's the revised project timeline:

## Phase 1: Planning (Weeks 1-2)
- Requirements gathering
- Technical specification
- Resource allocation

## Phase 2: Development (Weeks 3-8)
- Core feature development
- Integration testing
- User interface design

## Phase 3: Launch (Weeks 9-10)
- Final testing
- Deployment
- User training

Let me know if this timeline works for your team!
```

#### HTML Reply

```markdown
Reply to email ID 11111 with HTML format:

<div style="font-family: Arial, sans-serif;">
  <h2 style="color: #2563eb;">Welcome to Our Service!</h2>
  
  <p>Thank you for signing up. Here's what happens next:</p>
  
  <ol style="line-height: 1.6;">
    <li><strong>Account Activation:</strong> Check your email for activation link</li>
    <li><strong>Profile Setup:</strong> Complete your profile information</li>
    <li><strong>First Steps:</strong> Follow our getting started guide</li>
  </ol>
  
  <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <strong>Need Help?</strong> Contact our support team at support@company.com
  </div>
</div>
```

### Use Cases

**💬 Customer Support**
- Respond to customer inquiries
- Provide technical assistance
- Handle billing questions
- Process service requests

**📧 Business Communication**
- Continue project discussions
- Respond to meeting requests
- Follow up on proposals
- Provide status updates

**🤝 Relationship Management**
- Maintain client relationships
- Nurture leads and prospects
- Follow up on introductions
- Build professional networks

**⚡ Automated Responses**
- Acknowledge receipt of emails
- Provide immediate assistance
- Route requests to specialists
- Send confirmation messages

### Email Threading

**RFC Compliance:**
- Proper `In-Reply-To` headers
- Complete `References` chain
- Unique `Message-ID` generation
- Thread-safe conversation grouping

**Client Compatibility:**
- Works with Gmail, Outlook, Apple Mail
- Maintains conversation views
- Preserves email history
- Supports all major email clients

**Conversation Context:**
- Maintains email thread integrity
- Preserves conversation history
- Links related messages
- Enables conversation search

### Content Processing

**Markdown to HTML:**
- Professional email formatting
- Automatic HTML generation
- Preserved text structure
- Enhanced readability

**Plain Text Extraction:**
- API compatibility requirements
- Fallback for text-only clients
- Accessibility compliance
- Universal email support

**Backward Compatibility:**
- Supports legacy `text` and `html` parameters
- Smooth migration path
- Existing workflow preservation
- Flexible content handling

### Error Handling

**Invalid Message ID:**
```
Error: Original message 12345 not found
```

**Missing Content:**
```
Reply sent with default content: "This reply was sent via the TAI MCP Email Server."
```

**Threading Failure:**
```
Warning: Unable to retrieve threading headers, sending as new message
```

**Format Error:**
```
Error: Invalid format "plain". Must be "markdown" or "html"
```

## Tool Integration Patterns

### Sequential Processing

```markdown
1. List inbox to find new emails
2. Fetch specific email for details
3. Reply with appropriate response
4. Verify email was sent successfully
```

### Automated Workflows

```markdown
1. Monitor inbox with list_inbox (show_read=false)
2. Process each unread email with fetch_email
3. Generate appropriate response based on content
4. Send reply with reply_email to maintain threading
```

### Content Management

```markdown
1. Fetch email with HTML content
2. Process markdown-converted content with AI
3. Generate response in markdown format
4. Send via reply_email or send_email as needed
```

## Best Practices

### Email Composition
- Use descriptive subject lines
- Structure content with headers and lists
- Include clear calls to action
- Maintain professional tone

### Threading Maintenance
- Always use reply_email for responses
- Preserve original subject context
- Include relevant conversation history
- Maintain consistent messaging

### Error Recovery
- Handle network failures gracefully
- Retry failed operations when appropriate
- Log errors for debugging
- Provide fallback options

### Performance Optimization
- Use pagination for large inboxes
- Fetch specific emails when possible
- Batch operations efficiently
- Monitor API usage patterns

## Next Steps

- [API Overview](/api/) - High-level API concepts and integration patterns
- [Authentication](/api/authentication) - Security and token management details
- [Usage Guide](/guide/usage) - Practical workflows and automation patterns