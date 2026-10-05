import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Usa DATABASE_URL do .env; sem .env (ex.: no `npm install`), cai no padrão de instruções/datasetconfig.md.
const url = process.env.DATABASE_URL ?? 'mysql://root:root@127.0.0.1:3307/fases_do_brasil';

export default defineConfig({ schema: 'prisma/schema.prisma', datasource: { url } });
