# Configuration Guide

tai-mcp uses environment variables for configuration. This guide covers all configuration options, security best practices, and different setup scenarios.

## Required Environment Variables

These environment variables are required for tai-mcp to function:

### NAME
Your registered username with the email service.

```bash
NAME=your-username
```

**Requirements:**
- 3-50 characters long
- Alphanumeric characters and hyphens only
- Must be unique across all users
- Case-sensitive

### PASSWORD  
Your account password for authentication.

```bash
PASSWORD=your-secure-password
```

**Requirements:**
- 8-128 characters long
- Use a strong, unique password
- Store securely (never commit to version control)

### INSTANCE
Agent instance identifier that prefixes your email address.

```bash
INSTANCE=desktop
```

**Common Values:**
- `desktop` - For Claude Desktop usage
- `server` - For server deployments  
- `dev` - For development environments
- `prod` - For production environments

Your email address becomes: `{INSTANCE}.{NAME}@tai.chat`

**Examples:**
- `desktop.alice@tai.chat`
- `server.bob@tai.chat`
- `dev.charlie@tai.chat`

## Optional Environment Variables

### USEREMAIL
Default recipient email address for the `send_email` tool when no recipient is specified.

```bash
USEREMAIL=user@example.com
```

**Use Cases:**
- Personal email forwarding
- Notification delivery
- Default contact for agent communications

### LOG_LEVEL
Controls the verbosity of logging output.

```bash
LOG_LEVEL=info
```

**Available Levels:**
- `error` - Only error messages
- `warn` - Warnings and errors
- `info` - General information (default)
- `debug` - Detailed debugging information

**Recommendations:**
- `info` for production
- `debug` for development and troubleshooting
- `error` for minimal logging

### API_TIMEOUT
Timeout for API requests in milliseconds.

```bash
API_TIMEOUT=30000
```

**Default:** 30000 (30 seconds)
**Range:** 5000-300000 (5 seconds to 5 minutes)

### POLL_INTERVAL
Polling interval for live mode in milliseconds.

```bash
POLL_INTERVAL=5000
```

**Default:** 5000 (5 seconds)
**Range:** 1000-60000 (1 second to 1 minute)

**Considerations:**
- Lower values = more responsive but higher API usage
- Higher values = less responsive but lower server load
- Recommended: 5000ms for most use cases

### API_BASE_URL
Base URL for the email service API.

```bash
API_BASE_URL=https://tai.chat
```

**Default:** https://tai.chat
**Use Cases:**
- Development environments with different endpoints
- Custom deployments
- Testing with staging environments

## Configuration Methods

### Method 1: MCP Configuration (Recommended)

The most secure method is using MCP configuration with environment variables:

```json
{
  "mcpServers": {
    "tai-email": {
      "command": "npx",
      "args": ["-y", "tai-mcp"],
      "env": {
        "NAME": "${TAI_MCP_USERNAME}",
        "PASSWORD": "${TAI_MCP_PASSWORD}",
        "INSTANCE": "${TAI_MCP_INSTANCE}",
        "USEREMAIL": "${TAI_MCP_USEREMAIL}",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

Then set system environment variables:
```bash
export TAI_MCP_USERNAME=your-username
export TAI_MCP_PASSWORD=your-password
export TAI_MCP_INSTANCE=desktop
export TAI_MCP_USEREMAIL=user@example.com
```

### Method 2: Direct Environment Variables

Set environment variables directly in your shell:

```bash
# Required
export NAME=your-username
export PASSWORD=your-password
export INSTANCE=desktop

# Optional
export USEREMAIL=user@example.com
export LOG_LEVEL=info
export API_TIMEOUT=30000
export POLL_INTERVAL=5000
```

### Method 3: .env File (Development Only)

For development environments, create a `.env` file:

```bash
# .env file
NAME=your-username
PASSWORD=your-password
INSTANCE=dev
USEREMAIL=developer@example.com
LOG_LEVEL=debug
API_TIMEOUT=60000
POLL_INTERVAL=3000
```

**⚠️ Important:** Never commit `.env` files with real credentials to version control!

## Security Best Practices

### Credential Storage

**✅ Secure Methods:**
- System environment variables
- Environment variable references in MCP config
- Encrypted credential stores
- Secret management services

**❌ Insecure Methods:**
- Hardcoded credentials in configuration files
- Credentials in version control
- Plain text credential files
- Shared credential files

### Environment Variable Security

1. **Use Descriptive Names:**
   ```bash
   # Good
   export TAI_MCP_PASSWORD=secret
   
   # Avoid
   export PASSWORD=secret
   ```

2. **Set Appropriate Permissions:**
   ```bash
   # Make environment files readable only by owner
   chmod 600 .env
   ```

3. **Clear Variables After Use:**
   ```bash
   # Clear sensitive variables
   unset TAI_MCP_PASSWORD
   ```

### Password Requirements

- **Minimum 8 characters**
- **Include mix of:** uppercase, lowercase, numbers, symbols
- **Avoid:** common passwords, personal information, dictionary words
- **Use:** password managers for generation and storage

## Multi-Instance Configuration

tai-mcp supports multiple agent instances with different configurations:

### Scenario 1: Development and Production

**Development Instance:**
```json
{
  "mcpServers": {
    "tai-email-dev": {
      "command": "npx",
      "args": ["-y", "tai-mcp"],
      "env": {
        "NAME": "alice",
        "PASSWORD": "${DEV_PASSWORD}",
        "INSTANCE": "dev",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

**Production Instance:**
```json
{
  "mcpServers": {
    "tai-email-prod": {
      "command": "npx", 
      "args": ["-y", "tai-mcp"],
      "env": {
        "NAME": "alice",
        "PASSWORD": "${PROD_PASSWORD}",
        "INSTANCE": "prod",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Scenario 2: Multiple Users

```json
{
  "mcpServers": {
    "alice-email": {
      "command": "npx",
      "args": ["-y", "tai-mcp"],
      "env": {
        "NAME": "alice",
        "PASSWORD": "${ALICE_PASSWORD}",
        "INSTANCE": "desktop"
      }
    },
    "bob-email": {
      "command": "npx",
      "args": ["-y", "tai-mcp"],
      "env": {
        "NAME": "bob", 
        "PASSWORD": "${BOB_PASSWORD}",
        "INSTANCE": "desktop"
      }
    }
  }
}
```

## Configuration Validation

tai-mcp validates configuration on startup and provides helpful error messages:

### Validation Errors

**Missing Required Variables:**
```
Error: Missing required environment variable: NAME
```

**Invalid Values:**
```
Error: INSTANCE must be 3-50 characters long and contain only alphanumeric characters and hyphens
```

**Network Issues:**
```
Error: Unable to connect to API at https://tai.chat
```

### Validation Success

Successful startup shows:
```
🚀 TAI MCP Email Server starting...
📧 Instance email: desktop.alice@tai.chat
🔐 Authentication configured
⚡ MCP server ready on stdio
```

## Troubleshooting Configuration

### Environment Variable Issues

**Check if variables are set:**
```bash
echo $NAME
echo $PASSWORD
echo $INSTANCE
```

**Debug environment loading:**
```bash
LOG_LEVEL=debug npx tai-mcp
```

### MCP Configuration Issues

**Verify JSON syntax:**
```bash
# Check JSON validity
cat ~/.config/claude/claude_desktop_config.json | python -m json.tool
```

**Check Claude Desktop logs:**
- Look for MCP server startup messages
- Verify environment variables are passed correctly
- Check for authentication errors

### Common Configuration Mistakes

1. **Incorrect JSON syntax** in MCP configuration
2. **Missing quotes** around environment variable references
3. **Typos** in environment variable names
4. **Incorrect file paths** for configuration files
5. **Permission issues** with configuration files

## Performance Tuning

### API Timeout Optimization

**Fast Networks:**
```bash
API_TIMEOUT=15000  # 15 seconds
```

**Slow Networks:**
```bash
API_TIMEOUT=60000  # 60 seconds
```

### Live Mode Optimization

**High Responsiveness:**
```bash
POLL_INTERVAL=2000  # 2 seconds
```

**Balanced Performance:**
```bash
POLL_INTERVAL=5000  # 5 seconds (default)
```

**Low Resource Usage:**
```bash
POLL_INTERVAL=30000  # 30 seconds
```

## Next Steps

With tai-mcp properly configured:

- [Usage Guide](/guide/usage) - Learn workflows and automation patterns
- [API Reference](/api/) - Explore the available email tools
- [Development Guide](/development/) - Architecture and implementation details