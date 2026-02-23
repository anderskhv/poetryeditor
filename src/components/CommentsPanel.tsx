import { useState } from 'react';
import './CommentsPanel.css';
import type { PoemComment } from '../utils/poemComments';

interface CommentsPanelProps {
  comments: PoemComment[];
  onResolve: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, text: string) => void;
  onJump: (comment: PoemComment) => void;
}

export function CommentsPanel({ comments, onResolve, onDelete, onEdit, onJump }: CommentsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const active = comments.filter(comment => !comment.resolved);
  const resolved = comments.filter(comment => comment.resolved);

  const startEdit = (comment: PoemComment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      onEdit(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="comments-panel">
      <div className="comments-panel-header">
        <h3>Comments</h3>
        <span className="comments-count">{active.length}</span>
      </div>

      {active.length === 0 && (
        <div className="comments-empty">No comments yet.</div>
      )}

      {active.map((comment, idx) => (
        <div key={comment.id} className="comment-card">
          <div className="comment-card-meta">
            <span className="comment-index">C{idx + 1}</span>
            <span className="comment-date">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          {comment.quote && (
            <div className="comment-quote">&ldquo;{comment.quote}&rdquo;</div>
          )}
          {editingId === comment.id ? (
            <div className="comment-edit">
              <textarea
                className="comment-edit-input"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                autoFocus
                rows={3}
              />
              <div className="comment-actions">
                <button onClick={saveEdit} className="comment-action">Save</button>
                <button onClick={cancelEdit} className="comment-action">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="comment-text">{comment.text}</div>
              <div className="comment-actions">
                <button onClick={() => onJump(comment)} className="comment-action">
                  Jump
                </button>
                <button onClick={() => startEdit(comment)} className="comment-action">
                  Edit
                </button>
                <button onClick={() => onResolve(comment.id)} className="comment-action">
                  Resolve
                </button>
                <button onClick={() => onDelete(comment.id)} className="comment-action danger">
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {resolved.length > 0 && (
        <div className="comments-resolved">
          <div className="comments-resolved-title">Resolved</div>
          {resolved.map((comment) => (
            <div key={comment.id} className="comment-card resolved">
              <div className="comment-card-meta">
                <span className="comment-index">C</span>
                <span className="comment-date">
                  {comment.resolvedAt ? new Date(comment.resolvedAt).toLocaleDateString() : 'Resolved'}
                </span>
              </div>
              <div className="comment-text">{comment.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
