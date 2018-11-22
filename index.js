const { registerMetrics } = require("./metrics");
const { BaseError } = require("./types");
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
    message: _message
  } = args;

  const registry = _registry || exports.registry;
  const defaultMessage = _message || "Error";

  const TypedError = class extends BaseError {
    constructor(message, meta) {
      super(message || defaultMessage);
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
      return type || (this.typePrefix || "") + this.code.toLowerCase();
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

  registry.register(TypedError);

  return TypedError;
};

exports.registerMetrics = registerMetrics;
exports.BaseError = BaseError;
exports.ErrorRegistry = ErrorRegistry;
exports.registry = new ErrorRegistry({ name: "default" });
