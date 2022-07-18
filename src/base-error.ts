import { ulid } from "ulid";

import { counter } from "./metrics";
import { ErrorConstants, LokeError } from "./types";
import { errorToString, toType } from "./util";

// see https://github.com/bjyoungblood/es6-error/blob/master/src/index.js
class ExtendableError extends Error {
  override readonly stack: string = ""; // Overridden in constructor

  constructor(message = "") {
    super(message);

    // extending Error is weird and does not propagate `message`
    Object.defineProperty(this, "message", {
      configurable: true,
      // We make message enumerable in loke errors
      enumerable: true,
      value: message,
      writable: true,
    });

    if (Error.hasOwnProperty("captureStackTrace")) {
      Error.captureStackTrace(this, this.constructor);
      return;
    }

    Object.defineProperty(this, "stack", {
      configurable: true,
      enumerable: false,
      value: new Error(message).stack,
      writable: true,
    });
  }
}

/**
 * A BaseError has a stack trace and extends the standard Error type.
 */
export class BaseError extends ExtendableError implements LokeError {
  readonly instance: string = ulid();
  readonly expose?: boolean;
  readonly code: string;
  readonly namespace?: string;
  readonly type: string;
  readonly help: string;

  constructor(message: string | null = null, constants: ErrorConstants) {
    super(message || constants.defaultMessage);

    Object.defineProperty(this, "name", {
      configurable: true,
      enumerable: false,
      value: constants.name || this.constructor.name,
      writable: true,
    });

    this.expose = constants.expose;
    this.code = constants.code;
    this.namespace = constants.namespace;
    this.type = toType(constants);
    this.help = constants.help;

    Object.defineProperty(this, "help", { enumerable: false });

    counter.inc({
      namespace: this.namespace || "default",
      type: this.type,
    });
  }

  override toString() {
    return errorToString(this);
  }
}
