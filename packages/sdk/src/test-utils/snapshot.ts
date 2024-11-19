import {
  type Address,
  Cell,
  type ContractProvider,
  TonClient,
  type TupleItem,
  TupleReader,
  openContract,
} from "@ton/ton";
import { vi } from "vitest";

import { createMockObj } from "./createMockObj";

type SnapshotItem =
  | {
      type: "cell" | "number";
      data: string;
    }
  | {
      type: "null";
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

  null(): Snapshot {
    this.items.push({ type: "null" });
    return this;
  }

  async toTupleReader() {
    return {
      gas_used: 0,
      stack: new TupleReader(
        this.items.map((item) => {
          switch (item.type) {
            case "cell":
              return { type: "cell", cell: Cell.fromBase64(item.data) };
            case "number":
              return { type: "int", value: BigInt(item.data) };
            case "null":
              return { type: "null" };
          }
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

export function createPrintableProvider(
  options: { testnet?: boolean } | { endpoint: string } = {},
) {
  const client = new TonClient(
    "endpoint" in options
      ? { endpoint: options.endpoint }
      : {
          endpoint: options.testnet
            ? "https://testnet.toncenter.com/api/v2/jsonRPC"
            : "https://toncenter.com/api/v2/jsonRPC",
        },
  );

  return createPrintableProviderImpl({ address: undefined, client });
}

function createPrintableProviderImpl(options: {
  address: Address | undefined;
  client: TonClient;
}): ContractProvider {
  return createMockObj<ContractProvider>({
    get: vi.fn().mockImplementation(async (method, data) => {
      if (!options.address)
        throw new Error(`Unexpected undefined address: ${method}`);

      const provider = options.client.provider(options.address);
      const result = await provider.get(method, data);
      const items: TupleItem[] = [];

      // console.log(`${options.address} ${method}`);
      // console.log("const snapshot = createProviderSnapshot()");
      // while (result.stack.remaining > 0) {
      //   const item = result.stack.pop();
      //   items.push(item);

      //   if (item.type === "cell") {
      //     console.log("  .cell(");
      //     console.log(`    "${item.cell.toBoc().toString("base64")}"`);
      //     console.log(`  )${result.stack.remaining === 0 ? ";" : ""}`);
      //   } else if (item.type === "int") {
      //     console.log("  .number(");
      //     console.log(`    "${item.value}"`);
      //     console.log(`  )${result.stack.remaining === 0 ? ";" : ""}`);
      //   } else if (item.type === "null") {
      //     console.log(`  .null()${result.stack.remaining === 0 ? ";" : ""}`);
      //   } else {
      //     console.log("Unexpected tuple item:", item);
      //   }
      // }

      return {
        ...result,
        stack: new TupleReader(items),
      };
    }),
    open: vi.fn().mockImplementation((contract) => {
      return openContract(contract, (params) => {
        return createPrintableProviderImpl({
          address: params.address,
          client: options.client,
        });
      });
    }),
  });
}
