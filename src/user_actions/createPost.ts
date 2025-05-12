import { db } from "../db";
import { chunkedInsert } from "../db/chunkedInsert";
import { posts, PostToCreate, PostToInsert } from "../db/schema/posts";
import { generateEmbeddingVectors } from "../embedding";

/** Calculate the metadata of posts and insert them into the database. */
export async function createPosts(data: PostToCreate[]) {
    console.log(`Creating ${data.length} posts...`)

    // Generate embedding vector
    const { embeddings, keywords } = await generateEmbeddingVectors(data.map(post => post.text))

    // Find hashtags
    const hashtags = data.map(post => getHashtags(post.text))

    // Create rows to insert from the results
    const postsToInsert: PostToInsert[] = data.map(
        (post, i) => ({
            ...post,
            embedding: embeddings[i],
            keywords: [...new Set([...keywords[i], ...hashtags[i]])], // Add the hashtags and the keywords
        })
    )

    // Insert to db and return
    const createdPosts = (await chunkedInsert(
        postsToInsert,
        async (rows) => (
            await db
                .insert(posts)
                .values(rows)
                .returning()
        )
    )).flat()

    return createdPosts
}

/** Insert replies into the database. */
export async function createReplies(data: PostToCreate[]) {
    console.log(`Creating ${data.length} replies...`)

    // Insert to db and return
    const createdPosts = (await chunkedInsert(
        data,
        async (rows) => (
            await db
                .insert(posts)
                .values(rows)
                .returning()
        )
    )).flat()

    return createdPosts
}

export const hashtagRegex = /(?<=#)[^#\s]{1,}/gm

/** Get the hastags from a text. Return the lowercase words without the hashtags.*/
function getHashtags(text: string) {
    return [...text.matchAll(hashtagRegex)].map(el => el[0].toLowerCase())
}

/** Create a single post. */
export async function createPost(data: PostToCreate) {
    await createPosts([data])
}