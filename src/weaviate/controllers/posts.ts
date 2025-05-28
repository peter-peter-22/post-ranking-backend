import { FilterValue } from "weaviate-client";
import { any, z } from "zod";
import { Post } from "../../db/schema/posts";
import { Vector } from "../../embedding/updateUserEmbedding";
import { weaviateClient } from "../connect";
import { postVectorSchema } from "../schemas/posts";

type PostVectorToInsert = {
    properties: {
        text: string,
        createdAt: Date,
        userId: string
    },
    vectors: {
        embedding: Vector
    },
    id: string
}

// Zod schema to validate vector search response.
const postVectorResponseSchema = z.object({
    objects: z.array(z.object({
        uuid: z.string(),
        properties: z.object({
            createdAt: z.date(),
            text: z.string(),
            userId: z.string()
        }),
        vectors: z.any(),
        references: z.any(),
        metadata: z.any()
    }))
})
export const postsCollection = weaviateClient.collections.use(postVectorSchema.name)

export async function insertPostVectors(data: PostVectorToInsert[]) {
    const res = await postsCollection.data.insertMany(data)
    if (res.hasErrors) {
        console.error(res.errors)
        throw new Error("Error inserting to vector db")
    }
    console.log(`Inserted ${data.length} vectors to the ${postsCollection.name} weaviate collection.`)
}

/** Create entries in the vector database based on posts. */
export async function insertVectorsOfPosts(createdPosts: Post[]) {
    // Get the vectors to insert
    const vectorsToInsert: PostVectorToInsert[] = []
    for (const post of createdPosts) {
        if (!post.embeddingText || !post.embedding)
            continue
        vectorsToInsert.push({
            properties: {
                text: post.embeddingText,
                createdAt: post.createdAt,
                userId: post.userId
            },
            vectors: {
                embedding: post.embedding
            },
            id: post.id
        })
    }
    // Insert
    await insertPostVectors(vectorsToInsert);
}

/** Get posts ordered by embedding similarity with filters. */
export async function postVectorSearch(searchVector: Vector, maxCount: number, filters?: FilterValue, maxDistance?: number) {
    const rows = postVectorResponseSchema.parse(
        await postsCollection.query.nearVector(
            searchVector,
            {
                limit: maxCount,
                distance: maxDistance,
                filters,
            }
        )
    )
    const formatted = rows.objects.map(x => ({
        id: x.uuid,
        createdAt: x.properties.createdAt,
        userId: x.properties.userId,
        text: x.properties.text
    }))
    return formatted
}