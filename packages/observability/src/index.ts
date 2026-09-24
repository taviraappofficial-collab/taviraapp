export interface LogContext {
  correlationId: string;
  requestId?: string;
  accountId?: string;
}
export interface Logger {
  info(message: string, context: LogContext): void;
  error(message: string, context: LogContext & { errorCode: string }): void;
}

const sensitiveKeys =
  /password|token|authorization|card|cvv|messageBody|identityDocument/i;
export function sanitizeLogFields(
  fields: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      sensitiveKeys.test(key) ? '[REDACTED]' : value,
    ]),
  );
}
