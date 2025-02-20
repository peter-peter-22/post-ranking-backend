import { Router } from 'express';
import home from './routes/home';

const router = Router();

router.use("/", home);

export default router;