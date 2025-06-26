const router = require("express").Router()


const {registerUser, loginUser,getUser,searchUsers, getUsers, editUser, followUnfollowUser, changeUserAvatar } = require('../controllers/userControllers')
const authMiddleware = require("../middleware/authMiddleware")
const {createPost, updatePost,searchPosts ,deletePost,getPost, getPosts, getUserPosts, getUserBookmarks, createBookmark, likeDislikePost, getFollowingPosts} = require ("../controllers/postControllers")
const {createMessage, getMessages, getConversations} = require("../controllers/messageControllers")
const {createComment, getPostComments, deleteComment} = require('../controllers/commentControllers')

//User routs
router.post('/users/register',registerUser)
router.post('/users/login',loginUser)
router.get('/users/bookmarks', authMiddleware,getUserBookmarks)
router.get('/users/search', authMiddleware, searchUsers);
router.get('/users/:id',authMiddleware, getUser)
router.get('/users', authMiddleware, getUsers)
router.patch('/users/:id',authMiddleware, editUser)
router.get('/users/:id/follow-unfollow', authMiddleware, followUnfollowUser)
router.post('/users/avatar',authMiddleware, changeUserAvatar)
router.get('/users/:id/posts', getUserPosts)

//Post routs

router.post('/posts', authMiddleware, createPost)
router.get('/posts/following', authMiddleware, getFollowingPosts)
router.get('/posts/search', searchPosts);
router.get('/posts/:id', authMiddleware, getPost)
router.get('/posts', authMiddleware, getPosts)
router.patch('/posts/:id', authMiddleware, updatePost)
router.delete('/posts/:id', authMiddleware, deletePost)
router.get('/posts/:id/like', authMiddleware, likeDislikePost)
router.get('/posts/:id/bookmark', authMiddleware, createBookmark)


//Comment routs
router.post('/comments/:postId', authMiddleware,createComment)
router.get('/comments/:postId', authMiddleware,getPostComments)
router.delete('/comments/:commentId', authMiddleware,deleteComment)


//Message routs
router.post('/messages/:receiverId', authMiddleware, createMessage)
router.get('/messages/:receiverId', authMiddleware, getMessages)
router.get('/conversations', authMiddleware, getConversations)





module.exports = router;
