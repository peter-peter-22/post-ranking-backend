import { defineConfig } from 'drizzle-kit';
import 'dotenv';

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DB_URL!
    },
});