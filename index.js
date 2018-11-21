const { registerMetrics } = require("./metrics");
const { BaseError } = require("./types");
const { ErrorRegistry } = require("./registry");

exports.createErrorType = args => {
  const useRegistry = args.registry || exports.registry;

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

  useRegistry(TypedError);

  return TypedError;
};

exports.registerMetrics = registerMetrics;
exports.BaseError = BaseError;
exports.ErrorRegistry = ErrorRegistry;
exports.registry = new ErrorRegistry({ name: "default" });
