import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, issuesAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { Project, Issue, IssueStatus, IssueType, IssuePriority } from '../types';
import IssueDetailModal from '../components/IssueDetailModal';
import CreateIssueModal from '../components/CreateIssueModal';
import ProjectMembersModal from '../components/ProjectMembersModal';

const Issues: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadIssues();
    }
  }, [projectId]);

  useEffect(() => {
    applyFilters();
  }, [issues, statusFilter, typeFilter, priorityFilter, searchQuery]);

  const loadProject = async () => {
    try {
      const data = await projectsAPI.getById(projectId!);
      setProject(data);
    } catch (error) {
      toast.error('Failed to load project');
    }
  };

  const loadIssues = async () => {
    try {
      const data = await issuesAPI.getByProject(projectId!);
      setIssues(data);
    } catch (error) {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...issues];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((issue) => issue.type === typeFilter);
    }

    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter((issue) => issue.priority === priorityFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((issue) =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredIssues(filtered);
  };

  const getPriorityColor = (priority: IssuePriority): string => {
    const colors: Record<IssuePriority, string> = {
      HIGHEST: '#ff0000',
      HIGH: '#ff5722',
      MEDIUM: '#ff9800',
      LOW: '#4caf50',
      LOWEST: '#2196f3',
    };
    return colors[priority];
  };

  const getStatusBadgeClass = (status: IssueStatus): string => {
    const classes: Record<IssueStatus, string> = {
      TODO: 'status-badge status-todo',
      IN_PROGRESS: 'status-badge status-in-progress',
      DONE: 'status-badge status-done',
    };
    return classes[status];
  };

  const getStatusLabel = (status: IssueStatus): string => {
    const labels: Record<IssueStatus, string> = {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      DONE: 'Done',
    };
    return labels[status];
  };

  const getTypeIcon = (type: IssueType): string => {
    const icons: Record<IssueType, string> = {
      STORY: '📖',
      TASK: '✓',
      BUG: '🐛',
      EPIC: '⚡',
    };
    return icons[type];
  };

  if (loading) {
    return <div className="loading">Loading issues...</div>;
  }

  return (
    <div className="issues-page">
      <div className="issues-header">
        <div>
          <h1>{project?.name}</h1>
          <p className="project-key">{project?.key}</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowMembersModal(true)}
          >
            Members
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate(`/projects/${projectId}/board`)}
          >
            Board View
          </button>
          <button className="btn-secondary" onClick={() => navigate(`/projects/${projectId}/sprints`)}>Sprints</button>
<button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            Create Issue
          </button>
        </div>
      </div>

      <div className="issues-filters">
        <input
          type="text"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="STORY">Story</option>
          <option value="TASK">Task</option>
          <option value="BUG">Bug</option>
          <option value="EPIC">Epic</option>
        </select>

        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="ALL">All Priorities</option>
          <option value="HIGHEST">Highest</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="LOWEST">Lowest</option>
        </select>

        <div className="filter-summary">
          Showing {filteredIssues.length} of {issues.length} issues
        </div>
      </div>

      <div className="issues-table-container">
        <table className="issues-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <tr key={issue.id} onClick={() => setSelectedIssue(issue)} className="issue-row">
                  <td>
                    <span className="issue-type-icon" title={issue.type}>
                      {getTypeIcon(issue.type)}
                    </span>
                  </td>
                  <td className="issue-title-cell">
                    <strong>{issue.title}</strong>
                    {issue.description && (
                      <div className="issue-description-preview">{issue.description}</div>
                    )}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(issue.status)}>
                      {getStatusLabel(issue.status)}
                    </span>
                  </td>
                  <td>
                    <div className="priority-cell">
                      <span
                        className="priority-indicator"
                        style={{ backgroundColor: getPriorityColor(issue.priority) }}
                      />
                      {issue.priority}
                    </div>
                  </td>
                  <td>
                    {issue.assignee ? (
                      <div className="assignee-cell">
                        {issue.assignee.avatar ? (
                          <img
                            src={issue.assignee.avatar}
                            alt={issue.assignee.name}
                            className="assignee-avatar-small"
                          />
                        ) : (
                          <div className="assignee-avatar-small avatar-placeholder-small">
                            {issue.assignee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{issue.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="unassigned">Unassigned</span>
                    )}
                  </td>
                  <td className="comments-cell">
                    {issue._count && issue._count.comments > 0 && (
                      <span>💬 {issue._count.comments}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="no-issues">
                  {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL' || priorityFilter !== 'ALL'
                    ? 'No issues match your filters'
                    : 'No issues yet. Create your first issue!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdate={() => {
            loadIssues();
            setSelectedIssue(null);
          }}
        />
      )}

      {showCreateModal && (
        <CreateIssueModal
          projectId={projectId!}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadIssues();
          }}
        />
      )}

      {showMembersModal && project && (
        <ProjectMembersModal
          project={project}
          onClose={() => setShowMembersModal(false)}
          onUpdate={() => {
            loadProject();
          }}
        />
      )}
    </div>
  );
};

export default Issues;
