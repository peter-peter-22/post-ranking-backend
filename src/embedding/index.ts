import axios from "axios";

/** Send a request to the embedding vector generator server.
 * @param text The text to convert.
 * @returns Embedding vector.
 */
export async function generateEmbeddingVector(text: string) {
    try{
        const res = await axios.post(`${process.env.EMBEDDING_VECTOR_API_URL!}/embedding`, { text })
        return res.data.embedding
    }
    catch(err){
        throw new Error(`Failed to generate embedding vector. Error: "${err instanceof Error?err.message:err}"`)
    }
}