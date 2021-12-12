import express from 'express';
import { getPostsBySearch, getPosts, createPost, updatePost, deletePost, likePost, getPost, commentPost } from '../controllers/postController.js'; 
import authMiddleware from '../middlware/authMiddleware.js';

const router = express.Router();

router.get('/search', getPostsBySearch)
router.get('/', getPosts);
router.get('/:id', getPost)
router.post('/', authMiddleware, createPost);
router.patch('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);
router.patch('/:id/likepost', authMiddleware, likePost);
router.post('/:id/commentPost', authMiddleware, commentPost);

export default router;