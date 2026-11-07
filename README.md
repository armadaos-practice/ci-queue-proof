# ci-queue-proof

A practice repository. It tests one design for a merge queue's required check, using a toy workflow and nothing else.

- A pull request runs only a cheap check.
- The merge queue runs the full check once, on the exact commit it would merge.
- One job that always runs, `Merge Queue Proof Gate (required)`, is the only required check. It fails when a mandatory job failed, was cancelled, is missing, or was skipped when it should have run.

Files:

- `.github/workflows/ci-queue-proof.yml`: the workflow.
- `.github/ci-queue-proof/gate.mjs`: the gate's decision, run by the workflow.
- `.ci-queue-proof-mode`: which fault to plant: `green`, `full-red`, `missing`, `cancelled` or `skipped`.

This repository holds no product code and no secrets, and the workflow names no secret or token. Workflows from outside contributors need approval before they run. It will be archived when the proof is done.
