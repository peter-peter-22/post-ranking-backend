import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequest } from '../authentication';
import { hydratePosts } from '../posts/hydratePosts';

const router = Router();

const GetPostSchema=z.object({
    id: z.string()
})

router.get('/:id', async (req: Request, res: Response) => {
    const {id} = GetPostSchema.parse(req.params)
    const user=await authRequest(req)
    const [post] = await hydratePosts([id],user)
    res.json({post})
});

export default router;