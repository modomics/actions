const analyse = require("../analyse.js");

/** Helper to create mock objects */
function createMocks(overrides = {}) {
  const outputs = {};
  const warnings = [];
  const errors = [];

  return {
    outputs,
    warnings,
    errors,
    core: {
      setOutput: (k, v) => {
        outputs[k] = v;
      },
      warning: (msg, opts) => {
        warnings.push({ msg, ...opts });
      },
      error: (msg, opts) => {
        errors.push({ msg, ...opts });
      },
    },
    exec: {
      getExecOutput: async (cmd, args, opts) => {
        // Default: git shallow check returns false, analysis succeeds
        if (cmd === "git") return { stdout: "false\n", exitCode: 0 };
        return {
          stdout: JSON.stringify({ filesAnalysed: 5 }),
          exitCode: 0,
          ...overrides.execResult,
        };
      },
    },
  };
}

describe("analyse", () => {
  beforeEach(() => {
    process.env.INPUT_PATTERN = "**/*.ts";
    process.env.INPUT_EXCLUDE = "";
    process.env.INPUT_WORKING_DIR = ".";
  });

  it("detects ephemeral mode for pull_request events", async () => {
    const { core, exec, outputs } = createMocks();
    const context = {
      eventName: "pull_request",
      ref: "refs/pull/42/merge",
      repo: { owner: "acme", repo: "app" },
      payload: {
        repository: { default_branch: "main" },
        pull_request: { number: 42 },
      },
    };

    await analyse({ context, core, exec });

    expect(outputs.mode).toBe("ephemeral");
    expect(outputs.files_analysed).toBe(5);
    expect(outputs.run_id).toMatch(/^mdr-\d+-[a-f0-9]{8}$/);
  });

  it("detects canonical mode for default branch push", async () => {
    const { core, exec, outputs } = createMocks();
    const context = {
      eventName: "push",
      ref: "refs/heads/main",
      repo: { owner: "acme", repo: "app" },
      payload: { repository: { default_branch: "main" } },
    };

    await analyse({ context, core, exec });
    expect(outputs.mode).toBe("canonical");
  });

  it("treats feature branch push as ephemeral", async () => {
    const { core, exec, outputs } = createMocks();
    const context = {
      eventName: "push",
      ref: "refs/heads/feat/new-thing",
      repo: { owner: "acme", repo: "app" },
      payload: { repository: { default_branch: "main" } },
    };

    await analyse({ context, core, exec });
    expect(outputs.mode).toBe("ephemeral");
  });

  it("emits MODOMICS_E006 on non-zero exit", async () => {
    const { core, exec, errors } = createMocks({
      execResult: { stdout: "", exitCode: 1 },
    });
    const context = {
      eventName: "push",
      ref: "refs/heads/main",
      repo: { owner: "acme", repo: "app" },
      payload: { repository: { default_branch: "main" } },
    };

    await analyse({ context, core, exec });
    expect(errors).toContainEqual(
      expect.objectContaining({ title: "MODOMICS_E006" }),
    );
  });

  it("warns MODOMICS_W003 when zero files analysed", async () => {
    const { core, exec, warnings } = createMocks({
      execResult: { stdout: JSON.stringify({ filesAnalysed: 0 }), exitCode: 0 },
    });
    const context = {
      eventName: "push",
      ref: "refs/heads/main",
      repo: { owner: "acme", repo: "app" },
      payload: { repository: { default_branch: "main" } },
    };

    await analyse({ context, core, exec });
    expect(warnings).toContainEqual(
      expect.objectContaining({ title: "MODOMICS_W003" }),
    );
  });
});
