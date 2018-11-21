const { ExtendableError } = require("./types");
const client = require("prom-client");
const counter = new client.Counter({
  name: "errors_thrown",
  help: "Count of number times an error is thrown",
  labelNames: ["registry", "type"]
});

class ErrorRegistry {
  constructor(args) {
    const { name, typePrefix = "", debug = false } = args;
    const registry = this;
    this.name = name;
    this.typePrefix = typePrefix;
    this.debug = debug;
    this.registered = {};

    this.BaseError = class BaseError extends ExtendableError {
      constructor(message = "Error") {
        super(message);

        Object.defineProperty(this, "code", {
          enumerable: false,
          value: this.constructor.code
        });

        // Object.defineProperty(this, "type", {
        //   enumerable: true,
        //   value: this.constructor.type
        // });
        Object.defineProperty(this, "type", {
          configurable: true,
          enumerable: true,
          value: this.constructor.type || "unkown",
          writable: true
        });

        if (!registry.registered[this.name]) {
          console.warn(
            `${
              this.constructor.name
            } was not registered with the registry. Please ensure you call register after creating your error class.`
          );
          registry.register(this.constructor);
        }
        counter.inc({ registry: name, type: this.constructor.name });
      }

      // toJSON() {
      //   return { message: this.message, type: this.type };
      // }

      static get type() {
        return registry._typeFromCode(this.code);
      }
    };
  }

  createErrorType({ name, code, help, constructor }) {
    const registry = this;
    const TypeError = class extends this.BaseError {
      constructor(message = "") {
        super(message);
        if (constructor) constructor.apply(this, arguments);
      }

      // get type() {
      //   return registry._typeFromCode(code);
      // }

      static get code() {
        return code;
      }

      static get name() {
        return name || `${code}Error`;
      }

      static get help() {
        return help;
      }
    };

    this.register(TypeError);

    return TypeError;
  }

  register(ErrorType) {
    if (!ErrorType.name) {
      throw new Error("Name required.");
    }

    if (!ErrorType.code) {
      throw new Error("Code required.");
    }

    if (!ErrorType.help) {
      throw new Error("Help required.");
    }

    this.registered[ErrorType.name] = ErrorType;

    if (!this.debug) return;

    console.log(
      `Error type "${ErrorType.name}" registered with registry "${this.name}".`
    );
  }

  getMeta(typeName) {
    if (typeName) return this._mapTypeMeta(this.registered[typeName]);
    return Object.values(this.registered).map(t => this._mapTypeMeta(t));
  }

  _mapTypeMeta(t) {
    return {
      name: t.name,
      code: t.code,
      type: t.type || this._typeFromCode(t.code),
      help: t.help
    };
  }

  _typeFromCode(code) {
    return this.typePrefix + code;
  }
}

exports.ErrorRegistry = ErrorRegistry;
