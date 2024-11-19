import { beforeAll, describe, expect, it } from "vitest";

import { setup } from "../../../../test-utils";
import { DEX_VERSION } from "../../constants";
import { VaultV2_2 } from "./VaultV2_2";

describe("VaultV2_2", () => {
  beforeAll(setup);

  describe("version", () => {
    it("should have expected static value", () => {
      expect(VaultV2_2.version).toBe(DEX_VERSION.v2_2);
    });
  });
});
