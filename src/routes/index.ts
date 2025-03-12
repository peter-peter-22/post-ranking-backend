import { Router } from 'express';
import { protectedMiddleware } from '../authentication';

//routers

import bot from "./bots";
import candidates from "./development/candidates";
import reset from "./development/reset";
import feed from "./feed";
import home from './home';
import register from "./register";
import update from "./update";

//unauthenticated routes

const router = Router();

router.use(home);
router.use("/reset", reset);
router.use(register);
router.use("/bots", bot);
router.use("/candidates", candidates);
router.use("/update", update);

//protected routes

const authenticatedRouter = Router();
authenticatedRouter.use(protectedMiddleware)

authenticatedRouter.use("/feed", feed);

//connect the authenticatin router to the base
router.use(authenticatedRouter)

export default router;