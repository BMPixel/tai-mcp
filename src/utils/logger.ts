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

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger(
  (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info'
);