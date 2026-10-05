// Executa, em ordem, todos os data/*.sql no MySQL (config em .env). Uso: npm run db:init
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { parseDatabaseUrl } from '../server/config/database.js';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data');
const cfg = parseDatabaseUrl();

const conn = await mysql.createConnection({
  host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password,
  multipleStatements: true, charset: 'utf8mb4',
}).catch((e) => { console.error(`Não foi possível conectar ao MySQL em ${cfg.host}:${cfg.port} — ${e.message}\nO container está de pé? (docker compose -f docker/docker-compose.yml up -d)`); process.exit(1); });

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
for (const f of files) {
  await conn.query(fs.readFileSync(path.join(dir, f), 'utf8'));
  console.log(`✔ ${f}`);
}
await conn.end();
console.log(`Banco "${cfg.database}" pronto.`);
