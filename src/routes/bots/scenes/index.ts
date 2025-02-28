import { Request, Response, Router } from 'express';
import z from "zod";
import { clearAllTables } from '../../../db/reset/clearTables';
import { seedAll } from '../../../db/seed/all';
import { followOneSimplifiedScene } from '../../../db/seed/scenes/followSimplified';
import { followOneScene } from '../../../db/seed/scenes/followOne';

const router = Router();

const multiplierSchema = z.object({
    multiplier: z.coerce.number().int().optional()
})

router.get('/followOneSimplified', async (req: Request, res: Response) => {
    const { multiplier } = multiplierSchema.parse(req.query)
    await followOneSimplifiedScene(multiplier);
    res.sendStatus(200)
});

router.get("/default", async (req, res) => {
    const { multiplier } = multiplierSchema.parse(req.query)
    await clearAllTables()
    await seedAll(multiplier)
    res.sendStatus(200)
})

router.get("/followOne", async (req, res) => {
    const { multiplier } = multiplierSchema.parse(req.query)
    await followOneScene(multiplier)
    res.sendStatus(200)
})

export default router;