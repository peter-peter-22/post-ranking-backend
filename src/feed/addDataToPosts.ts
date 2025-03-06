import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import { db } from "../db";
import { Post } from "../db/schema/posts";
import { User, users } from "../db/schema/users";
import { removeDuplicates } from "../utilities/removeDuplicates";
import { likes } from "../db/schema/likes";

/** Post with the user object and additional metadata. */
type FullPost = Post & {
    isLiked?: boolean,
    user?: FullUser
}

/** User with additional viewer-specific data. */
type FullUser = User & {
    isFollowed: boolean
}

/** Add metadata to the posts. */
export async function addDataToPosts({ posts, user, followedUsers }: { posts: Post[], user: User, followedUsers: string[] }) {
    const [uniqueUsers, likedPostIds] = await Promise.all([
        getUsers({ posts, user, followedUsers }),
        getIfUserLikedPosts({ posts, user })
    ])
    const postsWithLikes = addLikesToPosts({ posts, likedPostIds: likedPostIds })
    const postsWithUsers = addUsersToPosts({ posts: postsWithLikes, users: uniqueUsers })
    return postsWithUsers;
}

/** Return the uniqe users and their viewer-specific metadata. */
async function getUsers({ posts, user, followedUsers }: { posts: Post[], user: User, followedUsers: string[] }) {
    // Get the user ids from the posts
    const userIds = posts.map(post => post.userId);

    // Filter out duplicates
    const uniqueUserIds = removeDuplicates(userIds);

    // Select the users those belong to the ids
    const uniqueUsers = await db
        .select({
            ...getTableColumns(users),
        })
        .from(users)
        .where(inArray(users.id, uniqueUserIds))

    // Set the followed status of the users
    const uniqueUsersWithFollows: FullUser[] = uniqueUsers.map(user => ({
        ...user,
        isFollowed: !!followedUsers.find(userId => userId === user.id)
    }))

    return uniqueUsersWithFollows;
}

/** Add the users to the posts where they belong. */
function addUsersToPosts({ posts, users }: { posts: FullPost[], users: FullUser[] }): FullPost[] {
    return posts.map(post => ({
        ...post,
        user: users.find(user => user.id === post.userId)
    }))
}

/** Returns the array of post ids those were liked by the user from the provided posts. */
async function getIfUserLikedPosts({ user, posts }: { user: User, posts: Post[] }) {
    const postIds = posts.map(post => post.id)
    return (
        await db
            .select()
            .from(likes)
            .where(and(
                eq(likes.userId, user.id),
                inArray(likes.postId, postIds)
            ))
    ).map(like => like.postId)
}

/** Add the isLiked field to the posts based on the provided array of liked post ids. 
 * @param likedPostIds Liked post ids.
 * @param posts The posts to process.
 * @returns Posts with the isLiked field. 
*/
function addLikesToPosts({ posts, likedPostIds }: { posts: FullPost[], likedPostIds: string[] }): FullPost[] {
    return posts.map(post => ({
        ...post,
        isLiked: !!likedPostIds.find(likedId => likedId = post.id)
    }))
}