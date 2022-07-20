import assert from "assert";
import { register } from "prom-client";
import { registry, ErrorRegistry, createErrorType, registerMetrics } from "..";

registry.typePrefix = "https://abc.com/errors/";
registerMetrics(register);

const altRegistry = new ErrorRegistry({
  name: "alt",
  typePrefix: "https://xyz.com/errors/",
});

// class ErrorA extends BaseError {
//   static get code() {
//     return "error_a";
//   }
//   static get help() {
//     return `This is just an example.

// Add multi-line text here.`;
//   }
// }
// registry.register(ErrorA);

const ErrorB = createErrorType({
  name: "ErrorB",
  code: "error_b",
  help: "Desc",
});

const ErrorC = createErrorType<{ x: number }>({
  name: "ErrorC",
  code: "error_c",
  help: "Desc",
  registry: altRegistry,
});

const ErrorD = createErrorType({
  code: "error_d",
  namespace: "mynamespace",
  help: "Desc",
});

// new ErrorA();
// new ErrorA();
const errb = new ErrorB("HELLO");
/*
THROWING ERROR B
*/
const errc = new ErrorC("TEST", { x: 123 });
const errd = new ErrorD();

console.log(errb);
/*
{ ErrorB: HELLO
    at Object.<anonymous> (/Users/den/Development/loke/meta-errors/example.js:43:14)
    at Module._compile (internal/modules/cjs/loader.js:689:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:700:10)
    at Module.load (internal/modules/cjs/loader.js:599:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:538:12)
    at Function.Module._load (internal/modules/cjs/loader.js:530:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:742:12)
    at startup (internal/bootstrap/node.js:266:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:596:3) message: 'HELLO', type: 'https://abc.co
*/

console.log(errd);

assert.strictEqual(errb.toString(), "ErrorB: HELLO");
assert.strictEqual(
  JSON.stringify(errb),
  '{"message":"HELLO","type":"https://abc.com/errors/error_b"}'
);

assert.strictEqual(
  JSON.stringify(errc),
  '{"message":"TEST","type":"https://xyz.com/errors/error_c","x":123}'
);

console.log(register.metrics());
assert.strictEqual(
  register.metrics(),
  `# HELP errors_total Count of number times an error is thrown
# TYPE errors_total counter
errors_total{namespace="default",type="error_a"} 2
errors_total{namespace="default",type="https://abc.com/errors/error_b"} 1
errors_total{namespace="default",type="https://xyz.com/errors/error_c"} 1
errors_total{namespace="mynamespace",type="https://abc.com/errors/error_d"} 1
`
);

console.log(registry.getMeta());
/*
[ { name: 'ErrorA',
    code: 'error_a',
    type: 'https://xyz.com/errors/error_a',
    description: 'This is just an example.\n\nAdd multi-line text here.' },
  { name: 'ErrorB',
    code: 'error_b',
    type: 'https://xyz.com/errors/error_b',
    description: 'Another example' } ]
*/
