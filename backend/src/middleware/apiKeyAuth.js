import prisma from '../config/database.js';

/**
 * Authenticate requests using an API key.
 * Expects header: X-API-Key: <key>
 */
export const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required. Pass X-API-Key header.' });
    }

    const user = await prisma.user.findUnique({
      where: { apiKey },
      select: { id: true, email: true, name: true, role: true, avatar: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.user = user;
    req.authMethod = 'apikey';
    next();
  } catch (error) {
    return res.status(500).json({ error: 'API key authentication failed' });
  }
};

/**
 * Accept either JWT Bearer token or X-API-Key header.
 */
export const authenticateEither = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (apiKey) {
    return authenticateApiKey(req, res, next);
  }

  // Fall through to JWT auth
  const { authenticate } = await import('./auth.js');
  return authenticate(req, res, next);
};
