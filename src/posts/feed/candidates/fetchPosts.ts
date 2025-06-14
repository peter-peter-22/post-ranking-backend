import { CandidateSubquery, PostCandidate } from "."
import { db } from "../../../db"
import { countCandidateSources } from "./countSources"

/** Use candidate selectors to fetch the ids of the posts.
 * @param candidateSqs The subqueries of the candidate sources. The subqueries must return the pre-defined candidate rows and be dynamic.
 * @param user The viewer.
 * @returns Post ids.
*/
export async function fetchCandidates(candidateSqs: CandidateSubquery[]) {
    // Exit if no candidate selectors
    if (candidateSqs.length === 0) {
        console.log("All candidate selectors cancelled")
        return []
    }

    // Union the subqueries
    let unionSq = candidateSqs[0]
    for (const sq of candidateSqs.slice(1))
        unionSq = unionSq.unionAll(sq)

    // Fetch
    let postsToDisplay = await db
        .select()
        .from(unionSq.as("all_candidates"))

    return postsToDisplay
}

/** Remove posts with duplicated ids. */
export function deduplicatePosts(posts: PostCandidate[]) {
    const seen = new Set<string>();
    const deduplicated= posts.filter(post => {
        if (seen.has(post.id))
            return false;
        else {
            seen.add(post.id);
            return true;
        }
    })
    console.log("Before deduplication:",countCandidateSources(posts),"After deduplication:",countCandidateSources(deduplicated))
    return deduplicated
}