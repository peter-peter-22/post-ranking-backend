import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authUser } from '../authentication';
import { db } from '../db';
import { users } from '../db/schema/users';

const router = Router();

export const authSchema = z.object({
    handle: z
        .string()
        .regex(/^[a-z0-9_]+$/, {
            message: "Only letters, numbers, and underscores are allowed"
        })
        .max(50)
})

router.post('/', async (req: Request, res: Response) => {
    const data = authSchema.parse(req.body)
    // Try to login
    let user = await authUser(data.handle)
    // If the user doesn't exists, register
    if (!user) {
        user = (
            await db
                .insert(users)
                .values([{
                    handle: data.handle,
                    name: data.handle,
                }])
                .returning()
        )[0]
    }
    // Return the user
    res.json({ user });
});

export default router;