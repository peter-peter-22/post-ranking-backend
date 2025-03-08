import { updateUserEmbeddings } from "./updateUserEmbedding";

/** How much time must pass between 2 runs. */
const interval = 1000 * 60 * 5 // 5 minutes

/** Periodically update the user embeddings.
 ** Development only.
 */
export function startUserEmbeddingCron() {
    console.log("Starting user embedding vector updater.")
    update()
}

async function update() {
    await updateUserEmbeddings().catch(e => {
        console.error("Error while updating user embeddings.", e)
    })
    setTimeout(() => {
        update()
    }, interval);
}