export { registerMetrics } from "./metrics";
import { BaseError } from "./base-error";
import { SimpleError } from "./simple-error";
import { ErrorConstants, LokeMetaError } from "./types";
import { toType } from "./util";
import { ErrorRegistry } from "./registry";
export { ErrorRegistry } from "./registry";

interface CreateErrorTypeArgs {
  /**
   * The error name should describe the error, and ideally be the same as the variable/constructor name.
   * The name is not exposed in serialization, but is shown when converting to a string.
   * @example "NullValueError"
   */
  name?: string;
  /**
   * The error code should describe the error type and is exposed in serialization and metrics.
   * An error code should be unique within its namespace/prefix, but not necessarily globally unique.
   * For example there may be multiple errors in different services/layers with code "validation_error".
   * See type for global uniqueness.
   * @example "null_value"
   */
  code: string;
  /**
   * The type should be globally unique, and is used to identify the error code.
   * It is typically expected that this error be a URL, but this is not required.
   * The type is not exposed in serialization, or when converting to a string.
   * @note Typically you will not explicity set this, it will be automatically derived from the typePrefix + namespace + code.
   * @example "https://abc.com/errors/payments/null_value"
   */
  type?: string;
  /**
   * Help text should be a description of the error and its intended use case.
   * This is exposed in the error repository for listing elsewhere and is used to generate help text for the error.
   * Because it is up to you how you want to format the help text, the content type is up to you - eg Markdown, HTML.
   * It is not exposed in serialization, or when converting to a string.
   * @example "The value provided was null."
   */
  help: string;
  /**
   * The namespace is used to group errors together for larger projects.
   * It is not exposed in serialization, or when converting to a string.
   * The namespace is used for automatically generated types.
   * For smaller projects you typically don't need to declare namespaces, everything can live on the default/root namespace.
   * @example "payments"
   */
  namespace?: string;
  /**
   * The typePrefix is used for automatically generated types.
   * Typically you will set this on the registry, but you can override it on a per-error basis.
   * @example "https://abc.com/errors/"
   */
  typePrefix?: string;
  /**
   * Indicates that the error message and code are safe to be exposed to an external user or client.
   * Should be considered false if not defined.
   * When handling errors in the API anything not expose:true should typically become an internal error, or some other generic error message.
   * @example true
   */
  expose?: boolean;
  /**
   * Specify to place this error in a non-default registry.
   * If not specified then the default registry is used.
   * It is typically expected that you will not need to specify this, but it is provided for flexibility.
   */
  registry?: ErrorRegistry;
  /**
   * The error message is the default message that is used when constructing an error.
   * You can override this message by passing a message to the constructor of a new error instance.
   * If no message is provided to the constructor the default message is used.
   * This helps explain the intended use case of the message, but can also assist in keeping messaging
   * consistent when it makes sense to do so (rather than repeating the message in multiple places).
   * @example "The value provided was null."
   */
  message?: string;
}

interface ContructableError<TMeta> {
  new (
    /** Error message to be displayed and exposed if required (leave undefined to use default message) */
    message?: string,
    /** Optional metadata for this error type. Note that metadata is always serialized AND converted to a string. */
    meta?: TMeta
  ): LokeMetaError<TMeta>;
}

export const registry = new ErrorRegistry({ name: "default" });

/**
 * Creates a new error type that extends from Error and has a stack trace.
 * This error type can optionally have additional metadata provided to assist with communication and debugging.
 * @example
 *  createErrorType<{field: string}>({
 *    name: "NullValueError",
 *    code: "null_value",
 *    message: "The value provided was null."
 *    help: "The specified field cannot be null. Please make sure you provide a non-null value for this field."",
 *    namespace: "payments",
 *    expose: true,
 *  );
 */
export const createErrorType = <TMeta extends object | void = void>(
  args: CreateErrorTypeArgs
): ContructableError<TMeta> => {
  const {
    name: _name,
    code,
    type: _type,
    help,
    namespace,
    typePrefix: _typePrefix,
    expose,
    registry: _registry,
    message: _message,
  } = args;

  const name = _name || `${code}Error`;
  const typeRegistry = _registry || registry;
  const defaultMessage = _message || "Error";
  const typePrefix = _typePrefix || typeRegistry.typePrefix;
  const type = _type || toType({ typePrefix, namespace, code });

  const constants: ErrorConstants = {
    defaultMessage,
    name: name || `${code}Error`,
    namespace,
    typePrefix,
    code,
    help,
    expose,
    type,
  };

  const TypedError = class extends BaseError {
    constructor(message: string, meta: TMeta) {
      super(message || defaultMessage, constants);
      if (meta) Object.assign(this, meta);
    }
  } as unknown as ContructableError<TMeta>;

  registry.register(constants);

  return TypedError;
};

/**
 * Creates a new error type that does NOT extend from Error and has no stack trace
 */
export const createSimpleErrorType = <TMeta>(
  args: CreateErrorTypeArgs
): ContructableError<TMeta> => {
  const {
    name: _name,
    code,
    type: _type,
    help,
    namespace,
    typePrefix: _typePrefix,
    expose,
    registry: _registry,
    message: _message,
  } = args;

  const name = _name || `${code}Error`;
  const typeRegistry = _registry || registry;
  const defaultMessage = _message || "Error";
  const typePrefix = _typePrefix || typeRegistry.typePrefix;
  const type = _type || toType({ typePrefix, namespace, code });

  const constants: ErrorConstants = {
    defaultMessage,
    name: name || `${code}Error`,
    namespace,
    typePrefix,
    code,
    help,
    expose,
    type,
  };

  const TypedError = class extends SimpleError {
    constructor(message?: string, meta?: Record<string, any>) {
      super(message || defaultMessage, constants);
      if (meta) Object.assign(this, meta);
    }
  } as ContructableError<TMeta>;

  registry.register(constants);

  return TypedError;
};
