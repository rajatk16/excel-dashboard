import { validateDatabaseEnvironment } from '../src/config/databaseEnvironment';

describe('Database environment validation', () => {
  it('applies defaults for optional database settings', () => {
    const environment = validateDatabaseEnvironment({
      DATABASE_URL: 'postgresql://dashboard:dashboard@localhost:5432/excel_dashboard',
    });

    expect(environment).toMatchObject({
      DATABASE_POOL_MAX: 10,
      DATABASE_POOL_IDLE_TIMEOUT_MS: 30000,
      DATABASE_CONNECTION_TIMEOUT_MS: 5000,
      DATABASE_STATEMENT_TIMEOUT_MS: 30000,
      DATABASE_LOCK_TIMEOUT_MS: 5000,
      DATABASE_IDLE_TRANSACTION_TIMEOUT_MS: 15000,
      DATABASE_TRANSACTION_MAX_WAIT_MS: 5000,
      DATABASE_TRANSACTION_TIMEOUT_MS: 10000,
      DATABASE_HEALTH_TIMEOUT_MS: 2000,
    });
  });

  it('coerces numeric environment values', () => {
    const environment = validateDatabaseEnvironment({
      DATABASE_URL: 'postgres://dashboard:dashboard@localhost:5432/excel_dashboard',
      DATABASE_POOL_MAX: '25',
      DATABASE_HEALTH_TIMEOUT_MS: '1000',
    });

    expect(environment.DATABASE_POOL_MAX).toBe(25);
    expect(environment.DATABASE_HEALTH_TIMEOUT_MS).toBe(1000);
  });

  it('rejects invalid database URLs', () => {
    expect(() =>
      validateDatabaseEnvironment({
        DATABASE_URL: 'https://localhost:5432/excel_dashboard',
      }),
    ).toThrow('Invalid database configuration:');
  });
});
