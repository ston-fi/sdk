import { FARM as FARMv1 } from "./v1";
import { FARM as FARMv2 } from "./v2";
import { FARM as FARMv3 } from "./v3";
import { FARM_VERSION } from "./constants";

export { FARM_VERSION } from "./constants";

export const FARM = {
  [FARM_VERSION.v1]: FARMv1,
  [FARM_VERSION.v2]: FARMv2,
  [FARM_VERSION.v3]: FARMv3,
} as const;
