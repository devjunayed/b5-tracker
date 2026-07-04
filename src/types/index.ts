export interface Module {
  id: number;
  missionId: number;
  name: string;
  link: string | null;
  durationMinutes: number;
  done: boolean;
  position: number;
  createdAt: string;
}

export interface Mission {
  id: number;
  courseId: number;
  title: string;
  timeMinutes: number;
  position: number;
  createdAt: string;
  modules: Module[];
}

export interface Course {
  id: number;
  title: string;
  position: number;
  createdAt: string;
  missions: Mission[];
}

export interface MissionStats {
  total: number;
  done: number;
  pct: number;
}

export interface TimeStats {
  totalMinutes: number;
  finishedMinutes: number;
  remainingMinutes: number;
}
