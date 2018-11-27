# @loke/errors

Custom error types for Node.js that include additional metadata for purposes of documentation and metrics

## How To Use

### Basic Use

You will need to create your error types using the library.

```js
const { createErrorType } = require("@loke/errors");
const MyCustomError = createErrorType({
  name: "MyCustomError",
  message: "This is a custom error",
  code: "custom_error",
  help: `Put your long description text here.
This serves as documentation for this error type.
Include examples on how to use this error type here too.

Presentation of the error is up to you, so you might like to use
**Markdown** here too if the intent is to display in the browser.
`
});

// Just throw to use default message
throw new MyCustomError();
// -> MyCustomError: This is a custom error [01CX7CJC5T4S642MH6MJ2WES0B]
// NOTE: unique instance ID is printed at the end of the error

// Or provide a custom message
throw new MyCustomError("So custom right now");
// -> MyCustomError: So custom right now [01CX7CJC5T4S642MH6MJ2WES0B]

// You can provide additional fields as the second arg
const err1 = new MyCustomError("Extra fields", { x: 1, y: "two" });
console.log(err1.x); // -> 1
console.log(err1.y); // -> two

// Message, code, type and any extra fields are included in the JSON
console.log(JSON.stringify(err1));
// -> {"instance","01CX7CJC5T4S642MH6MJ2WES0B","message":"Extra fields","code":"custom_error","type":"custom_error","x":1,"y":"two"}
```

### Types

The error type is based on the code. The intent is for the type to be a URL to make investigating issues from error tracking systems easier.

By convention error types will be prefixed with the repository's `typePrefix` suffixed with the `code`.

If you want to change this convention you can supply a custom `type`, and `code` can be optional.

_NOTE: types are always lower case._

```js
const { createErrorType, registry } = require("@loke/errors");
registry.typePrefix = "https://errors.example.com/";
const MyCustomError = createErrorType({
  name: "MyCustomError",
  message: "This is a custom error",
  code: "custom_error",
  help: "help"
});

const err1 = new MyCustomError();
console.log(err1.code); // -> custom_error
console.log(err1.type); // -> https://errors.example.com/custom_error

const AnotherError = createErrorType({
  name: "AnotherError",
  message: "This is a custom error",
  help: "help",
  type: "https://stuff.com/errors/another_error"
});

const err2 = new AnotherError();
console.log(err2.code); // -> undefined
console.log(err2.type); // -> https://stuff.com/errors/another_error
```

### Namespaces

Namespaces allow you to group errors together, eg by service, source, package, folder.

```js
const { createErrorType } = require("@loke/errors");
const MyCustomError = createErrorType({
  name: "MyCustomError",
  message: "This is a custom error",
  code: "custom_error",
  namespace: "group_a",
  help: "help"
});
const err1 = new MyCustomError();
console.log(err1.namespace); // -> group_a
console.log(JSON.stringify(err1));
// -> {"instance":"01CX7CJC5T4S642MH6MJ2WES0B","message":"This is a custom error","code":"custom_error","namespace":"group_a","type":"custom_error"}
```

### Expose

Expose is a flag to indicate the message is safe to expose to external users/clients.
NOTE: this does not indicate that the message will be helpful to the context of the user.

```js
const { createErrorType } = require("@loke/errors");
const MyCustomError = createErrorType({
  name: "MyCustomError",
  code: "custom_error",
  expose: true,
  help: "help"
});
const err1 = new MyCustomError();
console.log(err1.expose); // -> true
```

### Stack Traces

Stack traces are on by default. You can create error types without stack traces. These errors do _not_ extend from `Error` so `instanceof Error` will not work.

```js
const { createErrorType } = require("@loke/errors");
const NoStack = createErrorType({
  name: "NoStack",
  code: "stack_free",
  stackTrace: false,
  help: "help"
});
const err1 = new NoStack("Message");
console.log(err1.stack); // -> NoStack: Message [01CX7CJC5T4S642MH6MJ2WES0B]
```

> NOTE: to get stack traces on async functions try include [https://github.com/AndreasMadsen/trace](trace) and [https://github.com/AndreasMadsen/clarify](clarify). This has a big performance hit, so only run in development.

## Metrics

Errors created are automatically counted using [prom-client](https://github.com/siimon/prom-client).

You will need to provide your register if you wish these metrics to be usable.

```js
const { createErrorType, registerMetrics, registry } = require("@loke/errors");
registry.typePrefix = "https://errors.example.com/";

const { register } = require("prom-client");
registerMetrics(register);

const MyCustomError = createErrorType({
  name: "MyCustomError",
  message: "This is a custom error",
  code: "custom_error",
  namespace: "group_a",
  help: "help"
});

new MyCustomError();
new MyCustomError();

console.log(register.metrics());
// # HELP errors_total Count of number times an error is thrown
// # TYPE errors_total counter
// errors_total{namespace="group_a",type="https://errors.example.com/custom_error"} 2
```

## Documentation

Each error created is added to the error registry. You can fetch all registered types at any time for the purposes of live documentation.

```js
const { createErrorType, registry } = require("@loke/errors");
registry.typePrefix = "https://abc.com/errors/";
const MyCustomError = createErrorType({
  name: "MyCustomError",
  namespace: "group_a",
  message: "This is a custom error",
  code: "custom_error",
  help: `Put your long description text here.
This serves as documentation for this error type.
Include examples on how to use this error type here too.

Presentation of the error is up to you, so you might like to use
**Markdown** here too if the intent is to display in the browser.
`
});

const AnotherError = createErrorType({
  name: "AnotherError",
  message: "This is a custom error",
  help: "help",
  code: "another_error"
});

console.log(registry.getMeta());
// [ { name: 'MyCustomError',
//     namespace: 'group_a',
//     code: 'custom_error',
//     type: 'https://abc.com/errors/custom_error',
//     help:
//      'Put your long description text here.\nThis serves as documentation for this error type.\nInclude examples on how to use this error type heretoo.\n\nPresentation of the error is up to you, so you might like to use\n**Markdown** here too if the intent is to display in the browser.\n' },
//   { name: 'AnotherError',
//     namespace: undefined,
//     code: 'another_error',
//     type: 'https://abc.com/errors/another_error',
//     help: 'help' } ]
```

## Advanced/Custom Error Types

You can also extend from the BaseError if required.

TBD... see example for now

## Multiple Registries

TBD... see example for now

## Example

```js
const {
  registry,
  ErrorRegistry,
  BaseError,
  createErrorType,
  registerMetrics
} = require("@loke/errors");
registry.typePrefix = "https://abc.com/errors/";

const { register } = require("prom-client");
registerMetrics(register);

const assert = require("assert");

const altRegistry = new ErrorRegistry({
  name: "alt",
  typePrefix: "https://xyz.com/errors/"
});

class ErrorA extends BaseError {
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
  help: "Desc"
});

const ErrorC = createErrorType({
  name: "ErrorC",
  code: "error_c",
  help: "Desc",
  registry: altRegistry
});

const ErrorD = createErrorType({
  code: "error_d",
  namespace: "mynamespace",
  help: "Desc"
});

new ErrorA();
new ErrorA();
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
```
