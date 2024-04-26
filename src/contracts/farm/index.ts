import { FarmNftMinterV1 } from "./v1/FarmNftMinterV1";
import { FarmNftItemV1 } from "./v1/FarmNftItemV1";
import { FarmNftMinterV2 } from "./v2/FarmNftMinterV2";
import { FarmNftItemV2 } from "./v2/FarmNftItemV2";
import { FarmNftMinterV3 } from "./v3/FarmNftMinterV3";
import { FarmNftItemV3 } from "./v3/FarmNftItemV3";

import { FARM_VERSION } from "./constants";

export { FARM_OP_CODES, FARM_VERSION } from "./constants";

export const FARM = {
  [FARM_VERSION.v1]: {
    NftMinter: FarmNftMinterV1,
    NftItem: FarmNftItemV1,
  },
  [FARM_VERSION.v2]: {
    NftMinter: FarmNftMinterV2,
    NftItem: FarmNftItemV2,
  },
  [FARM_VERSION.v3]: {
    NftMinter: FarmNftMinterV3,
    NftItem: FarmNftItemV3,
  },
} as const;
