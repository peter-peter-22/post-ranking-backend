import { Request, Response, Router } from 'express';
import { getUser } from '../authentication';
import { getCandidates } from '../feed/candidates';
import { getFollowedUsers } from '../db/controllers/users/getFollowers';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const followedUsers = await getFollowedUsers({ user })

    const posts = await getCandidates({ user, followedUsers })
    res.json(posts)
});

export default router;