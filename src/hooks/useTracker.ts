"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Course,
  Mission,
  MissionStats,
  TimeStats,
  Module,
  Submodule,
} from "@/types";
import { getModuleDisplayState } from "@/lib/moduleState";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

function getModules(courses: Course[]) {
  return courses.flatMap((course) =>
    course.missions.flatMap((mission) => mission.modules),
  );
}

export function useTracker() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const data = await apiFetch<Course[]>("/api/missions");
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

  const missions = courses.flatMap((course) => course.missions);

  const getModuleTime = useCallback(
    (module: Mission["modules"][number]) =>
      getModuleDisplayState(module).durationMinutes,
    [],
  );

  const addCourse = useCallback(async (title: string) => {
    const created = await apiFetch<Course>("/api/missions", {
      method: "POST",
      body: JSON.stringify({ kind: "course", title }),
    });
    setCourses((prev) => [...prev, created]);
    return created;
  }, []);

  const deleteCourse = useCallback(async (id: number) => {
    await apiFetch(`/api/missions/${id}?kind=course`, { method: "DELETE" });
    setCourses((prev) => prev.filter((course) => course.id !== id));
  }, []);

  const resetCourse = useCallback(async (courseId: number) => {
    const updated = await apiFetch<Course>(`/api/missions/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify({ kind: "reset-course" }),
    });
    setCourses((prev) =>
      prev.map((course) => (course.id === courseId ? updated : course)),
    );
  }, []);

  const addMission = useCallback(async (courseId: number, title: string) => {
    const created = await apiFetch<Mission>("/api/missions", {
      method: "POST",
      body: JSON.stringify({ courseId, title }),
    });
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? { ...course, missions: [...course.missions, created] }
          : course,
      ),
    );
  }, []);

  const deleteMission = useCallback(async (courseId: number, id: number) => {
    await apiFetch(`/api/missions/${id}`, { method: "DELETE" });
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? {
              ...course,
              missions: course.missions.filter((mission) => mission.id !== id),
            }
          : course,
      ),
    );
  }, []);

  const addModule = useCallback(
    async (
      missionId: number,
      name: string,
      durationMinutes: number,
      link?: string,
    ) => {
      const created = await apiFetch<Module>(`/api/missions/${missionId}`, {
        method: "POST",
        body: JSON.stringify({ name, durationMinutes, link }),
      });

      setCourses((prev) =>
        prev.map((course) => ({
          ...course,
          missions: course.missions.map((mission) =>
            mission.id === missionId
              ? { ...mission, modules: [...mission.modules, created] }
              : mission,
          ),
        })),
      );
    },
    [],
  );

  const addSubmodule = useCallback(
    async (
      missionId: number,
      moduleId: number,
      name: string,
      durationMinutes: number,
      link?: string,
    ) => {
      const created = await apiFetch<Submodule>(
        `/api/modules/${moduleId}/submodules`,
        {
          method: "POST",
          body: JSON.stringify({ name, durationMinutes, link }),
        },
      );

      setCourses((prev) =>
        prev.map((course) => ({
          ...course,
          missions: course.missions.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  modules: mission.modules.map((module) =>
                    module.id === moduleId
                      ? {
                          ...module,
                          submodules: [...module.submodules, created],
                          done: false,
                        }
                      : module,
                  ),
                }
              : mission,
          ),
        })),
      );
    },
    [],
  );

  const toggleModule = useCallback(
    async (missionId: number, moduleId: number) => {
      const toggle = (courseList: Course[]) =>
        courseList.map((course) => ({
          ...course,
          missions: course.missions.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  modules: mission.modules.map((mod) =>
                    mod.id === moduleId ? { ...mod, done: !mod.done } : mod,
                  ),
                }
              : mission,
          ),
        }));

      setCourses(toggle);
      try {
        await apiFetch(`/api/modules/${moduleId}/toggle`, { method: "PATCH" });
      } catch {
        setCourses(toggle);
      }
    },
    [],
  );

  const toggleSubmodule = useCallback(
    async (missionId: number, moduleId: number, submoduleId: number) => {
      const updated = await apiFetch<Submodule>(
        `/api/submodules/${submoduleId}/toggle`,
        {
          method: "PATCH",
        },
      );

      setCourses((prev) =>
        prev.map((course) => ({
          ...course,
          missions: course.missions.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  modules: mission.modules.map((module) =>
                    module.id === moduleId
                      ? {
                          ...module,
                          submodules: module.submodules.map((submodule) =>
                            submodule.id === submoduleId ? updated : submodule,
                          ),
                          done:
                            module.submodules.length > 0
                              ? module.submodules.every((submodule) =>
                                  submodule.id === submoduleId
                                    ? updated.done
                                    : submodule.done,
                                )
                              : module.done,
                        }
                      : module,
                  ),
                }
              : mission,
          ),
        })),
      );
    },
    [],
  );

  const deleteModule = useCallback(
    async (missionId: number, moduleId: number) => {
      await apiFetch(`/api/modules/${moduleId}`, { method: "DELETE" });
      setCourses((prev) =>
        prev.map((course) => ({
          ...course,
          missions: course.missions.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  modules: mission.modules.filter((mod) => mod.id !== moduleId),
                }
              : mission,
          ),
        })),
      );
    },
    [],
  );

  const deleteSubmodule = useCallback(
    async (missionId: number, moduleId: number, submoduleId: number) => {
      await apiFetch(`/api/submodules/${submoduleId}`, { method: "DELETE" });
      setCourses((prev) =>
        prev.map((course) => ({
          ...course,
          missions: course.missions.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  modules: mission.modules.map((module) =>
                    module.id === moduleId
                      ? {
                          ...module,
                          submodules: module.submodules.filter(
                            (submodule) => submodule.id !== submoduleId,
                          ),
                        }
                      : module,
                  ),
                }
              : mission,
          ),
        })),
      );
    },
    [],
  );

  const getModuleFinishedMinutes = useCallback(
    (module: Mission["modules"][number]) => {
      if (module.submodules.length === 0) {
        return module.done ? module.durationMinutes : 0;
      }
      return module.submodules.reduce(
        (acc, submodule) =>
          acc + (submodule.done ? submodule.durationMinutes : 0),
        0,
      );
    },
    [],
  );

  const overallStats: MissionStats = (() => {
    const modules = getModules(courses);
    const done = modules.filter(
      (mod) => getModuleDisplayState(mod).done,
    ).length;
    const totalMinutes = modules.reduce(
      (acc, mod) => acc + getModuleDisplayState(mod).durationMinutes,
      0,
    );
    const finishedMinutes = modules.reduce(
      (acc, mod) => acc + getModuleFinishedMinutes(mod),
      0,
    );
    return {
      total: modules.length,
      done,
      pct: totalMinutes
        ? Math.round((finishedMinutes / totalMinutes) * 100)
        : 0,
    };
  })();

  const timeStats: TimeStats = (() => {
    const modules = getModules(courses);
    const totalMinutes = modules.reduce(
      (acc, mod) => acc + getModuleDisplayState(mod).durationMinutes,
      0,
    );
    const finishedMinutes = modules.reduce(
      (acc, mod) => acc + getModuleFinishedMinutes(mod),
      0,
    );

    return {
      totalMinutes,
      finishedMinutes,
      remainingMinutes: totalMinutes - finishedMinutes,
    };
  })();

  const getMissionStats = (mission: Mission): MissionStats => {
    const total = mission.modules.length;
    const done = mission.modules.filter(
      (m) => getModuleDisplayState(m).done,
    ).length;
    const totalMinutes = mission.modules.reduce(
      (acc, mod) => acc + getModuleDisplayState(mod).durationMinutes,
      0,
    );
    const finishedMinutes = mission.modules.reduce(
      (acc, mod) => acc + getModuleFinishedMinutes(mod),
      0,
    );
    return {
      total,
      done,
      pct: totalMinutes
        ? Math.round((finishedMinutes / totalMinutes) * 100)
        : 0,
    };
  };

  const getCourseStats = (course: Course): MissionStats => {
    const modules = course.missions.flatMap((mission) => mission.modules);
    const done = modules.filter(
      (mod) => getModuleDisplayState(mod).done,
    ).length;
    const totalMinutes = modules.reduce(
      (acc, mod) => acc + getModuleDisplayState(mod).durationMinutes,
      0,
    );
    const finishedMinutes = modules.reduce(
      (acc, mod) => acc + getModuleFinishedMinutes(mod),
      0,
    );
    return {
      total: modules.length,
      done,
      pct: totalMinutes
        ? Math.round((finishedMinutes / totalMinutes) * 100)
        : 0,
    };
  };

  const getCourseTimeStats = (course: Course): TimeStats => {
    const modules = course.missions.flatMap((mission) => mission.modules);
    const totalMinutes = modules.reduce(
      (acc, mod) => acc + getModuleDisplayState(mod).durationMinutes,
      0,
    );
    const finishedMinutes = modules.reduce(
      (acc, mod) => acc + getModuleFinishedMinutes(mod),
      0,
    );

    return {
      totalMinutes,
      finishedMinutes,
      remainingMinutes: totalMinutes - finishedMinutes,
    };
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
    getModuleTime,
    isCourseFinished,
    addCourse,
    deleteCourse,
    resetCourse,
    addMission,
    deleteMission,
    addModule,
    addSubmodule,
    toggleModule,
    toggleSubmodule,
    deleteModule,
    deleteSubmodule,
    refresh: fetchCourses,
  };
}
