import prisma from '../config/database.js';
import { validationResult } from 'express-validator';

export const getAllProjects = async (req, res, next) => {
  try {
    // Only return projects where the user is a member
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: { issues: true }
        }
      }
    });

    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: { issues: true, sprints: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is a member of the project
    const isMember = project.members.some(member => member.userId === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, key, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        description,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId: req.user.id,
        role: 'ADMIN'
      }
    });

    if (!member && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const project = await prisma.project.update({
      where: { id },
      data: { name, description },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId: req.user.id,
        role: 'ADMIN'
      }
    });

    if (!member && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.project.delete({
      where: { id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addProjectMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    const adminMember = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId: req.user.id,
        role: 'ADMIN'
      }
    });

    if (!adminMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
        role: role || 'MEMBER'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({ member });
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;

    const adminMember = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId: req.user.id,
        role: 'ADMIN'
      }
    });

    if (!adminMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.projectMember.delete({
      where: { id: memberId }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};
