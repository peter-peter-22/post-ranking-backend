import { isNull } from "drizzle-orm";
import { posts } from "../../db/schema/posts";

export const noReplies= isNull(posts.replyingTo)