import { asc, desc, sql } from "drizzle-orm"
import { db } from "../.."
import { follow } from "../../../user_actions/follow"
import { posts, PostToInsert } from "../../schema/posts"
import { User, users } from "../../schema/users"
import { seedPosts } from "../posts"
import { seedMainUser, seedUsers } from "../users"
import { uuid } from "drizzle-orm/pg-core"
import { clearAllTables } from "../../reset/clearTables"

/**
 * In this scene, the main user follows a specified user.
 ** The posts of the followed user will get higher rank on the feed.
 ** Other ranking factors are minimized.
 * @param multiplier multiplies the count of all generated rows.
 */
export async function followScene(multiplier: number = 1) {
    await clearAllTables()
    const mainUser = await seedMainUser()
    await seedUsers(1000 * multiplier)
    await seedPosts(50 * multiplier)
    await createFollowedUser(mainUser)
    console.log("Seeded all tables")
}

/**
 * Create the followed user
 ** Make the main user follow it
 ** Insert it's posts
 */
async function createFollowedUser(mainUser: User) {
    //insert the followed user into the database
    const [followedUser] = await db.insert(users)
        .values({
            handle: "followed",
            name: "Followed",
        })
        .returning()

    //make the main user follow this user
    await follow(mainUser.id, followedUser.id)

    //get the date range of the created posts
    const [[newest], [oldest]] = await Promise.all([
        db.select().from(posts).orderBy(desc(posts.createdAt)).limit(1),
        db.select().from(posts).orderBy(asc(posts.createdAt)).limit(1)
    ])

    //create the posts of the followed user
    const postCount = 5;
    /**Dates from the creation of the oldest post to the creation of the newest post */
    const postDates = Array.from({length:5}).map((_, i) => {
        const t = i / (postCount - 1);
        return newest.createdAt.getTime() + (oldest.createdAt.getTime() - newest.createdAt.getTime()) * t
    })

    /**The posts created by the followed user */
    const postsToInsert: PostToInsert[] = postDates.map(date => ({
        userId: followedUser.id,
        text: "Post of then followed user",
        createdAt: new Date(date)
    }))

    await db.insert(posts).values(postsToInsert)
}