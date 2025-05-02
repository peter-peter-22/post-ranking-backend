import { Engagement } from "../../../../bots/getEngagements";
import { averageVector, maxUserEmbeddingHistory, Vector } from "../../../../embedding/updateUserEmbedding";
import { UserEmbeddingSnapshotToInsert } from "../../../schema/userEmbeddingSnapshots";

/** Create functions to manage the embedding vectors of the users in the memory.
 * @returns Functions to get and update user embedding vectors.
 */
export function userEmbeddingVectorHandler() {
    const vectors: Map<string, Vector[]> = new Map()

    /** Add engagements to the user embedding tracker.
     * @param engagements The engagements to add.
     */
    const apply = (engagements: Engagement[]) => {
        for (const engagement of engagements) {
            // Get the vector list of the user
            const userVectors = getOrCreate(engagement.user.id)
            // If the engaged post is a reply, skip 
            if (engagement.post.replyingTo || !engagement.post.embedding)
                continue
            // Append the new vector
            userVectors.push(engagement.post.embedding)
            // Limit the length of the vector list. The real user vector calculation also limits it.
            if (userVectors.length > maxUserEmbeddingHistory)
                userVectors.splice(0, userVectors.length - maxUserEmbeddingHistory)
        }
    }

    /** Get the average vector of the provided user. 
     * @param user The user id.
     * @returns The average vector of the user.
    */
    const getAverage = (user: string) => {
        return averageVector(getOrCreate(user))
    }

    /** Get all users and their average vectors. */
    const getAllAverages = (date: Date): UserEmbeddingSnapshotToInsert[] => {
        const results:UserEmbeddingSnapshotToInsert[] = []
        Array.from(vectors.keys()).forEach((userId) => {
            const vector = getAverage(userId)
            // Filter out empty vectors
            if (!vector) return
            results.push({
                userId,
                embedding: vector,
                createdAt: date
            })
        });
        return results
    }

    /** Get or create the engaged vector list of a user.
     * @param userId The user id to get the vector list of.
     * @returns The vector list of the user.
     */
    const getOrCreate = (userId: string) => {
        // Try to get
        const myVectors = vectors.get(userId)
        if (myVectors)
            return myVectors
        // If doent't exist create
        const newVector: Vector[] = []
        vectors.set(userId, newVector)
        return newVector
    }

    return {
        getAllAverages,
        apply
    }
}