import { PersonalPost } from "./hydratePosts";

/** Apply changes to the fetched posts before sending them to the clients.
 ** Hide the contents of the deleted posts.
  */
export function postProcessPosts(posts: PersonalPost[]) {
    posts.forEach(post => {
        if (post.deleted) {
            post.text = null
            post.media = null
        }
    })
    return posts
}