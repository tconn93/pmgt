import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Issue } from '../types';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors: Record<string, string> = {
    HIGHEST: '#ff0000',
    HIGH: '#ff5722',
    MEDIUM: '#ff9800',
    LOW: '#4caf50',
    LOWEST: '#2196f3',
  };

  const typeIcons: Record<string, string> = {
    STORY: '📖',
    TASK: '✓',
    BUG: '🐛',
    EPIC: '⚡',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="issue-card"
      onClick={onClick}
    >
      <div className="issue-card-header">
        <span className="issue-type">{typeIcons[issue.type]}</span>
        <span
          className="issue-priority"
          style={{ backgroundColor: priorityColors[issue.priority] }}
        />
        <span
          className="drag-handle"
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab' }}
        >
          ⋮⋮
        </span>
      </div>
      <div className="issue-card-title">{issue.title}</div>
      <div className="issue-card-footer">
        {issue.assignee && (
          <div className="issue-assignee" title={issue.assignee.name}>
            {issue.assignee.avatar ? (
              <img src={issue.assignee.avatar} alt={issue.assignee.name} />
            ) : (
              <div className="avatar-placeholder">
                {issue.assignee.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
        {issue._count && issue._count.comments > 0 && (
          <span className="comment-count">💬 {issue._count.comments}</span>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
