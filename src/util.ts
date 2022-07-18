import { format } from "util";
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
  return metaKeys.map((key) => format("%s=%j", key, err[key])).join(" ");
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
