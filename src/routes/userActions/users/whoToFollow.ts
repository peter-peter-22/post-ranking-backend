import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../../authentication';
import { getWhoToFollow } from '../../../db/controllers/users/whoToFollow';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    // Authenticate
    const user = await authRequestStrict(req);
    // Get the top engaged unfollowed users
    const topUsers = await getWhoToFollow(user)
    // Return the users
    res.json({ users: topUsers })
});

export default router;