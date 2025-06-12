# Testing Guide

tai-mcp uses a comprehensive testing strategy that emphasizes integration testing with real API calls while maintaining fast unit tests for development workflow. This guide covers testing philosophy, strategies, and practical implementation.

## Testing Philosophy

### Integration-First Approach

tai-mcp prioritizes integration tests because:

- **Real API Behavior:** Tests actual email service responses and edge cases
- **End-to-End Validation:** Verifies complete workflows from tool call to email delivery
- **Network Conditions:** Tests under real network latency and connectivity issues
- **Authentication Flow:** Validates JWT token management and refresh logic
- **Content Processing:** Tests HTML/markdown conversion with real email content

### Dual Testing Strategy

**Integration Tests (Primary)**
- Test complete email workflows with live API calls
- Use two-account testing pattern (sender/receiver)
- Validate real-world scenarios and edge cases
- Run by default with `npm test`

**Unit Tests (Secondary)**
- Test individual components in isolation
- Fast execution for development feedback
- Mock external dependencies
- Business logic validation

## Test Architecture

### Directory Structure

```
tests/
├── integration/          # End-to-end API tests
│   └── api.test.ts      # Complete email workflows
├── unit/                # Component isolation tests
│   ├── services/        # Service layer tests
│   │   ├── api-client.test.ts
│   │   └── auth.test.ts
│   ├── tools/           # Tool implementation tests
│   │   ├── send-email.test.ts
│   │   └── reply-email.test.ts
│   └── utils/           # Utility function tests
│       ├── config.test.ts
│       └── html-to-markdown.test.ts
└── mocks/               # Test fixtures and data
    └── api-responses.ts # Mock API responses
```

### Test Configuration

**Jest Configuration (`jest.config.js`):**
```javascript
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.ts'
  ],
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true
    }]
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
};
```

## Integration Testing

### Two-Account Testing Pattern

Integration tests use separate sender and receiver accounts to test complete email workflows:

```typescript
describe('Email Integration Tests', () => {
  let senderConfig: Config;
  let receiverConfig: Config;
  let senderApiClient: ApiClient;
  let receiverApiClient: ApiClient;

  beforeAll(async () => {
    // Set up sender account
    senderConfig = {
      name: `sender${Date.now()}`,
      password: 'test-password-123',
      instance: 'test-sender',
      // ... other config
    };

    // Set up receiver account  
    receiverConfig = {
      name: `receiver${Date.now()}`,
      password: 'test-password-456',
      instance: 'test-receiver',
      // ... other config
    };

    // Initialize API clients
    senderApiClient = new ApiClient(senderConfig);
    receiverApiClient = new ApiClient(receiverConfig);

    // Register test accounts
    await registerTestAccount(senderConfig);
    await registerTestAccount(receiverConfig);
  });

  afterAll(async () => {
    // Cleanup test accounts
    await cleanupTestAccount(senderConfig);
    await cleanupTestAccount(receiverConfig);
  });
});
```

### Email Workflow Tests

**Complete Send/Receive/Reply Workflow:**
```typescript
test('complete email workflow: send → receive → reply', async () => {
  const testSubject = `Test Email ${Date.now()}`;
  const testContent = `# Test Email\n\nThis is a test message with **markdown** formatting.`;

  // Step 1: Sender sends email to receiver
  const sendResult = await senderApiClient.sendEmail({
    to: `${receiverConfig.instance}.${receiverConfig.name}@tai.chat`,
    subject: testSubject,
    content: testContent,
    format: 'markdown'
  });

  expect(sendResult).toHaveProperty('messageId');
  expect(sendResult.to).toContain(receiverConfig.name);

  // Step 2: Receiver fetches the email
  await waitForEmailDelivery(); // Allow time for email processing

  const messages = await receiverApiClient.fetchMessages({
    prefix: receiverConfig.instance,
    limit: 10
  });

  const receivedEmail = messages.messages.find(
    msg => msg.subject === testSubject
  );

  expect(receivedEmail).toBeDefined();
  expect(receivedEmail.from).toContain(senderConfig.name);

  // Step 3: Receiver replies to the email
  const replyContent = `Thanks for your message! I received it successfully.`;
  
  const replyResult = await receiverApiClient.replyToMessage(
    receivedEmail.id.toString(),
    {
      content: replyContent,
      format: 'markdown'
    }
  );

  expect(replyResult).toHaveProperty('messageId');
  expect(replyResult.subject).toMatch(/^Re:/);

  // Step 4: Sender receives the reply
  await waitForEmailDelivery();

  const senderMessages = await senderApiClient.fetchMessages({
    prefix: senderConfig.instance,
    limit: 10
  });

  const replyEmail = senderMessages.messages.find(
    msg => msg.subject.includes('Re:') && msg.subject.includes(testSubject)
  );

  expect(replyEmail).toBeDefined();
  expect(replyEmail.body_text).toContain(replyContent);
});
```

### Content Processing Tests

**HTML to Markdown Conversion:**
```typescript
test('HTML email content converted to markdown', async () => {
  const htmlContent = `
    <h1>Important Update</h1>
    <p>Please review the following changes:</p>
    <ul>
      <li><strong>Feature A</strong> - Now available</li>
      <li><em>Feature B</em> - Coming soon</li>
    </ul>
    <a href="https://example.com">Learn more</a>
  `;

  // Send HTML email
  await senderApiClient.sendEmail({
    to: `${receiverConfig.instance}.${receiverConfig.name}@tai.chat`,
    subject: 'HTML Content Test',
    content: htmlContent,
    format: 'html'
  });

  await waitForEmailDelivery();

  // Fetch and verify markdown conversion
  const receivedEmail = await receiverApiClient.fetchEmail();
  
  expect(receivedEmail).toContain('# Important Update');
  expect(receivedEmail).toContain('- **Feature A** - Now available');
  expect(receivedEmail).toContain('- *Feature B* - Coming soon');
  expect(receivedEmail).toContain('[Learn more](https://example.com)');
});
```

### Authentication Tests

**JWT Token Management:**
```typescript
test('automatic token refresh on expiration', async () => {
  // Force token expiration
  const apiClient = new ApiClient(senderConfig);
  await apiClient.login();
  
  // Simulate expired token
  const authService = (apiClient as any).authService;
  authService.tokenExpiry = new Date(Date.now() - 1000); // 1 second ago

  // Make API call that should trigger refresh
  const result = await apiClient.fetchMessages({ limit: 1 });
  
  expect(result).toBeDefined();
  expect(authService.token).toBeTruthy();
  expect(authService.tokenExpiry.getTime()).toBeGreaterThan(Date.now());
});
```

### Error Handling Tests

**Network Failure Recovery:**
```typescript
test('retry logic on network failures', async () => {
  // Mock network failure for first request
  const originalFetch = global.fetch;
  let callCount = 0;
  
  global.fetch = jest.fn().mockImplementation((...args) => {
    callCount++;
    if (callCount === 1) {
      throw new Error('Network error');
    }
    return originalFetch.apply(global, args);
  });

  try {
    const result = await senderApiClient.fetchMessages({ limit: 1 });
    expect(result).toBeDefined();
    expect(callCount).toBe(2); // First failed, second succeeded
  } finally {
    global.fetch = originalFetch;
  }
});
```

## Unit Testing

### Service Layer Tests

**API Client Unit Tests:**
```typescript
// tests/unit/services/api-client.test.ts
import { jest } from '@jest/globals';
import { ApiClient } from '../../../src/services/api-client.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockConfig: Config;

  beforeEach(() => {
    mockConfig = {
      name: 'test-user',
      password: 'test-password',
      instance: 'test',
      // ... other config
    };
    
    apiClient = new ApiClient(mockConfig);
    jest.clearAllMocks();
  });

  test('constructs request with authentication headers', async () => {
    // Mock successful authentication
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(createMockResponse({ 
        token: 'mock-jwt-token' 
      }))
      .mockResolvedValueOnce(createMockResponse({ 
        messages: [] 
      }));

    await apiClient.fetchMessages({ limit: 10 });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/messages'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-jwt-token'
        })
      })
    );
  });

  test('handles API rate limiting', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(createMockResponse(
        { error: 'Rate limited' }, 
        429
      ));

    await expect(
      apiClient.fetchMessages({ limit: 10 })
    ).rejects.toThrow('Rate limited');
  });
});
```

### Tool Tests

**Parameter Validation Tests:**
```typescript
// tests/unit/tools/send-email.test.ts
import { sendEmailSchema } from '../../../src/types/tools.js';

describe('send_email parameter validation', () => {
  test('validates email addresses correctly', () => {
    const validParams = {
      to: 'user@example.com',
      subject: 'Test Subject',
      content: 'Test content'
    };

    const result = sendEmailSchema.safeParse(validParams);
    expect(result.success).toBe(true);
  });

  test('rejects invalid email addresses', () => {
    const invalidParams = {
      to: 'invalid-email',
      subject: 'Test Subject',
      content: 'Test content'
    };

    const result = sendEmailSchema.safeParse(invalidParams);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('valid email');
  });

  test('applies default values correctly', () => {
    const minimalParams = {
      to: 'user@example.com'
    };

    const result = sendEmailSchema.parse(minimalParams);
    expect(result.format).toBe('markdown');
  });
});
```

### Utility Tests

**Content Conversion Tests:**
```typescript
// tests/unit/utils/html-to-markdown.test.ts
import { 
  convertHtmlToMarkdown, 
  convertMarkdownToHtml 
} from '../../../src/utils/html-to-markdown.js';

describe('Content conversion utilities', () => {
  test('converts HTML to markdown correctly', () => {
    const html = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> text.</p>';
    const markdown = convertHtmlToMarkdown(html);
    
    expect(markdown).toContain('# Title');
    expect(markdown).toContain('**bold**');
  });

  test('converts markdown to HTML correctly', () => {
    const markdown = '# Title\n\nParagraph with **bold** text.';
    const html = convertMarkdownToHtml(markdown);
    
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
  });

  test('handles edge cases gracefully', () => {
    expect(convertHtmlToMarkdown('')).toBe('');
    expect(convertMarkdownToHtml('')).toBe('');
    expect(convertHtmlToMarkdown(null as any)).toBe('');
  });
});
```

## Test Utilities and Helpers

### Test Data Management

```typescript
// tests/mocks/api-responses.ts
export const mockEmailResponse = {
  id: 12345,
  from: 'sender@example.com',
  to: 'receiver@example.com',
  subject: 'Test Email',
  body_text: 'Test email content',
  body_html: '<p>Test email content</p>',
  received_at: '2024-03-15T10:30:00Z',
  is_read: false
};

export const mockMessagesResponse = {
  messages: [mockEmailResponse],
  count: 1,
  has_more: false
};

export function createMockResponse(
  data: any, 
  status = 200
): Promise<Response> {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  } as Response);
}
```

### Test Configuration Helpers

```typescript
// tests/helpers/test-config.ts
export function createTestConfig(overrides: Partial<Config> = {}): Config {
  return {
    name: `test-user-${Date.now()}`,
    password: 'test-password-123',
    instance: 'test',
    userEmail: 'test@example.com',
    logLevel: 'error', // Reduce noise in tests
    apiTimeout: 5000,
    pollInterval: 1000,
    baseUrl: process.env.TEST_API_URL || 'https://tai.chat',
    ...overrides
  };
}

export async function registerTestAccount(config: Config): Promise<void> {
  const authService = new AuthService(config);
  try {
    await authService.register();
  } catch (error) {
    // Account might already exist, try to login
    await authService.login();
  }
}

export async function cleanupTestAccount(config: Config): Promise<void> {
  // Implementation depends on API availability for account deletion
  // For now, test accounts are left for manual cleanup
}
```

### Async Test Utilities

```typescript
// tests/helpers/async-utils.ts
export async function waitForEmailDelivery(
  timeout = 10000
): Promise<void> {
  // Allow time for email processing and delivery
  await new Promise(resolve => setTimeout(resolve, 2000));
}

export async function waitForCondition<T>(
  condition: () => Promise<T | null>,
  timeout = 10000,
  interval = 1000
): Promise<T> {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const result = await condition();
    if (result !== null) {
      return result;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

export async function retryAsync<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Test Execution

### Running Tests

**All Tests (Default):**
```bash
npm test
```

**Integration Tests Only:**
```bash
npm run test:integration
```

**Unit Tests Only:**
```bash
npm run test:unit
```

**Watch Mode:**
```bash
npm run test:watch
```

**Coverage Report:**
```bash
npm test -- --coverage
```

**Specific Test File:**
```bash
npm test -- tests/integration/api.test.ts
```

**Verbose Output:**
```bash
npm test -- --verbose
```

### Test Environment Configuration

**Environment Variables for Testing:**
```bash
# Override API URL for testing
TEST_API_URL=https://staging.tai.chat

# Disable integration tests
TEST_INTEGRATION=false

# Enable debug logging in tests
LOG_LEVEL=debug

# Faster timeouts for unit tests
API_TIMEOUT=5000
```

**CI/CD Configuration:**
```yaml
# GitHub Actions example
- name: Run Tests
  env:
    TEST_INTEGRATION: true
    LOG_LEVEL: error
    API_TIMEOUT: 30000
  run: npm test
```

## Test Maintenance

### Best Practices

**Test Isolation:**
- Each test should be independent
- Clean up resources after tests
- Use unique test data to avoid conflicts
- Mock external dependencies in unit tests

**Test Reliability:**
- Handle network latency in integration tests
- Use retry logic for flaky operations
- Set appropriate timeouts
- Test error conditions explicitly

**Test Performance:**
- Run unit tests frequently during development
- Use integration tests for CI/CD validation
- Optimize test data and setup
- Parallel test execution where possible

### Debugging Tests

**Debug Specific Test:**
```bash
# Run single test with debug output
LOG_LEVEL=debug npm test -- --testNamePattern="send email"
```

**Node.js Debugging:**
```bash
# Debug test execution
node --inspect-brk node_modules/.bin/jest tests/integration/api.test.ts
```

**Test Coverage Analysis:**
```bash
# Generate detailed coverage report
npm test -- --coverage --coverageReporters=html
open coverage/index.html
```

### Common Issues and Solutions

**Flaky Integration Tests:**
```typescript
// Add retry logic for network-dependent operations
test('should handle network issues', async () => {
  await retryAsync(async () => {
    const result = await apiClient.fetchMessages({ limit: 1 });
    expect(result).toBeDefined();
  }, 3, 2000);
});
```

**Test Account Management:**
```typescript
// Use unique account names to avoid conflicts
beforeAll(async () => {
  const timestamp = Date.now();
  testConfig.name = `test-${timestamp}`;
  await registerTestAccount(testConfig);
});
```

**Mock Data Consistency:**
```typescript
// Ensure mock data matches real API responses
const mockResponse = {
  ...realApiResponse,
  // Override only necessary fields for test
  id: 'test-id-123'
};
```

## Continuous Integration

### GitHub Actions Configuration

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        env:
          TEST_INTEGRATION: true
          # Add test credentials as secrets
          TEST_NAME: ${{ secrets.TEST_NAME }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

This comprehensive testing strategy ensures tai-mcp remains reliable and maintainable while supporting rapid development and deployment cycles.

## Next Steps

- [Development Guide](/development/) - Setup and contribution guidelines
- [Architecture Guide](/development/architecture) - Detailed system design
- [API Reference](/api/) - Tool implementation details