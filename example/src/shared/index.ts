export * from "./constants";
export * from "./types";

export async function delay<RESULT>(
  milliseconds: number,
  returnValue: RESULT,
): Promise<RESULT> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(returnValue);
    }, milliseconds);
  });
}
