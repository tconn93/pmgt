import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { Project } from '../types';

const ProjectSettings: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', key: '', description: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      const data = await projectsAPI.getById(projectId);
      setProject(data);
      setFormData({
        name: data.name,
        key: data.key,
        description: data.description || ''
      });
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    try {
      await projectsAPI.update(projectId, formData);
      toast.success('Project updated successfully');
      navigate('/projects');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;

    try {
      await projectsAPI.delete(projectId);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete project');
    }
  };

  if (loading) {
    return <div className="loading">Loading project settings...</div>;
  }

  if (!project) {
    return <div className="loading">Project not found</div>;
  }

  return (
    <div className="project-settings-page">
      <div className="settings-header">
        <div>
          <h1>Project Settings</h1>
          <p className="settings-subtitle">{project.name}</p>
        </div>
        <button
          className="btn-secondary"
          onClick={() => navigate('/projects')}
        >
          Back to Projects
        </button>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>General Information</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label htmlFor="name">Project Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., My Awesome Project"
              />
            </div>
            <div className="form-group">
              <label htmlFor="key">Project Key *</label>
              <input
                type="text"
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                required
                placeholder="e.g., MAP"
                maxLength={10}
              />
              <small>2-10 characters, used in issue IDs</small>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project"
                rows={4}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>

        <div className="settings-section danger-zone">
          <h2>Danger Zone</h2>
          <div className="danger-zone-content">
            <div className="danger-zone-info">
              <h3>Delete Project</h3>
              <p>
                Once you delete a project, there is no going back. This will permanently delete
                the project, all its issues, sprints, and comments. Please be certain.
              </p>
            </div>
            <button
              className="btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Project?</h2>
            <p>
              Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone.
              All issues, sprints, and comments will be permanently deleted.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
              >
                Yes, Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSettings;
