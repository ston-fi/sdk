import { Address } from "@ton/ton";

export function setup() {
  // @ts-expect-error - we are defining a new method on the prototype
  // that doesn't exist on the original class
  // This is needed for correct Address presentation in snapshots
  Address.prototype.toJSON = function () {
    return this.toString();
  };
}

export { createMockObj } from "./createMockObj";
export {
  createProviderSnapshot,
  createMockProvider,
  createMockProviderFromSnapshot,
} from "./snapshot";
