import TonWeb from "tonweb";
import { describe, it, expect } from "vitest";

import { createSbtDestroyMessage } from "./createSbtDestroyMessage";

const {
  utils: { bytesToBase64 },
  boc: { Cell },
} = TonWeb;

describe("createSbtDestroyMessage", () => {
  it("should create message", async () => {
    const message = await createSbtDestroyMessage();

    expect(message).toBeInstanceOf(Cell);
    expect(bytesToBase64(await message.toBoc())).toMatchInlineSnapshot(
      '"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAAAAxk9G9"',
    );
  });

  it("should create message when queryId is defined", async () => {
    const queryId = 12345;

    const message = await createSbtDestroyMessage({
      queryId,
    });

    expect(message).toBeInstanceOf(Cell);
    expect(bytesToBase64(await message.toBoc())).toMatchInlineSnapshot(
      '"te6ccsEBAQEADgAAABgfBFN6AAAAAAAAMDnPE861"',
    );
  });
});
