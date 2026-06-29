import React, { useState, useEffect } from 'react';
import { projectsAPI, usersAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import type { Project, User, ProjectMember } from '../types';

interface ProjectMembersModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: () => void;
}

const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({ project, onClose, onUpdate }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>(project.members || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      const users = await usersAPI.getAll();
      setAllUsers(users);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const loadProjectDetails = async () => {
    try {
      const updatedProject = await projectsAPI.getById(project.id);
      setMembers(updatedProject.members || []);
    } catch (error) {
      toast.error('Failed to reload members');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    // Check if user is already a member
    if (members.some((m) => m.userId === selectedUserId)) {
      toast.error('User is already a member of this project');
      return;
    }

    setLoading(true);
    try {
      await projectsAPI.addMember(project.id, selectedUserId, selectedRole);
      toast.success('Member added successfully');
      setShowAddForm(false);
      setSelectedUserId('');
      setSelectedRole('MEMBER');
      await loadProjectDetails();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return;
    }

    setLoading(true);
    try {
      await projectsAPI.removeMember(project.id, memberId);
      toast.success('Member removed successfully');
      await loadProjectDetails();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const isCurrentUserAdmin = () => {
    const currentMember = members.find((m) => m.userId === currentUser?.id);
    return currentMember?.role === 'ADMIN' || currentUser?.role === 'ADMIN';
  };

  const getAvailableUsers = () => {
    return allUsers.filter((user) => !members.some((m) => m.userId === user.id));
  };

  const getRoleBadgeClass = (role: string) => {
    if (role === 'ADMIN') return 'role-badge role-admin';
    if (role === 'MEMBER') return 'role-badge role-member';
    return 'role-badge role-viewer';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Project Members</h2>
            <p className="project-name-subtitle">{project.name}</p>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body-single">
          <div className="members-section">
            <div className="members-header">
              <h3>Current Members ({members.length})</h3>
              {isCurrentUserAdmin() && !showAddForm && (
                <button className="btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
                  Add Member
                </button>
              )}
            </div>

            {showAddForm && (
              <div className="add-member-form">
                <h4>Add New Member</h4>
                <form onSubmit={handleAddMember}>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label htmlFor="userId">User</label>
                      <select
                        id="userId"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        required
                      >
                        <option value="">Select a user</option>
                        {getAvailableUsers().map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="role">Role</label>
                      <select
                        id="role"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Member'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="members-list">
              {members.length > 0 ? (
                members.map((member) => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <div className="member-avatar">
                        {member.user.avatar ? (
                          <img src={member.user.avatar} alt={member.user.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="member-details">
                        <div className="member-name">
                          {member.user.name}
                          {member.userId === currentUser?.id && (
                            <span className="you-badge">(You)</span>
                          )}
                        </div>
                        <div className="member-email">{member.user.email}</div>
                      </div>
                    </div>
                    <div className="member-actions">
                      <span className={getRoleBadgeClass(member.role)}>
                        {member.role}
                      </span>
                      {isCurrentUserAdmin() && member.userId !== currentUser?.id && (
                        <button
                          className="btn-remove"
                          onClick={() => handleRemoveMember(member.id, member.user.name)}
                          disabled={loading}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-members">No members yet</div>
              )}
            </div>
          </div>

          <div className="role-descriptions">
            <h4>Role Permissions</h4>
            <div className="role-description-item">
              <strong>Admin:</strong> Full access - can manage members, edit project settings, and delete the project
            </div>
            <div className="role-description-item">
              <strong>Member:</strong> Can create, edit, and delete issues within the project
            </div>
            <div className="role-description-item">
              <strong>Viewer:</strong> Read-only access - can view issues but cannot modify them
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMembersModal;
