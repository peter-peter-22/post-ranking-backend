import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { User } from "../../db/schema/users";
import { getTrendNames } from "../../db/controllers/trends/getTrends";
import { getFollowedCandidates } from "./candidates/followed";
import { getGraphClusterCandidates } from "./candidates/graphCluster";
import { getRepliedByFollowedCandidates } from "./candidates/repliedByFollowed";
import { getTrendCandidates } from "./candidates/trending";
import { CandidateSubquery, DatePageParams } from "../common";
import { rankPosts } from "../ranker";
import { getEmbeddingSimilarityCandidates } from "./candidates/embedding";
import { personalizePosts } from "../hydratePosts";

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

    const [followed, followed2] = await Promise.all([
        getFollowedCandidates({ followedUsers, count: 30, user, pageParams: pageParams?.followed, firstPage }),
        getTrendCandidates({ trends, user, count: 30, pageParams: pageParams?.trends, firstPage })
    ])
    let allPosts = [...followed.posts, ...followed2.posts]
    const allPageParams: ForYouPageParams = {
        followed: followed.pageParams,
        trends: followed2.pageParams
    }
    if(allPosts.length===0) return 

    // Rank
    allPosts = await rankPosts(allPosts)

    return { posts: allPosts, pageParams: allPageParams }
}