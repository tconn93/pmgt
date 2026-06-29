import express from 'express';
import {
  getAllUsers, getUserById, createUser, updateUser, deleteUser,
  generateApiKey, revokeApiKey, getApiKeyStatus
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, getUserById);
router.post('/', authenticate, authorize('ADMIN'), createUser);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

// API key management
router.get('/:id/api-key', authenticate, getApiKeyStatus);
router.post('/:id/api-key', authenticate, generateApiKey);
router.delete('/:id/api-key', authenticate, revokeApiKey);

export default router;
