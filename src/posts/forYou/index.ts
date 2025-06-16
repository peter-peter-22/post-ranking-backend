import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { User } from "../../db/schema/users";
import { getTrendNames } from "../../trends/getTrends";
import { hydratePostsWithMeta } from "../hydratePosts";
import { fetchCandidates } from "./candidates/fetchPosts";
import { getFollowedCandidates } from "./candidates/sources/followed";
import { getGraphClusterCandidates } from "./candidates/sources/graphCluster";
import { getRepliedByFollowedCandidates } from "./candidates/sources/repliedByFollowed";
import { getTrendCandidates } from "./candidates/sources/trending";
import { CandidateSubquery, deduplicatePosts } from "../common";
import { rankPosts } from "./ranker";
import { getEmbeddingSimilarityCandidates } from "./candidates/sources/embedding";

/** Get posts from the main feed of a user 
 * @todo Separating skipIds per candidate source would improve performance.
*/
export async function getFeed({ user, skipIds }: { user: User, skipIds?: string[] }) {
    // Get common data
    const [trends, followedUsers] = await Promise.all([
        getTrendNames(user.clusterId),
        getFollowedUsers({ user })
    ])

    /** The subqueries to get the candidates */
    const candidateSqs: CandidateSubquery[] = []
    /** The promises to get the candidates */
    const promises = []

    // Followed
    candidateSqs.push(getFollowedCandidates({ followedUsers, skipIds }))
    // Replied by followed
    candidateSqs.push(getRepliedByFollowedCandidates({ followedUsers, skipIds }))
    // Graph cluster
    const graphClusterSq = getGraphClusterCandidates({ followedUsers, skipIds, user })
    if (graphClusterSq)
        candidateSqs.push(graphClusterSq)
    // Trending
    const trendingSqs = getTrendCandidates({ trends, skipIds })
    for (const sq of trendingSqs)
        candidateSqs.push(sq)
    // Embedding
    const embedding = user.embedding
    if (embedding)
        promises.push(getEmbeddingSimilarityCandidates({ vector: embedding, skipIds }))

    // Fetch candidates from the database
    promises.push(fetchCandidates(candidateSqs))

    // Await the promises to get all candidates
    const allCandidates = (await Promise.all(promises)).flat()

    // Deduplicate
    const deduplicated = deduplicatePosts(allCandidates)

    // Hydrate
    let finalPosts = await hydratePostsWithMeta(deduplicated, user)

    // Rank
    return await rankPosts(finalPosts)
}