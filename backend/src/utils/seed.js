import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: passwordHash,
      name: 'Alice Johnson',
      role: 'PROJECT_MANAGER',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: passwordHash,
      name: 'Bob Smith',
      role: 'DEVELOPER',
    },
  });

  const carol = await prisma.user.create({
    data: {
      email: 'carol@example.com',
      password: passwordHash,
      name: 'Carol Williams',
      role: 'DEVELOPER',
    },
  });

  const dave = await prisma.user.create({
    data: {
      email: 'dave@example.com',
      password: passwordHash,
      name: 'Dave Brown',
      role: 'VIEWER',
    },
  });

  console.log('✅ Users created');

  // Create projects
  const webApp = await prisma.project.create({
    data: {
      name: 'Web Application',
      key: 'WEB',
      description: 'Main web application development project',
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: alice.id, role: 'ADMIN' },
          { userId: bob.id, role: 'MEMBER' },
          { userId: carol.id, role: 'MEMBER' },
          { userId: dave.id, role: 'VIEWER' },
        ],
      },
    },
  });

  const mobileApp = await prisma.project.create({
    data: {
      name: 'Mobile App',
      key: 'MOB',
      description: 'iOS and Android mobile application',
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: bob.id, role: 'MEMBER' },
          { userId: carol.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const api = await prisma.project.create({
    data: {
      name: 'Backend API',
      key: 'API',
      description: 'REST API infrastructure and services',
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: alice.id, role: 'MEMBER' },
          { userId: bob.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✅ Projects created');

  // Create sprints
  const sprint1 = await prisma.sprint.create({
    data: {
      name: 'Sprint 1 - Foundation',
      goal: 'Set up project foundation and core infrastructure',
      status: 'ACTIVE',
      startDate: new Date('2026-06-15'),
      endDate: new Date('2026-06-29'),
      projectId: webApp.id,
    },
  });

  const sprint2 = await prisma.sprint.create({
    data: {
      name: 'Sprint 2 - Features',
      goal: 'Implement core user-facing features',
      status: 'PLANNED',
      startDate: new Date('2026-06-30'),
      endDate: new Date('2026-07-14'),
      projectId: webApp.id,
    },
  });

  await prisma.sprint.create({
    data: {
      name: 'Sprint 1 - MVP',
      goal: 'Build minimum viable product',
      status: 'ACTIVE',
      startDate: new Date('2026-06-20'),
      endDate: new Date('2026-07-04'),
      projectId: mobileApp.id,
    },
  });

  console.log('✅ Sprints created');

  // Create issues
  const issues = [
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment.',
      type: 'TASK',
      priority: 'HIGH',
      status: 'DONE',
      projectId: webApp.id,
      sprintId: sprint1.id,
      reporterId: admin.id,
      assigneeId: bob.id,
      orderIndex: 0,
    },
    {
      title: 'Design database schema',
      description: 'Create the initial database schema design for all core entities.',
      type: 'TASK',
      priority: 'HIGHEST',
      status: 'DONE',
      projectId: webApp.id,
      sprintId: sprint1.id,
      reporterId: alice.id,
      assigneeId: alice.id,
      orderIndex: 1,
    },
    {
      title: 'Implement user authentication',
      description: 'Set up JWT-based authentication with login and registration endpoints.',
      type: 'STORY',
      priority: 'HIGHEST',
      status: 'IN_PROGRESS',
      projectId: webApp.id,
      sprintId: sprint1.id,
      reporterId: alice.id,
      assigneeId: bob.id,
      orderIndex: 2,
    },
    {
      title: 'Build project dashboard UI',
      description: 'Create the main dashboard page showing all projects with key metrics.',
      type: 'STORY',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      projectId: webApp.id,
      sprintId: sprint1.id,
      reporterId: alice.id,
      assigneeId: carol.id,
      orderIndex: 3,
    },
    {
      title: 'Fix login page styling on mobile',
      description: 'The login form is cut off on iPhone SE screens. Need to adjust padding and font sizes.',
      type: 'BUG',
      priority: 'MEDIUM',
      status: 'TODO',
      projectId: webApp.id,
      sprintId: sprint2.id,
      reporterId: bob.id,
      assigneeId: carol.id,
      orderIndex: 4,
    },
    {
      title: 'Add drag-and-drop to Kanban board',
      description: 'Users should be able to drag issues between columns to change their status.',
      type: 'STORY',
      priority: 'HIGH',
      status: 'TODO',
      projectId: webApp.id,
      sprintId: sprint2.id,
      reporterId: alice.id,
      assigneeId: bob.id,
      orderIndex: 5,
    },
    {
      title: 'API rate limiting',
      description: 'Implement rate limiting on authentication endpoints to prevent brute force attacks.',
      type: 'TASK',
      priority: 'MEDIUM',
      status: 'TODO',
      projectId: api.id,
      reporterId: admin.id,
      assigneeId: bob.id,
      orderIndex: 0,
    },
    {
      title: 'Database backup strategy',
      description: 'Research and implement automated database backups with point-in-time recovery.',
      type: 'TASK',
      priority: 'HIGH',
      status: 'TODO',
      projectId: api.id,
      reporterId: alice.id,
      orderIndex: 1,
    },
    {
      title: 'User profile screen',
      description: 'Allow users to view and edit their profile information including avatar.',
      type: 'STORY',
      priority: 'LOW',
      status: 'TODO',
      projectId: mobileApp.id,
      reporterId: bob.id,
      assigneeId: carol.id,
      orderIndex: 0,
    },
    {
      title: 'App crashes on logout',
      description: 'The app crashes when logging out while on the issue detail screen.',
      type: 'BUG',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      projectId: mobileApp.id,
      reporterId: carol.id,
      assigneeId: bob.id,
      orderIndex: 1,
    },
  ];

  for (const issueData of issues) {
    await prisma.issue.create({ data: issueData });
  }

  console.log('✅ Issues created');

  // Add comments
  const webAppIssues = await prisma.issue.findMany({
    where: { projectId: webApp.id },
    take: 3,
  });

  if (webAppIssues.length > 0) {
    await prisma.comment.create({
      data: {
        content: "I've started working on this. The JWT implementation looks straightforward.",
        userId: bob.id,
        issueId: webAppIssues[0].id,
      },
    });

    await prisma.comment.create({
      data: {
        content: 'Great! Let me know if you need any help with the token refresh logic.',
        userId: alice.id,
        issueId: webAppIssues[0].id,
      },
    });

    await prisma.comment.create({
      data: {
        content: "I've reviewed the schema design. Looks good overall, but we should add indexes on the issues table for better query performance.",
        userId: bob.id,
        issueId: webAppIssues[1].id,
      },
    });
  }

  console.log('✅ Comments created');
  console.log('');
  console.log('🎉 Seed complete! Default login credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: password123');
  console.log('');
  console.log('   Other users: alice@example.com, bob@example.com, carol@example.com, dave@example.com');
  console.log('   All passwords: password123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
