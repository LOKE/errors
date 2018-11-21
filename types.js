// see https://github.com/bjyoungblood/es6-error/blob/master/src/index.js

const { counter } = require("./metrics");

class ExtendableError extends Error {
  constructor(message = "") {
    super(message);

    // extending Error is weird and does not propagate `message`
    Object.defineProperty(this, "message", {
      configurable: true,
      enumerable: true,
      value: message,
      writable: true
    });

    Object.defineProperty(this, "name", {
      configurable: true,
      enumerable: false,
      value: this.constructor.name,
      writable: true
    });

    if (Error.hasOwnProperty("captureStackTrace")) {
      Error.captureStackTrace(this, this.constructor);
      return;
    }

    Object.defineProperty(this, "stack", {
      configurable: true,
      enumerable: false,
      value: new Error(message).stack,
      writable: true
    });
  }
}

class BaseError extends ExtendableError {
  constructor(message = "Error") {
    super(message);

    Object.defineProperty(this, "code", {
      enumerable: false,
      value: this.constructor.code
    });
    Object.defineProperty(this, "namespace", {
      enumerable: false,
      value: this.constructor.namespace
    });
    Object.defineProperty(this, "type", {
      configurable: true,
      enumerable: true,
      value: this.constructor.type || "unknown",
      writable: true
    });

    counter.inc({
      namespace: this.namespace || "default",
      type: this.type
    });
  }

  static get type() {
    return (this.typePrefix || "") + this.code;
  }
}

exports.BaseError = BaseError;
exports.ExtendableError = ExtendableError;

exports.createErrorType = ({ name, code, help, namespace, typePrefix }) => {
  const TypedError = class extends BaseError {
    constructor(message = "Error", meta) {
      super(message);
      if (meta) Object.assign(this, meta);
    }

    static get namespace() {
      return namespace;
    }

    static get typePrefix() {
      return typePrefix;
    }

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

  return TypedError;
};
