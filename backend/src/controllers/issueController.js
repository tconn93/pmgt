import prisma from '../config/database.js';
import { validationResult } from 'express-validator';

export const getIssuesByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, assigneeId, type, sprintId } = req.query;

    // Check if user is a member of the project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: req.user.id
      }
    });

    if (!projectMember) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }

    const where = { projectId };
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (type) where.type = type;
    if (sprintId) where.sprintId = sprintId;

    const issues = await prisma.issue.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: [
        { status: 'asc' },
        { orderIndex: 'asc' }
      ]
    });

    res.json({ issues });
  } catch (error) {
    next(error);
  }
};

export const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true
          }
        },
        sprint: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check if user is a member of the project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: issue.projectId,
        userId: req.user.id
      }
    });

    if (!projectMember) {
      return res.status(403).json({ error: 'You do not have access to this issue' });
    }

    res.json({ issue });
  } catch (error) {
    next(error);
  }
};

export const createIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { title, description, type, priority, assigneeId, sprintId, status } = req.body;

    // Check if user is a member of the project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: req.user.id
      }
    });

    if (!projectMember) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        type: type || 'TASK',
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        assigneeId,
        reporterId: req.user.id,
        projectId,
        sprintId,
        orderIndex: 0
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({ issue });
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, type, priority, status, assigneeId, sprintId, orderIndex } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (sprintId !== undefined) updateData.sprintId = sprintId;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;

    const issue = await prisma.issue.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.json({ issue });
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.issue.delete({
      where: { id }
    });

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        issueId: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existingComment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.json({ comment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existingComment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
