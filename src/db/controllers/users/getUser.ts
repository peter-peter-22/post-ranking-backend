import { and, eq, exists, getTableColumns, sql } from "drizzle-orm";
import { db } from "../..";
import { users } from "../../schema/users";
import { follows } from "../../schema/follows";

const { embedding, embeddingNormalized, ...userColumns } = getTableColumns(users)

/** The columns of the users those will be displayed in the client. */
export function getUserColumns(viewerId?: string) {
    // Followed by viewer
    const isFollowedSq = (viewerId ? (
        exists(db
            .select()
            .from(follows)
            .where(and(
                eq(follows.followerId, viewerId),
                eq(follows.followedId, users.id)
            )))
    ) : (
        sql<boolean>`false::boolean`
    )).as<boolean>("followed_by_viewer")

    return ({
        ...userColumns,
        followed: isFollowedSq
    })
}

const exampleUserQuery=db.select(getUserColumns()).from(users)

export type PersonalUser=Awaited<typeof exampleUserQuery>[number]