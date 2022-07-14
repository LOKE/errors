import test from "ava";
import { inspect } from "util";
import { createErrorType, createSimpleErrorType, registry } from "./index";
import { LokeError } from "./types";

registry.typePrefix = "https://example.com/errors/";

interface ErrorAMeta {
  /** A number */
  a: number;
  /** A string */
  b: string;
}
const ErrorA = createErrorType<ErrorAMeta>({
  message: "This is error A",
  name: "ErrorA",
  code: "error_a",
  help: "Error a help",
});
const ExposedError = createErrorType({
  name: "ExposedError",
  code: "exposed",
  help: "Exposed help",
  expose: true,
});
const NamespaceError = createErrorType({
  name: "NamespaceError",
  code: "namespaced",
  help: "Exposed help",
  namespace: "mystuff",
});
const StackFreeError = createSimpleErrorType({
  name: "StackFreeError",
  code: "stack_free",
  help: "No stack trace here",
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

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties
console.log(String(new ErrorA("hi", { a: 1, b: "s" })));
console.log(JSON.stringify(new ErrorA("hi", { a: 1, b: "s" })));

test("default message", (t) => {
  const err = new ErrorA();
  t.is(err.message, "This is error A");
});
test("custom message", (t) => {
  const err = new ErrorA("Custom message");
  t.is(err.message, "Custom message");
});
test("instance ID on each message", (t) => {
  const err = new ErrorA();
  t.is(typeof err.instance, "string");
  t.is(err.instance.length, 26);
});
test("toString includes instance", (t) => {
  const err = new ErrorA("Custom message.");
  t.is(err.toString(), `ErrorA: Custom message. [${err.instance}]`);
});
test("util.inspect includes instance", (t) => {
  // Note: test will be flakey in different node versions
  const err = new ErrorA("Custom message.");
  t.true(inspect(err).indexOf(`instance: '${err.instance}'`) > 0, inspect(err));
});
test("type", (t) => {
  const err = new ErrorA();
  t.is(err.type, "https://example.com/errors/error_a");
  t.is(
    JSON.stringify(err),
    `{"message":"This is error A","instance":"${err.instance}","code":"error_a","type":"https://example.com/errors/error_a"}`
  );
});
test("code", (t) => {
  const err = new ErrorA();
  t.is(err.code, "error_a");
});
test("expose", (t) => {
  const err = new ExposedError();
  t.is(err.expose, true);
});
test("namespace", (t) => {
  const err = new NamespaceError();
  t.is(err.namespace, "mystuff", "Namespace should be exposed");
  t.is(
    err.type,
    "https://example.com/errors/mystuff/namespaced",
    "Namespace should be included in the type"
  );
  t.is(
    JSON.stringify(err),
    `{"message":"Error","instance":"${err.instance}","code":"namespaced","namespace":"mystuff","type":"https://example.com/errors/mystuff/namespaced"}`
  );
});
test("meta", (t) => {
  const err = new ErrorA("With meta", { a: 1, b: "two words" });
  t.is(err.a, 1);
  t.is(err.b, "two words");
  t.is(err.toString(), `ErrorA: With meta [${err.instance}] a=1 b="two words"`);
  t.is(
    JSON.stringify(err),
    `{"message":"With meta","instance":"${err.instance}","code":"error_a","type":"https://example.com/errors/error_a","a":1,"b":"two words"}`
  );
});
test("stack trace", (t) => {
  const err: LokeError = t.throws(() => stack1()) as any;
  t.regex(
    err.stack,
    /ErrorA: This is error A\n    at null.stackFinal .+\n    at null.stack2 .+\n    at null.stack1/
  );
});
test("stack trace free", (t) => {
  const err = new StackFreeError("My message.");
  t.is(
    (err as any).stack,
    `StackFreeError: My message. [${(err as any).instance}]`
  );
});
