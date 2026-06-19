import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { validateAgentPhoneWebhook } from "./validate-webhook.js";

test("validateAgentPhoneWebhook accepts valid signatures", async () => {
  const secret = "whsec_test_secret";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const rawBody = JSON.stringify({ event: "agent.message", channel: "sms" });
  const signedString = `${timestamp}.${rawBody}`;
  const digest = createHmac("sha256", secret).update(signedString).digest("hex");
  const signature = `sha256=${digest}`;

  const valid = await validateAgentPhoneWebhook(rawBody, signature, timestamp, secret);
  assert.equal(valid, true);
});

test("validateAgentPhoneWebhook rejects invalid signatures", async () => {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const rawBody = "{}";

  const valid = await validateAgentPhoneWebhook(
    rawBody,
    "sha256=deadbeef",
    timestamp,
    "whsec_test_secret",
  );

  assert.equal(valid, false);
});

test("validateAgentPhoneWebhook rejects stale timestamps", async () => {
  const secret = "whsec_test_secret";
  const timestamp = String(Math.floor(Date.now() / 1000) - 600);
  const rawBody = "{}";
  const signedString = `${timestamp}.${rawBody}`;
  const digest = createHmac("sha256", secret).update(signedString).digest("hex");

  const valid = await validateAgentPhoneWebhook(
    rawBody,
    `sha256=${digest}`,
    timestamp,
    secret,
  );

  assert.equal(valid, false);
});
