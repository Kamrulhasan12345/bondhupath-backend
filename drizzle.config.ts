import { defineConfig } from 'drizzle-kit';
import config from './src/config/config';

export default defineConfig({
  out: './migrations',
  schema: ['src/modules/**/*.schema.ts'],
  dialect: 'postgresql',
  dbCredentials: {
    url: config.db.url,
  }
});
