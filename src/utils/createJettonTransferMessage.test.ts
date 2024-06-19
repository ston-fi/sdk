import { address, beginCell } from "@ton/ton";
import { describe, it, expect } from "vitest";

import { createJettonTransferMessage } from "./createJettonTransferMessage";

describe("createJettonTransferMessage", () => {
  const queryId = 1;
  const amount = BigInt("1000000000");
  const destination = "EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v";
  const forwardTonAmount = BigInt("500000000");

  it("should create message with expected content with all required fields", async () => {
    const message = await createJettonTransferMessage({
      queryId,
      amount,
      destination,
      forwardTonAmount,
    });

    expect(message.toBoc().toString("base64")).toMatchInlineSnapshot(
      '"te6cckEBAQEAOQAAbQ+KfqUAAAAAAAAAAUO5rKAIAO7Eyy3LJcL20B6gGHPOj2ztGS08kfMOd+6a9Oz0lICyEHc1lAGwz8AH"',
    );
  });

  const customPayload = beginCell().storeUint(1, 32).endCell();

  it("should create message with expected content when customPayload is defined", async () => {
    const message = await createJettonTransferMessage({
      queryId,
      amount,
      destination,
      forwardTonAmount,
      customPayload,
    });

    expect(message.toBoc().toString("base64")).toMatchInlineSnapshot(
      '"te6cckEBAgEAQAABbQ+KfqUAAAAAAAAAAUO5rKAIAO7Eyy3LJcL20B6gGHPOj2ztGS08kfMOd+6a9Oz0lICyUHc1lAEBAAgAAAABFDJIHA=="',
    );
  });

  const forwardPayload = beginCell().storeUint(2, 32).endCell();

  it("should create message with expected content when forwardPayload is defined", async () => {
    const message = await createJettonTransferMessage({
      queryId,
      amount,
      destination,
      forwardTonAmount,
      forwardPayload,
    });

    expect(message.toBoc().toString("base64")).toMatchInlineSnapshot(
      '"te6cckEBAgEAQAABbQ+KfqUAAAAAAAAAAUO5rKAIAO7Eyy3LJcL20B6gGHPOj2ztGS08kfMOd+6a9Oz0lICyEHc1lAMBAAgAAAAC4lvH+Q=="',
    );
  });

  const responseDestination = address(
    "EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i",
  );

  it("should create message with expected content when responseDestination is defined", async () => {
    const message = await createJettonTransferMessage({
      queryId,
      amount,
      destination,
      forwardTonAmount,
      responseDestination,
    });

    expect(message.toBoc().toString("base64")).toMatchInlineSnapshot(
      '"te6cckEBAQEAWgAAsA+KfqUAAAAAAAAAAUO5rKAIAO7Eyy3LJcL20B6gGHPOj2ztGS08kfMOd+6a9Oz0lICzAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaCDuaygBjL74c"',
    );
  });

  it("should create message with expected content when all fields are defined", async () => {
    const message = await createJettonTransferMessage({
      queryId,
      amount,
      destination,
      forwardTonAmount,
      responseDestination,
      customPayload,
      forwardPayload,
    });

    expect(message.toBoc().toString("base64")).toMatchInlineSnapshot(
      '"te6cckEBAwEAaAACsA+KfqUAAAAAAAAAAUO5rKAIAO7Eyy3LJcL20B6gGHPOj2ztGS08kfMOd+6a9Oz0lICzAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKDuaygEBAgAIAAAAAQAIAAAAAiWo6pY="',
    );
  });
});
