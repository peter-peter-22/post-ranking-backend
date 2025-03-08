import { gte, isNull, lte, or } from "drizzle-orm";
import { posts } from "../../db/schema/posts";

/** Filter out replies. */
export const isPost = isNull(posts.replyingTo)

/** Filter out te posts those have a significant amount of views, but no engagement. */
export const minimalEngagement = or(gte(posts.engagementScore, 10), lte(posts.viewCount, 20));

/** @todo filter out more than 2 posts from the same user */