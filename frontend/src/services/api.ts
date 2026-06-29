import axios from 'axios';
import type { AuthResponse, User, Project, Issue, Sprint, Comment } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await api.post<AuthResponse>('/auth/register', { email, password, name });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get<{ users: User[] }>('/users');
    return response.data.users;
  },
  getById: async (id: string) => {
    const response = await api.get<{ user: User }>(`/users/${id}`);
    return response.data.user;
  },
  create: async (data: { email: string; password: string; name: string; role?: string; avatar?: string }) => {
    const response = await api.post<{ user: User }>('/users', data);
    return response.data.user;
  },
  update: async (id: string, data: Partial<User>) => {
    const response = await api.put<{ user: User }>(`/users/${id}`, data);
    return response.data.user;
  },
  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    const response = await api.get<{ projects: Project[] }>('/projects');
    return response.data.projects;
  },
  getById: async (id: string) => {
    const response = await api.get<{ project: Project }>(`/projects/${id}`);
    return response.data.project;
  },
  create: async (data: { name: string; key: string; description?: string }) => {
    const response = await api.post<{ project: Project }>('/projects', data);
    return response.data.project;
  },
  update: async (id: string, data: Partial<Project>) => {
    const response = await api.put<{ project: Project }>(`/projects/${id}`, data);
    return response.data.project;
  },
  delete: async (id: string) => {
    await api.delete(`/projects/${id}`);
  },
  addMember: async (projectId: string, userId: string, role?: string) => {
    const response = await api.post(`/projects/${projectId}/members`, { userId, role });
    return response.data.member;
  },
  removeMember: async (projectId: string, memberId: string) => {
    await api.delete(`/projects/${projectId}/members/${memberId}`);
  },
};

// Issues API
export const issuesAPI = {
  getByProject: async (projectId: string, filters?: Record<string, string>) => {
    const response = await api.get<{ issues: Issue[] }>(`/issues/project/${projectId}`, {
      params: filters,
    });
    return response.data.issues;
  },
  getById: async (id: string) => {
    const response = await api.get<{ issue: Issue }>(`/issues/${id}`);
    return response.data.issue;
  },
  create: async (projectId: string, data: Partial<Issue>) => {
    const response = await api.post<{ issue: Issue }>(`/issues/project/${projectId}`, data);
    return response.data.issue;
  },
  update: async (id: string, data: Partial<Issue>) => {
    const response = await api.put<{ issue: Issue }>(`/issues/${id}`, data);
    return response.data.issue;
  },
  delete: async (id: string) => {
    await api.delete(`/issues/${id}`);
  },
  addComment: async (issueId: string, content: string) => {
    const response = await api.post<{ comment: Comment }>(`/issues/${issueId}/comments`, { content });
    return response.data.comment;
  },
  updateComment: async (issueId: string, commentId: string, content: string) => {
    const response = await api.put<{ comment: Comment }>(`/issues/${issueId}/comments/${commentId}`, { content });
    return response.data.comment;
  },
  deleteComment: async (issueId: string, commentId: string) => {
    await api.delete(`/issues/${issueId}/comments/${commentId}`);
  },
};

// Sprints API
export const sprintsAPI = {
  getByProject: async (projectId: string) => {
    const response = await api.get<{ sprints: Sprint[] }>(`/sprints/project/${projectId}`);
    return response.data.sprints;
  },
  getById: async (id: string) => {
    const response = await api.get<{ sprint: Sprint }>(`/sprints/${id}`);
    return response.data.sprint;
  },
  create: async (projectId: string, data: Partial<Sprint>) => {
    const response = await api.post<{ sprint: Sprint }>(`/sprints/project/${projectId}`, data);
    return response.data.sprint;
  },
  update: async (id: string, data: Partial<Sprint>) => {
    const response = await api.put<{ sprint: Sprint }>(`/sprints/${id}`, data);
    return response.data.sprint;
  },
  delete: async (id: string) => {
    await api.delete(`/sprints/${id}`);
  },
  start: async (id: string) => {
    const response = await api.post<{ sprint: Sprint }>(`/sprints/${id}/start`);
    return response.data.sprint;
  },
  complete: async (id: string) => {
    const response = await api.post<{ sprint: Sprint }>(`/sprints/${id}/complete`);
    return response.data.sprint;
  },
};

export default api;
