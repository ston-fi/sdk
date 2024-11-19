import { describe, expect, it } from "vitest";

import { createSbtDestroyMessage } from "./createSbtDestroyMessage";

describe("createSbtDestroyMessage", () => {
  it("should create message", async () => {
    const message = await createSbtDestroyMessage();

    expect(message.toBoc().toString("base64")).toMatchInlineSnapshot(
      '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAAAOpSrEg="',
    );
  });

  it("should create message when queryId is defined", async () => {
    const queryId = 12345;

    const message = await createSbtDestroyMessage({
      queryId,
    });

    expect(message.toBoc().toString("base64")).toMatchInlineSnapshot(
      '"te6cckEBAQEADgAAGB8EU3oAAAAAAAAwORTSs0A="',
    );
  });
});
