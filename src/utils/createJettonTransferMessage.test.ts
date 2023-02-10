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
  const destination = 'EQDneJ03j4n9vWFwvuEZbt8o_UtoT2A1YPv46-97KXsvWsOZ';
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
      '"te6ccsEBAQEAOQAAAG0Pin6lAAAAAAAAAAFDuaygCAHO8TpvHxP7esLhfcIy3b5R+pbQnsBqwffx1972UvZetBB3NZQBmPapTA=="',
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
      '"te6ccsEBAgEAQAAAOgFtD4p+pQAAAAAAAAABQ7msoAgBzvE6bx8T+3rC4X3CMt2+UfqW0J7AasH38dfe9lL2XrRQdzWUAQEACAAAAAEyCMcv"',
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
      '"te6ccsEBAgEAQAAAOgFtD4p+pQAAAAAAAAABQ7msoAgBzvE6bx8T+3rC4X3CMt2+UfqW0J7AasH38dfe9lL2XrQQdzWUAwEACAAAAALEYUjK"',
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
      '"te6ccsEBAQEAWgAAALAPin6lAAAAAAAAAAFDuaygCAHO8TpvHxP7esLhfcIy3b5R+pbQnsBqwffx1972UvZetQAEJ8S6pV9gesOI0M88z1gPHslmVWQc+mNA//J6AESzmgg7msoA0PJ1JQ=="',
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
      '"te6ccsEBAwEAaAAAXGICsA+KfqUAAAAAAAAAAUO5rKAIAc7xOm8fE/t6wuF9wjLdvlH6ltCewGrB9/HX3vZS9l61AAQnxLqlX2B6w4jQzzzPWA8eyWZVZBz6Y0D/8noARLOaKDuaygEBAgAIAAAAAQAIAAAAAvO/HGA="',
    );
  });
});
