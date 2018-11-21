const { ExtendableError } = require("./types");
const { ErrorRegistry } = require("./registry");

exports.ExtendableError = ExtendableError;
exports.ErrorRegistry = ErrorRegistry;
exports.registry = new ErrorRegistry({ name: "default" });
exports.createErrorType = args => {
  const useRegistry = args.registry || exports.registry;
  return useRegistry.createErrorType(args);
};
