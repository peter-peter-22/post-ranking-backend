import { Router } from 'express';
import home from './routes/home';
import seed from "./routes/seed";

const router = Router();

router.use("/", home);
router.use("/seed", seed);

export default router;