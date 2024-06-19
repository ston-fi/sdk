import { PtonV1 } from "./v1/PtonV1";
import { pTON_VERSION } from "./constants";

export { pTON_VERSION } from "./constants";

export const pTON = {
  [pTON_VERSION.v1]: PtonV1,
};
