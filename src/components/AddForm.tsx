'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  placeholder: string;
  onSubmit: (value: string) => Promise<void>;
  onCancel: () => void;
}

export function AddForm({ placeholder, onSubmit, onCancel }: Props) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await onSubmit(trimmed);
      setValue('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-form">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="add-input"
        disabled={loading}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <button className="btn-primary" onClick={handleSubmit} disabled={loading || !value.trim()}>
        {loading ? '...' : 'Add'}
      </button>
      <button className="btn-ghost" onClick={onCancel} disabled={loading}>
        Cancel
      </button>
    </div>
  );
}
