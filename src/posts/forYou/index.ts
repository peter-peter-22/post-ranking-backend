import { getTrendNames } from "../../db/controllers/trends/getTrends";
import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { User } from "../../db/schema/users";
import { DatePageParams, mergePostArrays } from "../common";
import { rankPosts } from "../ranker";
import { getFollowedCandidates } from "./candidates/followed";
import { getTrendCandidates } from "./candidates/trending";

export type ForYouPageParams = {
    followed?: DatePageParams,
    trends?: DatePageParams
}

/** Get posts from the main feed of a user 
 * @todo Separating skipIds per candidate source would improve performance.
*/
export async function getMainFeed({ user, pageParams, firstPage }: { user: User, pageParams?: ForYouPageParams, firstPage: boolean }) {
    // Get common data
    const [trends, followedUsers] = await Promise.all([
        getTrendNames(user.clusterId),
        getFollowedUsers({ user })
    ])


    //// Followed
    //candidateSqs.push()
    //// Replied by followed
    //candidateSqs.push(getRepliedByFollowedCandidates({ followedUsers, skipIds }))
    //// Graph cluster
    //const graphClusterSq = getGraphClusterCandidates({ followedUsers, skipIds, user })
    //if (graphClusterSq)
    //    candidateSqs.push(graphClusterSq)
    //// Trending
    //const trendingSqs = getTrendCandidates({ trends, skipIds })
    //for (const sq of trendingSqs)
    //    candidateSqs.push(sq)
    //// Embedding
    //const embedding = user.embedding
    //if (embedding)
    //    candidateSqs.push(getEmbeddingSimilarityCandidates({ vector: embedding, skipIds }))

    const [followedPosts, trendPosts] = await Promise.all([
        getFollowedCandidates({ followedUsers, count: 30, user, pageParams: pageParams?.followed, firstPage }),
        getTrendCandidates({ trends, user, count: 30, pageParams: pageParams?.trends, firstPage })
    ])

    let allPosts = mergePostArrays([followedPosts?.posts, trendPosts?.posts])
    if (allPosts.length === 0) return

    const allPageParams: ForYouPageParams = {
        followed: followedPosts?.pageParams,
        trends: trendPosts?.pageParams
    }
    
    // Rank
    allPosts = await rankPosts(allPosts)

    return { posts: allPosts, pageParams: allPageParams }
}