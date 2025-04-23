import { db } from "../db";
import { posts, PostToCreate, PostToInsert } from "../db/schema/posts";
import { generateEmbeddingVectors } from "../embedding";

export async function createPosts(data: PostToCreate[]) {
    console.log(`Creating ${data.length} posts...`)

    // Generate embedding vector
    const embeddings = await generateEmbeddingVectors(data.map(post=>post.text))

    // Find hashtags
    const hashtags = data.map(post=>getHashtags(post.text))

    // Merge the result
    const postsToInsert:PostToInsert[]=data.map(
        (post,i)=>({
            ...post,
            embedding:embeddings[i],
            hashtags:hashtags[i]
        })
    )

    // Insert to db and return
    const createdPosts = await db
        .insert(posts)
        .values(postsToInsert)
        .returning()

    return createdPosts
}

export const hashtagRegex = /(?<=#)[^#\s]{1,}/gm

/** Get the hastags from a text. */
function getHashtags(text: string) {
    return [...text.matchAll(hashtagRegex)].map(el => el[0])
}

export async function createPost(data: PostToCreate) {
    await createPosts([data])
}