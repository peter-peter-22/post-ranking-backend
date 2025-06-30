import { Router } from 'express';

import signUpload from "./posts/requestUploadKey"
import createPost from './posts/createPost';
import feed from "./posts/feed";
import relevantPosts from "./posts/relevantPosts";
import commentSection from "./posts/commentSection";
import contentsOfuser from "./posts/getContentsOfUser";
import follow from "./users/follow";
import whoToFollow from "./users/whoToFollow";
import searchPosts from "./posts/search";
import searchUsers from "./users/search";
import listFollows from "./users/listFollows";

const router = Router();

router.use("/signUpload", signUpload)
router.use("/create", createPost)
router.use("/feed", feed)
router.use("/relevantPosts", relevantPosts)
router.use("/commentSection", commentSection)
router.use("/userContents", contentsOfuser)
router.use("/follow", follow)
router.use("/whoToFollow", whoToFollow)
router.use("/searchPosts", searchPosts)
router.use("/searchUsers", searchUsers)
router.use("/listFollows", listFollows)

export default router;