'use client';

import { useState, useRef, useEffect } from 'react';
import { parseTimeInput } from '@/lib/time';

interface Props {
  onSubmit: (name: string, durationMinutes: number, link?: string) => Promise<void>;
  onCancel: () => void;
}

export function AddModuleForm({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [link, setLink] = useState('');
  const [durationError, setDurationError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const durationMinutes = parseTimeInput(duration);

    if (!trimmedName) return;
    if (durationMinutes === null) {
      setDurationError(true);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(trimmedName, durationMinutes, link.trim() || undefined);
      setName('');
      setDuration('');
      setLink('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-form add-module-form">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Module name..."
        className="add-input"
        disabled={loading}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <input
        type="text"
        value={duration}
        onChange={e => { setDuration(e.target.value); setDurationError(false); }}
        placeholder="1h 2m"
        className={`add-input duration-input ${durationError ? 'error' : ''}`}
        disabled={loading}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <input
        type="url"
        value={link}
        onChange={e => setLink(e.target.value)}
        placeholder="Optional link"
        className="add-input link-input"
        disabled={loading}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <button className="btn-primary" onClick={handleSubmit} disabled={loading || !name.trim()}>
        {loading ? '...' : 'Add'}
      </button>
      <button className="btn-ghost" onClick={onCancel} disabled={loading}>
        Cancel
      </button>
    </div>
  );
}
