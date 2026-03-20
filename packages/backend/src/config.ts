export interface AppConfig {
  PORT: number;
  DATABASE_PATH: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_MAX: number;
  LOG_LEVEL: string;
}

export function getConfig(): AppConfig {
  return {
    PORT: parseInt(process.env.PORT ?? "3001", 10),
    DATABASE_PATH: process.env.DATABASE_PATH ?? "./data/todos.db",
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX ?? "120", 10),
    LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  };
}
