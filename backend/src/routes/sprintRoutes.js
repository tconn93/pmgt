import express from 'express';
import { body } from 'express-validator';
import {
  getSprintsByProject,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  completeSprint
} from '../controllers/sprintController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/project/:projectId', authenticate, getSprintsByProject);
router.get('/:id', authenticate, getSprintById);

router.post(
  '/project/:projectId',
  authenticate,
  [
    body('name').notEmpty().withMessage('Name is required')
  ],
  createSprint
);

router.put('/:id', authenticate, updateSprint);
router.delete('/:id', authenticate, deleteSprint);

router.post('/:id/start', authenticate, startSprint);
router.post('/:id/complete', authenticate, completeSprint);

export default router;
