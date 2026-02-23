// @ts-check
const crypto = require("crypto");
const path = require("path");

/**
 * @param {object} params
 * @param {import("@actions/github").context} params.context
 * @param {import("@actions/core")} params.core
 * @param {import("@actions/exec")} params.exec
 */
module.exports = async function analyse({ context, core, exec }) {
  const runId = `mdr-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  // --- Mode detection ---
  const isPR = ["pull_request", "pull_request_target"].includes(
    context.eventName,
  );
  const isDefault =
    context.ref === `refs/heads/${context.payload.repository.default_branch}`;
  const mode = isPR ? "ephemeral" : isDefault ? "canonical" : "ephemeral";

  // --- Shallow clone warning ---
  try {
    const { stdout } = await exec.getExecOutput("git", [
      "rev-parse",
      "--is-shallow-repository",
    ]);
    if (stdout.trim() === "true") {
      core.warning(
        "Shallow clone detected. Add fetch-depth: 0 to checkout for full churn metrics.",
        { title: "MODOMICS_W002" },
      );
    }
  } catch {
    /* not critical */
  }

  // --- Build CLI arguments ---
  const args = [
    process.env.INPUT_PATTERN,
    "--project",
    `${context.repo.owner}/${context.repo.repo}`,
    "--region",
    process.env.INPUT_REGION,
    "--mode",
    mode,
    "--bundle-output",
    ".modomics-bundle",
    "--ci",
    "--json=receipt"
  ];

  const prNumber = context.payload.pull_request?.number;
  if (prNumber) args.push("--pr", String(prNumber));
  if (process.env.INPUT_EXCLUDE)
    args.push("--exclude", process.env.INPUT_EXCLUDE);

  // --- Execute analysis ---
  const cwd = path.resolve(process.env.INPUT_WORKING_DIR || ".");
  let filesAnalysed = 0;

  const { stdout, exitCode } = await exec.getExecOutput(
    "modomics-analyse",
    args,
    { cwd, ignoreReturnCode: true },
  );

  if (exitCode !== 0) {
    core.error(
      `Analysis failed with exit code ${exitCode}. Check logs above.`,
      { title: "MODOMICS_E006" },
    );
  } else {
    try {
      const data = JSON.parse(stdout);
      filesAnalysed = data.filesAnalysed ?? 0;
    } catch (parseErr) {
      core.warning(`Could not parse analysis output: ${parseErr.message}`);
    }
  }

  if (filesAnalysed === 0) {
    core.warning(
      "No files were analysed. Check pattern and working-directory inputs.",
      { title: "MODOMICS_W003" },
    );
  }

  // --- Set outputs ---
  core.setOutput("run_id", runId);
  core.setOutput("mode", mode);
  core.setOutput("files_analysed", filesAnalysed);
};
