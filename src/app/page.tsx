'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTracker } from '@/hooks/useTracker';
import { MissionCard } from '@/components/MissionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { AddForm } from '@/components/AddForm';
import { ConfirmModal } from '@/components/ConfirmModal';
import { ResetModal } from '@/components/ResetModal';
import { formatMinutes } from '@/lib/time';

export default function Home() {
  const {
    courses, loading, error,
    getCourseStats, getCourseTimeStats, getMissionStats, isCourseFinished,
    addCourse, deleteCourse, resetCourse,
    addMission, deleteMission,
    addModule, toggleModule, deleteModule,
  } = useTracker();

  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [addingCourse, setAddingCourse] = useState(false);
  const [addingMission, setAddingMission] = useState(false);
  const [pendingReset, setPendingReset] = useState<{ courseId: number; title: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<
    | { type: 'course'; courseId: number; title: string }
    | { type: 'mission'; courseId: number; missionId: number; title: string }
    | { type: 'module'; missionId: number; moduleId: number; title: string }
    | null
  >(null);

  useEffect(() => {
    if (!courses.length) {
      setActiveCourseId(null);
      return;
    }

    if (!activeCourseId || !courses.some(course => course.id === activeCourseId)) {
      setActiveCourseId(courses[0].id);
    }
  }, [activeCourseId, courses]);

  const activeCourse = courses.find(course => course.id === activeCourseId) ?? courses[0] ?? null;

  const dashboard = useMemo(() => {
    if (!activeCourse) {
      return { pct: 0, total: 0, done: 0, missionCount: 0, finished: false, finishedMinutes: 0, remainingMinutes: 0 };
    }

    const stats = getCourseStats(activeCourse);
    const time = getCourseTimeStats(activeCourse);

    return {
      pct: stats.pct,
      total: stats.total,
      done: stats.done,
      missionCount: activeCourse.missions.length,
      finished: isCourseFinished(activeCourse),
      finishedMinutes: time.finishedMinutes,
      remainingMinutes: time.remainingMinutes,
    };
  }, [activeCourse, getCourseStats, getCourseTimeStats, isCourseFinished]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    if (pendingDelete.type === 'course') {
      await deleteCourse(pendingDelete.courseId);
    } else if (pendingDelete.type === 'mission') {
      await deleteMission(pendingDelete.courseId, pendingDelete.missionId);
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
    <main className="page dashboard-page">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button className="btn-ghost" style={{ padding: '4px 10px' }} onClick={() => location.reload()}>
            Retry
          </button>
        </div>
      )}

      <section className="dashboard-header">
        <div>
          <h1>Course Dashboard</h1>
          <p>Track every course, mission, and module in one place.</p>
        </div>
        {addingCourse ? (
          <div className="header-form">
            <AddForm
              placeholder="Course title..."
              onSubmit={async title => {
                const course = await addCourse(title);
                setActiveCourseId(course.id);
                setAddingCourse(false);
              }}
              onCancel={() => setAddingCourse(false)}
            />
          </div>
        ) : (
          <button className="btn-primary" onClick={() => setAddingCourse(true)}>
            Add course
          </button>
        )}
      </section>

      <section className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">
            {activeCourse ? `${activeCourse.title} progress` : 'Overall progress'}
          </span>
          <strong>{dashboard.pct}%</strong>
          <ProgressBar pct={dashboard.pct} />
        </div>
        <div className="summary-card">
          <span className="summary-label">Course</span>
          <strong>{activeCourse ? activeCourse.title : '—'}</strong>
          <span className="summary-detail">{dashboard.finished ? 'Finished' : `${courses.length} total courses`}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Missions</span>
          <strong>{dashboard.missionCount}</strong>
          <span className="summary-detail">{dashboard.done}/{dashboard.total} modules</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Time</span>
          <strong>{formatMinutes(dashboard.finishedMinutes)}</strong>
          <span className="summary-detail">{formatMinutes(dashboard.remainingMinutes)} left</span>
        </div>
      </section>

      {courses.length === 0 ? (
        <section className="empty-state">
          <p>No courses yet</p>
          <p className="empty-hint">Create your first course to start adding missions.</p>
        </section>
      ) : (
        <section className="workspace-grid">
          <aside className="course-sidebar">
            <div className="content-header sidebar-header">
              <h2>Courses</h2>
              <span className="content-count">{courses.length} total</span>
            </div>
            <div className="course-list">
              {courses.map(course => {
                const stats = getCourseStats(course);
                const finished = isCourseFinished(course);

                return (
                  <button
                    key={course.id}
                    className={`course-list-item ${activeCourse?.id === course.id ? 'active' : ''}`}
                    onClick={() => setActiveCourseId(course.id)}
                  >
                    <span className="course-list-title">
                      {course.title}
                      {finished && <span className="finished-pill">Finished</span>}
                    </span>
                    <span className="course-list-meta">
                      {stats.done}/{stats.total} modules
                    </span>
                    <ProgressBar pct={stats.pct} size="sm" />
                  </button>
                );
              })}
            </div>
          </aside>

          {activeCourse && (
            <section className="course-detail">
              <div className="course-detail-header">
                <div>
                  <div className="course-title-row">
                    <h2>{activeCourse.title}</h2>
                    {isCourseFinished(activeCourse) && <span className="finished-pill">Finished</span>}
                  </div>
                  <p>
                    {activeCourse.missions.length} missions / {getCourseStats(activeCourse).total} modules
                  </p>
                </div>
                <div className="course-actions">
                  <button
                    className="btn-ghost"
                    onClick={() => setPendingReset({ courseId: activeCourse.id, title: activeCourse.title })}
                  >
                    Reset
                  </button>
                  <button
                    className="btn-ghost danger-ghost"
                    onClick={() => setPendingDelete({ type: 'course', courseId: activeCourse.id, title: activeCourse.title })}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="course-progress-block">
                <div className="overall-row">
                  <span className="overall-label">Course progress</span>
                  <span className="overall-pct">{getCourseStats(activeCourse).pct}%</span>
                </div>
                <ProgressBar pct={getCourseStats(activeCourse).pct} />
              </div>

              {activeCourse.missions.length === 0 ? (
                <div className="empty-state small-empty">
                  <p>No missions yet</p>
                  <p className="empty-hint">Add a mission, then add modules inside it.</p>
                </div>
              ) : (
                <div className="missions-container">
                  {activeCourse.missions.map(mission => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      stats={getMissionStats(mission)}
                      onAddModule={addModule}
                      onToggleModule={toggleModule}
                      onDeleteModule={(missionId, moduleId, title) => {
                        setPendingDelete({ type: 'module', missionId, moduleId, title });
                      }}
                      onDeleteMission={(courseId, missionId, title) => {
                        setPendingDelete({ type: 'mission', courseId, missionId, title });
                      }}
                    />
                  ))}
                </div>
              )}

              {addingMission ? (
                <div className="add-mission-form">
                  <AddForm
                    placeholder="Mission title..."
                    onSubmit={async title => {
                      await addMission(activeCourse.id, title);
                      setAddingMission(false);
                    }}
                    onCancel={() => setAddingMission(false)}
                  />
                </div>
              ) : (
                <button className="add-mission-btn" onClick={() => setAddingMission(true)}>
                  + Add mission
                </button>
              )}
            </section>
          )}
        </section>
      )}

      {pendingDelete && (
        <ConfirmModal
          title={`Delete ${pendingDelete.type}?`}
          message={`Are you sure you want to delete "${pendingDelete.title}"? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {pendingReset && (
        <ResetModal
          courseTitle={pendingReset.title}
          onConfirm={async () => {
            await resetCourse(pendingReset.courseId);
            setPendingReset(null);
          }}
          onCancel={() => setPendingReset(null)}
        />
      )}
    </main>
  );
}
