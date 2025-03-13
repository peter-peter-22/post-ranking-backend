import { and, desc, getTableColumns, isNotNull } from "drizzle-orm"
import { db } from "../db"
import { posts } from "../db/schema/posts"
import { isPost, minimalEngagement, recencyFilter } from "../feed/filters"

// Only the hastags and the engagement score is needed.
const { hashtags, engagementScore } = getTableColumns(posts)
const columns = { hashtags, engagementScore }

/** How much trends are selected. */
const trendCount = 5

/** Trend with total engagement score and post count. */
type Trend = { name: string, score: number, posts: number }

/** Calculate the top trends. */
export async function updateTrendsList() {
    console.log("Updating trends.")

    // Get the hastags of the recent posts.
    const recentPosts = await db
        .select(columns)
        .from(posts)
        .where(and(
            isPost(),
            recencyFilter(),
            minimalEngagement(),
            isNotNull(posts.hashtags),
        ))
        .orderBy(desc(posts.createdAt))

    /** Hashtags paired with engagement metrics. */
    const trendScores: { [key: string]: Omit<Trend, "name"> } = {}

    // Group the score of the posts by their hashtags.
    recentPosts.forEach(({ hashtags, engagementScore }) => {
        // The posts without hashtag array are excluded, but typescript ignores this.
        if (!hashtags)
            return;

        hashtags.forEach(tag => {
            // Get or create the current score of the hashtag.
            let trend = trendScores[tag] || { score: 0, posts: 0 }

            // Add the score.
            trend.score += engagementScore

            // Increase the post count.
            trend.posts++

            // Apply.
            trendScores[tag] = trend
        });
    })

    /** Trends sorted by score. */
    const sortedTrends = Object.entries(trendScores).sort((a, b) => b[1].score - a[1].score);

    // Output the names of the top x trends.
    trends = sortedTrends.slice(0, trendCount).map(el => ({ name: el[0], ...el[1] }))

    console.log(`Calculated the top ${trends.length} trends from ${recentPosts.length} posts:`, trends)
}

/** The the top trends. */
let trends: Trend[] = []

/** Get the the top trends. */
export function getTrends() {
    return trends
}

/** Get the names of the top trends. */
export function getTrendNames() {
    return Object.keys(trends)
}