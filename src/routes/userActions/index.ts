import { Router } from 'express';

import signUpload from "./requestUploadKey"
import createPost from './createPost';
import feed from "./feed";
import relevantPosts from "./relevantPosts";

const router = Router();

router.use("/signUpload", signUpload)
router.use("/create", createPost)
router.use("/feed", feed)
router.use("/relevantPosts", relevantPosts)

export default router;