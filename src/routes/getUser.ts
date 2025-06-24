import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequest } from '../authentication';
import { personalizePosts } from '../posts/hydratePosts';
import { db } from '../db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { HttpError } from '../middlewares/errorHandler';
import { getUserColumns } from '../db/controllers/users/getUser';

const router = Router();

const GetUserSchema = z.object({
    handle: z.string()
})

router.get('/:handle', async (req: Request, res: Response) => {
    const { handle } = GetUserSchema.parse(req.params)
    const authUser = await authRequest(req)
    const [user] = await db
        .select(getUserColumns(authUser?.id))
        .from(users)
        .where(eq(users.handle, handle))
    if (!user) throw new HttpError(404, "User not found")
    res.json({ user })
});

export default router;