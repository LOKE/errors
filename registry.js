class ErrorRegistry {
  constructor(args) {
    const { name, typePrefix = "", debug = false } = args;
    this.name = name;
    this.typePrefix = typePrefix;
    this.debug = debug;
    this.registered = {};
  }

  register(ErrorType) {
    if (!ErrorType.name) {
      throw new Error("Name required.");
    }

    if (!ErrorType.code && !ErrorType.type) {
      throw new Error("Code or type required.");
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
      namespace: t.namespace,
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
