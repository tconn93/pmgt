import prisma from '../config/database.js';
import { validationResult } from 'express-validator';

export const getSprintsByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

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

    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { issues: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ sprints });
  } catch (error) {
    next(error);
  }
};

export const getSprintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sprint = await prisma.sprint.findUnique({
      where: { id },
      include: {
        issues: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true
          }
        }
      }
    });

    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    // Check if user is a member of the project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: sprint.projectId,
        userId: req.user.id
      }
    });

    if (!projectMember) {
      return res.status(403).json({ error: 'You do not have access to this sprint' });
    }

    res.json({ sprint });
  } catch (error) {
    next(error);
  }
};

export const createSprint = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { name, goal, startDate, endDate } = req.body;

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

    const sprint = await prisma.sprint.create({
      data: {
        name,
        goal,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        projectId,
        status: 'PLANNED'
      }
    });

    res.status(201).json({ sprint });
  } catch (error) {
    next(error);
  }
};

export const updateSprint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, goal, startDate, endDate, status } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (goal !== undefined) updateData.goal = goal;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.status = status;

    const sprint = await prisma.sprint.update({
      where: { id },
      data: updateData
    });

    res.json({ sprint });
  } catch (error) {
    next(error);
  }
};

export const deleteSprint = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.sprint.delete({
      where: { id }
    });

    res.json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const startSprint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sprint = await prisma.sprint.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        startDate: new Date()
      }
    });

    res.json({ sprint });
  } catch (error) {
    next(error);
  }
};

export const completeSprint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sprint = await prisma.sprint.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endDate: new Date()
      }
    });

    res.json({ sprint });
  } catch (error) {
    next(error);
  }
};
