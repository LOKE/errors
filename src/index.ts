export { registerMetrics } from "./metrics";
import { BaseError } from "./base-error";
import { SimpleError } from "./simple-error";
import { ErrorConstants, LokeMetaError } from "./types";
import { toType } from "./util";
import { ErrorRegistry } from "./registry";
export { ErrorRegistry } from "./registry";

interface CreateErrorTypeArgs {
  name?: string;
  code: string;
  type?: string;
  help: string;
  namespace?: string;
  typePrefix?: string;
  expose?: boolean;
  registry?: ErrorRegistry;
  message?: string;
}

interface ContructableError<TMeta> {
  new (message?: string, meta?: TMeta): LokeMetaError<TMeta>;
}

export const registry = new ErrorRegistry({ name: "default" });

export const createErrorType = <TMeta>(
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
