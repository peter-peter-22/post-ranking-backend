import { Router } from 'express';
import { protectedMiddleware } from '../authentication';

//routers

import bot from "./bots";
import reset from "./development/reset";
import home from './home';
import register from "./register";
import update from "./update";
import userActions from "./userActions/index";

//unauthenticated routes

const router = Router();

router.use(home);
router.use("/reset", reset);
router.use("/register", register);
router.use("/bots", bot);
router.use("/update", update);

//protected routes

const authenticatedRouter = Router();
authenticatedRouter.use(protectedMiddleware)

authenticatedRouter.use("/userActions", userActions);

//connect the authenticatin router to the base
router.use(authenticatedRouter)

export default router;