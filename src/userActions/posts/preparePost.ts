import { PostToInsert } from "../../db/schema/posts";
import { generateEmbeddingVectors } from "../../embedding";

/** Calculate the metadata of posts before insert. */
export async function preparePosts(data: PostToInsert[]) {
    console.log(`Preparing ${data.length} posts...`)

    // Find hashtags
    const hashtags = data.map(post => post.text ? getHashtags(post.text) : [])

    // Generate embedding vector
    const { embeddings, keywords } = await generateEmbeddingVectors(data.map(getEmbeddingText))//TODO merge with hashtag getter

    // Create rows to insert from the results
    const postsToInsert: PostToInsert[] = data.map(
        (post, i) => ({
            ...post,
            embedding: embeddings[i],
            keywords: [...new Set([...keywords[i], ...hashtags[i]])], // Add the hashtags and the keywords
        })
    )

    return postsToInsert
}

/** Calculate the metadata of replies before insert. */
export async function prepareReplies(data: PostToInsert[]) {
    console.log(`Preparing ${data.length} replies...`)

    return data
}

export const hashtagRegex = /(?<=#)[^#\s]{1,}/gm

/** Get the hastags from a text. Return the lowercase words without the hashtags.*/
function getHashtags(text: string) {
    return [...text.matchAll(hashtagRegex)].map(el => el[0].toLowerCase())
}

/** Get the texz that will be used for the embedding vector */
function getEmbeddingText(post:PostToInsert){
    return post.text||""
}