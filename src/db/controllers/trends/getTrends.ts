import { desc, eq, getTableColumns, notInArray, sql } from "drizzle-orm"
import { db } from "../.."
import { getOrGenerateCache } from "../../../redis/cachedRead"
import { trends } from "../../schema/trends"
import { userClusterTrends } from "../../schema/userClusterTrends"

function getTrendColumns(category:"global"|"personal")
{
    return {
        ...getTableColumns(trends),
        category:sql<string>`${category}::text`.as("trend_category")
    }
}

export type TrendForClient=Awaited<ReturnType<typeof fetchTrends>>[number]

/** Return the the top and personalized trends. */
async function fetchTrends(clusterId: number | null) {
    if (clusterId) {
        // If the clusterid is defined, fetch the personalized and global trends.

        /** Top personalized trends */
        const personalTrends = await db
            .select(getTrendColumns("personal"))
            .from(userClusterTrends)
            .innerJoin(trends, eq(userClusterTrends.keyword, trends.keyword))
            .where(eq(userClusterTrends.clusterId, clusterId))
            .orderBy(desc(userClusterTrends.count))
            .limit(5)

        /** The keywords of the personalized trends. */
        const personalKeywords = personalTrends.map(t => t.keyword)

        /** Top global trends */
        const globalTrends = await db
            .select(getTrendColumns("global"))
            .from(trends)
            .where(notInArray(trends.keyword, personalKeywords))
            .orderBy(trends.score)
            .limit(5)

        return [...personalTrends, ...globalTrends]
    }
    else {
        // If the cluster id is undefined, fetch only the global trends.

        return await db
            .select(getTrendColumns("global"))
            .from(trends)
            .orderBy(trends.score)
            .limit(10)
    }
}

/** Expiration time of cache. */
const expiration = 60 * 5 // 5 minutes

/** Get the the top trends. */
export async function getTrends(clusterId: number|null) {
    return await getOrGenerateCache<TrendForClient[]>(`trends_${clusterId}`, async () => await fetchTrends(clusterId), expiration)
}

/** Get the names of the top trends. */
export async function getTrendNames(clusterId: number|null) {
    return (await getTrends(clusterId)).map(trend => trend.keyword)
}
