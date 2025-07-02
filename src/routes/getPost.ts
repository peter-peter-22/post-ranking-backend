import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequest } from '../authentication';
import { db } from '../db';
import { posts } from '../db/schema/posts';
import { candidateColumns } from '../posts/common';
import { personalizePosts } from '../posts/hydratePosts';

const router = Router();

const GetPostSchema = z.object({
    id: z.string()
})

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = GetPostSchema.parse(req.params)
    const user = await authRequest(req)
    const [post] = await personalizePosts(getOnePost(id), user)
    res.json({ post })
});

export function getOnePost(id: string) {
    return db
        .select(candidateColumns("Unknown"))
        .from(posts)
        .where(eq(posts.id, id))
        .$dynamic()
}

export default router;