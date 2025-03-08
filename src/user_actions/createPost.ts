import { db } from "../db";
import { posts, PostToCreate } from "../db/schema/posts";
import { generateEmbeddingVector } from "../embedding";

export async function createPost(data: PostToCreate) {
    //generate embedding vector
    const embedding = await generateEmbeddingVector(data.text)

    //insert to db and return
    const [post] = await db
        .insert(posts)
        .values([{
            ...data,
            embedding
        }])
        .returning()

    return post
}

export async function createPosts(data: PostToCreate[]) {
    return await Promise.all(
        data.map(post => createPost(post))
    )
}