import { gt, isNull } from "drizzle-orm";
import { posts } from "../../db/schema/posts";

export const isPost = isNull(posts.replyingTo)

export const minimalEngagement = gt(posts.likeCount, 2);