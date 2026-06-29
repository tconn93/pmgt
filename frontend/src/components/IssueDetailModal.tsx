import React, { useState, useEffect } from 'react';
import { issuesAPI, usersAPI } from '../services/api';
import { toast } from 'react-toastify';
//import { useAuth } from '../contexts/AuthContext';
import type { Issue, User, Comment } from '../types';

interface IssueDetailModalProps {
  issue: Issue;
  onClose: () => void;
  onUpdate: () => void;
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issue: initialIssue, onClose, onUpdate }) => {
  const [issue, setIssue] = useState<Issue>(initialIssue);
  const [users, setUsers] = useState<User[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    loadIssueDetails();
    loadUsers();
  }, []);

  const loadIssueDetails = async () => {
    try {
      const data = await issuesAPI.getById(issue.id);
      setIssue(data);
    } catch (error) {
      toast.error('Failed to load issue details');
    }
  };

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleUpdate = async (updates: Partial<Issue>) => {
    try {
      await issuesAPI.update(issue.id, updates);
      toast.success('Issue updated');
      loadIssueDetails();
      onUpdate();
    } catch (error) {
      toast.error('Failed to update issue');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      await issuesAPI.addComment(issue.id, comment);
      setComment('');
      loadIssueDetails();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (!confirm('Are you sure you want to delete this issue?')) return;

    try {
      await issuesAPI.delete(issue.id);
      toast.success('Issue deleted');
      onClose();
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete issue');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large issue-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="issue-type-badge">{issue.type}</span>
            <h2>{issue.title}</h2>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="issue-main">
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={issue.description || ''}
                onChange={(e) => handleUpdate({ description: e.target.value })}
                placeholder="Add a description..."
                rows={5}
              />
            </div>

            <div className="comments-section">
              <h3>Comments</h3>
              <form onSubmit={handleAddComment} className="add-comment">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
                <button type="submit" className="btn-primary" disabled={loading}>
                  Add Comment
                </button>
              </form>

              <div className="comments-list">
                {issue.comments && issue.comments.length > 0 ? (
                  issue.comments.map((c: Comment) => (
                    <div key={c.id} className="comment">
                      <div className="comment-header">
                        <strong>{c.user.name}</strong>
                        <span className="comment-date">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p>{c.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">No comments yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="issue-sidebar">
            <div className="form-group">
              <label>Status</label>
              <select
                value={issue.status}
                onChange={(e) => handleUpdate({ status: e.target.value as any })}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                value={issue.type}
                onChange={(e) => handleUpdate({ type: e.target.value as any })}
              >
                <option value="STORY">Story</option>
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="EPIC">Epic</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={issue.priority}
                onChange={(e) => handleUpdate({ priority: e.target.value as any })}
              >
                <option value="HIGHEST">Highest</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="LOWEST">Lowest</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assignee</label>
              <select
                value={issue.assigneeId || ''}
                onChange={(e) => handleUpdate({ assigneeId: e.target.value || undefined })}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="issue-meta">
              <p><strong>Reporter:</strong> {issue.reporter?.name}</p>
              <p><strong>Created:</strong> {new Date(issue.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(issue.updatedAt).toLocaleDateString()}</p>
            </div>

            <button className="btn-danger" onClick={handleDeleteIssue}>
              Delete Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
