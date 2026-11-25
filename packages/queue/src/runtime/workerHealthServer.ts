import { createServer, type Server, type ServerResponse } from 'node:http';

export interface WorkerHealthServerOptions {
  host: string;

  port: number;

  isReady(): Promise<boolean>;
}

function respond(
  response: ServerResponse,

  statusCode: number,

  body: Record<string, unknown>,
): void {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',

    'Cache-Control': 'no-store',

    'X-Content-Type-Options': 'nosniff',
  });

  response.end(JSON.stringify(body));
}

export class WorkerHealthServer {
  private readonly server: Server;

  constructor(private readonly options: WorkerHealthServerOptions) {
    this.server = createServer((request, response) => {
      if (request.method !== 'GET') {
        respond(response, 405, {
          status: 'method_not_allowed',
        });

        return;
      }

      if (request.url === '/health/live') {
        respond(response, 200, {
          status: 'ok',
        });

        return;
      }

      if (request.url === '/health/ready') {
        void this.handleReadiness(response);

        return;
      }

      respond(response, 404, {
        status: 'not_found',
      });
    });

    this.server.requestTimeout = 5000;

    this.server.headersTimeout = 5000;

    this.server.keepAliveTimeout = 1000;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const onError = (error: Error): void => {
        reject(error);
      };

      this.server.once('error', onError);

      this.server.listen(
        this.options.port,

        this.options.host,

        () => {
          this.server.removeListener('error', onError);

          resolve();
        },
      );
    });
  }

  close(): Promise<void> {
    if (!this.server.listening) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.server.close((error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });

      this.server.closeIdleConnections();
    });
  }

  private async handleReadiness(response: ServerResponse): Promise<void> {
    let ready = false;

    try {
      ready = await this.options.isReady();
    } catch {
      ready = false;
    }

    if (!response.destroyed) {
      respond(response, ready ? 200 : 503, {
        status: ready ? 'ready' : 'not_ready',
      });
    }
  }
}
