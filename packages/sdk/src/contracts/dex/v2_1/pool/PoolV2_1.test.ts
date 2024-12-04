import { describe, expect, it } from "vitest";

import { BasePoolV2_1 } from "./BasePoolV2_1";
import { CPIPoolV2_1 } from "./CPIPoolV2_1";
import { PoolV2_1 } from "./PoolV2_1";
import { StablePoolV2_1 } from "./StablePoolV2_1";

const POOL_ADDRESS = "kQDZVuwLe9I6XjZrnm3txQyEHuV5RcwlSRVHpqiutLsw6HR7";

describe("PoolV2_1", () => {
  it("should extends BasePoolV2_1", () => {
    const Pool = PoolV2_1.create(POOL_ADDRESS);

    expect(Pool).toBeInstanceOf(BasePoolV2_1);
  });

  describe("CPI", () => {
    it("should be instance of CPIPoolV2_1", () => {
      const Pool = PoolV2_1.CPI.create(POOL_ADDRESS);

      expect(Pool).toBeInstanceOf(CPIPoolV2_1);
    });
  });

  describe("Stable", () => {
    it("should be instance of StablePoolV2_1", () => {
      const Pool = PoolV2_1.Stable.create(POOL_ADDRESS);

      expect(Pool).toBeInstanceOf(StablePoolV2_1);
    });
  });
});
