import { ulid } from "ulid";

import { counter } from "./metrics";
import { ErrorConstants, LokeError } from "./types";
import { errorToString, toType } from "./util";

/**
 * A SimpleError has no stack trace and does not extend the standard Error type.
 */
export class SimpleError implements LokeError {
  readonly instance: string = ulid();
  readonly name: string = ""; // overridden in constructor
  readonly message: string;
  readonly code: string;
  readonly type: string;
  readonly namespace?: string;
  readonly expose?: boolean;
  readonly stack: string = ""; // overridden in constructor
  readonly help: string = ""; // overridden in constructor

  constructor(message: string | null = null, constants: ErrorConstants) {
    this.name = constants.name || this.constructor.name;
    this.message = message || constants.defaultMessage;
    this.code = constants.code;
    this.expose = constants.expose;
    this.namespace = constants.namespace;
    this.help = constants.help;
    this.type = toType(constants);

    Object.defineProperty(this, "name", {
      configurable: true,
      enumerable: false,
      value: constants.name || this.constructor.name,
      writable: true,
    });
    Object.defineProperty(this, "help", { enumerable: false });
    Object.defineProperty(this, "stack", {
      enumerable: false,
      get() {
        return this.toString();
      },
    });

    counter.inc({
      namespace: this.namespace || "default",
      type: this.type,
    });
  }

  toString() {
    return errorToString(this);
  }
}
