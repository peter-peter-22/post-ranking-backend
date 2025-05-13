import { and, getTableColumns, gte, lt } from "drizzle-orm";
import { db } from "../db";
import { posts } from "../db/schema/posts";
import { createStream } from "../db/utils/cursor";

// Select only the keywords
const {keywords,..._}=getTableColumns(posts)

/** Count the mentions of all keywords in a given time interval.
 * @param startDate - The start date of the time interval.
 * @param endDate - The end date of the time interval.
 */
async function getTrendsFromInterval(startDate: Date, endDate: Date) {
    const keywordCounts: Map<string, number> = new Map()

    /** Query to get the keywords of the posts from the  */
    const query = db
        .select({keywords})
        .from(posts)
        .where(
            and(
                gte(posts.createdAt, startDate),
                lt(posts.createdAt, endDate)
            )
        )

    for await (const post of createStream(query)) {
        // Increase the counters of each keyword in each post
        post.keywords?.forEach(keyword => {
            let count = keywordCounts.get(keyword) || 0
            count++
            keywordCounts.set(keyword, count)
        })
    }

    console.log(keywordCounts.entries())
}
