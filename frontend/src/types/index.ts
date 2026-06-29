export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
  _count?: {
    issues: number;
    sprints?: number;
  };
}

export interface ProjectMember {
  id: string;
  role: string;
  userId: string;
  projectId: string;
  user: User;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId?: string;
  reporterId: string;
  projectId: string;
  sprintId?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  reporter?: User;
  project?: Project;
  sprint?: Sprint;
  comments?: Comment[];
  _count?: {
    comments: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  issueId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status: SprintStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  issues?: Issue[];
  _count?: {
    issues: number;
  };
}

export type IssueType = 'STORY' | 'TASK' | 'BUG' | 'EPIC';
export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type IssuePriority = 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';
export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  details?: any;
}
