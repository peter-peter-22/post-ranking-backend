import { and, desc, inArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData, CandidatePost } from ".";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { isPost, minimalEngagement } from "./filters";

/** Max count of posts */
const count = 750;

/** Selecting candidate posts from the users those the viewer follows */
export async function getInNetworkCandidates({ followedUsers }: CandidateCommonData): Promise<CandidatePost[]> {
    const candidates = await db
        .select(candidateColumns)
        .from(posts)
        .where(
            and(
                isPost,
                minimalEngagement,
                inArray(posts.userId, followedUsers)
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
    console.log(`In network candidates: ${candidates.length}`)
    return candidates
}