'use client';

import { useState } from 'react';
import { useTracker } from '@/hooks/useTracker';
import { MissionCard } from '@/components/MissionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { AddForm } from '@/components/AddForm';
import { ConfirmModal } from '@/components/ConfirmModal';
import { formatMinutes } from '@/lib/time';

export default function Home() {
  const {
    missions, loading, error,
    overallStats, timeStats, getMissionStats,
    addMission, deleteMission,
    addModule, toggleModule, deleteModule,
  } = useTracker();

  const [addingMission, setAddingMission] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<
    | { type: 'mission'; missionId: number; title: string }
    | { type: 'module'; missionId: number; moduleId: number; title: string }
    | null
  >(null);

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    if (pendingDelete.type === 'mission') {
      await deleteMission(pendingDelete.missionId);
    } else {
      await deleteModule(pendingDelete.missionId, pendingDelete.moduleId);
    }

    setPendingDelete(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading your progress...
      </div>
    );
  }

  return (
    <main className="page">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button className="btn-ghost" style={{ padding: '4px 10px' }} onClick={() => location.reload()}>
            Retry
          </button>
        </div>
      )}

      <section className={`stats-section ${statsOpen ? '' : 'collapsed'}`}>
        <div className="stats-container" hidden={!statsOpen}>
          <div className="overall-card">
            <div className="overall-row">
              <span className="overall-label">Overall progress</span>
              <span className="overall-pct">{overallStats.pct}%</span>
            </div>
            <ProgressBar pct={overallStats.pct} />
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-num">{overallStats.done}</span>
                <span className="stat-lbl">Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{overallStats.total - overallStats.done}</span>
                <span className="stat-lbl">Remaining</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{missions.length}</span>
                <span className="stat-lbl">Missions</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{overallStats.total}</span>
                <span className="stat-lbl">Total modules</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{formatMinutes(timeStats.totalMinutes)}</span>
                <span className="stat-lbl">Total time</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{formatMinutes(timeStats.finishedMinutes)}</span>
                <span className="stat-lbl">Finished time</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{formatMinutes(timeStats.remainingMinutes)}</span>
                <span className="stat-lbl">Remaining time</span>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon">%</div>
              <div className="stat-card-content">
                <div className="stat-card-value">{Math.round(overallStats.pct)}%</div>
                <div className="stat-card-label">Complete</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">F</div>
              <div className="stat-card-content">
                <div className="stat-card-value">{formatMinutes(timeStats.finishedMinutes)}</div>
                <div className="stat-card-label">Finished time</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">T</div>
              <div className="stat-card-content">
                <div className="stat-card-value">{formatMinutes(timeStats.totalMinutes)}</div>
                <div className="stat-card-label">Total time</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">R</div>
              <div className="stat-card-content">
                <div className="stat-card-value">{formatMinutes(timeStats.remainingMinutes)}</div>
                <div className="stat-card-label">Remaining time</div>
              </div>
            </div>
          </div>
        </div>
        <button
          className="stats-toggle"
          onClick={() => setStatsOpen(open => !open)}
          aria-label={statsOpen ? 'Hide stats' : 'Show stats'}
          aria-expanded={statsOpen}
        >
          <span style={{ transform: statsOpen ? 'rotate(-90deg)' : 'rotate(90deg)' }}>
            &rsaquo;
          </span>
        </button>
      </section>

      <section className="content-section">
        <div className="content-header">
          <h2>Missions</h2>
          <span className="content-count">{missions.length} total</span>
        </div>

        {missions.length === 0 ? (
          <div className="empty-state">
            <p>No missions yet</p>
            <p className="empty-hint">Create your first mission to get started</p>
          </div>
        ) : (
          <div className="missions-container">
            {missions.map(mission => (
              <MissionCard
                key={mission.id}
                mission={mission}
                stats={getMissionStats(mission)}
                onAddModule={addModule}
                onToggleModule={toggleModule}
                onDeleteModule={(missionId, moduleId, title) => {
                  setPendingDelete({ type: 'module', missionId, moduleId, title });
                }}
                onDeleteMission={(missionId, title) => {
                  setPendingDelete({ type: 'mission', missionId, title });
                }}
              />
            ))}
          </div>
        )}

        {addingMission ? (
          <div className="add-mission-form">
            <AddForm
              placeholder="Mission title..."
              onSubmit={async title => { await addMission(title); setAddingMission(false); }}
              onCancel={() => setAddingMission(false)}
            />
          </div>
        ) : (
          <button className="add-mission-btn" onClick={() => setAddingMission(true)}>
            + Add mission
          </button>
        )}
      </section>

      {pendingDelete && (
        <ConfirmModal
          title={`Delete ${pendingDelete.type}?`}
          message={`Are you sure you want to delete "${pendingDelete.title}"? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </main>
  );
}
