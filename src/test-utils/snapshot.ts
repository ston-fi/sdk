import { vi } from "vitest";
import {
  TupleReader,
  Cell,
  openContract,
  type Address,
  type ContractProvider,
} from "@ton/ton";

import { createMockObj } from "@/test-utils/createMockObj";

type SnapshotItem = {
  type: "cell" | "number";
  data: string;
};

class Snapshot {
  items: Array<SnapshotItem> = [];

  cell(base64: string): Snapshot {
    this.items.push({ type: "cell", data: base64 });
    return this;
  }

  number(number: string): Snapshot {
    this.items.push({ type: "number", data: number });
    return this;
  }

  async toTupleReader() {
    return {
      gas_used: 0,
      stack: new TupleReader(
        this.items.map((item) => {
          return item.type === "cell"
            ? { type: "cell", cell: Cell.fromBase64(item.data) }
            : { type: "int", value: BigInt(item.data) };
        }),
      ),
    };
  }
}

export function createProviderSnapshot() {
  return new Snapshot();
}

export function createMockProvider() {
  return createMockProviderFromSnapshotImpl({
    address: undefined,
    snapshot: () => {
      throw new Error(
        "Unexpected get method call. Use provider with snapshot instead.",
      );
    },
  });
}

export function createMockProviderFromSnapshot(
  snapshot: ((address: string, method: string) => Snapshot) | Snapshot,
) {
  return createMockProviderFromSnapshotImpl({
    address: undefined,
    snapshot,
  });
}

function createMockProviderFromSnapshotImpl(options: {
  address: Address | undefined;
  snapshot: ((address: string, method: string) => Snapshot) | Snapshot;
}): ContractProvider {
  return createMockObj<ContractProvider>({
    get: vi.fn().mockImplementation(async (method) => {
      if (options.address) {
        const snapshot =
          options.snapshot instanceof Snapshot
            ? options.snapshot
            : options.snapshot(options.address.toString(), method);

        if (snapshot) return snapshot.toTupleReader();
      }

      throw new Error(`Unexpected runMethod: ${options.address}, ${method}`);
    }),
    open: vi.fn().mockImplementation((contract) => {
      return openContract(contract, (params) => {
        return createMockProviderFromSnapshotImpl({
          address: params.address,
          snapshot: options.snapshot,
        });
      });
    }),
  });
}
