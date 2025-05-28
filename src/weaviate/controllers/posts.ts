import { Vector } from "../../embedding/updateUserEmbedding";
import { weaviateClient } from "../connect";
import { postVectorSchema } from "../schemas/posts";

type PostVectorToInsert = {
    properties: {
        text: string
    },
    vectors: {
        embedding: Vector
    }
}

export type PostVectorInput = {
    postId: string,
    text: string,
    vector: Vector
}

const collection = weaviateClient.collections.use(postVectorSchema.name)

export async function insertPostVectors(data: PostVectorInput[]) {
    // Format data
    const vectorsToInsert:PostVectorToInsert[] = data.map(e => ({
        properties: {
            text: e.text
        },
        vectors: {
            embedding: e.vector
        },
        id:e.postId
    }))
    // Insert
    await collection.data.insertMany(vectorsToInsert)
    console.log(`Inserted ${data.length} vectors to the ${collection.name} weaviate collection.`)
}