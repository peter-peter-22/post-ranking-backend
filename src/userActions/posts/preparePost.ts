import { inArray } from "drizzle-orm";
import emojiRegex from "emoji-regex";
import { db } from "../../db";
import { generateEmbeddingVectors } from "../../db/controllers/embedding";
import { posts, PostToInsert } from "../../db/schema/posts";
import { HttpError } from "../../middlewares/errorHandler";
import { normalizeVector } from "../../utilities/arrays/normalize";

/** Calculate the metadata of posts before insert. */
export async function preparePosts(data: PostToInsert[]) {
    console.log(`Preparing ${data.length} posts...`)

    // Format embedding texts and get hashtags
    const textsHashtags = data.map(getEmbeddingTextAndHashtasgs)
    const embeddingTexts = textsHashtags.map((text) => text.embeddingText)
    const hashtags = textsHashtags.map((text) => text.hashtags)

    // Generate embedding vectors for texts
    const { embeddings, keywords } = await generateEmbeddingVectors(embeddingTexts)

    // Create rows to insert from the results
    const postsToInsert: PostToInsert[] = data.map(
        (post, i) => ({
            ...post,
            embedding: embeddingTexts[i] ? embeddings[i] : null, // Add the embedding vector only if there is an embedding text
            embeddingNormalized: embeddingTexts[i] ? normalizeVector(embeddings[i]) : null,
            keywords: [...new Set([...keywords[i], ...hashtags[i]])], // Add the hashtags and the keywords
            embeddingText: embeddingTexts[i] // The embedding text is added only for debugging purposes
        })
    )
    return postsToInsert
}

/** Calculate the metadata of replies before insert. */
export async function prepareReplies(data: PostToInsert[]) {
    console.log(`Preparing ${data.length} replies...`)
    await addRepliedUser(data)
    return data
}

async function addRepliedUser(data: PostToInsert[]) {
    const repliedPosts = await db
        .select({ userId: posts.userId, id: posts.id })
        .from(posts)
        .where(inArray(posts.id, data.map(p => {
            if (!p.replyingTo) throw new HttpError(400, "Invalid reply")
            return p.replyingTo
        })))
    data.forEach(reply => {
        const myPost = repliedPosts.find(p => p.id === reply.replyingTo)
        reply.repliedUser = myPost?.userId
    })
}

/** Calculate the medadata of a post or a reply before insert. */
export async function prepareAnyPost(data: PostToInsert) {
    const [postToInsert] = data.replyingTo ?
        await prepareReplies([data])
        :
        await preparePosts([data])
    return postToInsert
}

export const hashtagRegex = /#[^#\s]+/gm
const urlRegex = /(https|http):\/\/\S+/gm

/** Remove hashtags from the text, add them to the hashtag list */
function getEmbeddingTextAndHashtasgs(post: PostToInsert) {
    /** The hashtags in the text */
    let hashtags: string[] = []
    /** The text that will be used to gerenrate the embedding vector */
    let embeddingText = post.text || ""
    // Remove hashtags from the post text, add them to an array
    if (post.text)
        embeddingText = post.text.replace(hashtagRegex, (hashtag) => {
            const hashtagText = hashtag.toLowerCase().slice(1)
            hashtags.push(hashtagText.replace("_", " "))// Replace _ with space to use the same format as the keyword detector
            return hashtagText + "."
        })
    // Remove urls from the post text
    embeddingText = embeddingText?.replace(urlRegex, "")
    // Remove emojis
    embeddingText = embeddingText?.replace(emojiRegex(), "")
    // Extract text from the media files and add them to the embedding text
    if (post.media)
        for (const file of post.media)
            if (file.description)
                embeddingText += "\n" + file.description
    // Trim text
    embeddingText = embeddingText.trim()
    return { embeddingText, hashtags }
}