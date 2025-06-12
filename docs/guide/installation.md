# Installation Guide

tai-mcp is designed for easy, install-free usage via npx. No local installation or dependencies required - just run and go!

## Prerequisites

- **Node.js 18+** - tai-mcp requires Node.js version 18.0.0 or higher
- **Network Access** - Internet connection for email service communication

Check your Node.js version:
```bash
node --version
```

If you need to install or update Node.js, visit [nodejs.org](https://nodejs.org/).

## Installation Methods

### Method 1: npx (Recommended)

The easiest way to use tai-mcp is via npx, which downloads and runs the latest version automatically:

```bash
# Register a new user account
npx tai-mcp register

# Start the MCP server (default mode)
npx tai-mcp

# Start in live mode for automatic email processing
npx tai-mcp live
```

**Benefits:**
- Always uses the latest version
- No local installation required
- Works across different environments
- Perfect for CI/CD and automation

### Method 2: Global Installation

For frequent usage, you can install tai-mcp globally:

```bash
# Install globally
npm install -g tai-mcp

# Use the installed version
tai-mcp register
tai-mcp
tai-mcp live
```

**Benefits:**
- Faster startup (no download time)
- Works offline after initial install
- Consistent version control

## User Registration

Before using tai-mcp, you need to register a user account:

### Interactive Registration

```bash
npx tai-mcp register
```

This will prompt you for:
- **Username** - Your unique identifier (3-50 characters, alphanumeric and hyphens only)
- **Password** - Secure password (8-128 characters)

### Non-Interactive Registration

For automation or scripting:

```bash
# Set environment variables
export NAME=your-username
export PASSWORD=your-secure-password

# Register without prompts
npx tai-mcp register
```

### Registration Output

Successful registration will show:
```
✅ User registered successfully!
📧 Your email address: desktop.your-username@tai.chat
🔑 Authentication configured
```

Your unique email address follows the format: `{INSTANCE}.{NAME}@tai.chat`

## Environment Configuration

tai-mcp requires environment variables for operation. There are several ways to configure them:

### Environment Variables

Set these required variables in your environment:

```bash
# Required
export NAME=your-username          # Your registered username
export PASSWORD=your-password      # Your account password  
export INSTANCE=desktop           # Agent instance identifier

# Optional
export USEREMAIL=user@example.com # Default recipient for send_email
export LOG_LEVEL=info             # Logging level (error|warn|info|debug)
```

### .env File (Development)

For development, create a `.env` file:

```bash
# .env file
NAME=your-username
PASSWORD=your-password
INSTANCE=desktop
USEREMAIL=user@example.com
LOG_LEVEL=debug
```

**⚠️ Security Warning:** Never commit `.env` files with real credentials to version control!

## Claude Desktop Integration

To use tai-mcp with Claude Desktop, add it to your MCP configuration:

### Configuration File Location

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/claude/claude_desktop_config.json
```

### MCP Configuration

Add tai-mcp to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tai-email": {
      "command": "npx",
      "args": ["-y", "tai-mcp"],
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

### Security Best Practices

Instead of hardcoding credentials, reference system environment variables:

```json
{
  "mcpServers": {
    "tai-email": {
      "command": "npx", 
      "args": ["-y", "tai-mcp"],
      "env": {
        "NAME": "${TAI_MCP_USERNAME}",
        "PASSWORD": "${TAI_MCP_PASSWORD}",
        "INSTANCE": "${TAI_MCP_INSTANCE}"
      }
    }
  }
}
```

Then set the system environment variables:
```bash
export TAI_MCP_USERNAME=your-username
export TAI_MCP_PASSWORD=your-password
export TAI_MCP_INSTANCE=desktop
```

## Verification

### Test MCP Server

Verify the MCP server starts correctly:

```bash
# Set required environment variables
export NAME=your-username
export PASSWORD=your-password
export INSTANCE=desktop

# Start the server (should show no errors)
npx tai-mcp
```

Expected output:
```
🚀 TAI MCP Email Server starting...
📧 Instance email: desktop.your-username@tai.chat
🔐 Authentication configured
⚡ MCP server ready on stdio
```

### Test with Claude Desktop

1. **Restart Claude Desktop** after updating the configuration
2. **Start a new conversation** 
3. **Test email functionality:**

```
Send a test email to someone with the subject "Hello from tai-mcp"
```

If configured correctly, Claude will have access to the email tools and can send emails.

## Troubleshooting

### Common Issues

**Node.js Version Error:**
```
Error: Node.js 18.0.0 or higher is required
```
**Solution:** Update Node.js to version 18+ from [nodejs.org](https://nodejs.org/)

**Registration Failed:**
```
Error: Username already exists
```
**Solution:** Choose a different username or use your existing credentials

**Authentication Failed:**
```
Error: Invalid credentials
```
**Solution:** Verify your username and password are correct

**MCP Server Not Found:**
```
Error: command not found: tai-mcp
```
**Solution:** Ensure you're using `npx tai-mcp` or install globally with `npm install -g tai-mcp`

**Environment Variables Missing:**
```
Error: Missing required environment variable: NAME
```
**Solution:** Set all required environment variables (NAME, PASSWORD, INSTANCE)

### Debug Mode

Enable debug logging to troubleshoot issues:

```bash
export LOG_LEVEL=debug
npx tai-mcp
```

This provides detailed output about:
- Authentication attempts
- API communications  
- Email processing
- Error details

### Getting Help

If you encounter issues:

1. **Check the logs** with debug mode enabled
2. **Verify environment variables** are set correctly
3. **Test network connectivity** to https://tai.chat
4. **Check Node.js version** meets requirements
5. **File an issue** on [GitHub](https://github.com/BMPixel/tai-mcp/issues) with:
   - Operating system and Node.js version
   - Complete error messages
   - Steps to reproduce the issue

## Next Steps

Once tai-mcp is installed and configured:

- [Configuration Guide](/guide/configuration) - Detailed environment variable reference
- [Usage Guide](/guide/usage) - Learn workflows and automation patterns  
- [API Reference](/api/) - Explore the available email tools