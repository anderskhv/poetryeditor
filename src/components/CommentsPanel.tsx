import './CommentsPanel.css';
import type { PoemComment } from '../utils/poemComments';

interface CommentsPanelProps {
  comments: PoemComment[];
  onResolve: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onJump: (comment: PoemComment) => void;
}

export function CommentsPanel({ comments, onResolve, onDelete, onJump }: CommentsPanelProps) {
  const active = comments.filter(comment => !comment.resolved);
  const resolved = comments.filter(comment => comment.resolved);

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
            <div className="comment-quote">“{comment.quote}”</div>
          )}
          <div className="comment-text">{comment.text}</div>
          <div className="comment-actions">
            <button onClick={() => onJump(comment)} className="comment-action">
              Jump
            </button>
            <button onClick={() => onResolve(comment.id)} className="comment-action">
              Resolve
            </button>
            <button onClick={() => onDelete(comment.id)} className="comment-action danger">
              Delete
            </button>
          </div>
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
