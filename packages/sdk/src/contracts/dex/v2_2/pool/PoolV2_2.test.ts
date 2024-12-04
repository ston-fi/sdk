import { describe, expect, it } from "vitest";

import { BasePoolV2_2 } from "./BasePoolV2_2";
import { CPIPoolV2_2 } from "./CPIPoolV2_2";
import { PoolV2_2 } from "./PoolV2_2";
import { StablePoolV2_2 } from "./StablePoolV2_2";

const POOL_ADDRESS = "kQDZVuwLe9I6XjZrnm3txQyEHuV5RcwlSRVHpqiutLsw6HR7";

describe("PoolV2_2", () => {
  it("should extends BasePoolV2_2", () => {
    const Pool = PoolV2_2.create(POOL_ADDRESS);

    expect(Pool).toBeInstanceOf(BasePoolV2_2);
  });

  describe("CPI", () => {
    it("should be instance of CPIPoolV2_2", () => {
      const Pool = PoolV2_2.CPI.create(POOL_ADDRESS);

      expect(Pool).toBeInstanceOf(CPIPoolV2_2);
    });
  });

  describe("Stable", () => {
    it("should be instance of StablePoolV2_2", () => {
      const Pool = PoolV2_2.Stable.create(POOL_ADDRESS);

      expect(Pool).toBeInstanceOf(StablePoolV2_2);
    });
  });
});
