# Authentication

tai-mcp uses secure JWT-based authentication with automatic token management. This guide covers authentication flow, security features, and troubleshooting.

## Authentication Overview

tai-mcp handles authentication automatically using JSON Web Tokens (JWT) with the following security features:

- **JWT-based authentication** with HS256 algorithm
- **Automatic token refresh** before expiration  
- **Memory-only token storage** (no persistence)
- **Secure credential handling** via environment variables
- **Retry logic** for authentication failures

## Authentication Flow

### Initial Authentication

1. **Credential Validation**
   - Validates NAME and PASSWORD environment variables
   - Checks username format (3-50 chars, alphanumeric + hyphens)
   - Verifies password strength (8-128 characters)

2. **Token Request**
   - Sends login request to authentication endpoint
   - Receives JWT token with 24-hour expiration
   - Stores token in memory only

3. **Token Usage**
   - Includes JWT token in all API requests
   - Token contains username in `sub` claim
   - Server validates token signature and expiration

### Automatic Token Refresh

tai-mcp proactively manages token lifecycle:

```typescript
// Token refresh happens automatically
// - Checks token expiration before each request
// - Refreshes token when within 5 minutes of expiry
// - Retries failed requests after token refresh
// - No user intervention required
```

### Authentication Retry Logic

Robust error handling for authentication issues:

1. **401 Unauthorized Response**
   - Automatically attempts token refresh
   - Retries original request with new token
   - Falls back to full re-authentication if needed

2. **Network Failures**
   - Exponential backoff for retry attempts
   - Maximum retry limits to prevent infinite loops
   - Detailed error logging for debugging

## Security Features

### Credential Security

**Environment Variable Protection:**
```bash
# Credentials never appear in logs
NAME=username
PASSWORD=secure-password

# No hardcoded credentials in code
# No credential persistence to disk
# Memory-only token storage
```

**Secure Transmission:**
- All authentication requests use HTTPS
- Credentials encrypted in transit
- JWT tokens signed with server secret
- No credential caching or storage

### Token Security

**JWT Implementation:**
- **Algorithm:** HS256 (HMAC SHA-256)
- **Expiration:** 24 hours from issue
- **Claims:** Username in `sub`, standard exp/iat claims
- **Signature:** Server-side secret validation

**Token Lifecycle:**
```
Issue → Use → Monitor → Refresh → Expire
 ↑                                    ↓
 └────── Re-authenticate ←────────────┘
```

### Input Validation

**Username Validation:**
- 3-50 characters length
- Alphanumeric characters and hyphens only
- Case-sensitive matching
- Uniqueness enforced server-side

**Password Security:**
- 8-128 character length requirement
- Server-side PBKDF2-SHA256 hashing
- 100,000 iterations for resistance
- 16-byte random salt per password

## Configuration

### Required Environment Variables

```bash
# Required for authentication
NAME=your-username          # Registered username
PASSWORD=your-password      # Account password
```

### Optional Security Configuration

```bash
# API timeout (affects auth requests)
API_TIMEOUT=30000           # 30 seconds default

# Base URL (for custom endpoints)
API_BASE_URL=https://tai.chat
```

### MCP Configuration

Secure MCP configuration with environment variable references:

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

System environment variables:
```bash
export TAI_MCP_USERNAME=your-username
export TAI_MCP_PASSWORD=your-password
export TAI_MCP_INSTANCE=desktop
```

## Authentication States

### Successful Authentication

**Startup Logs:**
```
🚀 TAI MCP Email Server starting...
🔐 Authentication configured
✅ Login successful
📧 Instance email: desktop.username@tai.chat
⚡ MCP server ready on stdio
```

**API Request Flow:**
```
Request → Check Token → Valid → Proceed
                   ↓
                Invalid → Refresh → Retry → Success
```

### Authentication Failure

**Common Error Scenarios:**

**Invalid Credentials:**
```
Error: Authentication failed - invalid username or password
```

**Network Issues:**
```
Error: Unable to connect to authentication server
```

**Token Expired:**
```
Warning: Token expired, attempting refresh...
✅ Token refreshed successfully
```

## Error Handling

### Authentication Errors

**Login Failures:**
- Invalid username/password combinations
- Account locked or suspended
- Network connectivity issues
- Server maintenance periods

**Token Issues:**
- Expired tokens (handled automatically)
- Invalid token signatures
- Token corruption or modification
- Clock synchronization problems

### Error Recovery

**Automatic Recovery:**
```typescript
// tai-mcp handles these automatically:
// - Token expiration → automatic refresh
// - 401 responses → retry with new token  
// - Network failures → exponential backoff
// - Invalid tokens → full re-authentication
```

**Manual Recovery:**
```bash
# For persistent auth issues:
# 1. Verify credentials
echo $NAME
echo $PASSWORD  # (redacted in actual logs)

# 2. Test connectivity
curl https://tai.chat/api/v1/health

# 3. Enable debug logging
LOG_LEVEL=debug npx tai-mcp

# 4. Check for server issues
# Visit https://tai.chat/status
```

## Troubleshooting

### Common Issues

**Environment Variable Problems:**
```bash
# Check if variables are set
env | grep -E "(NAME|PASSWORD|INSTANCE)"

# Verify no extra spaces or characters
echo "[$NAME]"  # Should show [username] without spaces
```

**Authentication Debug Mode:**
```bash
# Enable detailed authentication logging
LOG_LEVEL=debug npx tai-mcp

# Look for authentication-related log entries:
# - Login attempts and responses
# - Token validation and refresh
# - API request authentication headers
```

**Network Connectivity:**
```bash
# Test API endpoint connectivity
curl -v https://tai.chat/api/v1/health

# Check for proxy or firewall issues
# Verify DNS resolution
nslookup tai.chat
```

### Debug Information

**Authentication Logs:**
```
DEBUG: Attempting login with username: alice
DEBUG: Login request sent to: https://tai.chat/api/v1/login
DEBUG: Login response status: 200
DEBUG: JWT token received, expires: 2024-03-16T10:30:00Z
DEBUG: Token stored in memory for API requests
```

**Token Management Logs:**
```
DEBUG: Checking token expiration before API request
DEBUG: Token expires in 4 minutes, refreshing proactively
DEBUG: Token refresh successful, new expiry: 2024-03-17T10:30:00Z
DEBUG: API request proceeding with refreshed token
```

### Security Monitoring

**Recommended Monitoring:**
- Failed authentication attempts
- Unusual token refresh patterns
- API rate limiting responses
- Network connectivity issues

**Log Analysis:**
```bash
# Monitor authentication events
tail -f logs/tai-mcp.log | grep -E "(auth|login|token)"

# Check for security-related errors
grep -E "(401|403|auth)" logs/tai-mcp.log
```

## Best Practices

### Credential Management

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Unique password for tai-mcp
   - Regular password rotation

2. **Secure Storage**
   - System environment variables
   - Password managers for credential storage
   - Encrypted configuration files
   - Never commit credentials to version control

3. **Access Control**
   - Limit access to credential information
   - Use dedicated service accounts when possible
   - Monitor authentication logs regularly
   - Implement principle of least privilege

### Environment Security

1. **Environment Variable Security**
   ```bash
   # Use descriptive, scoped variable names
   export TAI_MCP_USERNAME=alice
   export TAI_MCP_PASSWORD=secure-password-123
   
   # Set appropriate shell history settings
   export HISTCONTROL=ignorespace
   
   # Clear variables when no longer needed
   unset TAI_MCP_PASSWORD
   ```

2. **Configuration File Protection**
   ```bash
   # Secure MCP configuration file permissions
   chmod 600 ~/.config/claude/claude_desktop_config.json
   
   # Verify file ownership
   ls -la ~/.config/claude/claude_desktop_config.json
   ```

### Operational Security

1. **Monitoring and Alerting**
   - Set up monitoring for authentication failures
   - Alert on unusual access patterns
   - Track token refresh frequency
   - Monitor API usage patterns

2. **Incident Response**
   - Document credential rotation procedures
   - Prepare incident response workflows
   - Test authentication backup procedures
   - Maintain emergency access methods

## API Integration

### Authentication in Custom Applications

For developers integrating tai-mcp authentication:

```typescript
// Example: Manual authentication flow
const authService = new AuthService(config);

try {
  // Initial login
  await authService.login();
  
  // Make authenticated API calls
  const response = await apiClient.makeRequest('/api/v1/messages');
  
  // Authentication handled automatically
  // - Token refresh before expiration
  // - Retry on 401 responses
  // - Error handling and logging
  
} catch (error) {
  // Handle authentication errors
  console.error('Authentication failed:', error.message);
}
```

### Custom Authentication Headers

tai-mcp automatically handles authentication headers:

```http
GET /api/v1/messages HTTP/1.1
Host: tai.chat
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
User-Agent: tai-mcp/1.0.0
```

## Next Steps

- [API Overview](/api/) - Understanding tai-mcp API integration
- [Tools Reference](/api/tools) - Complete tool documentation  
- [Configuration Guide](/guide/configuration) - Environment variable setup
- [Troubleshooting](/guide/usage#troubleshooting) - Common issues and solutions