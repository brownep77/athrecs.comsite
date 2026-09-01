export function normalizePostgresConnectionString(rawConnectionString: string): string;

export function postgresConnectionConfig<T extends object = Record<string, never>>(
  rawConnectionString: string,
  extras?: T,
): T & { connectionString: string; ssl?: true };
