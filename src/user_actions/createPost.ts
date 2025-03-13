import { db } from "../db";
import { posts, PostToCreate } from "../db/schema/posts";
import { generateEmbeddingVector } from "../embedding";

export async function createPost(data: PostToCreate) {
    // Generate embedding vector
    const embedding = await generateEmbeddingVector(data.text)

    // Find hashtags
    const hashtags=getHashtags(data.text)

    // Insert to db and return
    const [post] = await db
        .insert(posts)
        .values([{
            ...data,
            embedding,
            hashtags
        }])
        .returning()

    return post
}

/** Get the hastags from a text. */
function getHashtags(text:string){
    return [...text.matchAll(/(?<=#)[^#\s]{1,}/gm)].map(el=>el[0])
}

export async function createPosts(data: PostToCreate[]) {
    return await Promise.all(
        data.map(post => createPost(post))
    )
}