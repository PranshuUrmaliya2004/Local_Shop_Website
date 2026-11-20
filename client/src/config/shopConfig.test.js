import test from "node:test";
import assert from "node:assert/strict";

import { shopConfig } from "./shopConfig.js";

test("shop configuration exposes a shop name", () => {
  assert.equal(typeof shopConfig.name, "string");
  assert.ok(shopConfig.name.length > 0);
});
