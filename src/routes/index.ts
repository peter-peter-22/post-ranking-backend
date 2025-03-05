import { Router } from 'express';
import { protectedMiddleware } from '../authentication';

//routers

import home from './home';
import seed from "./seed";
import register from "./register";
import feed from "./feed";
import reset from "./reset";
import bot from "./bots";
import candidates from "./candidates";

//unauthenticated routes

const router = Router();

router.use(home);
router.use("/seed", seed);
router.use("/reset", reset);
router.use(register);
router.use("/bots", bot);
router.use("/candidates", candidates);

//protected routes

const authenticatedRouter = Router();
authenticatedRouter.use(protectedMiddleware)

authenticatedRouter.use("/feed", feed);

//connect the authenticatin router to the base
router.use(authenticatedRouter)

export default router;