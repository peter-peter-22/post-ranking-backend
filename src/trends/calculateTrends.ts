import { and, desc, getTableColumns, isNotNull } from "drizzle-orm"
import { db } from "../db"
import { posts } from "../db/schema/posts"
import { Trend, trends } from "../db/schema/trends"
import { isPost, minimalEngagement, recencyFilter } from "../feed/filters"

// Only the hastags and the engagement score is needed.
const { hashtags, engagementScore } = getTableColumns(posts)
const columns = { hashtags, engagementScore }

/** How much trends are selected. */
const trendCount = 5

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

    /** If not hashtags are found, exit. */
    if (recentPosts.length === 0) {
        console.log("Trend updading cancelled because the lack of posts.")
        return
    }

    /** Trends sorted by score. */
    const sortedTrends = Object.entries(trendScores).sort((a, b) => b[1].score - a[1].score);

    /** Top trends. */
    const topTrends = sortedTrends.slice(0, trendCount).map(el => ({ name: el[0], ...el[1] }))

    /** Save to database. */
    const clear = db.$with("clear").as(db.delete(trends))
    await db.with(clear).insert(trends).values(topTrends)

    console.log(`Calculated the top ${topTrends.length} trends from ${recentPosts.length} posts:`, topTrends)
}