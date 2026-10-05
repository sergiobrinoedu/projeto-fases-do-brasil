import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { parseDatabaseUrl } from '../config/database.js';

/** Model layer — instância única do Prisma Client ligada ao MySQL (adapter MariaDB/MySQL). */
const c = parseDatabaseUrl();
export const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: c.host, port: c.port, user: c.user, password: c.password, database: c.database,
    connectionLimit: 5,
  }),
});
