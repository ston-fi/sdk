/**
 * Convert bigint with specified decimals to string-representation of number
 *
 * analog of `fromNano` function from @ton/core package, but with custom decimals count
 *
 * @see [implementation by viem.](https://github.com/wevm/viem/blob/71a4e7aca259f0565005929d6584dca87bd59807/src/utils/unit/formatUnits.ts#L16)
 */
export function fromUnits(value: bigint, decimals = 9) {
  let display = value.toString();

  const negative = display.startsWith("-");
  if (negative) display = display.slice(1);

  display = display.padStart(decimals, "0");

  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals),
  ];
  fraction = fraction.replace(/(0+)$/, "");
  return `${negative ? "-" : ""}${integer || "0"}${
    fraction ? `.${fraction}` : ""
  }`;
}
