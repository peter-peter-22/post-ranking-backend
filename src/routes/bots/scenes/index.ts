import { Router } from 'express';
import z from "zod";
import { seedBasics } from '../../../db/seed/scenes/seedBasics';
import { seedEngagements } from '../../../db/seed/scenes/seedEngagements';

const router = Router();

const multiplierSchema = z.object({
    multiplier: z.coerce.number().optional()
})

router.get("/basics", async (req, res) => {
    const { multiplier } = multiplierSchema.parse(req.query)
    await seedBasics(multiplier)
    res.sendStatus(200)
})

router.get("/engagements", async (req, res) => {
    const { multiplier } = multiplierSchema.parse(req.query)
    await seedEngagements(multiplier)
    res.sendStatus(200)
})

export default router;