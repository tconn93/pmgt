import express from 'express';
import { authenticateApiKey } from '../middleware/apiKeyAuth.js';
import { listTools, callTool } from '../controllers/mcpController.js';

const router = express.Router();

// All MCP endpoints require API key authentication
router.get('/tools', authenticateApiKey, listTools);
router.post('/call', authenticateApiKey, callTool);

// Also support the MCP-style POST to /message for JSON-RPC compatibility
router.post('/message', authenticateApiKey, (req, res) => {
  const { method, params } = req.body;

  if (method === 'tools/list') {
    return listTools(req, res);
  }

  if (method === 'tools/call') {
    // params is { name, arguments } per MCP spec
    req.body.name = params?.name;
    req.body.arguments = params?.arguments;
    return callTool(req, res);
  }

  res.status(400).json({ error: `Unknown method: ${method}` });
});

export default router;
