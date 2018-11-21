const { registerMetrics } = require("./metrics");
const { BaseError } = require("./types");
const { ErrorRegistry } = require("./registry");

exports.createErrorType = args => {
  const useRegistry = args.registry || exports.registry;
  return useRegistry.createErrorType(args);
};

exports.registerMetrics = registerMetrics;
exports.BaseError = BaseError;
exports.ErrorRegistry = ErrorRegistry;
exports.registry = new ErrorRegistry({ name: "default" });
