/**
 * Structured JSON logger for Next.js API routes.
 *
 * Outputs newline-delimited JSON to stdout so log aggregators (Datadog, Logtail,
 * Papertrail, CloudWatch, etc.) can parse fields without regex.
 *
 * Usage:
 *   import { log } from '../../lib/logger';
 *   log.info({ event: 'user_login', userId });
 *   log.warn({ event: 'rate_limit_near', remaining: 5 });
 *   log.error({ event: 'db_error', err: err.message });
 */

const isDev = process.env.NODE_ENV !== 'production';
const SERVICE = 'cloudach-dashboard';

function write(level, fields) {
  const entry = {
    level,
    service: SERVICE,
    ts: new Date().toISOString(),
    ...fields,
  };

  if (isDev) {
    // Pretty-print in development for readability
    const { level: l, ts, service, ...rest } = entry;
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `[${l.toUpperCase()}] ${ts}`,
      rest,
    );
  } else {
    process.stdout.write(JSON.stringify(entry) + '\n');
  }
}

export const log = {
  info:  (fields) => write('info', fields),
  warn:  (fields) => write('warn', fields),
  error: (fields) => write('error', fields),
  debug: (fields) => { if (process.env.LOG_LEVEL === 'debug') write('debug', fields); },
};
