import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { projectsAPI, issuesAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { Project, Issue, IssueStatus } from '../types';
import IssueCard from '../components/IssueCard';
import Column from '../components/Column';
import CreateIssueModal from '../components/CreateIssueModal';
import IssueDetailModal from '../components/IssueDetailModal';
import ProjectMembersModal from '../components/ProjectMembersModal';

const STATUSES: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

const Board: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadIssues();
    }
  }, [projectId]);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    // If not dropped over anything, cancel
    if (!over) return;

    const issueId = active.id as string;
    let newStatus: IssueStatus | null = null;

    // Check if dropped directly on a column (over.id is a status)
    if (STATUSES.includes(over.id as IssueStatus)) {
      newStatus = over.id as IssueStatus;
    } else {
      // Dropped on an issue card, find that issue's status
      const targetIssue = issues.find((i) => i.id === over.id);
      if (targetIssue) {
        newStatus = targetIssue.status;
      }
    }

    // If we couldn't determine a valid status, cancel the drag
    if (!newStatus) return;

    const issue = issues.find((i) => i.id === issueId);

    // If issue not found or status unchanged, do nothing
    if (!issue || issue.status === newStatus) return;

    // Optimistic update
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
    );

    try {
      await issuesAPI.update(issueId, { status: newStatus });
      toast.success('Issue updated');
    } catch (error) {
      toast.error('Failed to update issue');
      loadIssues();
    }
  };

  const getIssuesByStatus = (status: IssueStatus) => {
    return issues.filter((issue) => issue.status === status);
  };

  const activeIssue = issues.find((issue) => issue.id === activeId);

  if (loading) {
    return <div className="loading">Loading board...</div>;
  }

  return (
    <div className="board-page">
      <div className="board-header">
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
            onClick={() => navigate(`/projects/${projectId}/issues`)}
          >
            List View
          </button>
          <button className="btn-secondary" onClick={() => navigate(`/projects/${projectId}/sprints`)}>Sprints</button>
<button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            Create Issue
          </button>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns">
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              issues={getIssuesByStatus(status)}
              onIssueClick={setSelectedIssue}
            />
          ))}
        </div>

        <DragOverlay>
          {activeIssue && <IssueCard issue={activeIssue} />}
        </DragOverlay>
      </DndContext>

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

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdate={loadIssues}
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

export default Board;
