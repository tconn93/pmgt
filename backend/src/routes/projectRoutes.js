import express from 'express';
import { body } from 'express-validator';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAllProjects);
router.get('/:id', authenticate, getProjectById);

router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('key').notEmpty().withMessage('Key is required').isLength({ min: 2, max: 10 })
  ],
  createProject
);

router.put('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);

router.post('/:id/members', authenticate, addProjectMember);
router.delete('/:id/members/:memberId', authenticate, removeProjectMember);

export default router;
