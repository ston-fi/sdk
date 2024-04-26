import TonWeb from "tonweb";
import { describe, it, expect } from "vitest";

import { parseBoolean } from "./parseBoolean";

describe("parseBoolean", () => {
  it("should return true for truthy values", () => {
    expect(parseBoolean(new TonWeb.utils.BN(-1))).toBe(true);
  });

  it("should return false for falsy values ", () => {
    expect(parseBoolean(new TonWeb.utils.BN(0))).toBe(false);
  });
});
