import { and, desc, eq, notExists } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../../authentication';
import { db } from '../../../db';
import { getUserColumns } from '../../../db/controllers/users/getUser';
import { engagementHistory } from '../../../db/schema/engagementHistory';
import { follows } from '../../../db/schema/follows';
import { users } from '../../../db/schema/users';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    // Authenticate
    const user = await authRequestStrict(req);
    // Get the top engaged unfollowed users
    const topUsers=await db
        .select(getUserColumns(user.id))
        .from(engagementHistory)
        .where(and(
            eq(engagementHistory.viewerId, user.id),
            notExists(
                db
                    .select()
                    .from(follows)
                    .where(and(
                        eq(follows.followerId, engagementHistory.viewerId),
                        eq(follows.followedId, engagementHistory.publisherId)
                    ))
            )
        ))
        .orderBy(desc(engagementHistory.likes))
        .innerJoin(users, eq(users.id, engagementHistory.publisherId))
        .limit(3)
    // Return the users
    res.json({users:topUsers})
});

export default router;