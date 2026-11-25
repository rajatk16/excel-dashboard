export type WorkerLogLevel = 'info' | 'warn' | 'error';

export type WorkerLogFields = Record<string, string | number | boolean | null | undefined>;

export interface WorkerLogger {
  info(message: string, fields?: WorkerLogFields): void;

  warn(message: string, fields?: WorkerLogFields): void;

  error(message: string, fields?: WorkerLogFields): void;
}

export function createWorkerLogger(workerName: string): WorkerLogger {
  function write(
    level: WorkerLogLevel,

    message: string,

    fields: WorkerLogFields = {},
  ): void {
    const entry = JSON.stringify({
      ...fields,

      level,

      service: workerName,

      message,

      timestamp: new Date().toISOString(),
    });

    const stream = level === 'error' ? process.stderr : process.stdout;

    stream.write(`${entry}\n`);
  }

  return {
    info: (message, fields) => {
      write('info', message, fields);
    },

    warn: (message, fields) => {
      write('warn', message, fields);
    },

    error: (message, fields) => {
      write('error', message, fields);
    },
  };
}
