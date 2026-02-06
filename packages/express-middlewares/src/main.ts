export const sub = (a: number | MyNumber, b: number | MyNumber): number => {
  if (a instanceof MyNumber) {
    a = a.x;
  }
  if (b instanceof MyNumber) {
    b = b.x;
  }
  return a - b;
};

export class MyNumber {
  x: number;

  constructor(x = 0) {
    this.x = x;
  }
}
