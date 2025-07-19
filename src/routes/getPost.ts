import { DrizzleError, eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequest } from '../authentication';
import { db } from '../db';
import { posts } from '../db/schema/posts';
import { candidateColumns } from '../posts/common';
import { personalizePosts } from '../posts/hydratePosts';
import { postProcessPosts } from '../posts/postProcessPosts';
import { DatabaseError } from 'pg';
import { HttpError } from '../middlewares/errorHandler';

const router = Router();

const GetPostSchema = z.object({
    id: z.string()
})

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = GetPostSchema.parse(req.params)
    const user = await authRequest(req)
    try {
        const [post] = await postProcessPosts(await (personalizePosts(getOnePost(id), user)))
        if (!post) throw new HttpError(404, 'Post not found')
        res.json({ post })
    }
    catch (e) {
        console.log(typeof (e))
        if (e instanceof DatabaseError && e.routine === "MakeParseError")
            throw new HttpError(422, "Invalid post ID")
        throw e
    }
});

export function getOnePost(id: string) {
    return db
        .select(candidateColumns("Unknown"))
        .from(posts)
        .where(eq(posts.id, id))
        .$dynamic()
}

export default router;