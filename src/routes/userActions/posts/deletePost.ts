import { and, eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { db } from '../../../db';
import { posts } from '../../../db/schema/posts';
import { HttpError } from '../../../middlewares/errorHandler';

const router = Router();

const DeletePostSchema = z.object({
    id: z.string()
})

router.post('/', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Get the values of the post
    const { id } = DeletePostSchema.parse(req.body);
    // Update the deleted state of the post
    const [deleted] = await db
        .update(posts)
        .set({ deleted: true })
        .where(and(
            eq(posts.id, id),
            eq(posts.userId, user.id)
        ))
        .returning()
    // Check what was changed
    if (!deleted) throw new HttpError(400, "This post does not exists or it is not your post.")
    // OK
    console.log(`Deleted post ${id}`)
    res.sendStatus(200)
});

export default router;