import { Router } from 'express';
import { protectedMiddleware } from '../authentication';

//routers

import home from './home';
import seed from "./seed";
import register from "./register";
import feed from "./feed";
import reset from "./reset";

//unauthenticated routes

const router = Router();

router.use(home);
router.use("/seed", seed);
router.use("/reset", reset);
router.use(register);

//protected routes

const authenticatedRouter = Router();
authenticatedRouter.use(protectedMiddleware)

authenticatedRouter.use(feed);

//connect the authenticatin router to the base
router.use(authenticatedRouter)

export default router;