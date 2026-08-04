import type { Module } from "@/types";

export interface ModuleDisplayState {
  done: boolean;
  durationMinutes: number;
  hasSubmodules: boolean;
}

export function getModuleDisplayState(module: Module): ModuleDisplayState {
  const hasSubmodules = module.submodules.length > 0;

  if (!hasSubmodules) {
    return {
      done: module.done,
      durationMinutes: module.durationMinutes,
      hasSubmodules: false,
    };
  }

  const submoduleCount = module.submodules.length;
  const completedSubmodules = module.submodules.filter(
    (submodule) => submodule.done,
  ).length;
  const durationMinutes = module.submodules.reduce(
    (total, submodule) => total + submodule.durationMinutes,
    0,
  );



  return {
    done: completedSubmodules > 0 && completedSubmodules === submoduleCount,
    durationMinutes,
    hasSubmodules: true,
  };
}
