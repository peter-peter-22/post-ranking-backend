import { db } from "../db";
import { chunkedInsert } from "../db/chunkedInsert";
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
    const createdPosts = (await chunkedInsert(
        postsToInsert,
        async (rows)=>(
            await db
            .insert(posts)
            .values(rows)
            .returning()
        )
    )).flat()

    return createdPosts
}

export async function createReplies(data: PostToCreate[]) {
    console.log(`Creating ${data.length} replies...`)

    // Find hashtags
    const hashtags = data.map(post=>getHashtags(post.text))

    // Merge the result
    const postsToInsert:PostToInsert[]=data.map(
        (post,i)=>({
            ...post,
            hashtags:hashtags[i]
        })
    )

    // Insert to db and return
    const createdPosts = (await chunkedInsert(
        postsToInsert,
        async (rows)=>(
            await db
            .insert(posts)
            .values(rows)
            .returning()
        )
    )).flat()

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