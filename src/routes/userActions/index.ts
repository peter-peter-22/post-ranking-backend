import { Router } from 'express';

import signUpload from "./posts/requestUploadKey"
import createPost from './posts/createPost';
import feed from "./posts/feed";
import hydratePosts from "./posts/hydratePosts";
import relevantPosts from "./posts/relevantPosts";
import commentSection from "./posts/commentSection";
import contentsOfuser from "./posts/getContentsOfUser";
import follow from "./users/follow";
import whoToFollow from "./users/whoToFollow";

const router = Router();

router.use("/signUpload", signUpload)
router.use("/create", createPost)
router.use("/feed", feed)
router.use("/hydratePosts", hydratePosts)
router.use("/relevantPosts", relevantPosts)
router.use("/commentSection", commentSection)
router.use("/userContents", contentsOfuser)
router.use("/follow", follow)
router.use("/whoToFollow", whoToFollow)

export default router;