const { registerMetrics } = require("./metrics");
const { BaseError, SimpleError, toType } = require("./types");
const { ErrorRegistry } = require("./registry");

exports.createErrorType = args => {
  const {
    name,
    code,
    type,
    help,
    namespace,
    typePrefix,
    expose,
    registry: _registry,
    message: _message,
    stackTrace = true
  } = args;

  const registry = _registry || exports.registry;
  const defaultMessage = _message || "Error";

  let TypedError;

  if (stackTrace) {
    TypedError = class extends BaseError {
      constructor(message, meta) {
        super(message || defaultMessage, stackTrace);
        if (meta) Object.assign(this, meta);
      }

      static get namespace() {
        return namespace;
      }

      static get typePrefix() {
        return typePrefix || registry.typePrefix;
      }

      static get code() {
        return code;
      }

      static get type() {
        return type || toType(this);
      }

      static get name() {
        return name || `${code}Error`;
      }

      static get help() {
        return help;
      }

      static get expose() {
        return expose;
      }
    };
  } else {
    TypedError = class extends SimpleError {
      constructor(message, meta) {
        super(message || defaultMessage, stackTrace);
        if (meta) Object.assign(this, meta);
      }

      static get namespace() {
        return namespace;
      }

      static get typePrefix() {
        return typePrefix || registry.typePrefix;
      }

      static get code() {
        return code;
      }

      static get type() {
        return type || toType(this);
      }

      static get name() {
        return name || `${code}Error`;
      }

      static get help() {
        return help;
      }

      static get expose() {
        return expose;
      }
    };
  }

  registry.register(TypedError);

  return TypedError;
};

exports.registerMetrics = registerMetrics;
exports.BaseError = BaseError;
exports.ErrorRegistry = ErrorRegistry;
exports.registry = new ErrorRegistry({ name: "default" });
