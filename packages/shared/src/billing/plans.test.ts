import assert from "node:assert/strict";
import test from "node:test";
import { PLAN_LIMITS } from "./plans.js";

const DB_PLAN_LIMITS = {
  FREE: { sms_sent: 50, voice_minutes: 0, customers_imported: 100 },
  STARTER: { sms_sent: 500, voice_minutes: 60, customers_imported: 1000 },
  GROWTH: { sms_sent: 2000, voice_minutes: 300, customers_imported: 5000 },
  ENTERPRISE: { sms_sent: null, voice_minutes: null, customers_imported: null },
} as const;

test("PLAN_LIMITS matches plan_limit_config migration seed", () => {
  for (const plan of Object.keys(DB_PLAN_LIMITS) as Array<keyof typeof DB_PLAN_LIMITS>) {
    assert.deepEqual(PLAN_LIMITS[plan], DB_PLAN_LIMITS[plan]);
  }
});
