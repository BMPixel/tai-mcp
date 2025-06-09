# CF Mail Bridge API Specification

## Overview

CF Mail Bridge is a Cloudflare Workers-based email bridge service that provides email message queuing functionality. It allows users to register, authenticate, and access their email messages through a RESTful API.

**Base URL**: `https://tai.chat`

## Authentication

The API uses JWT (JSON Web Token) based authentication. Tokens are included in the `Authorization` header:

```
Authorization: Bearer <token>
```

**Token Expiration**: 24 hours

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Malformed request body or parameters |
| `INVALID_USERNAME` | Username validation failed |
| `INVALID_PASSWORD` | Password validation failed |
| `USER_EXISTS` | Username already registered |
| `INVALID_CREDENTIALS` | Login credentials are incorrect |
| `UNAUTHORIZED` | Missing or invalid authentication token |
| `NOT_FOUND` | Requested resource not found |
| `FORBIDDEN` | Access denied to resource |
| `RATE_LIMIT` | Too many requests |
| `INTERNAL_ERROR` | Server-side error |

## Endpoints

### 1. User Registration

**Endpoint**: `POST /api/v1/register`

**Description**: Register a new user account

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Validation Rules**:
- Username: 3-50 characters, lowercase letters/numbers/hyphens only (a-z0-9-), no uppercase or underscores
- Password: 8-128 characters, any characters allowed

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "username": "string",
    "email": "username@tai.chat",
    "token": "jwt_token_string"
  }
}
```

**Example**:
```bash
curl -X POST https://tai.chat/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"username": "johndoe", "password": "mypassword123"}'
```

### 2. User Login

**Endpoint**: `POST /api/v1/login`

**Description**: Authenticate user and receive access token

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "expires_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X POST https://tai.chat/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username": "johndoe", "password": "mypassword123"}'
```

### 3. Token Refresh

**Endpoint**: `POST /api/v1/refresh`

**Description**: Refresh an existing token to extend its validity

**Headers**:
```
Authorization: Bearer <current_token>
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_string",
    "expires_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X POST https://tai.chat/api/v1/refresh \
  -H "Authorization: Bearer your_current_token"
```

### 4. Get Messages

**Endpoint**: `GET /api/v1/messages`

**Description**: Retrieve user's email messages with pagination and filtering

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Number of messages to return (max: 200) |
| `offset` | integer | 0 | Number of messages to skip |
| `prefix` | string | - | Filter by to_address prefix (e.g., "desktop" for desktop.username@tai.chat) |

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "message_id": "unique_email_id",
        "from": "sender@example.com",
        "to": "username@tai.chat",
        "subject": "Email subject",
        "body_text": "Plain text content",
        "body_html": "<p>HTML content</p>",
        "is_read": false,
        "received_at": "2024-01-01T12:00:00.000Z",
        "size": 1024
      }
    ],
    "count": 1,
    "has_more": false
  }
}
```

**Examples**:

Basic request:
```bash
curl -X GET https://tai.chat/api/v1/messages \
  -H "Authorization: Bearer your_token"
```

With pagination:
```bash
curl -X GET "https://tai.chat/api/v1/messages?limit=10&offset=20" \
  -H "Authorization: Bearer your_token"
```

With prefix filtering:
```bash
curl -X GET "https://tai.chat/api/v1/messages?prefix=desktop" \
  -H "Authorization: Bearer your_token"
```

### 5. Get Single Message

**Endpoint**: `GET /api/v1/messages/{messageId}`

**Description**: Retrieve a specific message by ID

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `messageId` | integer | Message ID |

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message_id": "unique_email_id",
    "from": "sender@example.com",
    "to": "username@tai.chat",
    "subject": "Email subject",
    "body_text": "Plain text content",
    "body_html": "<p>HTML content</p>",
    "is_read": false,
    "received_at": "2024-01-01T12:00:00.000Z",
    "size": 1024
  }
}
```

**Example**:
```bash
curl -X GET https://tai.chat/api/v1/messages/123 \
  -H "Authorization: Bearer your_token"
```

### 6. Delete Message

**Endpoint**: `DELETE /api/v1/messages/{messageId}`

**Description**: Delete a specific message by ID

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `messageId` | integer | Message ID |

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "message": "Message deleted successfully",
    "id": 123
  }
}
```

**Example**:
```bash
curl -X DELETE https://tai.chat/api/v1/messages/123 \
  -H "Authorization: Bearer your_token"
```

### 7. Mark Message as Read

**Endpoint**: `PUT /api/v1/messages/{messageId}/read`

**Description**: Mark a specific message as read

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `messageId` | integer | Message ID |

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "message": "Message marked as read",
    "id": 123
  }
}
```

**Example**:
```bash
curl -X PUT https://tai.chat/api/v1/messages/123/read \
  -H "Authorization: Bearer your_token"
```

### 8. Send Email

**Endpoint**: `POST /api/v1/send-email`

**Description**: Send an email via the Resend service with sender authorization

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "to": "recipient@example.com",
  "from": "username@tai.chat",
  "subject": "Email subject",
  "message": "Plain text message content",
  "html": "HTML message content"
}
```

**Field Requirements**:
- `to` (string) - **Required** - Must be valid email format
- `from` (string) - **Optional** - Defaults to "noreply@tai.chat" if omitted
- `subject` (string) - **Optional** - Defaults to "Email from CF Mail Bridge" if omitted  
- `message` (string) - **Optional** - Plain text content, defaults to standard message if omitted
- `html` (string) - **Optional** - HTML content, defaults to generated HTML if omitted

**Validation Rules**:
- `to` field must be valid email format
- `from` field must be @tai.chat domain
- Authenticated user must be authorized for the sender address
- Supports prefix formats (e.g., user "alice" can send from "desktop.alice@tai.chat")
- Both `to` and `from` emails validated with regex pattern

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "messageId": "resend_message_id",
    "to": "recipient@example.com",
    "subject": "Email subject",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

**Examples**:

Minimal request (only required field):
```bash
curl -X POST https://tai.chat/api/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{"to": "test@example.com"}'
```

Full request with all fields:
```bash
curl -X POST https://tai.chat/api/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{"to": "test@example.com", "from": "alice@tai.chat", "subject": "Test Email", "message": "Hello World", "html": "<p>Hello <strong>World</strong></p>"}'
```

### 9. Get Unread Count

**Endpoint**: `GET /api/v1/unread`

**Description**: Get the count of unread messages for a specific email address from a specific sender. This endpoint does not require authentication.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | Yes | Email address to check (supports prefix format like `desktop.username@tai.chat`) |
| `from` | string | Yes | Sender email address to filter by |

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "to": "username@tai.chat",
    "from": "sender@example.com",
    "unread_count": 5
  }
}
```

**Examples**:

Basic request:
```bash
curl -X GET "https://tai.chat/api/v1/unread?to=alice@tai.chat&from=sender@example.com"
```

With prefix format:
```bash
curl -X GET "https://tai.chat/api/v1/unread?to=desktop.alice@tai.chat&from=sender@example.com"
```

**Notes**:
- Returns 0 for non-existent users
- Supports prefix email formats (e.g., `desktop.alice@tai.chat` maps to user `alice`)
- Both `to` and `from` parameters must be valid email addresses
- No authentication required

### 10. Health Check

**Endpoint**: `GET /health`

**Description**: Check service health and database connectivity

**Response (Success)**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Response (Failure)**:
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Example**:
```bash
curl -X GET https://tai.chat/health
```

## Data Models

### User
```typescript
interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
  last_access?: string;
}
```

### Message
```typescript
interface Message {
  id: number;
  user_id: number;
  message_id?: string;
  from_address: string;
  to_address: string;
  subject?: string;
  body_text?: string;
  body_html?: string;
  raw_headers?: string;
  raw_size?: number;
  is_read?: boolean;
  received_at: string;
}
```

### Message Response (API)
```typescript
interface MessageResponse {
  id: number;
  message_id?: string;
  from: string;
  to: string;
  subject?: string;
  body_text?: string;
  body_html?: string;
  is_read?: boolean;
  received_at: string;
  size?: number;
}
```

## Web Interface Endpoints

The service also provides web interface endpoints:

- `GET /` - Homepage with API documentation
- `GET /register` - User registration page
- `GET /login` - User login page
- `GET /messages` - Messages interface (requires authentication)

## Email Processing

The service automatically processes incoming emails via Cloudflare's Email Routing:

- Emails sent to `*@tai.chat` are automatically processed
- Username extraction supports prefix formats (e.g., `desktop.wenbo@tai.chat` → user `wenbo`)
- Messages are parsed using postal-mime library and stored in the database
- HTML content is preserved as-is, with HTML-to-text conversion for text fallback
- Users can access their messages via the API

### Email Authorization

For outbound emails, the service implements sender authorization to prevent spoofing:

- Users can only send emails from addresses they are authorized for
- Authorized formats: `username@tai.chat` or `prefix.username@tai.chat`
- Example: User "alice" can send from "alice@tai.chat" or "desktop.alice@tai.chat"
- Unauthorized sender addresses will result in a `FORBIDDEN` error

## Rate Limiting

The service implements rate limiting to prevent abuse. Specific limits depend on the deployment configuration.

## CORS

All API endpoints support CORS with the following configuration:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Environment Variables

The service requires the following environment variables:

- `JWT_SECRET` - Secret key for JWT token signing (required)
- `RESEND_API_KEY` - API key for Resend email service (required for send-email endpoint)

These are configured via Cloudflare Workers secrets using `npx wrangler secret put`.

## Database

The service uses Cloudflare D1 database with the following tables:

- `users` - User accounts
- `messages` - Email messages

Refer to `schema.sql` for the complete database schema.