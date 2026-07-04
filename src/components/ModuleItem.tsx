'use client';

import { useState } from 'react';
import type { Module } from '@/types';
import { formatMinutes } from '@/lib/time';

interface Props {
  mod: Module;
  missionId: number;
  onToggle: (missionId: number, moduleId: number) => void;
  onDelete: (missionId: number, moduleId: number, title: string) => void;
}

export function ModuleItem({ mod, missionId, onToggle, onDelete }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="module-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <label className="module-label">
        <input
          type="checkbox"
          checked={mod.done}
          onChange={() => onToggle(missionId, mod.id)}
          className="checkbox"
        />
        <span className={mod.done ? 'module-name done' : 'module-name'}>
          {mod.name}
        </span>
      </label>
      {mod.link && (
        <a
          className="module-link"
          href={mod.link}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
        >
          Open
        </a>
      )}
      <span className="module-duration">{formatMinutes(mod.durationMinutes)}</span>
      <button
        className="delete-btn"
        style={{ opacity: hovered ? 1 : 0 }}
        onClick={() => onDelete(missionId, mod.id, mod.name)}
        aria-label={`Delete ${mod.name}`}
      >
        ✕
      </button>
    </div>
  );
}
