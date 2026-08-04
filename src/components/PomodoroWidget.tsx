"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TimerMode = "focus" | "break";
type TimerStatus = "idle" | "running" | "paused" | "finished";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

function formatCountdown(seconds: number) {
  const clamped = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(clamped / 60);
  const remainingSeconds = clamped % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function getModeSeconds(mode: TimerMode) {
  return mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
}

function ringTimer() {
  const AudioContextCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextCtor) return;

  const audioContext = new AudioContextCtor();
  const now = audioContext.currentTime;
  const notes = [880, 660, 880];

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = now + index * 0.28;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.22, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.24);
  });

  window.setTimeout(() => void audioContext.close(), 1200);
}

export function PomodoroWidget() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_SECONDS);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [minimized, setMinimized] = useState(true);
  const [sessionsDone, setSessionsDone] = useState(0);
  const originalTitle = useRef<string | null>(null);

  const modeLabel = mode === "focus" ? "Focus" : "Break";
  const timeLabel = useMemo(
    () => formatCountdown(remainingSeconds),
    [remainingSeconds],
  );

  useEffect(() => {
    originalTitle.current = document.title;

    return () => {
      if (originalTitle.current) {
        document.title = originalTitle.current;
      }
    };
  }, []);

  useEffect(() => {
    if (!originalTitle.current) return;

    if (status === "running") {
      document.title = `${timeLabel} ${modeLabel} | ${originalTitle.current}`;
    } else {
      document.title = originalTitle.current;
    }
  }, [modeLabel, status, timeLabel]);

  useEffect(() => {
    if (status !== "running" || endAt === null) return;

    const tick = () => {
      const nextRemaining = Math.max(0, (endAt - Date.now()) / 1000);
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0) {
        setStatus("finished");
        setEndAt(null);
        setRemainingSeconds(0);
        if (mode === "focus") {
          setSessionsDone((count) => count + 1);
        }
        ringTimer();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 500);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [endAt, mode, status]);

  const start = () => {
    setStatus("running");
    setEndAt(Date.now() + remainingSeconds * 1000);
  };

  const pause = () => {
    if (endAt !== null) {
      setRemainingSeconds(Math.max(0, (endAt - Date.now()) / 1000));
    }
    setStatus("paused");
    setEndAt(null);
  };

  const reset = (nextMode = mode) => {
    setMode(nextMode);
    setStatus("idle");
    setRemainingSeconds(getModeSeconds(nextMode));
    setEndAt(null);
  };

  const switchMode = () => {
    reset(mode === "focus" ? "break" : "focus");
  };

  const startNext = () => {
    const nextMode = mode === "focus" ? "break" : "focus";
    setMode(nextMode);
    setStatus("running");
    setRemainingSeconds(getModeSeconds(nextMode));
    setEndAt(Date.now() + getModeSeconds(nextMode) * 1000);
  };

  return (
    <aside
      className={`pomodoro-widget ${minimized ? "minimized" : "expanded"} ${status === "finished" ? "finished" : ""}`}
      aria-label="Pomodoro timer"
    >
      <button
        className="pomodoro-compact"
        onClick={() => setMinimized((value) => !value)}
        aria-expanded={!minimized}
      >
        <span className="pomodoro-dot" />
        <span className="pomodoro-mode">{modeLabel}</span>
        <strong>{timeLabel}</strong>
      </button>

      {!minimized && (
        <div className="pomodoro-panel">
          <div className="pomodoro-panel-header">
            <div>
              <span>{modeLabel}</span>
              <strong>{timeLabel}</strong>
            </div>
            <button
              className="pomodoro-icon-btn"
              onClick={() => setMinimized(true)}
              aria-label="Minimize timer"
            >
              -
            </button>
          </div>

          <div className="pomodoro-track" aria-hidden="true">
            <span
              style={{
                width: `${100 - (remainingSeconds / getModeSeconds(mode)) * 100}%`,
              }}
            />
          </div>

          <div className="pomodoro-actions">
            {status === "running" ? (
              <button className="btn-primary" onClick={pause}>
                Pause
              </button>
            ) : status === "finished" ? (
              <button className="btn-primary" onClick={startNext}>
                Next
              </button>
            ) : (
              <button className="btn-primary" onClick={start}>
                Start
              </button>
            )}
            <button className="btn-ghost" onClick={() => reset()}>
              Reset
            </button>
            <button className="btn-ghost" onClick={switchMode}>
              {mode === "focus" ? "Break" : "Focus"}
            </button>
          </div>

          <div className="pomodoro-meta">
            <span>{sessionsDone} done</span>
            <span>{status === "finished" ? "Finished" : status}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
