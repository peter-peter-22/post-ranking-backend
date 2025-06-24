import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { getReplies } from '../../../posts/comments/getReplies';
import { authRequestStrict } from '../../../authentication';
import { BasicFeedSchema } from '../../../posts/common';

const router = Router();

const CommentSectionUrlSchema = z.object({
    postId: z.string(),
})

router.post('/:postId', async (req: Request, res: Response) => {
    // Get params
    const { postId } = CommentSectionUrlSchema.parse(req.params)
    const {  } = BasicFeedSchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await getReplies(postId, user);
    res.json({ posts })
});

export default router;