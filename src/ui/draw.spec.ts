const roundToHalf = (x: number) => {
  const fraction = x % 1;
  if (fraction < 0.5) {
    return Math.round(x) + 0.5;
  } else {
    return Math.round(x) - 0.5;
  }
};

it("s", () => {
  expect(roundToHalf(0)).toBe(0.5);
  expect(roundToHalf(5)).toBe(5.5);
  expect(roundToHalf(6)).toBe(6.5);
  expect(roundToHalf(6.5)).toBe(6.5);
  expect(roundToHalf(6.56)).toBe(6.5);
  expect(roundToHalf(6.36)).toBe(6.5);
  expect(roundToHalf(6.22)).toBe(6.5);
  expect(roundToHalf(6.8)).toBe(6.5);
  expect(roundToHalf(6.3)).toBe(6.5);
  expect(roundToHalf(7.1)).toBe(7.5);
});
