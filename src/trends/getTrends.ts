import { db } from "../db"
import { Trend, trends } from "../db/schema/trends"
import { getOrGenerateCache } from "../redis/cachedRead"


/** Query to fetch the trends from the database. */
const fetchTrends =  async ()=>await db.select().from(trends)

/** Expiration time of cache. */
const expiration=60*10 // 5 minutes

/** Get the the top trends. */
export async function getTrends() {
    return await getOrGenerateCache<Trend[]>("trends",fetchTrends,expiration)
}

/** Get the names of the top trends. */
export async function getTrendNames() {
    return (await getTrends()).map(trend=>trend.name)
}