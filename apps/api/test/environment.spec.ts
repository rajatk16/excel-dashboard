import { validateEnvironment } from "../src/config/schemas/environment.schema";

describe('Environment validation', () => {
  it('applies safe development defaults', () => {
    const environment = validateEnvironment({});

    expect(environment.NODE_ENV).toBe('development');
    expect(environment.API_PORT).toBe(4000);
    expect(environment.CORS_CREDENTIALS).toBe(false);

    expect(environment.CORS_ORIGINS).toEqual([
      'http://localhost:3000',
    ]);
  });

  it('converts string ports into numbers', () => {
    const environment = validateEnvironment({
      API_PORT: '5000',
    });

    expect(environment.API_PORT).toBe(5000);
  });

  it('parses multiple CORS origins', () => {
    const environment = validateEnvironment({
      CORS_ORIGINS:
        'http://localhost:3000, https://app.example.com',
    });

    expect(environment.CORS_ORIGINS).toEqual([
      'http://localhost:3000',
      'https://app.example.com',
    ]);
  });

  it('deduplicates CORS origins', () => {
    const environment = validateEnvironment({
      CORS_ORIGINS:
        'http://localhost:3000,http://localhost:3000',
    });

    expect(environment.CORS_ORIGINS).toEqual([
      'http://localhost:3000',
    ]);
  });

  it('parses false without truthiness coercion', () => {
    const environment = validateEnvironment({
      CORS_CREDENTIALS: 'false',
    });

    expect(environment.CORS_CREDENTIALS).toBe(false);
  });

  it('parses true explicitly', () => {
    const environment = validateEnvironment({
      CORS_CREDENTIALS: 'true',
    });

    expect(environment.CORS_CREDENTIALS).toBe(true);
  });

  it('rejects invalid boolean values', () => {
    expect(() =>
      validateEnvironment({
        CORS_CREDENTIALS: 'yes',
      }),
    ).toThrow('CORS_CREDENTIALS');
  });

  it.each([
    '0',
    '-1',
    '65536',
    'abc',
    '1.5',
  ])('rejects invalid API port %s', (port) => {
    expect(() =>
      validateEnvironment({
        API_PORT: port,
      }),
    ).toThrow('API_PORT');
  });

  it('rejects wildcard CORS origins', () => {
    expect(() =>
      validateEnvironment({
        CORS_ORIGINS: '*',
      }),
    ).toThrow('CORS_ORIGINS');
  });

  it('rejects CORS origins containing paths', () => {
    expect(() =>
      validateEnvironment({
        CORS_ORIGINS: 'https://example.com/dashboard',
      }),
    ).toThrow('CORS_ORIGINS');
  });

  it('rejects insecure production CORS origins', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        CORS_ORIGINS: 'http://example.com',
      }),
    ).toThrow('Production CORS origins must use HTTPS');
  });

  it('accepts secure production configuration', () => {
    const environment = validateEnvironment({
      NODE_ENV: 'production',
      CORS_ORIGINS: 'https://app.example.com',
    });

    expect(environment.NODE_ENV).toBe('production');
  });

  it('rejects header timeouts exceeding request timeouts', () => {
    expect(() =>
      validateEnvironment({
        HTTP_REQUEST_TIMEOUT_MS: '5000',
        HTTP_HEADERS_TIMEOUT_MS: '10000',
      }),
    ).toThrow('HTTP_HEADERS_TIMEOUT_MS');
  });
});
