import { expect, test } from "vitest";
import { convertToNumber, splitStringByWordCount } from "./TextModifications";

test("convert text-number to actual number", () => {
  expect(convertToNumber("tre")).toBe(3);
});

test("text-number not exist in numberMap", () => {
  expect(convertToNumber("tress")).toBe(undefined);
});

test("split amount sting in half", () => {
  expect(splitStringByWordCount("1 stk 2 stk")).toStrictEqual([
    "1 stk",
    "2 stk",
  ]);
});
