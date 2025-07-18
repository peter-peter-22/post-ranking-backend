import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { db } from '../../../db';
import { createMentionNotifications, createReplyNotification } from '../../../db/controllers/notifications/createNotification';
import { notificationList } from '../../../db/controllers/notifications/read';
import { follows } from '../../../db/schema/follows';
import { likes } from '../../../db/schema/likes';
import { notifications } from '../../../db/schema/notifications';
import { posts } from '../../../db/schema/posts';
import { users } from '../../../db/schema/users';
import { BasicFeedSchema } from '../../../posts/common';
import { follow } from '../../../userActions/follow';
import { createReplies } from '../../../userActions/posts/createPost';
import { likePost } from '../../../userActions/posts/like';

const router = Router();

const NotificationSchema = BasicFeedSchema.extend({
    lastChecked: z.coerce.date().optional()
})

router.post('/', async (req: Request, res: Response) => {

    // Get params
    const { offset } = NotificationSchema.parse(req.body)
    // Get user
    const viewer = await authRequestStrict(req)

    const [post] = await db.select().from(posts).where(eq(posts.userId, viewer.id)).limit(1)
    await db.delete(notifications)
    await db.delete(posts).where(eq(posts.replyingTo, post.id))
    await db.delete(likes).where(eq(likes.postId, post.id))
    await db.delete(follows).where(eq(follows.followedId, viewer.id))
    const actors = await db.select().from(users).limit(10)
    for (const user of actors) {
        await likePost(post.id, user.id, true)
        await follow(user.id, viewer.id)
    }
    const replies = await createReplies(actors.map(user => ({
        userId: user.id,
        text: "reply text @main_user",
        replyingTo: post.id
    })))
    for (const reply of replies) {
        if (reply.repliedUser && reply.replyingTo)
            await createReplyNotification(reply.repliedUser, reply.replyingTo)
        await createMentionNotifications(reply.mentions, reply.id)
    }

    // Get notifications
    const data = await notificationList(viewer.id, offset, new Date(0))
    res.json({ notifications: data })
});

export default router;