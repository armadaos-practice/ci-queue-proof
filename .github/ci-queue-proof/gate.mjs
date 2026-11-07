import { pathToFileURL } from "node:url";

const EVENT_MANDATORY = Object.freeze({
  pull_request: Object.freeze(["cheap"]),
  merge_group: Object.freeze(["full"]),
});

export function evaluateGate({ eventName, results, extraRequired = [] }) {
  const eventRequired = EVENT_MANDATORY[eventName];
  if (!eventRequired) {
    return { ok: false, failures: [`unsupported event: ${eventName || "<missing>"}`] };
  }

  const required = [...eventRequired, ...extraRequired];
  const failures = [];
  for (const job of required) {
    if (!Object.hasOwn(results, job)) {
      failures.push(`${job}: missing`);
      continue;
    }

    const result = results[job]?.result;
    if (result !== "success") {
      failures.push(`${job}: ${result || "missing-result"}`);
    }
  }

  return { ok: failures.length === 0, failures };
}

function parseJson(name, fallback) {
  const value = process.env[name];
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${name} is not valid JSON: ${error.message}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const verdict = evaluateGate({
      eventName: process.env.GATE_EVENT,
      results: parseJson("GATE_RESULTS", {}),
      extraRequired: parseJson("GATE_EXTRA_REQUIRED", []),
    });
    if (!verdict.ok) {
      console.error(`QUEUE_GATE_REFUSED ${verdict.failures.join(", ")}`);
      process.exitCode = 1;
    } else {
      console.log(`QUEUE_GATE_PASS event=${process.env.GATE_EVENT}`);
    }
  } catch (error) {
    console.error(`QUEUE_GATE_ERROR ${error.message}`);
    process.exitCode = 1;
  }
}
