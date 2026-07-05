'use client';

import { useState } from 'react';
import type { Mission, MissionStats } from '@/types';
import { ModuleItem } from './ModuleItem';
import { ProgressBar } from './ProgressBar';
import { AddModuleForm } from './AddModuleForm';
import { formatTime } from '@/lib/time';

interface Props {
  mission: Mission;
  stats: MissionStats;
  onAddModule: (missionId: number, name: string, durationMinutes: number, link?: string) => Promise<void>;
  onToggleModule: (missionId: number, moduleId: number) => void;
  onDeleteModule: (missionId: number, moduleId: number, title: string) => void;
  onDeleteMission: (courseId: number, id: number, title: string) => void;
}

export function MissionCard({
  mission, stats, onAddModule, onToggleModule, onDeleteModule, onDeleteMission,
}: Props) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [hovering, setHovering] = useState(false);
  const complete = stats.done === stats.total && stats.total > 0;
  const missionTime = mission.modules.reduce((acc, mod) => acc + mod.durationMinutes, 0);

  return (
    <div className={`mission-card ${complete ? 'complete' : ''}`}>
      <div
        className="mission-header"
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="mission-header-left">
          <span className="chevron" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            &rsaquo;
          </span>
          <span className={`mission-title ${complete ? 'complete' : ''}`}>
            {mission.title}
          </span>
        </div>

        <div className="mission-header-right">
          <span className="time-pill">{formatTime(missionTime)}</span>
          <div className="mini-progress">
            <ProgressBar pct={stats.pct} size="sm" />
          </div>
          <span className="badge">{stats.done}/{stats.total}</span>
          <button
            className="delete-btn"
            style={{ opacity: hovering ? 1 : 0 }}
            onClick={e => { e.stopPropagation(); onDeleteMission(mission.courseId, mission.id, mission.title); }}
            aria-label="Delete mission"
          >
            x
          </button>
        </div>
      </div>

      {open && (
        <div className="modules-list">
          {mission.modules.length === 0 && (
            <p className="empty-hint">No modules yet - add one below.</p>
          )}
          {mission.modules.map(mod => (
            <ModuleItem
              key={mod.id}
              mod={mod}
              missionId={mission.id}
              onToggle={onToggleModule}
              onDelete={onDeleteModule}
            />
          ))}

          {adding ? (
            <div style={{ padding: '8px 16px' }}>
              <AddModuleForm
                onSubmit={async (name, durationMinutes, link) => {
                  await onAddModule(mission.id, name, durationMinutes, link);
                  setAdding(false);
                }}
                onCancel={() => setAdding(false)}
              />
            </div>
          ) : (
            <button className="add-module-btn" onClick={() => setAdding(true)}>
              + Add module
            </button>
          )}
        </div>
      )}
    </div>
  );
}
