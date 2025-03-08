import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { candidateColumns } from ".";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";

/** Max count of posts */
const count = 450;

/** Selecting candidate posts from the users the  */
export async function getEmbeddingSimilarityCandidates({ user, followedUsers }: { user: User, followedUsers: string[] }) {

    //if the user has no embedding vector, exit.
    if (!user.embedding)
        return []

    const similarity = sql<number>`1 - (${cosineDistance(posts.embedding, user.embedding)})`;
    return await db
        .select({
            ...candidateColumns,
            similarity
        })
        .from(posts)
        .where(t => gt(t.similarity, 0.5))
        .orderBy(desc(posts.createdAt))
        .limit(count)
}