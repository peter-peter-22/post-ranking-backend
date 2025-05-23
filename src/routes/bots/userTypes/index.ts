import { Request, Response, Router } from 'express';
import { mainUserTypeNew } from '../../../db/seed/scenes/new';
import { testCommentRanker } from '../../../db/seed/scenes/commentRanking';

const router = Router();

router.get('/new', async (req: Request, res: Response) => {
    await mainUserTypeNew()
    console.log("Test started: new user")
    res.sendStatus(200)
});

router.get('/followsOne', async (req: Request, res: Response) => {
    //await mainUserTypeFollowOne()
    res.sendStatus(200)
});

router.get('/interactTopic', async (req: Request, res: Response) => {
    //await mainUserTypeInteractTopic()
    res.sendStatus(200)
});

router.get('/commentRanking', async (req: Request, res: Response) => {
    const id=await testCommentRanker()
    console.log("Test started: comment ranking")
    res.json({id})
});

export default router;