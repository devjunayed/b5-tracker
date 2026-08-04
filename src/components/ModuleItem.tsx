"use client";

import { useState } from "react";
import type { Module } from "@/types";
import { getModuleDisplayState } from "@/lib/moduleState";
import { formatTime } from "@/lib/time";
import { ProgressBar } from "./ProgressBar";
import { AddModuleForm } from "./AddModuleForm";

interface Props {
  mod: Module;
  missionId: number;
  onAddSubmodule: (
    missionId: number,
    moduleId: number,
    name: string,
    durationMinutes: number,
    link?: string,
  ) => Promise<void>;
  onToggle: (missionId: number, moduleId: number) => void;
  onToggleSubmodule: (
    missionId: number,
    moduleId: number,
    submoduleId: number,
  ) => void;
  onDelete: (missionId: number, moduleId: number, title: string) => void;
  onDeleteSubmodule: (
    missionId: number,
    moduleId: number,
    submoduleId: number,
    title: string,
  ) => void;
}

export function ModuleItem({
  mod,
  missionId,
  onAddSubmodule,
  onToggle,
  onToggleSubmodule,
  onDelete,
  onDeleteSubmodule,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [addingSubmodule, setAddingSubmodule] = useState(false);
  const displayState = getModuleDisplayState(mod);
  const durationLabel = formatTime(displayState.durationMinutes);
  const submoduleTotal = mod.submodules.length;
  const completedSubmodules = mod.submodules.filter(
    (submodule) => submodule.done,
  ).length;
  const submodulePct = submoduleTotal
    ? Math.round((completedSubmodules / submoduleTotal) * 100)
    : 0;
  const [open, setOpen] = useState(false);
  // const complete = stats.done === stats.total && stats.total > 0;
  const complete = 0;
  return (
    <div
      className="module-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="module-main">
        <span
          onClick={() => setOpen((o) => !o)}
          className="chevron cursor-pointer"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          &rsaquo;
        </span>
        <label className="module-label">
          {submoduleTotal == 0 && (
            <input
              type="checkbox"
              checked={displayState.done}
              onChange={() => {
                if (mod.submodules.length === 0) {
                  onToggle(missionId, mod.id);
                }
              }}
              className="checkbox"
              aria-disabled={mod.submodules.length > 0}
            />
          )}

          {submoduleTotal > 0 ? (
            <span
              onClick={() => setOpen((o) => !o)}
              className={displayState.done ? "module-name done" : "module-name"}
            >
              {mod.name}
            </span>
          ) : (
            <span
              className={displayState.done ? "module-name done" : "module-name"}
            >
              {mod.name}
            </span>
          )}

     
        </label>

        {mod.link && (
          <a
            className="module-link"
            href={mod.link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Open
          </a>
        )}

        {durationLabel ? (
          <span className="module-duration">{durationLabel}</span>
        ) : null}

        {submoduleTotal > 0 && (
          <div className="module-submodule-progress">
            <div className="mini-progress">
              <ProgressBar pct={submodulePct} size="sm" />
            </div>
            <span className="badge">
              {completedSubmodules}/{submoduleTotal}
            </span>
          </div>
        )}

        <button
          className="delete-btn"
          style={{ opacity: hovered ? 1 : 0 }}
          onClick={() => onDelete(missionId, mod.id, mod.name)}
          aria-label={`Delete ${mod.name}`}
        >
          x
        </button>
      </div>

      {mod.submodules.length > 0 && open && (
        <div className="submodule-list">
          {mod.submodules.map((submodule) => (
            <div key={submodule.id} className="submodule-row">
              <label className="submodule-label">
                <input
                  type="checkbox"
                  checked={submodule.done}
                  onChange={() =>
                    onToggleSubmodule(missionId, mod.id, submodule.id)
                  }
                  className="checkbox"
                />
                <span
                  className={
                    submodule.done ? "module-name done" : "module-name"
                  }
                >
                  {submodule.name}
                </span>
              </label>

              {submodule.link && (
                <a
                  className="module-link"
                  href={submodule.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open
                </a>
              )}

              {submodule.durationMinutes > 0 && (
                <span className="module-duration">
                  {formatTime(submodule.durationMinutes)}
                </span>
              )}

              <button
                className="delete-btn submodule-delete-btn"
                onClick={() =>
                  onDeleteSubmodule(
                    missionId,
                    mod.id,
                    submodule.id,
                    submodule.name,
                  )
                }
                aria-label={`Delete ${submodule.name}`}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {addingSubmodule ? (
        <div className="submodule-form">
          <AddModuleForm
            itemLabel="Submodule"
            onSubmit={async (name, durationMinutes, link) => {
              await onAddSubmodule(
                missionId,
                mod.id,
                name,
                durationMinutes,
                link,
              );
              setAddingSubmodule(false);
            }}
            onCancel={() => setAddingSubmodule(false)}
          />
        </div>
      ) : (
        open && (
          <button
            className="add-module-btn submodule-add-btn"
            onClick={() => setAddingSubmodule(true)}
          >
            + Add submodule
          </button>
        )
      )}
    </div>
  );
}
