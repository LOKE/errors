export interface ErrorConstants {
  readonly name: string;
  readonly defaultMessage: string;
  readonly code: string;
  readonly typePrefix?: string;
  readonly type?: string;
  readonly namespace?: string;
  readonly expose?: boolean;
  readonly help: string;
}

export interface ErrorInstanceParams {
  readonly instance: string;
  readonly message: string;
  readonly stack: string;
}

export type LokeError = Omit<ErrorConstants, "defaultMessage"> &
  ErrorInstanceParams;
export type LokeMetaError<T> = LokeError & T;
