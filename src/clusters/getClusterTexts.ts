import { cosineDistance, desc, eq, sql } from "drizzle-orm";
import { posts } from "../db/schema/posts";
import { db } from "../db";
import { users } from "../db/schema/users";
import { Cluster, clusters } from "../db/schema/clusters";

/** Get the most relevant posts from a cluster and return their texts. 
 * @param cluster The cluster where the posts are selected from.
 * @param count Max count of posts
 * @returns The most relevant post text
*/
export async function getClusterTexts(cluster: Cluster, count: number) {
    const similarity = sql<number>`1 - (${cosineDistance(posts.embedding, cluster.centroid)})`;
    const mostSimilarPosts = await db
        .select({
            text: posts.text,
            similarity
        })
        .from(posts)
        .innerJoin(users, eq(users.id, posts.userId))
        .where(eq(users.clusterId, cluster.id))
        .orderBy(t => desc(t.similarity))
        .limit(count)
    const texts = mostSimilarPosts.map(post => post.text)
    return texts
}


export async function getClustersTexts() {
    
    /** The max number of posts per cluster */
    const maxPosts = 10

    // Get all clusters
    const allClusters = await db.select().from(clusters)

    // Function to get the texts of a cluster and return a formatted object
    const addTextsToCluster = async (cluster: Cluster) => ({ id: cluster.id, texts: await getClusterTexts(cluster, maxPosts) })

    // Add the texts to the clusters
    return await Promise.all(
        allClusters.map(cluster => addTextsToCluster(cluster))
    )
}