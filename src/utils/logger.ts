interface LogContext {
  [key: string]: any;
}

class Logger {
  private logLevel: number;
  private readonly levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };

  constructor(level: keyof typeof Logger.prototype.levels = 'info') {
    this.logLevel = this.levels[level] || this.levels.info;
  }

  setLevel(level: keyof typeof Logger.prototype.levels): void {
    this.logLevel = this.levels[level] || this.levels.info;
  }

  private shouldLog(level: keyof typeof Logger.prototype.levels): boolean {
    return this.levels[level] <= this.logLevel;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private writeLog(level: string, message: string, context?: LogContext): void {
    const logMessage = this.formatMessage(level, message, context);
    // In MCP mode (when running as a server), log to stderr to avoid interfering with stdio
    // In other modes, use regular console methods
    if (process.env.MCP_MODE === 'true' || !process.stdout.isTTY) {
      process.stderr.write(logMessage + '\n');
    } else {
      // Use appropriate console method based on level
      switch (level) {
        case 'error':
          console.error(logMessage);
          break;
        case 'warn':
          console.warn(logMessage);
          break;
        case 'info':
          console.info(logMessage);
          break;
        case 'debug':
          console.debug(logMessage);
          break;
        default:
          console.log(logMessage);
      }
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      this.writeLog('error', message, context);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.writeLog('warn', message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.writeLog('info', message, context);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.writeLog('debug', message, context);
    }
  }
}

export const logger = new Logger(
  (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info'
);