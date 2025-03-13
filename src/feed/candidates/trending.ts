import { and, desc, inArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData, CandidatePost, setCandidatesType } from ".";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";

/** Max count of posts */
const count = 100;

/** Selecting candidate posts from the users those the viewer follows */
export async function getInNetworkCandidates({ followedUsers, commonFilters }: CandidateCommonData): Promise<CandidatePost[]> {
    // Get the posts
    let candidates = await db
        .select(candidateColumns)
        .from(posts)
        .where(
            and(
                ...commonFilters,
                inArray(posts.userId, followedUsers)
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
    console.log(`In network candidates: ${candidates.length}`)

    // Set the candidate type
    const candidatesWithType=setCandidatesType(candidates,"InNetwork")

    return candidatesWithType
}