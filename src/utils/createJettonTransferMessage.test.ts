import TonWeb from 'tonweb';
import { describe, it, expect } from 'vitest';

import { createJettonTransferMessage } from './createJettonTransferMessage';

const {
  utils: { BN, bytesToBase64 },
  boc: { Cell },
  Address,
} = TonWeb;

describe('createJettonTransferMessage', () => {
  const queryId = 1;
  const amount = new BN(1000000000);
  const destination = 'EQB3YmWW5ZLhe2gPUAw550e2doyWnkj5hzv3TXp2ekpAWe7v';
  const forwardTonAmount = new BN(500000000);

  it('should create message with expected content with all required fields', async () => {
    const message = await createJettonTransferMessage({
      queryId,
      amount,
      destination,
      forwardTonAmount,
    });

    expect(message).toBeInstanceOf(Cell);
    expect(bytesToBase64(await message.toBoc())).toMatchInlineSnapshot(
      '"te6ccsEBAQEAOQAAAG0Pin6lAAAAAAAAAAFDuaygCADuxMstyyXC9tAeoBhzzo9s7RktPJHzDnfumvTs9JSAshB3NZQBUGLNgw=="',
    );
  });

  const customPayload = new Cell();
  customPayload.bits.writeUint(1, 32);

  it('should create message with expected content when customPayload is defined', async () => {
    const message = await createJettonTransferMessage({
      queryId,
      amount,
      destination,
      forwardTonAmount,
      customPayload,
    });

    expect(message).toBeInstanceOf(Cell);
    expect(bytesToBase64(await message.toBoc())).toMatchInlineSnapshot(
      '"te6ccsEBAgEAQAAAOgFtD4p+pQAAAAAAAAABQ7msoAgA7sTLLcslwvbQHqAYc86PbO0ZLTyR8w537pr07PSUgLJQdzWUAQEACAAAAAHNYDxa"',
    );
  });

  const forwardPayload = new Cell();
  forwardPayload.bits.writeUint(2, 32);

  it('should create message with expected content when forwardPayload is defined', async () => {
    const message = await createJettonTransferMessage({
      queryId,
      amount,
      destination,
      forwardTonAmount,
      forwardPayload,
    });

    expect(message).toBeInstanceOf(Cell);
    expect(bytesToBase64(await message.toBoc())).toMatchInlineSnapshot(
      '"te6ccsEBAgEAQAAAOgFtD4p+pQAAAAAAAAABQ7msoAgA7sTLLcslwvbQHqAYc86PbO0ZLTyR8w537pr07PSUgLIQdzWUAwEACAAAAAI7CbO/"',
    );
  });

  const responseDestination = new Address(
    'EQAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D_8noARLOaB3i',
  );

  it('should create message with expected content when responseDestination is defined', async () => {
    const message = await createJettonTransferMessage({
      queryId,
      amount,
      destination,
      forwardTonAmount,
      responseDestination,
    });

    expect(message).toBeInstanceOf(Cell);
    expect(bytesToBase64(await message.toBoc())).toMatchInlineSnapshot(
      '"te6ccsEBAQEAWgAAALAPin6lAAAAAAAAAAFDuaygCADuxMstyyXC9tAeoBhzzo9s7RktPJHzDnfumvTs9JSAswAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmgg7msoAPPnA8g=="',
    );
  });

  it('should create message with expected content when all fields are defined', async () => {
    const message = await createJettonTransferMessage({
      queryId,
      amount,
      destination,
      forwardTonAmount,
      responseDestination,
      customPayload,
      forwardPayload,
    });

    expect(message).toBeInstanceOf(Cell);
    expect(bytesToBase64(await message.toBoc())).toMatchInlineSnapshot(
      '"te6ccsEBAwEAaAAAXGICsA+KfqUAAAAAAAAAAUO5rKAIAO7Eyy3LJcL20B6gGHPOj2ztGS08kfMOd+6a9Oz0lICzAAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKDuaygEBAgAIAAAAAQAIAAAAAmQoBQo="',
    );
  });
});
