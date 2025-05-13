import { and, gte, lt } from "drizzle-orm";
import { db } from "../db";
import { posts } from "../db/schema/posts";

async function getTrendsFromInterval(startDate: Date, endDate: Date) {
    const sql = await db
        .select()
        .from(posts)
        .where(
            and(
                gte(posts.createdAt, startDate),
                lt(posts.createdAt, endDate)
            )
        )
        .toSQL()
    console.log(sql)
}

await getTrendsFromInterval(new Date(), new Date())