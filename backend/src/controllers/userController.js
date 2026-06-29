import prisma from '../config/database.js';
import { hashPassword } from '../utils/auth.js';
import crypto from 'crypto';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    // Only admins can create users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    const { email, password, name, role, avatar } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'DEVELOPER',
        avatar
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, avatar, role, email, password } = req.body;

    // Check if user is authorized
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Prepare update data
    const updateData = {};

    // Regular users can only update their own name and avatar
    if (req.user.id === id) {
      if (name !== undefined) updateData.name = name;
      if (avatar !== undefined) updateData.avatar = avatar;
    }

    // Admins can update any field for any user
    if (req.user.role === 'ADMIN') {
      if (name !== undefined) updateData.name = name;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (role !== undefined) updateData.role = role;
      if (email !== undefined) updateData.email = email;
      if (password !== undefined) {
        updateData.password = await hashPassword(password);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        updatedAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Only admins can delete users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can delete users' });
    }

    const { id } = req.params;

    // Prevent admins from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ── API Key Management ──

export const generateApiKey = async (req, res, next) => {
  try {
    // Users can only generate keys for themselves (admins can generate for anyone)
    const targetId = req.params.id || req.user.id;

    if (req.user.id !== targetId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate a secure random API key
    const apiKey = `pmgt_${crypto.randomBytes(32).toString('hex')}`;

    const user = await prisma.user.update({
      where: { id: targetId },
      data: { apiKey },
      select: { id: true, email: true, name: true, role: true }
    });

    res.json({ user, apiKey });
  } catch (error) {
    next(error);
  }
};

export const revokeApiKey = async (req, res, next) => {
  try {
    const targetId = req.params.id || req.user.id;

    if (req.user.id !== targetId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.user.update({
      where: { id: targetId },
      data: { apiKey: null }
    });

    res.json({ message: 'API key revoked' });
  } catch (error) {
    next(error);
  }
};

export const getApiKeyStatus = async (req, res, next) => {
  try {
    const targetId = req.params.id || req.user.id;

    if (req.user.id !== targetId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, apiKey: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      hasApiKey: !!user.apiKey,
      // Only show the last 8 chars for safety in UI
      keyPreview: user.apiKey ? `...${user.apiKey.slice(-8)}` : null
    });
  } catch (error) {
    next(error);
  }
};
