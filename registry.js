const { ExtendableError } = require("./types");
const client = require("prom-client");
const counter = new client.Counter({
  name: "errors_thrown",
  help: "Count of number times an error is thrown",
  labelNames: ["registry", "type"]
});

class ErrorRegistry {
  constructor(args) {
    const { name, typePrefix = "" } = args;
    const registry = this;
    this.name = name;
    this.typePrefix = typePrefix;
    this.registered = {};

    this.BaseError = class BaseError extends ExtendableError {
      constructor(message = "Error") {
        super(message);

        this.code = typePrefix + this.constructor.code();
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
    };
  }

  register(ErrorType) {
    if (!ErrorType.name) {
      throw new Error("Name required.");
    }

    if (!ErrorType.code) {
      throw new Error("Code required.");
    }

    if (!ErrorType.description) {
      throw new Error("Description required.");
    }

    this.registered[ErrorType.name] = ErrorType;
    console.log(
      `Error type "${ErrorType.name}" registered with "${this.name}".`
    );
  }

  getMeta(typeName) {
    if (typeName) return this._mapTypeMeta(this.registered[typeName]);
    return Object.values(this.registered).map(t => this._mapTypeMeta(t));
  }

  _mapTypeMeta(t) {
    return {
      name: t.name,
      code: t.code(),
      type: this._typeFromCode(t.code()),
      description: t.description()
    };
  }

  _typeFromCode(code) {
    return this.typePrefix + code;
  }
}

exports.ErrorRegistry = ErrorRegistry;
