import { and, desc, ilike, lte, or } from "drizzle-orm"
import { db } from "../../.."
import { usersPerRequest } from "../../../../redis/userFeeds/common"
import { User, users } from "../../../schema/users"
import { getUserColumns } from "../getUser"

export type FollowerCountPageParams = {
    followerCount: number,
    lastId: string
}

export type SearchUsersPageParams = {
    name: FollowerCountPageParams,
    handle: FollowerCountPageParams
}

export async function userSearch({
    user,
    pageParams,
    offset,
    text
}: {
    user: User,
    pageParams?: FollowerCountPageParams,
    offset: number,
    text?: string
}) {
    if (offset !== 0 && !pageParams) return

    // Query
    const q = db
        .select(getUserColumns(user?.id))
        .from(users)
        .where(
            and(
                pageParams ? and(
                    lte(users.followerCount, pageParams?.followerCount),
                    lte(users.id, pageParams?.lastId)
                ) : undefined,
                ilike(users.fullName, `%${text}%`),
            )
        )
        .orderBy(desc(users.followerCount), desc(users.id))
        .limit(usersPerRequest)

    const info = q.toSQL()
    console.log(info)
    const explain = await db.$client.query(`EXPLAIN ${info.sql}`, info.params)
    console.log(explain)

    //Fetch
    const fetchedUsers = await q

    // Exit if no users
    if (fetchedUsers.length === 0) return

    // Get next page params
    const lastUser = fetchedUsers[fetchedUsers.length - 1]
    const nextPageParams: FollowerCountPageParams | undefined = {
        followerCount: lastUser.followerCount,
        lastId: lastUser.id
    }

    // Return the ranked posts and the page params
    return { data: fetchedUsers, pageParams: nextPageParams }
}