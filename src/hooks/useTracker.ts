'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Mission, MissionStats, TimeStats } from '@/types';

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export function useTracker() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    try {
      const data = await apiFetch<Mission[]>('/api/missions');
      setMissions(data);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMissions(); }, [fetchMissions]);

  // ── Missions ───────────────────────────────────────────────────────────────

  const addMission = useCallback(async (title: string) => {
    const created = await apiFetch<Mission>('/api/missions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    setMissions(prev => [...prev, created]);
  }, []);

  const deleteMission = useCallback(async (id: number) => {
    await apiFetch(`/api/missions/${id}`, { method: 'DELETE' });
    setMissions(prev => prev.filter(m => m.id !== id));
  }, []);

  // ── Modules ────────────────────────────────────────────────────────────────

  const addModule = useCallback(async (missionId: number, name: string, durationMinutes: number) => {
    const created = await apiFetch<Mission['modules'][number]>(
      `/api/missions/${missionId}`,
      { method: 'POST', body: JSON.stringify({ name, durationMinutes }) }
    );
    setMissions(prev =>
      prev.map(m => m.id === missionId ? { ...m, modules: [...m.modules, created] } : m)
    );
  }, []);

  const toggleModule = useCallback(async (missionId: number, moduleId: number) => {
    // Optimistic update
    setMissions(prev => prev.map(m =>
      m.id !== missionId ? m : {
        ...m,
        modules: m.modules.map(mod =>
          mod.id === moduleId ? { ...mod, done: !mod.done } : mod
        ),
      }
    ));
    try {
      await apiFetch(`/api/modules/${moduleId}/toggle`, { method: 'PATCH' });
    } catch {
      // Revert on failure
      setMissions(prev => prev.map(m =>
        m.id !== missionId ? m : {
          ...m,
          modules: m.modules.map(mod =>
            mod.id === moduleId ? { ...mod, done: !mod.done } : mod
          ),
        }
      ));
    }
  }, []);

  const deleteModule = useCallback(async (missionId: number, moduleId: number) => {
    await apiFetch(`/api/modules/${moduleId}`, { method: 'DELETE' });
    setMissions(prev =>
      prev.map(m =>
        m.id !== missionId ? m : {
          ...m,
          modules: m.modules.filter(mod => mod.id !== moduleId),
        }
      )
    );
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const overallStats: MissionStats = (() => {
    const total = missions.reduce((acc, m) => acc + m.modules.length, 0);
    const done  = missions.reduce((acc, m) => acc + m.modules.filter(mod => mod.done).length, 0);
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  })();

  const timeStats: TimeStats = (() => {
    const modules = missions.flatMap(mission => mission.modules);
    const totalMinutes = modules.reduce((acc, mod) => acc + mod.durationMinutes, 0);
    const finishedMinutes = modules.reduce(
      (acc, mod) => mod.done ? acc + mod.durationMinutes : acc,
      0
    );

    return { totalMinutes, finishedMinutes, remainingMinutes: totalMinutes - finishedMinutes };
  })();

  const getMissionStats = (mission: Mission): MissionStats => {
    const total = mission.modules.length;
    const done  = mission.modules.filter(m => m.done).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  return {
    missions,
    loading,
    error,
    overallStats,
    timeStats,
    getMissionStats,
    addMission,
    deleteMission,
    addModule,
    toggleModule,
    deleteModule,
    refresh: fetchMissions,
  };
}
