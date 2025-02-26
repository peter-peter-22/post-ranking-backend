import { Request, Response, Router } from 'express';
import z from "zod";
import { clearAllTables } from '../../../db/reset/clearTables';
import { seedAll } from '../../../db/seed/all';
import { followScene } from '../../../db/seed/scenes/followed';

const router = Router();

const multiplierSchema = z.object({
    multiplier: z.coerce.number().int().optional()
})

router.get('/follow', async (req: Request, res: Response) => {
    await followScene();
    res.sendStatus(200)
});

router.get("/default", async (req, res) => {
    const { multiplier } = multiplierSchema.parse(req.query)
    await clearAllTables()
    await seedAll(multiplier)
    res.sendStatus(200)
})

export default router;