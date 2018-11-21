# meta-errors

Custom error types for Node.js that include additional metadata for purposes of documentation

```js
const { registry, ErrorRegistry, createErrorType } = require("@loke/errors");
const assert = require("assert");
registry.typePrefix = "https://abc.com/errors/";

const altRegistry = new ErrorRegistry({
  name: "alt",
  typePrefix: "https://xyz.com/errors/"
});

class ErrorA extends registry.BaseError {
  static get code() {
    return "error_a";
  }
  static get help() {
    return `This is just an example.

Add multi-line text here.`;
  }
}
registry.register(ErrorA);

const ErrorB = createErrorType({
  name: "ErrorB",
  code: "error_b",
  help: "Desc",
  constructor: function Xyz() {
    console.log("THROWING ERROR B");
  }
});

const ErrorC = createErrorType({
  name: "ErrorB",
  code: "error_b",
  help: "Desc",
  constructor: function Xyz(message, x) {
    this.x = x;
  },
  registry: altRegistry
});

new ErrorA();
new ErrorA();
const errb = new ErrorB("HELLO");
/*
THROWING ERROR B
*/
const errc = new ErrorC("TEST", 123);

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

assert.strictEqual(errb.toString(), "ErrorB: HELLO");
assert.strictEqual(
  JSON.stringify(errb),
  '{"message":"HELLO","type":"https://abc.com/errors/error_b"}'
);

assert.strictEqual(
  JSON.stringify(errc),
  '{"message":"TEST","type":"https://xyz.com/errors/error_b","x":123}'
);

const client = require("prom-client");
assert.strictEqual(
  client.register.metrics(),
  `# HELP errors_thrown Count of number times an error is thrown
# TYPE errors_thrown counter
errors_thrown{registry="default",type="ErrorA"} 2
errors_thrown{registry="default",type="ErrorB"} 1
errors_thrown{registry="alt",type="ErrorB"} 1
`
);
/*
# HELP errors_thrown Count of number times an error is thrown
# TYPE errors_thrown counter
errors_thrown{registry="test1",type="ErrorA"} 2
errors_thrown{registry="test1",type="ErrorB"} 1
*/

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
```
