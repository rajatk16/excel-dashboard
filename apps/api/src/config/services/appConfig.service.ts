import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Environment } from '../schemas/environment.schema';

@Injectable()
export class AppConfigService {
  constructor(
    private readonly configService: ConfigService<Environment, true>
  ) {}

  get<K extends keyof Environment>(key: K): Environment[K] {
    return this.configService.getOrThrow<Environment[K]>(key)
  }

  get isProduction(): boolean {
    return this.get("NODE_ENV") === 'production';
  }

  get isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  get isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  get applicationName(): string {
    return this.get('APP_NAME');
  }

  get applicationVersion(): string {
    return this.get('APP_VERSION');
  }

  get host(): string {
    return this.get('API_HOST');
  }

  get port(): number {
    return this.get("API_PORT");
  }

  get corsOrigins(): readonly string[] {
    return this.get('CORS_ORIGINS');
  }

  get corsCredentials(): boolean {
    return this.get('CORS_CREDENTIALS');
  }

  get trustProxyHops(): number {
    return this.get('TRUST_PROXY_HOPS');
  }
}
