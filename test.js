import test from "ava";

const { createErrorType, registry } = require("./index");
registry.typePrefix = "https://example.com/errors/";

const ErrorA = createErrorType({
  message: "This is error A",
  name: "ErrorA",
  code: "error_a",
  help: "Error a help"
});
const ExposedError = createErrorType({
  name: "ExposedError",
  code: "exposed",
  help: "Exposed help",
  expose: true
});
const NamespaceError = createErrorType({
  name: "NamespaceError",
  code: "namespaced",
  help: "Exposed help",
  namespace: "mystuff"
});

function stack1() {
  stack2();
}

function stack2() {
  stackFinal();
}

function stackFinal() {
  throw new ErrorA();
}

test("default message", t => {
  const err = new ErrorA();
  t.is(err.message, "This is error A");
});
test("custom message", t => {
  const err = new ErrorA("Custom message");
  t.is(err.message, "Custom message");
});
test("instance ID on each message", t => {
  const err = new ErrorA();
  t.is(typeof err.instance, "string");
  t.is(err.instance.length, 26);
});
test("type", t => {
  const err = new ErrorA();
  t.is(err.type, "https://example.com/errors/error_a");
});
test("code", t => {
  const err = new ErrorA();
  t.is(err.code, "error_a");
});
test("expose", t => {
  const err = new ExposedError();
  t.is(err.expose, true);
});
test("namespace", t => {
  const err = new NamespaceError();
  t.is(err.namespace, "mystuff");
});
test("stack trace", t => {
  const err = t.throws(() => stack1());
  t.regex(
    err.stack,
    /ErrorA: This is error A\n    at stackFinal .+\n    at stackFinal .+\n    at stack2 .+\n    at stack1 .+\n    at coreAssert.throws/
  );
});
