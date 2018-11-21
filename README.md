# meta-errors
Custom error types for Node.js that include additional metadata for purposes of documentation

```
const { ErrorRegistry } = require('meta-errors');
const registry = new ErrorRegistry("myservice");

class ErrorExample extends registry.BaseError {
}

ErrorExample.$description = `
`;

err = new ErrorA();

const client = require("prom-client");
console.log(client.register.metrics())

```