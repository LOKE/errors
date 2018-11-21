const { createErrorType } = require("./types");

class ErrorRegistry {
  constructor(args) {
    const { name, typePrefix = "", debug = false } = args;
    this.name = name;
    this.typePrefix = typePrefix;
    this.debug = debug;
    this.registered = {};
  }

  createErrorType({ name, code, help, namespace, typePrefix }) {
    const TypedError = createErrorType({
      name,
      code,
      help,
      namespace,
      typePrefix: typePrefix || this.typePrefix
    });
    this.register(TypedError);
    return TypedError;
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
