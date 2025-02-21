import { Request, Response, Router } from 'express';
import { db } from '../db';
import { users } from '../db/schema/users';
import { posts } from '../db/schema/posts';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript with Express!');
});

router.get('/users', async (req: Request, res: Response) => {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
});

router.get('/posts', async (req: Request, res: Response) => {
    const allPosts = await db.select().from(posts);
    res.json(allPosts);
});

export default router;