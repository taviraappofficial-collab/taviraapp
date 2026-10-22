import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const generationOnlyUrl = 'postgresql://invalid:invalid@localhost:5432/invalid';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? generationOnlyUrl },
});
