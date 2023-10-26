import TonWeb from 'tonweb';
import { describe, it, expect } from 'vitest';

import { parseString } from './parseString';

const {
  boc: { Cell },
} = TonWeb;

describe('parseString', () => {
  it('should parse string from cell', () => {
    const testString = 'test string to parse';
    const cell = new Cell();
    cell.bits.writeString(testString);

    expect(parseString(cell)).toBe(testString);
  });
});
