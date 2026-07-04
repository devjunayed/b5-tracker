'use client';

import { useState } from 'react';

interface Props {
  courseTitle: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ResetModal({ courseTitle, onConfirm, onCancel }: Props) {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const canReset = answer.trim().toLowerCase() === 'reset now';

  const handleConfirm = async () => {
    if (!canReset) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="reset-title">Reset course?</h3>
        <p>Type reset now to reset progress for "{courseTitle}".</p>
        <input
          className="add-input reset-input"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="reset now"
          autoFocus
          disabled={loading}
          onKeyDown={e => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') onCancel();
          }}
        />
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn-danger" onClick={handleConfirm} disabled={!canReset || loading}>
            {loading ? 'Resetting...' : 'Reset'}
          </button>
        </div>
      </div>
    </div>
  );
}
