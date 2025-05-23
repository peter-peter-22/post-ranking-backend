import { eq } from "drizzle-orm"
import { posts } from "../db/schema/posts"

/** Filter out pending posts. */
export const noPending=()=>{
    return eq(posts.pending,false)
}

export const globalFilters = () => [
    noPending()
]