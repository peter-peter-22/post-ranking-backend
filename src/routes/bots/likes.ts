import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { getUser } from '../../authentication';
import { likeUser } from '../../bots/likes';
import { db } from '../../db';
import { users } from '../../db/schema/users';

const router = Router();

const likeUserParamsSchema = z.object({
    handle: z.string()
})

const likeUserQuerySchema = z.object({
    coverage: z.number().optional()
})

router.get('/likeUser/:handle', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user) return;

    //validate inputs
    const { handle } = likeUserParamsSchema.parse(req.params)
    const { coverage } = likeUserQuerySchema.parse(req.query)

    //select the user that will be liked based on the handle
    const liked = (await db.select().from(users).where(eq(users.handle, handle)))[0]

    //check if exists
    if (!liked)
        throw new Error(`The liked user "${handle}" is not in the database`)

    //insert the likes
    await likeUser({ liker: user, liked, coverage })
    res.sendStatus(200)
});

export default router;