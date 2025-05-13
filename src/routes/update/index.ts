import { Request, Response, Router } from 'express';
import { updateUserClusters } from '../../clusters/updateClusters';
import { updateTrendsList } from '../../trends/calculateTrends';
import { updateAllEngagementHistory } from '../../db/controllers/posts/engagement/history/updateAll';
import '../../trends/updateTrendTracker'

const router = Router();

router.get('/userClusters', async (req: Request, res: Response) => {
    await updateUserClusters()
    res.sendStatus(200)
});

router.get('/trends', async (req: Request, res: Response) => {
    await updateTrendsList()
    res.sendStatus(200)
});

router.get('/engagementHistory', async (req: Request, res: Response) => {
    await updateAllEngagementHistory()
    res.sendStatus(200)
});

router.get('/trendTracker', async (req: Request, res: Response) => {
    res.sendStatus(200)
});

export default router;