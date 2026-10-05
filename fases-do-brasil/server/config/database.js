import 'dotenv/config';

/** Lê DATABASE_URL (mysql://user:pass@host:port/db) — padrão de instruções/datasetconfig.md. */
export function parseDatabaseUrl(url = process.env.DATABASE_URL ?? 'mysql://root:root@127.0.0.1:3307/fases_do_brasil') {
  const u = new URL(url);
  return {
    host: u.hostname, port: Number(u.port || 3306),
    user: decodeURIComponent(u.username), password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
  };
}
