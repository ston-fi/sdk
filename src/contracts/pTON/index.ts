import { PtonV1 } from "./v1/PtonV1";
import { PtonV2 } from "./v2/PtonV2";
import { pTON_VERSION } from "./constants";

export { pTON_VERSION } from "./constants";

export const pTON = {
  [pTON_VERSION.v1]: PtonV1,
  [pTON_VERSION.v2]: PtonV2,
};
