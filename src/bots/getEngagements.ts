import { EngagementHistory } from "../db/schema/engagementHistory"
import { Post } from "../db/schema/posts"
import { User, UserCommon } from "../db/schema/users"

export type ViewerPublisherRelationship = {
    followed: boolean,
    engagementHistory?:EngagementHistory
}

export type Engagement = {
    post: Post,
    user: UserCommon,
    like: boolean,
    reply: boolean,
    click: boolean,
    date: Date,
}

/** Get the organic engagement chances between a user and a post.*/
export function getEngagementChances(user: User, post: Post, relationship: ViewerPublisherRelationship) {
    return { like: 1, reply: 1, click: 1, } // TODO: Add the logic to calculate the engagement chances.
}

/** Create engagements for post user pairs. */
export function getEngagements(user: User, post: Post, relationship: ViewerPublisherRelationship, date:Date): Engagement {
    const { like, reply, click } = getEngagementChances(user, post, relationship)
    return {
        like: Math.random() < like,
        reply: Math.random() < reply,
        click: Math.random() < click,
        post: post,
        user: user,
        date,
    }
}
