import logfmt from "logfmt";
import { LokeError } from "./types";

const EXCLUDED_META_KEYS = [
  "type",
  "code",
  "expose",
  "message",
  "namespace",
  "instance",
];

function metaStr(metaKeys: string[], err: Record<string, any>) {
  return logfmt.stringify(
    metaKeys.reduce((obj: Record<string, any>, key: string) => {
      obj[key] = err[key];
      return obj;
    }, {} as Record<string, any>)
  );
}

export function errorToString(err: LokeError) {
  const metaKeys = Object.keys(err).filter(
    (key: string) => !EXCLUDED_META_KEYS.includes(key)
  );
  return `${err.name}: ${err.message} [${err.instance}]${
    metaKeys.length ? " " + metaStr(metaKeys, err) : ""
  }`;
}

export function toType(args: {
  typePrefix?: string;
  namespace?: string;
  code: string;
}) {
  const { typePrefix, namespace, code } = args;
  return (
    (typePrefix || "") + (namespace ? namespace + "/" : "") + code.toLowerCase()
  );
}
