import { describe, it, expect } from 'vitest';
import TonWeb from 'tonweb';

import { parseAddressFromCell } from './parseAddressFromCell';

describe('parseAddressFromCell', () => {
  it('should parse address from cell', () => {
    const address = new TonWeb.utils.Address(
      '0:779dcc815138d9500e449c5291e7f12738c23d575b5310000f6a253bd607384e',
    );
    const cell = new TonWeb.boc.Cell();

    cell.bits.writeAddress(address);
    expect(parseAddressFromCell(cell)?.toString()).toBe(address.toString());
  });
  it('should return null if could not parse address', () => {
    const cell = new TonWeb.boc.Cell();
    expect(parseAddressFromCell(cell)).toBe(null);
  });
});
