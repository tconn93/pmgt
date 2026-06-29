import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, getUserById);
router.post('/', authenticate, authorize('ADMIN'), createUser);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

export default router;
