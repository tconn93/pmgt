import express from 'express';
import { body } from 'express-validator';
import {
  getIssuesByProject,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  addComment,
  updateComment,
  deleteComment
} from '../controllers/issueController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/project/:projectId', authenticate, getIssuesByProject);
router.get('/:id', authenticate, getIssueById);

router.post(
  '/project/:projectId',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required')
  ],
  createIssue
);

router.put('/:id', authenticate, updateIssue);
router.delete('/:id', authenticate, deleteIssue);

// Comments
router.post('/:id/comments', authenticate, addComment);
router.put('/:id/comments/:commentId', authenticate, updateComment);
router.delete('/:id/comments/:commentId', authenticate, deleteComment);

export default router;
