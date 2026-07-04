'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Course, Mission, MissionStats, TimeStats } from '@/types';

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

function getModules(courses: Course[]) {
  return courses.flatMap(course => course.missions.flatMap(mission => mission.modules));
}

export function useTracker() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const data = await apiFetch<Course[]>('/api/missions');
      setCourses(data);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const missions = courses.flatMap(course => course.missions);

  const addCourse = useCallback(async (title: string) => {
    const created = await apiFetch<Course>('/api/missions', {
      method: 'POST',
      body: JSON.stringify({ kind: 'course', title }),
    });
    setCourses(prev => [...prev, created]);
    return created;
  }, []);

  const deleteCourse = useCallback(async (id: number) => {
    await apiFetch(`/api/missions/${id}?kind=course`, { method: 'DELETE' });
    setCourses(prev => prev.filter(course => course.id !== id));
  }, []);

  const resetCourse = useCallback(async (courseId: number) => {
    const updated = await apiFetch<Course>(`/api/missions/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify({ kind: 'reset-course' }),
    });
    setCourses(prev => prev.map(course => course.id === courseId ? updated : course));
  }, []);

  const addMission = useCallback(async (courseId: number, title: string) => {
    const created = await apiFetch<Mission>('/api/missions', {
      method: 'POST',
      body: JSON.stringify({ courseId, title }),
    });
    setCourses(prev => prev.map(course =>
      course.id === courseId ? { ...course, missions: [...course.missions, created] } : course
    ));
  }, []);

  const deleteMission = useCallback(async (courseId: number, id: number) => {
    await apiFetch(`/api/missions/${id}`, { method: 'DELETE' });
    setCourses(prev => prev.map(course =>
      course.id === courseId
        ? { ...course, missions: course.missions.filter(mission => mission.id !== id) }
        : course
    ));
  }, []);

  const addModule = useCallback(
    async (missionId: number, name: string, durationMinutes: number, link?: string) => {
      const created = await apiFetch<Mission['modules'][number]>(
        `/api/missions/${missionId}`,
        { method: 'POST', body: JSON.stringify({ name, durationMinutes, link }) }
      );

      setCourses(prev => prev.map(course => ({
        ...course,
        missions: course.missions.map(mission =>
          mission.id === missionId
            ? { ...mission, modules: [...mission.modules, created] }
            : mission
        ),
      })));
    },
    []
  );

  const toggleModule = useCallback(async (missionId: number, moduleId: number) => {
    const toggle = (courseList: Course[]) => courseList.map(course => ({
      ...course,
      missions: course.missions.map(mission =>
        mission.id === missionId
          ? {
              ...mission,
              modules: mission.modules.map(mod =>
                mod.id === moduleId ? { ...mod, done: !mod.done } : mod
              ),
            }
          : mission
      ),
    }));

    setCourses(toggle);
    try {
      await apiFetch(`/api/modules/${moduleId}/toggle`, { method: 'PATCH' });
    } catch {
      setCourses(toggle);
    }
  }, []);

  const deleteModule = useCallback(async (missionId: number, moduleId: number) => {
    await apiFetch(`/api/modules/${moduleId}`, { method: 'DELETE' });
    setCourses(prev => prev.map(course => ({
      ...course,
      missions: course.missions.map(mission =>
        mission.id === missionId
          ? { ...mission, modules: mission.modules.filter(mod => mod.id !== moduleId) }
          : mission
      ),
    })));
  }, []);

  const overallStats: MissionStats = (() => {
    const modules = getModules(courses);
    const done = modules.filter(mod => mod.done).length;
    return { total: modules.length, done, pct: modules.length ? Math.round((done / modules.length) * 100) : 0 };
  })();

  const timeStats: TimeStats = (() => {
    const modules = getModules(courses);
    const totalMinutes = modules.reduce((acc, mod) => acc + mod.durationMinutes, 0);
    const finishedMinutes = modules.reduce((acc, mod) => mod.done ? acc + mod.durationMinutes : acc, 0);

    return { totalMinutes, finishedMinutes, remainingMinutes: totalMinutes - finishedMinutes };
  })();

  const getMissionStats = (mission: Mission): MissionStats => {
    const total = mission.modules.length;
    const done = mission.modules.filter(m => m.done).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  const getCourseStats = (course: Course): MissionStats => {
    const modules = course.missions.flatMap(mission => mission.modules);
    const done = modules.filter(mod => mod.done).length;
    return { total: modules.length, done, pct: modules.length ? Math.round((done / modules.length) * 100) : 0 };
  };

  const getCourseTimeStats = (course: Course): TimeStats => {
    const modules = course.missions.flatMap(mission => mission.modules);
    const totalMinutes = modules.reduce((acc, mod) => acc + mod.durationMinutes, 0);
    const finishedMinutes = modules.reduce((acc, mod) => mod.done ? acc + mod.durationMinutes : acc, 0);

    return { totalMinutes, finishedMinutes, remainingMinutes: totalMinutes - finishedMinutes };
  };

  const isCourseFinished = (course: Course) => {
    const stats = getCourseStats(course);
    return stats.total > 0 && stats.done === stats.total;
  };

  return {
    courses,
    missions,
    loading,
    error,
    overallStats,
    timeStats,
    getCourseStats,
    getCourseTimeStats,
    getMissionStats,
    isCourseFinished,
    addCourse,
    deleteCourse,
    resetCourse,
    addMission,
    deleteMission,
    addModule,
    toggleModule,
    deleteModule,
    refresh: fetchCourses,
  };
}
