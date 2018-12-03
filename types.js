// see https://github.com/bjyoungblood/es6-error/blob/master/src/index.js

const { counter } = require("./metrics");
const { ulid } = require("ulid");

function toType(typePrefix, namespace, code) {
  return (
    (typePrefix || "") + (namespace ? namespace + "/" : "") + code.toLowerCase()
  );
}

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

/**
 * A BaseError has a stack trace and extends the standard Error type.
 */
class BaseError extends ExtendableError {
  constructor(message = "Error") {
    super(message);
    extendInstance(this);
  }

  toString() {
    return `${this.name}: ${this.message} [${this.instance}]`;
  }

  static get type() {
    return toType(this.typePrefix, this.namespace, this.code);
  }
}

/**
 * A SimpleError has no stack trace and does not extend the standard Error type.
 */
class SimpleError {
  constructor(message = "Error") {
    this.message = message;
    extendInstance(this);

    Object.defineProperty(this, "stack", {
      configurable: true,
      enumerable: false,
      value: this.toString(),
      writable: true
    });
  }

  static get type() {
    return toType(this.typePrefix, this.namespace, this.code);
  }
}

SimpleError.prototype.toString = BaseError.prototype.toString;

function extendInstance(instance) {
  instance.instance = ulid();

  Object.defineProperty(instance, "name", {
    configurable: true,
    enumerable: false,
    value: instance.constructor.name,
    writable: true
  });

  Object.defineProperty(instance, "expose", {
    configurable: true,
    enumerable: true,
    value: instance.constructor.expose || undefined,
    writable: true
  });

  Object.defineProperty(instance, "code", {
    enumerable: true,
    value: instance.constructor.code
  });

  Object.defineProperty(instance, "namespace", {
    enumerable: true,
    value: instance.constructor.namespace
  });

  Object.defineProperty(instance, "type", {
    configurable: true,
    enumerable: true,
    value: instance.constructor.type || "unknown",
    writable: true
  });

  counter.inc({
    namespace: instance.namespace || "default",
    type: instance.type
  });
}

exports.BaseError = BaseError;
exports.SimpleError = SimpleError;
exports.toType = toType;
