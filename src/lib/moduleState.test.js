const test = require("node:test");
const assert = require("node:assert/strict");
const { getModuleDisplayState } = require("./moduleState.ts");

test("module completion and duration come from submodules when present", () => {
  const module = {
    id: 1,
    missionId: 10,
    name: "Setup",
    link: null,
    durationMinutes: 1200,
    done: false,
    position: 0,
    createdAt: "2024-01-01T00:00:00.000Z",
    submodules: [
      {
        id: 1,
        moduleId: 1,
        name: "Install",
        link: null,
        durationMinutes: 600,
        done: true,
        position: 0,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        moduleId: 1,
        name: "Configure",
        link: null,
        durationMinutes: 300,
        done: true,
        position: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ],
  };

  const state = getModuleDisplayState(module);

  assert.equal(state.done, true);
  assert.equal(state.durationMinutes, 900);
  assert.equal(state.hasSubmodules, true);
});

test("module falls back to its own duration when it has no submodules", () => {
  const module = {
    id: 2,
    missionId: 10,
    name: "Review",
    link: null,
    durationMinutes: 600,
    done: true,
    position: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    submodules: [],
  };

  const state = getModuleDisplayState(module);

  assert.equal(state.done, true);
  assert.equal(state.durationMinutes, 600);
  assert.equal(state.hasSubmodules, false);
});
