import { Request, Response, Router } from 'express';
import { updateUserClusters } from '../../clusters/updateClusters';
import { updateAllEngagementHistory } from '../../db/controllers/posts/engagement/history/updateAll';
import { updateTrends } from '../../trends/calculateTrends';
import { updateClusterTrends } from '../../trends/updateClusterTrends';

const router = Router();

router.get('/userClusters', async (req: Request, res: Response) => {
    await updateUserClusters()
    res.sendStatus(200)
});

router.get('/trends', async (req: Request, res: Response) => {
    await updateTrends()
    res.sendStatus(200)
});

router.get('/engagementHistory', async (req: Request, res: Response) => {
    await updateAllEngagementHistory()
    res.sendStatus(200)
});

router.get('/clusterTrends', async (req: Request, res: Response) => {
    await updateClusterTrends()
    res.sendStatus(200)
});

export default router;