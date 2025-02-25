import { sql } from "drizzle-orm";
import { db } from "..";

interface TableInfo {
    table_name: string;
    [key: string]: unknown;
}

/**
 * Clear all tables
 */
export async function clearAllTables() {
    try {
        // Get the list of all tables in the database
        const tables = await db.execute<TableInfo>(
            sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
        );

        // Truncate each table
        for (const table of tables.rows) {
            const tableName = table.table_name;
            await db.execute(sql`TRUNCATE TABLE ${sql.identifier(tableName)} CASCADE`);
            console.log(`Cleared table: ${tableName}`);
        }

        console.log('All tables cleared successfully.');
    } catch (error) {
        console.error('Error clearing tables:', error);
        throw error;
    }
}