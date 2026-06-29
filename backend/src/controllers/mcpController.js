import prisma from '../config/database.js';

// ── Tool Definitions ─────────────────────────────────────────────

const TOOLS = [
  // ── Projects ──
  {
    name: 'list_projects',
    description: 'List all projects the authenticated user has access to. Returns project id, name, key, description, member count, and issue count.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_project',
    description: 'Get full details for a single project by its ID, including members and counts.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'UUID of the project' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_project',
    description: 'Create a new project. The creating user is automatically added as an admin member.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Human-readable project name (e.g. "Website Redesign")' },
        key: { type: 'string', description: 'Short code, 2-10 uppercase chars (e.g. "WEB"). Used in issue IDs.' },
        description: { type: 'string', description: 'Optional project description' }
      },
      required: ['name', 'key']
    }
  },
  {
    name: 'update_project',
    description: 'Update a project name or description. Requires admin role on the project.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'UUID of the project' },
        name: { type: 'string', description: 'New project name' },
        description: { type: 'string', description: 'New project description' }
      },
      required: ['id']
    }
  },

  // ── Issues ──
  {
    name: 'list_issues',
    description: 'List issues in a project. Supports optional filtering by status, type, priority, and assignee. Returns issues with assignee, reporter, and comment counts.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'UUID of the project' },
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], description: 'Filter by status' },
        type: { type: 'string', enum: ['STORY', 'TASK', 'BUG', 'EPIC'], description: 'Filter by issue type' },
        priority: { type: 'string', enum: ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'], description: 'Filter by priority' },
        assigneeId: { type: 'string', description: 'Filter by assignee user UUID' },
        sprintId: { type: 'string', description: 'Filter by sprint UUID' }
      },
      required: ['projectId']
    }
  },
  {
    name: 'get_issue',
    description: 'Get full details for a single issue including description, comments, assignee, reporter, sprint, and project info.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'UUID of the issue' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_issue',
    description: 'Create a new issue in a project. The calling user becomes the reporter.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'UUID of the project' },
        title: { type: 'string', description: 'Issue title (required)' },
        description: { type: 'string', description: 'Issue description (markdown supported)' },
        type: { type: 'string', enum: ['STORY', 'TASK', 'BUG', 'EPIC'], description: 'Issue type. Default: TASK' },
        priority: { type: 'string', enum: ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'], description: 'Priority. Default: MEDIUM' },
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], description: 'Initial status. Default: TODO' },
        assigneeId: { type: 'string', description: 'UUID of the user to assign' },
        sprintId: { type: 'string', description: 'UUID of the sprint to add this issue to' }
      },
      required: ['projectId', 'title']
    }
  },
  {
    name: 'update_issue',
    description: 'Update any field on an existing issue. Only pass the fields you want to change.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'UUID of the issue to update' },
        title: { type: 'string', description: 'New title' },
        description: { type: 'string', description: 'New description' },
        type: { type: 'string', enum: ['STORY', 'TASK', 'BUG', 'EPIC'] },
        priority: { type: 'string', enum: ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] },
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
        assigneeId: { type: 'string', description: 'UUID of new assignee (or null to unassign)' },
        sprintId: { type: 'string', description: 'UUID of sprint to move issue to (or null to remove)' }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_issue',
    description: 'Permanently delete an issue by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'UUID of the issue to delete' }
      },
      required: ['id']
    }
  },

  // ── Comments ──
  {
    name: 'add_comment',
    description: 'Add a comment to an issue. The calling user is the comment author.',
    inputSchema: {
      type: 'object',
      properties: {
        issueId: { type: 'string', description: 'UUID of the issue' },
        content: { type: 'string', description: 'Comment text (markdown supported)' }
      },
      required: ['issueId', 'content']
    }
  },

  // ── Sprints ──
  {
    name: 'list_sprints',
    description: 'List all sprints for a project with issue counts and status.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'UUID of the project' }
      },
      required: ['projectId']
    }
  },
  {
    name: 'get_sprint',
    description: 'Get full sprint details including all issues in the sprint.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'UUID of the sprint' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_sprint',
    description: 'Create a new sprint in a project.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'UUID of the project' },
        name: { type: 'string', description: 'Sprint name (e.g. "Sprint 3")' },
        goal: { type: 'string', description: 'Sprint goal / objective' },
        startDate: { type: 'string', description: 'Start date (ISO 8601, e.g. 2026-07-01)' },
        endDate: { type: 'string', description: 'End date (ISO 8601, e.g. 2026-07-14)' }
      },
      required: ['projectId', 'name']
    }
  },
  {
    name: 'start_sprint',
    description: 'Start a sprint (changes status to ACTIVE and sets start date to now).',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'UUID of the sprint' }
      },
      required: ['id']
    }
  },
  {
    name: 'complete_sprint',
    description: 'Complete a sprint (changes status to COMPLETED and sets end date to now).',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'UUID of the sprint' }
      },
      required: ['id']
    }
  },

  // ── Users ──
  {
    name: 'list_users',
    description: 'List all users in the system with their roles.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'search_issues',
    description: 'Search issues across all accessible projects by title text.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search text matched against issue titles' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_project_board',
    description: 'Get the full board view for a project — returns issues grouped by status (TODO, IN_PROGRESS, DONE). This is the data that powers the Kanban board.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'UUID of the project' }
      },
      required: ['projectId']
    }
  }
];

// ── Tool Registry ────────────────────────────────────────────────

const toolRegistry = {};

// ── Project handlers ──

toolRegistry.list_projects = async (args, user) => {
  const projects = await prisma.project.findMany({
    where: {
      members: { some: { userId: user.id } }
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } }
        }
      },
      _count: { select: { issues: true, sprints: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });
  return { projects };
};

toolRegistry.get_project = async (args, user) => {
  const project = await prisma.project.findUnique({
    where: { id: args.id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, role: true } }
        }
      },
      _count: { select: { issues: true, sprints: true } }
    }
  });
  if (!project) throw new Error('Project not found');
  const isMember = project.members.some(m => m.userId === user.id);
  if (!isMember) throw new Error('Access denied');
  return { project };
};

toolRegistry.create_project = async (args, user) => {
  const project = await prisma.project.create({
    data: {
      name: args.name,
      key: args.key.toUpperCase(),
      description: args.description,
      members: { create: { userId: user.id, role: 'ADMIN' } }
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } }
        }
      }
    }
  });
  return { project };
};

toolRegistry.update_project = async (args, user) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId: args.id, userId: user.id, role: 'ADMIN' }
  });
  if (!member && user.role !== 'ADMIN') throw new Error('Unauthorized');

  const data = {};
  if (args.name !== undefined) data.name = args.name;
  if (args.description !== undefined) data.description = args.description;

  const project = await prisma.project.update({ where: { id: args.id }, data });
  return { project };
};

// ── Issue handlers ──

toolRegistry.list_issues = async (args, user) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId: args.projectId, userId: user.id }
  });
  if (!member) throw new Error('Access denied');

  const where = { projectId: args.projectId };
  if (args.status) where.status = args.status;
  if (args.type) where.type = args.type;
  if (args.priority) where.priority = args.priority;
  if (args.assigneeId) where.assigneeId = args.assigneeId;
  if (args.sprintId) where.sprintId = args.sprintId;

  const issues = await prisma.issue.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      reporter: { select: { id: true, name: true, email: true, avatar: true } },
      _count: { select: { comments: true } }
    },
    orderBy: [{ status: 'asc' }, { orderIndex: 'asc' }]
  });
  return { issues };
};

toolRegistry.get_issue = async (args, user) => {
  const issue = await prisma.issue.findUnique({
    where: { id: args.id },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      reporter: { select: { id: true, name: true, email: true, avatar: true } },
      project: { select: { id: true, name: true, key: true } },
      sprint: { select: { id: true, name: true, status: true } },
      comments: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  if (!issue) throw new Error('Issue not found');
  const member = await prisma.projectMember.findFirst({
    where: { projectId: issue.projectId, userId: user.id }
  });
  if (!member) throw new Error('Access denied');
  return { issue };
};

toolRegistry.create_issue = async (args, user) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId: args.projectId, userId: user.id }
  });
  if (!member) throw new Error('Access denied');

  const issue = await prisma.issue.create({
    data: {
      title: args.title,
      description: args.description,
      type: args.type || 'TASK',
      priority: args.priority || 'MEDIUM',
      status: args.status || 'TODO',
      assigneeId: args.assigneeId,
      reporterId: user.id,
      projectId: args.projectId,
      sprintId: args.sprintId,
      orderIndex: 0
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      reporter: { select: { id: true, name: true, email: true, avatar: true } }
    }
  });
  return { issue };
};

toolRegistry.update_issue = async (args, user) => {
  const data = {};
  const fields = ['title', 'description', 'type', 'priority', 'status', 'assigneeId', 'sprintId'];
  for (const f of fields) {
    if (args[f] !== undefined) data[f] = args[f];
  }

  const issue = await prisma.issue.update({
    where: { id: args.id },
    data,
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      reporter: { select: { id: true, name: true, email: true, avatar: true } }
    }
  });
  return { issue };
};

toolRegistry.delete_issue = async (args, user) => {
  await prisma.issue.delete({ where: { id: args.id } });
  return { success: true, message: 'Issue deleted' };
};

// ── Comment handlers ──

toolRegistry.add_comment = async (args, user) => {
  const comment = await prisma.comment.create({
    data: {
      content: args.content,
      userId: user.id,
      issueId: args.issueId
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } }
    }
  });
  return { comment };
};

// ── Sprint handlers ──

toolRegistry.list_sprints = async (args, user) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId: args.projectId, userId: user.id }
  });
  if (!member) throw new Error('Access denied');

  const sprints = await prisma.sprint.findMany({
    where: { projectId: args.projectId },
    include: { _count: { select: { issues: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return { sprints };
};

toolRegistry.get_sprint = async (args, user) => {
  const sprint = await prisma.sprint.findUnique({
    where: { id: args.id },
    include: {
      issues: {
        include: {
          assignee: { select: { id: true, name: true, avatar: true } }
        }
      },
      project: { select: { id: true, name: true, key: true } }
    }
  });
  if (!sprint) throw new Error('Sprint not found');
  const member = await prisma.projectMember.findFirst({
    where: { projectId: sprint.projectId, userId: user.id }
  });
  if (!member) throw new Error('Access denied');
  return { sprint };
};

toolRegistry.create_sprint = async (args, user) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId: args.projectId, userId: user.id }
  });
  if (!member) throw new Error('Access denied');

  const sprint = await prisma.sprint.create({
    data: {
      name: args.name,
      goal: args.goal,
      startDate: args.startDate ? new Date(args.startDate) : null,
      endDate: args.endDate ? new Date(args.endDate) : null,
      projectId: args.projectId,
      status: 'PLANNED'
    }
  });
  return { sprint };
};

toolRegistry.start_sprint = async (args, user) => {
  const sprint = await prisma.sprint.update({
    where: { id: args.id },
    data: { status: 'ACTIVE', startDate: new Date() }
  });
  return { sprint };
};

toolRegistry.complete_sprint = async (args, user) => {
  const sprint = await prisma.sprint.update({
    where: { id: args.id },
    data: { status: 'COMPLETED', endDate: new Date() }
  });
  return { sprint };
};

// ── User handlers ──

toolRegistry.list_users = async (args, user) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true }
  });
  return { users };
};

// ── Search ──

toolRegistry.search_issues = async (args, user) => {
  const issues = await prisma.issue.findMany({
    where: {
      title: { contains: args.query },
      project: {
        members: { some: { userId: user.id } }
      }
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      reporter: { select: { id: true, name: true, email: true, avatar: true } },
      project: { select: { id: true, name: true, key: true } },
      _count: { select: { comments: true } }
    },
    orderBy: { updatedAt: 'desc' },
    take: 50
  });
  return { issues };
};

// ── Board ──

toolRegistry.get_project_board = async (args, user) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId: args.projectId, userId: user.id }
  });
  if (!member) throw new Error('Access denied');

  const issues = await prisma.issue.findMany({
    where: { projectId: args.projectId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      reporter: { select: { id: true, name: true, email: true, avatar: true } },
      _count: { select: { comments: true } }
    },
    orderBy: { orderIndex: 'asc' }
  });

  const board = {
    TODO: issues.filter(i => i.status === 'TODO'),
    IN_PROGRESS: issues.filter(i => i.status === 'IN_PROGRESS'),
    DONE: issues.filter(i => i.status === 'DONE'),
  };

  return { board };
};

// ── Controller exports ───────────────────────────────────────────

/**
 * GET /api/mcp/tools
 * List all available tools with their input schemas.
 */
export const listTools = async (req, res) => {
  res.json({ tools: TOOLS });
};

/**
 * POST /api/mcp/call
 * Call a tool by name with arguments. Uses API key authentication.
 *
 * Body: { name: "create_issue", arguments: { projectId: "...", title: "..." } }
 * Response: { result: { ... } } or { error: "..." }
 */
export const callTool = async (req, res) => {
  try {
    const { name, arguments: args } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tool name is required' });
    }

    const handler = toolRegistry[name];

    if (!handler) {
      return res.status(400).json({
        error: `Unknown tool: "${name}". Use GET /api/mcp/tools to see available tools.`
      });
    }

    // Validate required args against schema
    const toolDef = TOOLS.find(t => t.name === name);
    if (toolDef?.inputSchema?.required) {
      for (const required of toolDef.inputSchema.required) {
        if (args?.[required] === undefined) {
          return res.status(400).json({
            error: `Missing required argument: "${required}" for tool "${name}"`
          });
        }
      }
    }

    const result = await handler(args || {}, req.user);

    res.json({ result });
  } catch (error) {
    console.error(`MCP tool call error (${req.body.name}):`, error.message);
    res.status(error.message.includes('not found') ? 404 :
               error.message.includes('Access denied') || error.message.includes('Unauthorized') ? 403 : 500)
      .json({ error: error.message });
  }
};
