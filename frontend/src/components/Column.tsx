import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Issue, IssueStatus } from '../types';
import IssueCard from './IssueCard';

interface ColumnProps {
  status: IssueStatus;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
}

const statusLabels: Record<IssueStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const Column: React.FC<ColumnProps> = ({ status, issues, onIssueClick }) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="board-column">
      <div className="column-header">
        <h3>{statusLabels[status]}</h3>
        <span className="issue-count">{issues.length}</span>
      </div>
      <div ref={setNodeRef} className="column-content">
        <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onClick={() => onIssueClick(issue)} />
          ))}
        </SortableContext>
        {issues.length === 0 && (
          <div className="column-empty">No issues</div>
        )}
      </div>
    </div>
  );
};

export default Column;
