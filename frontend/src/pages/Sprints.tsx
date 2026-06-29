import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sprintsAPI, projectsAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { Sprint, Project } from '../types';

const Sprints: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    try {
      const [projectData, sprintsData] = await Promise.all([
        projectsAPI.getById(projectId),
        sprintsAPI.getByProject(projectId)
      ]);
      setProject(projectData);
      setSprints(sprintsData);
    } catch (error) {
      toast.error('Failed to load sprints');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sprint?: Sprint) => {
    if (sprint) {
      setEditingSprint(sprint);
      setFormData({
        name: sprint.name,
        goal: sprint.goal || '',
        startDate: sprint.startDate ? sprint.startDate.split('T')[0] : '',
        endDate: sprint.endDate ? sprint.endDate.split('T')[0] : ''
      });
    } else {
      setEditingSprint(null);
      setFormData({
        name: '',
        goal: '',
        startDate: '',
        endDate: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSprint(null);
    setFormData({
      name: '',
      goal: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    try {
      if (editingSprint) {
        await sprintsAPI.update(editingSprint.id, formData);
        toast.success('Sprint updated successfully');
      } else {
        await sprintsAPI.create(projectId, formData);
        toast.success('Sprint created successfully');
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${editingSprint ? 'update' : 'create'} sprint`);
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      await sprintsAPI.start(sprintId);
      toast.success('Sprint started successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start sprint');
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    if (!window.confirm('Are you sure you want to complete this sprint?')) {
      return;
    }

    try {
      await sprintsAPI.complete(sprintId);
      toast.success('Sprint completed successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete sprint');
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!window.confirm('Are you sure you want to delete this sprint? This action cannot be undone.')) {
      return;
    }

    try {
      await sprintsAPI.delete(sprintId);
      toast.success('Sprint deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete sprint');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'status-todo';
      case 'ACTIVE':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-done';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading sprints...</div>;
  }

  return (
    <div className="sprints-page">
      <div className="sprints-header">
        <div>
          <h1>Sprints</h1>
          <p className="sprints-subtitle">{project?.name}</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate(`/projects/${projectId}/board`)}>
            Board
          </button>
          <button className="btn-secondary" onClick={() => navigate(`/projects/${projectId}/issues`)}>
            Issues
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            Create Sprint
          </button>
        </div>
      </div>

      <div className="sprints-list">
        {sprints.map((sprint) => (
          <div key={sprint.id} className="sprint-card">
            <div className="sprint-card-header">
              <div>
                <h3>{sprint.name}</h3>
                <span className={`status-badge ${getStatusColor(sprint.status)}`}>
                  {sprint.status}
                </span>
              </div>
              <div className="sprint-actions">
                {sprint.status === 'PLANNED' && (
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => handleStartSprint(sprint.id)}
                  >
                    Start Sprint
                  </button>
                )}
                {sprint.status === 'ACTIVE' && (
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => handleCompleteSprint(sprint.id)}
                  >
                    Complete Sprint
                  </button>
                )}
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleOpenModal(sprint)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger btn-sm"
                  onClick={() => handleDeleteSprint(sprint.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {sprint.goal && (
              <div className="sprint-goal">
                <strong>Goal:</strong> {sprint.goal}
              </div>
            )}

            <div className="sprint-details">
              <div className="sprint-detail-item">
                <span className="detail-label">Start Date:</span>
                <span>{sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="sprint-detail-item">
                <span className="detail-label">End Date:</span>
                <span>{sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="sprint-detail-item">
                <span className="detail-label">Issues:</span>
                <span>{sprint._count?.issues || 0}</span>
              </div>
            </div>
          </div>
        ))}

        {sprints.length === 0 && (
          <div className="empty-state">
            <p>No sprints yet. Create your first sprint to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSprint ? 'Edit Sprint' : 'Create New Sprint'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Sprint Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Sprint 1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="goal">Sprint Goal</label>
                <textarea
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="What do you want to achieve in this sprint?"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingSprint ? 'Update Sprint' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sprints;
