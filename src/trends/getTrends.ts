import { db } from "../db"
import { Trend, trends } from "../db/schema/trends"
import { getOrGenerateCache } from "../redis/cachedRead"


/** Query to fetch the top trends from the database. */
async function fetchTrends() {
    return await db
    .select()
    .from(trends)
    .orderBy(trends.score)
    .limit(10)
}

/** Expiration time of cache. */
const expiration = 60 * 5 // 5 minutes

/** Get the the top trends. */
export async function getTrends() {
    return await getOrGenerateCache<Trend[]>("trends", fetchTrends, expiration)
}

/** Get the names of the top trends. */
export async function getTrendNames() {
    return (await getTrends()).map(trend => trend.name)
}