import assert from "node:assert/strict";
import test from "node:test";
import { getTelephonyProvider, isAgentPhoneTelephony } from "./provider.js";

const originalProvider = process.env.TELEPHONY_PROVIDER;

test.after(() => {
  if (originalProvider === undefined) {
    delete process.env.TELEPHONY_PROVIDER;
  } else {
    process.env.TELEPHONY_PROVIDER = originalProvider;
  }
});

test("getTelephonyProvider defaults to agentphone", () => {
  delete process.env.TELEPHONY_PROVIDER;
  assert.equal(getTelephonyProvider(), "agentphone");
  assert.equal(isAgentPhoneTelephony(), true);
});

test("getTelephonyProvider returns legacy for legacy alias values", () => {
  for (const value of ["legacy", "twilio", "retell"]) {
    process.env.TELEPHONY_PROVIDER = value;
    assert.equal(getTelephonyProvider(), "legacy");
    assert.equal(isAgentPhoneTelephony(), false);
  }
});

test("getTelephonyProvider is case-insensitive", () => {
  process.env.TELEPHONY_PROVIDER = "AGENTPHONE";
  assert.equal(getTelephonyProvider(), "agentphone");
});
