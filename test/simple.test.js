// Simple test to check if testing works
const assert = require("assert");

describe("Simple Test", () => {
  it("should pass a basic assertion", () => {
    assert.strictEqual(1 + 1, 2);
  });

  it("should verify string equality", () => {
    assert.strictEqual("hello", "hello");
  });
});
