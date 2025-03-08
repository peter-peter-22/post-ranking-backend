import { eq, inArray, isNull } from "drizzle-orm";
import { db } from "../..";
import { clearMainUser } from "../../reset/clearMainUser";
import { Post, posts } from "../../schema/posts";
import { createFollowedUser } from "../followedUser";
import { seedLikes } from "../likes";
import { createRandomPost } from "../posts";
import { createPostsBetweenDates, getTimeIntervalOfPosts } from "../postsBetweenDates";
import { getAllBots } from "../utils";
import { seedViews } from "../views";
import { seedFollows } from "../follows";
import { seedReplies } from "../comments";
import { User, users } from "../../schema/users";
import { updateUserEmbeddingVector } from "../../controllers/users/updateUserEmbedding";

//** The main user follows one active usert. */
export async function mainUserTypeFollowOne() {
    const mainUser = await clearMainUser()
    const followedUser = await createFollowedUser(mainUser)

    //create the posts of the followed user
    const interval = await getTimeIntervalOfPosts()
    const createdPosts = await createPostsBetweenDates({ from: interval.oldest, to: interval.newest, count: 5, user: followedUser, createPost: createRandomPost })

    //add reactions to the posts
    const allBots = await getAllBots()
    const allPosts = await db.select().from(posts).where(isNull(posts.replyingTo))
    const postIds = createdPosts.map(post => post.id)
    await Promise.all([
        seedLikes({ posts: createdPosts, users: allBots }),
        seedViews({ postFilter: inArray(posts.id, postIds) }),
        seedFollows({ from: allBots, to: [followedUser] }),
        seedReplies({ posts: createdPosts, users: allBots }),
        updateUserEmbeddingVector(mainUser)
    ])
    await generateUserActivity({ user: followedUser, allPosts, allBots })

    console.log("Main user type set to \"follow one\"")
}

/** Generate starting activity for a user. */
async function generateUserActivity({ user, allPosts, allBots }: { user: User, allPosts: Post[], allBots: User[] }) {
    await Promise.all([
        seedLikes({ posts: allPosts, users: [user] }),
        seedViews({ userFilter: eq(users.id, user.id) }),
        seedFollows({ from: [user], to: allBots }),
        seedReplies({ posts: allPosts, users: [user] })
    ])
}