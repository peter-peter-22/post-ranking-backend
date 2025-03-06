import { getFollowedUsers } from "../db/controllers/users/getFollowers";
import { User } from "../db/schema/users";
import { addDataToPosts } from "./addDataToPosts";
import { getCandidates } from "./candidates";

export const scorePerClick = 1
export const scorePerLike = 3
export const scorePerReply = 6

/** Get posts from the main feed of a user. */
export async function getFeed({ user, limit = 50, offset = 0 }: { user: User, limit?: number, offset?: number }) {
    const followedUsers = await getFollowedUsers({ user })
    const candidates = await getCandidates({ user, followedUsers })
    const fullPosts = addDataToPosts({ posts: candidates, user, followedUsers })
    return fullPosts
}

/** The posts from the main feed of a user in a more readable format.  */
export async function getFeedSimplified({ user }: { user: User }) {
    //    return (await getFeed({ user })).map(({ isLiked, likeCount, user: publisher, globalScore, personalScore, topic, viewCount, createdAt, clickCount }) => ({
    //        handle: publisher?.handle,
    //        topic,
    //        score: globalScore + personalScore,
    //        globalScore,
    //        personalScore,
    //        createdAt: createdAt.getDay(),
    //        counts: {
    //            likeCount,
    //            clickCount,
    //            viewCount,
    //        },
    //        personal: {
    //            followed: publisher?.followedByUser,
    //            followedIndirectly: publisher?.followedIndirectly,
    //            liked: isLiked,
    //        }
    //    }))
}