"use client";

import { useState } from "react";
import type { Mission, MissionStats } from "@/types";
import { ModuleItem } from "./ModuleItem";
import { ProgressBar } from "./ProgressBar";
import { AddModuleForm } from "./AddModuleForm";
import { getModuleDisplayState } from "@/lib/moduleState";
import { formatTime } from "@/lib/time";

interface Props {
  mission: Mission;
  stats: MissionStats;
  onAddModule: (
    missionId: number,
    name: string,
    durationMinutes: number,
    link?: string,
  ) => Promise<void>;
  onAddSubmodule: (
    missionId: number,
    moduleId: number,
    name: string,
    durationMinutes: number,
    link?: string,
  ) => Promise<void>;
  onToggleModule: (missionId: number, moduleId: number) => void;
  onToggleSubmodule: (
    missionId: number,
    moduleId: number,
    submoduleId: number,
  ) => void;
  onDeleteModule: (missionId: number, moduleId: number, title: string) => void;
  onDeleteSubmodule: (
    missionId: number,
    moduleId: number,
    submoduleId: number,
    title: string,
  ) => void;
  onDeleteMission: (courseId: number, id: number, title: string) => void;
}

export function MissionCard({
  mission,
  stats,
  onAddModule,
  onAddSubmodule,
  onToggleModule,
  onToggleSubmodule,
  onDeleteModule,
  onDeleteSubmodule,
  onDeleteMission,
}: Props) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [hovering, setHovering] = useState(false);
  const complete = stats.done === stats.total && stats.total > 0;
  const missionTime = mission.modules.reduce(
    (acc, mod) => acc + getModuleDisplayState(mod).durationMinutes,
    0,
  );
  const completedTime = mission.modules.reduce(
    (acc, mod) => {
      const state = getModuleDisplayState(mod);

      return acc + (state.done ? state.durationMinutes : 0);
    },
    0,
  );

  const remTime = missionTime - completedTime;

  const [hideCompleted, setHideCompleted] = useState(true);
  const hasSubModule = mission.modules.some((module) => module.submodules.length > 0) || false;
  return (
    <div className={`mission-card ${complete ? "complete" : ""}`}>
      <div
        className="mission-header"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="mission-header-left">
          <span
            className="chevron"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            &rsaquo;
          </span>
          <span className={`mission-title ${complete ? "complete" : ""}`}>
            {mission.title}
          </span>
        </div>

        <div className="mission-header-right">
          
          <span className="time-pill"> {remTime ? formatTime(remTime): "0s"}</span>
          <div className="mini-progress">
            <ProgressBar pct={stats.pct} size="sm" />
          </div>
          <span className="badge">
            {stats.done}/{stats.total}
          </span>
          <button
            className="delete-btn"
            style={{ opacity: hovering ? 1 : 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteMission(mission.courseId, mission.id, mission.title);
            }}
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

          {
            mission.modules.length !== 0 && 
            !hasSubModule && 
          <div className="border-b text-xs border-gray-700 text-right flex justify-between px-4 py-1">
            <p className=" text-(--muted)">
              {hideCompleted ? stats.done : 0} Hidden
            </p>
            <button
              onClick={() =>
                setHideCompleted((hideCompleted) => !hideCompleted)
              }
              className="text-(--muted) cursor-pointer"
            >
              {hideCompleted ? "Show completed" : "Hide completed"}
            </button>
          </div>
          }

          {hideCompleted &&
            !hasSubModule &&
            mission.modules
              .filter((mod) => !mod.done)
              .map((mod) => {
                return (
                  <ModuleItem
                    key={mod.id}
                    mod={mod}
                    missionId={mission.id}
                    onAddSubmodule={onAddSubmodule}
                    onToggle={onToggleModule}
                    onToggleSubmodule={onToggleSubmodule}
                    onDelete={onDeleteModule}
                    onDeleteSubmodule={onDeleteSubmodule}
                  />
                );
              })}
          {!hideCompleted &&
            mission.modules.map((mod) => {
              return (
                <ModuleItem
                  key={mod.id}
                  mod={mod}
                  missionId={mission.id}
                  onAddSubmodule={onAddSubmodule}
                  onToggle={onToggleModule}
                  onToggleSubmodule={onToggleSubmodule}
                  onDelete={onDeleteModule}
                  onDeleteSubmodule={onDeleteSubmodule}
                />
              );
            })}

      
          {hideCompleted &&
            hasSubModule &&
            mission.modules
              .map((mod) => {
                return (
                  <ModuleItem
                    key={mod.id}
                    mod={mod}
                    missionId={mission.id}
                    onAddSubmodule={onAddSubmodule}
                    onToggle={onToggleModule}
                    onToggleSubmodule={onToggleSubmodule}
                    onDelete={onDeleteModule}
                    onDeleteSubmodule={onDeleteSubmodule}
                  />
                );
              })}
          {!hideCompleted &&
            mission.modules.map((mod) => {
              return (
                <ModuleItem
                  key={mod.id}
                  mod={mod}
                  missionId={mission.id}
                  onAddSubmodule={onAddSubmodule}
                  onToggle={onToggleModule}
                  onToggleSubmodule={onToggleSubmodule}
                  onDelete={onDeleteModule}
                  onDeleteSubmodule={onDeleteSubmodule}
                />
              );
            })}

          {adding ? (
            <div className="add-module-form-wrap">
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
