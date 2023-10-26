export { createJettonTransferMessage } from './createJettonTransferMessage';
export { createSbtDestroyMessage } from './createSbtDestroyMessage';
export { parseAddress } from './parseAddress';
export { parseBoolean } from './parseBoolean';
export { parseString } from './parseString';

import { parseAddress } from './parseAddress';

/** @deprecated Use `parseAddress` instead. */
export const parseAddressFromCell = parseAddress;
