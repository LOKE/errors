# meta-errors

Custom error types for Node.js that include additional metadata for purposes of documentation

```
const { ErrorRegistry } = require("@loke/meta-errors");

const registry = new ErrorRegistry({
  name: "test1",
  typePrefix: "https://xyz.com/errors/"
});

class ErrorA extends registry.BaseError {
  static code() {
    return "error_a";
  }
  static description() {
    return `This is just an example.

Add multi-line text here.`;
  }
}

class ErrorB extends registry.BaseError {
  static code() {
    return "error_b";
  }
  static description() {
    return "Another example";
  }
}

registry.register(ErrorA);
registry.register(ErrorB);

err = new ErrorA();
err = new ErrorA();
err = new ErrorB();

const client = require("prom-client");
console.log(client.register.metrics());
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
