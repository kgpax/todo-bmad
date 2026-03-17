export interface AppConfig {
  PORT: number;
  DATABASE_PATH: string;
  CORS_ORIGIN: string;
  REVALIDATION_SECRET: string;
  LOG_LEVEL: string;
}

export function getConfig(): AppConfig {
  return {
    PORT: parseInt(process.env.PORT ?? "3001", 10),
    DATABASE_PATH: process.env.DATABASE_PATH ?? "./data/todos.db",
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    REVALIDATION_SECRET: process.env.REVALIDATION_SECRET ?? "",
    LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  };
}
