interface LokeErrorType {
  name: string;
  code: string;
  type?: string;
  help: string;
  namespace?: string;
}

export class ErrorRegistry {
  public typePrefix: string;

  private name: string;
  private debug?: boolean;
  private registered: Record<string, LokeErrorType> = {};

  constructor(args: { name: string; typePrefix?: string; debug?: boolean }) {
    const { name, typePrefix = "", debug = false } = args;
    this.name = name;
    this.typePrefix = typePrefix;
    this.debug = debug;
    this.registered = {};
  }

  register(details: LokeErrorType) {
    if (!details.name) {
      throw new Error("Name required.");
    }

    if (!details.code && !details.type) {
      throw new Error("Code or type required.");
    }

    if (!details.help) {
      throw new Error("Help required.");
    }

    this.registered[details.name] = details;

    if (!this.debug) return;

    console.log(
      `Error type "${details.name}" registered with registry "${this.name}".`
    );
  }

  getMeta(typeName?: string) {
    if (typeName) {
      const type = this.registered[typeName];
      return type ? this._mapTypeMeta(type) : null;
    }
    return Object.values(this.registered).map((t) => this._mapTypeMeta(t));
  }

  private _mapTypeMeta(t: LokeErrorType) {
    return {
      name: t.name,
      namespace: t.namespace,
      code: t.code,
      type: t.type || this._typeFromCode(t.code),
      help: t.help,
    };
  }

  private _typeFromCode(code: string) {
    return this.typePrefix + code;
  }
}
