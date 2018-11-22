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
      enumerable: true,
      value: this.constructor.code
    });
    Object.defineProperty(this, "namespace", {
      enumerable: true,
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
    return (this.typePrefix || "") + this.code.toLowerCase();
  }
}

exports.BaseError = BaseError;
exports.ExtendableError = ExtendableError;
