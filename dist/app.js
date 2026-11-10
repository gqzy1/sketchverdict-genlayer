var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};

// node_modules/abitype/dist/esm/regex.js
function execTyped(regex, string) {
  const match = regex.exec(string);
  return match?.groups;
}
var init_regex = __esm({
  "node_modules/abitype/dist/esm/regex.js"() {
  }
});

// node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js
function formatAbiParameter(abiParameter) {
  let type = abiParameter.type;
  if (tupleRegex.test(abiParameter.type) && "components" in abiParameter) {
    type = "(";
    const length = abiParameter.components.length;
    for (let i = 0; i < length; i++) {
      const component = abiParameter.components[i];
      type += formatAbiParameter(component);
      if (i < length - 1)
        type += ", ";
    }
    const result = execTyped(tupleRegex, abiParameter.type);
    type += `)${result?.array || ""}`;
    return formatAbiParameter({
      ...abiParameter,
      type
    });
  }
  if ("indexed" in abiParameter && abiParameter.indexed)
    type = `${type} indexed`;
  if (abiParameter.name)
    return `${type} ${abiParameter.name}`;
  return type;
}
var tupleRegex;
var init_formatAbiParameter = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js"() {
    init_regex();
    tupleRegex = /^tuple(?<array>(\[(\d*)\])*)$/;
  }
});

// node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js
function formatAbiParameters(abiParameters) {
  let params = "";
  const length = abiParameters.length;
  for (let i = 0; i < length; i++) {
    const abiParameter = abiParameters[i];
    params += formatAbiParameter(abiParameter);
    if (i !== length - 1)
      params += ", ";
  }
  return params;
}
var init_formatAbiParameters = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js"() {
    init_formatAbiParameter();
  }
});

// node_modules/abitype/dist/esm/human-readable/formatAbiItem.js
function formatAbiItem(abiItem) {
  if (abiItem.type === "function")
    return `function ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability && abiItem.stateMutability !== "nonpayable" ? ` ${abiItem.stateMutability}` : ""}${abiItem.outputs?.length ? ` returns (${formatAbiParameters(abiItem.outputs)})` : ""}`;
  if (abiItem.type === "event")
    return `event ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "error")
    return `error ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "constructor")
    return `constructor(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability === "payable" ? " payable" : ""}`;
  if (abiItem.type === "fallback")
    return `fallback() external${abiItem.stateMutability === "payable" ? " payable" : ""}`;
  return "receive() external payable";
}
var init_formatAbiItem = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiItem.js"() {
    init_formatAbiParameters();
  }
});

// node_modules/abitype/dist/esm/exports/index.js
var init_exports = __esm({
  "node_modules/abitype/dist/esm/exports/index.js"() {
    init_formatAbiItem();
  }
});

// node_modules/viem/_esm/utils/abi/formatAbiItem.js
function formatAbiItem2(abiItem, { includeName = false } = {}) {
  if (abiItem.type !== "function" && abiItem.type !== "event" && abiItem.type !== "error")
    throw new InvalidDefinitionTypeError(abiItem.type);
  return `${abiItem.name}(${formatAbiParams(abiItem.inputs, { includeName })})`;
}
function formatAbiParams(params, { includeName = false } = {}) {
  if (!params)
    return "";
  return params.map((param) => formatAbiParam(param, { includeName })).join(includeName ? ", " : ",");
}
function formatAbiParam(param, { includeName }) {
  if (param.type.startsWith("tuple")) {
    return `(${formatAbiParams(param.components, { includeName })})${param.type.slice("tuple".length)}`;
  }
  return param.type + (includeName && param.name ? ` ${param.name}` : "");
}
var init_formatAbiItem2 = __esm({
  "node_modules/viem/_esm/utils/abi/formatAbiItem.js"() {
    init_abi();
  }
});

// node_modules/viem/_esm/utils/data/isHex.js
function isHex(value, { even = false, strict = true } = {}) {
  if (!value)
    return false;
  if (typeof value !== "string")
    return false;
  if (even && value.length % 2 !== 0)
    return false;
  return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith("0x");
}
var init_isHex = __esm({
  "node_modules/viem/_esm/utils/data/isHex.js"() {
  }
});

// node_modules/viem/_esm/utils/data/size.js
function size(value) {
  if (isHex(value, { strict: false }))
    return Math.ceil((value.length - 2) / 2);
  return value.length;
}
var init_size = __esm({
  "node_modules/viem/_esm/utils/data/size.js"() {
    init_isHex();
  }
});

// node_modules/viem/_esm/errors/version.js
var version;
var init_version = __esm({
  "node_modules/viem/_esm/errors/version.js"() {
    version = "2.57.17";
  }
});

// node_modules/viem/_esm/errors/base.js
function walk(err, fn) {
  if (fn?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err && err.cause !== void 0)
    return walk(err.cause, fn);
  return fn ? null : err;
}
var errorConfig, BaseError;
var init_base = __esm({
  "node_modules/viem/_esm/errors/base.js"() {
    init_version();
    errorConfig = {
      getDocsUrl: ({ docsBaseUrl, docsPath: docsPath2 = "", docsSlug }) => docsPath2 ? `${docsBaseUrl ?? "https://viem.sh"}${docsPath2}${docsSlug ? `#${docsSlug}` : ""}` : void 0,
      version: `viem@${version}`
    };
    BaseError = class _BaseError extends Error {
      constructor(shortMessage, args = {}) {
        const details = (() => {
          if (args.cause instanceof _BaseError)
            return args.cause.details;
          if (args.cause?.message)
            return args.cause.message;
          return args.details;
        })();
        const docsPath2 = (() => {
          if (args.cause instanceof _BaseError)
            return args.cause.docsPath || args.docsPath;
          return args.docsPath;
        })();
        const docsUrl = errorConfig.getDocsUrl?.({ ...args, docsPath: docsPath2 });
        const message = [
          shortMessage || "An error occurred.",
          "",
          ...args.metaMessages ? [...args.metaMessages, ""] : [],
          ...docsUrl ? [`Docs: ${docsUrl}`] : [],
          ...details ? [`Details: ${details}`] : [],
          ...errorConfig.version ? [`Version: ${errorConfig.version}`] : []
        ].join("\n");
        super(message, args.cause ? { cause: args.cause } : void 0);
        Object.defineProperty(this, "details", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsPath", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "version", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "BaseError"
        });
        this.details = details;
        this.docsPath = docsPath2;
        this.metaMessages = args.metaMessages;
        this.name = args.name ?? this.name;
        this.shortMessage = shortMessage;
        this.version = version;
      }
      walk(fn) {
        return walk(this, fn);
      }
    };
  }
});

// node_modules/viem/_esm/errors/abi.js
var AbiEncodingArrayLengthMismatchError, AbiEncodingBytesSizeMismatchError, AbiEncodingLengthMismatchError, AbiFunctionNotFoundError, AbiItemAmbiguityError, BytesSizeMismatchError, InvalidAbiEncodingTypeError, InvalidArrayError, InvalidDefinitionTypeError;
var init_abi = __esm({
  "node_modules/viem/_esm/errors/abi.js"() {
    init_formatAbiItem2();
    init_size();
    init_base();
    AbiEncodingArrayLengthMismatchError = class extends BaseError {
      constructor({ expectedLength, givenLength, type }) {
        super([
          `ABI encoding array length mismatch for type ${type}.`,
          `Expected length: ${expectedLength}`,
          `Given length: ${givenLength}`
        ].join("\n"), { name: "AbiEncodingArrayLengthMismatchError" });
      }
    };
    AbiEncodingBytesSizeMismatchError = class extends BaseError {
      constructor({ expectedSize, value }) {
        super(`Size of bytes "${value}" (bytes${size(value)}) does not match expected size (bytes${expectedSize}).`, { name: "AbiEncodingBytesSizeMismatchError" });
      }
    };
    AbiEncodingLengthMismatchError = class extends BaseError {
      constructor({ expectedLength, givenLength }) {
        super([
          "ABI encoding params/values length mismatch.",
          `Expected length (params): ${expectedLength}`,
          `Given length (values): ${givenLength}`
        ].join("\n"), { name: "AbiEncodingLengthMismatchError" });
      }
    };
    AbiFunctionNotFoundError = class extends BaseError {
      constructor(functionName, { docsPath: docsPath2 } = {}) {
        super([
          `Function ${functionName ? `"${functionName}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the function exists on it."
        ].join("\n"), {
          docsPath: docsPath2,
          name: "AbiFunctionNotFoundError"
        });
      }
    };
    AbiItemAmbiguityError = class extends BaseError {
      constructor(x, y) {
        super("Found ambiguous types in overloaded ABI items.", {
          metaMessages: [
            `\`${x.type}\` in \`${formatAbiItem2(x.abiItem)}\`, and`,
            `\`${y.type}\` in \`${formatAbiItem2(y.abiItem)}\``,
            "",
            "These types encode differently and cannot be distinguished at runtime.",
            "Remove one of the ambiguous items in the ABI."
          ],
          name: "AbiItemAmbiguityError"
        });
      }
    };
    BytesSizeMismatchError = class extends BaseError {
      constructor({ expectedSize, givenSize }) {
        super(`Expected bytes${expectedSize}, got bytes${givenSize}.`, {
          name: "BytesSizeMismatchError"
        });
      }
    };
    InvalidAbiEncodingTypeError = class extends BaseError {
      constructor(type, { docsPath: docsPath2 }) {
        super([
          `Type "${type}" is not a valid encoding type.`,
          "Please provide a valid ABI type."
        ].join("\n"), { docsPath: docsPath2, name: "InvalidAbiEncodingType" });
      }
    };
    InvalidArrayError = class extends BaseError {
      constructor(value) {
        super([`Value "${value}" is not a valid array.`].join("\n"), {
          name: "InvalidArrayError"
        });
      }
    };
    InvalidDefinitionTypeError = class extends BaseError {
      constructor(type) {
        super([
          `"${type}" is not a valid definition type.`,
          'Valid types: "function", "event", "error"'
        ].join("\n"), { name: "InvalidDefinitionTypeError" });
      }
    };
  }
});

// node_modules/viem/_esm/errors/data.js
var SliceOffsetOutOfBoundsError, SizeExceedsPaddingSizeError;
var init_data = __esm({
  "node_modules/viem/_esm/errors/data.js"() {
    init_base();
    SliceOffsetOutOfBoundsError = class extends BaseError {
      constructor({ offset, position, size: size2 }) {
        super(`Slice ${position === "start" ? "starting" : "ending"} at offset "${offset}" is out-of-bounds (size: ${size2}).`, { name: "SliceOffsetOutOfBoundsError" });
      }
    };
    SizeExceedsPaddingSizeError = class extends BaseError {
      constructor({ size: size2, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (${size2}) exceeds padding size (${targetSize}).`, { name: "SizeExceedsPaddingSizeError" });
      }
    };
  }
});

// node_modules/viem/_esm/utils/data/pad.js
function pad(hexOrBytes, { dir, size: size2 = 32 } = {}) {
  if (typeof hexOrBytes === "string")
    return padHex(hexOrBytes, { dir, size: size2 });
  return padBytes(hexOrBytes, { dir, size: size2 });
}
function padHex(hex_, { dir, size: size2 = 32 } = {}) {
  if (size2 === null)
    return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size2 * 2)
    throw new SizeExceedsPaddingSizeError({
      size: Math.ceil(hex.length / 2),
      targetSize: size2,
      type: "hex"
    });
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size2 * 2, "0")}`;
}
function padBytes(bytes, { dir, size: size2 = 32 } = {}) {
  if (size2 === null)
    return bytes;
  if (bytes.length > size2)
    throw new SizeExceedsPaddingSizeError({
      size: bytes.length,
      targetSize: size2,
      type: "bytes"
    });
  const paddedBytes = new Uint8Array(size2);
  for (let i = 0; i < size2; i++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i : size2 - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
  }
  return paddedBytes;
}
var init_pad = __esm({
  "node_modules/viem/_esm/utils/data/pad.js"() {
    init_data();
  }
});

// node_modules/viem/_esm/errors/encoding.js
var IntegerOutOfRangeError, SizeOverflowError;
var init_encoding = __esm({
  "node_modules/viem/_esm/errors/encoding.js"() {
    init_base();
    IntegerOutOfRangeError = class extends BaseError {
      constructor({ max, min, signed, size: size2, value }) {
        super(`Number "${value}" is not in safe ${size2 ? `${size2 * 8}-bit ${signed ? "signed" : "unsigned"} ` : ""}integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`, { name: "IntegerOutOfRangeError" });
      }
    };
    SizeOverflowError = class extends BaseError {
      constructor({ givenSize, maxSize }) {
        super(`Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`, { name: "SizeOverflowError" });
      }
    };
  }
});

// node_modules/viem/_esm/utils/data/trim.js
function trim(hexOrBytes, { dir = "left" } = {}) {
  let data = typeof hexOrBytes === "string" ? hexOrBytes.replace("0x", "") : hexOrBytes;
  let sliceLength = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  if (typeof hexOrBytes === "string") {
    if (data.length === 1 && dir === "right")
      data = `${data}0`;
    return `0x${data.length % 2 === 1 ? `0${data}` : data}`;
  }
  return data;
}
var init_trim = __esm({
  "node_modules/viem/_esm/utils/data/trim.js"() {
  }
});

// node_modules/viem/_esm/utils/encoding/fromHex.js
function assertSize(hexOrBytes, { size: size2 }) {
  if (size(hexOrBytes) > size2)
    throw new SizeOverflowError({
      givenSize: size(hexOrBytes),
      maxSize: size2
    });
}
function hexToBigInt(hex, opts = {}) {
  const { signed } = opts;
  if (opts.size)
    assertSize(hex, { size: opts.size });
  const value = BigInt(hex);
  if (!signed)
    return value;
  const size2 = Math.ceil((hex.length - 2) / 2);
  const max = (1n << BigInt(size2) * 8n - 1n) - 1n;
  if (value <= max)
    return value;
  return value - BigInt(`0x${"f".padStart(size2 * 2, "f")}`) - 1n;
}
function hexToNumber(hex, opts = {}) {
  const value = hexToBigInt(hex, opts);
  const number = Number(value);
  if (!Number.isSafeInteger(number))
    throw new IntegerOutOfRangeError({
      max: `${Number.MAX_SAFE_INTEGER}`,
      min: `${Number.MIN_SAFE_INTEGER}`,
      signed: opts.signed,
      size: opts.size,
      value: `${value}n`
    });
  return number;
}
var init_fromHex = __esm({
  "node_modules/viem/_esm/utils/encoding/fromHex.js"() {
    init_encoding();
    init_size();
  }
});

// node_modules/viem/_esm/utils/encoding/toHex.js
function toHex(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToHex(value, opts);
  if (typeof value === "string") {
    return stringToHex(value, opts);
  }
  if (typeof value === "boolean")
    return boolToHex(value, opts);
  return bytesToHex(value, opts);
}
function boolToHex(value, opts = {}) {
  const hex = `0x${Number(value)}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { size: opts.size });
  }
  return hex;
}
function bytesToHex(value, opts = {}) {
  let string = "";
  for (let i = 0; i < value.length; i++) {
    string += hexes[value[i]];
  }
  const hex = `0x${string}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { dir: "right", size: opts.size });
  }
  return hex;
}
function numberToHex(value_, opts = {}) {
  const { signed, size: size2 } = opts;
  const value = BigInt(value_);
  let maxValue;
  if (size2) {
    if (signed)
      maxValue = (1n << BigInt(size2) * 8n - 1n) - 1n;
    else
      maxValue = 2n ** (BigInt(size2) * 8n) - 1n;
  } else if (typeof value_ === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }
  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
  if (maxValue && value > maxValue || value < minValue) {
    const suffix = typeof value_ === "bigint" ? "n" : "";
    throw new IntegerOutOfRangeError({
      max: maxValue ? `${maxValue}${suffix}` : void 0,
      min: `${minValue}${suffix}`,
      signed,
      size: size2,
      value: `${value_}${suffix}`
    });
  }
  const hex = `0x${(signed && value < 0 ? (1n << BigInt(size2 * 8)) + BigInt(value) : value).toString(16)}`;
  if (size2)
    return pad(hex, { size: size2 });
  return hex;
}
function stringToHex(value_, opts = {}) {
  const value = encoder.encode(value_);
  return bytesToHex(value, opts);
}
var hexes, encoder;
var init_toHex = __esm({
  "node_modules/viem/_esm/utils/encoding/toHex.js"() {
    init_encoding();
    init_pad();
    init_fromHex();
    hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
    encoder = /* @__PURE__ */ new TextEncoder();
  }
});

// node_modules/viem/_esm/utils/encoding/toBytes.js
function toBytes(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToBytes(value, opts);
  if (typeof value === "boolean")
    return boolToBytes(value, opts);
  if (isHex(value))
    return hexToBytes(value, opts);
  return stringToBytes(value, opts);
}
function boolToBytes(value, opts = {}) {
  const bytes = new Uint8Array(1);
  bytes[0] = Number(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { size: opts.size });
  }
  return bytes;
}
function charCodeToBase16(char) {
  if (char >= charCodeMap.zero && char <= charCodeMap.nine)
    return char - charCodeMap.zero;
  if (char >= charCodeMap.A && char <= charCodeMap.F)
    return char - (charCodeMap.A - 10);
  if (char >= charCodeMap.a && char <= charCodeMap.f)
    return char - (charCodeMap.a - 10);
  return void 0;
}
function hexToBytes(hex_, opts = {}) {
  let hex = hex_;
  if (opts.size) {
    assertSize(hex, { size: opts.size });
    hex = pad(hex, { dir: "right", size: opts.size });
  }
  let hexString = hex.slice(2);
  if (hexString.length % 2)
    hexString = `0${hexString}`;
  const length = hexString.length / 2;
  const bytes = new Uint8Array(length);
  for (let index = 0, j = 0; index < length; index++) {
    const nibbleLeft = charCodeToBase16(hexString.charCodeAt(j++));
    const nibbleRight = charCodeToBase16(hexString.charCodeAt(j++));
    if (nibbleLeft === void 0 || nibbleRight === void 0) {
      throw new BaseError(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
    }
    bytes[index] = nibbleLeft * 16 + nibbleRight;
  }
  return bytes;
}
function numberToBytes(value, opts) {
  const hex = numberToHex(value, opts);
  return hexToBytes(hex);
}
function stringToBytes(value, opts = {}) {
  const bytes = encoder2.encode(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { dir: "right", size: opts.size });
  }
  return bytes;
}
var encoder2, charCodeMap;
var init_toBytes = __esm({
  "node_modules/viem/_esm/utils/encoding/toBytes.js"() {
    init_base();
    init_isHex();
    init_pad();
    init_fromHex();
    init_toHex();
    encoder2 = /* @__PURE__ */ new TextEncoder();
    charCodeMap = {
      zero: 48,
      nine: 57,
      A: 65,
      F: 70,
      a: 97,
      f: 102
    };
  }
});

// node_modules/@noble/hashes/esm/_u64.js
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var U32_MASK64, _32n, rotlSH, rotlSL, rotlBH, rotlBL;
var init_u64 = __esm({
  "node_modules/@noble/hashes/esm/_u64.js"() {
    U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
    _32n = /* @__PURE__ */ BigInt(32);
    rotlSH = (h, l, s) => h << s | l >>> 32 - s;
    rotlSL = (h, l, s) => l << s | h >>> 32 - s;
    rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
    rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
  }
});

// node_modules/@noble/hashes/esm/crypto.js
var crypto2;
var init_crypto = __esm({
  "node_modules/@noble/hashes/esm/crypto.js"() {
    crypto2 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
  }
});

// node_modules/@noble/hashes/esm/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function abytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash should be wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap32(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
  return arr;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes2(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes(data);
  return data;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad2 = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}
function createHasher(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes2(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function randomBytes(bytesLength = 32) {
  if (crypto2 && typeof crypto2.getRandomValues === "function") {
    return crypto2.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto2 && typeof crypto2.randomBytes === "function") {
    return Uint8Array.from(crypto2.randomBytes(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}
var isLE, swap32IfBE, Hash;
var init_utils = __esm({
  "node_modules/@noble/hashes/esm/utils.js"() {
    init_crypto();
    isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
    swap32IfBE = isLE ? (u) => u : byteSwap32;
    Hash = class {
    };
  }
});

// node_modules/@noble/hashes/esm/sha3.js
function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds; round < 24; round++) {
    for (let x = 0; x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0; x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0; y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t2 = 0; t2 < 24; t2++) {
      const shift = SHA3_ROTL[t2];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t2];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0; y < 50; y += 10) {
      for (let x = 0; x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0; x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  clean(B);
}
var _0n, _1n, _2n, _7n, _256n, _0x71n, SHA3_PI, SHA3_ROTL, _SHA3_IOTA, IOTAS, SHA3_IOTA_H, SHA3_IOTA_L, rotlH, rotlL, Keccak, gen, keccak_256;
var init_sha3 = __esm({
  "node_modules/@noble/hashes/esm/sha3.js"() {
    init_u64();
    init_utils();
    _0n = BigInt(0);
    _1n = BigInt(1);
    _2n = BigInt(2);
    _7n = BigInt(7);
    _256n = BigInt(256);
    _0x71n = BigInt(113);
    SHA3_PI = [];
    SHA3_ROTL = [];
    _SHA3_IOTA = [];
    for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
      [x, y] = [y, (2 * x + 3 * y) % 5];
      SHA3_PI.push(2 * (5 * y + x));
      SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
      let t2 = _0n;
      for (let j = 0; j < 7; j++) {
        R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
        if (R & _2n)
          t2 ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
      }
      _SHA3_IOTA.push(t2);
    }
    IOTAS = split(_SHA3_IOTA, true);
    SHA3_IOTA_H = IOTAS[0];
    SHA3_IOTA_L = IOTAS[1];
    rotlH = (h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s);
    rotlL = (h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s);
    Keccak = class _Keccak extends Hash {
      // NOTE: we accept arguments in bytes instead of bits here.
      constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
        super();
        this.pos = 0;
        this.posOut = 0;
        this.finished = false;
        this.destroyed = false;
        this.enableXOF = false;
        this.blockLen = blockLen;
        this.suffix = suffix;
        this.outputLen = outputLen;
        this.enableXOF = enableXOF;
        this.rounds = rounds;
        anumber(outputLen);
        if (!(0 < blockLen && blockLen < 200))
          throw new Error("only keccak-f1600 function is supported");
        this.state = new Uint8Array(200);
        this.state32 = u32(this.state);
      }
      clone() {
        return this._cloneInto();
      }
      keccak() {
        swap32IfBE(this.state32);
        keccakP(this.state32, this.rounds);
        swap32IfBE(this.state32);
        this.posOut = 0;
        this.pos = 0;
      }
      update(data) {
        aexists(this);
        data = toBytes2(data);
        abytes(data);
        const { blockLen, state } = this;
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          for (let i = 0; i < take; i++)
            state[this.pos++] ^= data[pos++];
          if (this.pos === blockLen)
            this.keccak();
        }
        return this;
      }
      finish() {
        if (this.finished)
          return;
        this.finished = true;
        const { state, suffix, pos, blockLen } = this;
        state[pos] ^= suffix;
        if ((suffix & 128) !== 0 && pos === blockLen - 1)
          this.keccak();
        state[blockLen - 1] ^= 128;
        this.keccak();
      }
      writeInto(out) {
        aexists(this, false);
        abytes(out);
        this.finish();
        const bufferOut = this.state;
        const { blockLen } = this;
        for (let pos = 0, len = out.length; pos < len; ) {
          if (this.posOut >= blockLen)
            this.keccak();
          const take = Math.min(blockLen - this.posOut, len - pos);
          out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
          this.posOut += take;
          pos += take;
        }
        return out;
      }
      xofInto(out) {
        if (!this.enableXOF)
          throw new Error("XOF is not possible for this instance");
        return this.writeInto(out);
      }
      xof(bytes) {
        anumber(bytes);
        return this.xofInto(new Uint8Array(bytes));
      }
      digestInto(out) {
        aoutput(out, this);
        if (this.finished)
          throw new Error("digest() was already called");
        this.writeInto(out);
        this.destroy();
        return out;
      }
      digest() {
        return this.digestInto(new Uint8Array(this.outputLen));
      }
      destroy() {
        this.destroyed = true;
        clean(this.state);
      }
      _cloneInto(to) {
        const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
        to || (to = new _Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
        to.state32.set(this.state32);
        to.pos = this.pos;
        to.posOut = this.posOut;
        to.finished = this.finished;
        to.rounds = rounds;
        to.suffix = suffix;
        to.outputLen = outputLen;
        to.enableXOF = enableXOF;
        to.destroyed = this.destroyed;
        return to;
      }
    };
    gen = (suffix, blockLen, outputLen) => createHasher(() => new Keccak(blockLen, suffix, outputLen));
    keccak_256 = /* @__PURE__ */ (() => gen(1, 136, 256 / 8))();
  }
});

// node_modules/viem/_esm/utils/hash/keccak256.js
function keccak256(value, to_) {
  const to = to_ || "hex";
  const bytes = keccak_256(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}
var init_keccak256 = __esm({
  "node_modules/viem/_esm/utils/hash/keccak256.js"() {
    init_sha3();
    init_isHex();
    init_toBytes();
    init_toHex();
  }
});

// node_modules/viem/_esm/utils/lru.js
var LruMap;
var init_lru = __esm({
  "node_modules/viem/_esm/utils/lru.js"() {
    LruMap = class extends Map {
      constructor(size2) {
        super();
        Object.defineProperty(this, "maxSize", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxSize = size2;
      }
      get(key) {
        const value = super.get(key);
        if (super.has(key)) {
          super.delete(key);
          super.set(key, value);
        }
        return value;
      }
      set(key, value) {
        if (super.has(key))
          super.delete(key);
        super.set(key, value);
        if (this.maxSize && this.size > this.maxSize) {
          const firstKey = super.keys().next().value;
          if (firstKey !== void 0)
            super.delete(firstKey);
        }
        return this;
      }
    };
  }
});

// node_modules/viem/_esm/utils/hash/hashSignature.js
function hashSignature(sig) {
  return hash(sig);
}
var hash;
var init_hashSignature = __esm({
  "node_modules/viem/_esm/utils/hash/hashSignature.js"() {
    init_toBytes();
    init_keccak256();
    hash = (value) => keccak256(toBytes(value));
  }
});

// node_modules/viem/_esm/utils/hash/normalizeSignature.js
function normalizeSignature(signature) {
  let active = true;
  let current = "";
  let level = 0;
  let result = "";
  let valid = false;
  for (let i = 0; i < signature.length; i++) {
    const char = signature[i];
    if (["(", ")", ","].includes(char))
      active = true;
    if (char === "(")
      level++;
    if (char === ")")
      level--;
    if (!active)
      continue;
    if (level === 0) {
      if (char === " " && ["event", "function", "error", ""].includes(result))
        result = "";
      else {
        result += char;
        if (char === ")") {
          valid = true;
          break;
        }
      }
      continue;
    }
    if (char === " ") {
      if (!current.endsWith(",") && !current.endsWith("(")) {
        current = "";
        active = false;
      }
      continue;
    }
    result += char;
    current += char;
  }
  if (!valid)
    throw new BaseError("Unable to normalize signature.");
  return result;
}
var init_normalizeSignature = __esm({
  "node_modules/viem/_esm/utils/hash/normalizeSignature.js"() {
    init_base();
  }
});

// node_modules/viem/_esm/utils/hash/toSignature.js
var toSignature;
var init_toSignature = __esm({
  "node_modules/viem/_esm/utils/hash/toSignature.js"() {
    init_exports();
    init_normalizeSignature();
    toSignature = (def) => {
      const def_ = (() => {
        if (typeof def === "string")
          return def;
        return formatAbiItem(def);
      })();
      return normalizeSignature(def_);
    };
  }
});

// node_modules/viem/_esm/utils/hash/toSignatureHash.js
function toSignatureHash(fn) {
  const definition = typeof fn === "string" ? fn : formatAbiItem(fn);
  const cached = signatureHashCache.get(definition);
  if (cached)
    return cached;
  const hash2 = hashSignature(toSignature(definition));
  signatureHashCache.set(definition, hash2);
  return hash2;
}
var signatureHashCache;
var init_toSignatureHash = __esm({
  "node_modules/viem/_esm/utils/hash/toSignatureHash.js"() {
    init_exports();
    init_lru();
    init_hashSignature();
    init_toSignature();
    signatureHashCache = /* @__PURE__ */ new LruMap(8192);
  }
});

// node_modules/viem/_esm/utils/hash/toEventSelector.js
var toEventSelector;
var init_toEventSelector = __esm({
  "node_modules/viem/_esm/utils/hash/toEventSelector.js"() {
    init_toSignatureHash();
    toEventSelector = toSignatureHash;
  }
});

// node_modules/viem/_esm/errors/address.js
var InvalidAddressError;
var init_address = __esm({
  "node_modules/viem/_esm/errors/address.js"() {
    init_base();
    InvalidAddressError = class extends BaseError {
      constructor({ address }) {
        super(`Address "${address}" is invalid.`, {
          metaMessages: [
            "- Address must be a hex value of 20 bytes (40 hex characters).",
            "- Address must match its checksum counterpart."
          ],
          name: "InvalidAddressError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/utils/address/getAddress.js
function checksumAddress(address_, chainId) {
  if (checksumAddressCache.has(`${address_}.${chainId}`))
    return checksumAddressCache.get(`${address_}.${chainId}`);
  const hexAddress = chainId ? `${chainId}${address_.toLowerCase()}` : address_.substring(2).toLowerCase();
  const hash2 = keccak256(stringToBytes(hexAddress), "bytes");
  const address = (chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress).split("");
  for (let i = 0; i < 40; i += 2) {
    if (hash2[i >> 1] >> 4 >= 8 && address[i]) {
      address[i] = address[i].toUpperCase();
    }
    if ((hash2[i >> 1] & 15) >= 8 && address[i + 1]) {
      address[i + 1] = address[i + 1].toUpperCase();
    }
  }
  const result = `0x${address.join("")}`;
  checksumAddressCache.set(`${address_}.${chainId}`, result);
  return result;
}
var checksumAddressCache;
var init_getAddress = __esm({
  "node_modules/viem/_esm/utils/address/getAddress.js"() {
    init_toBytes();
    init_keccak256();
    init_lru();
    checksumAddressCache = /* @__PURE__ */ new LruMap(8192);
  }
});

// node_modules/viem/_esm/utils/address/isAddress.js
function isAddress(address, options) {
  const { strict = true } = options ?? {};
  const cacheKey = `${address}.${strict}`;
  if (isAddressCache.has(cacheKey))
    return isAddressCache.get(cacheKey);
  const result = (() => {
    if (!addressRegex.test(address))
      return false;
    if (address.toLowerCase() === address)
      return true;
    if (strict)
      return checksumAddress(address) === address;
    return true;
  })();
  isAddressCache.set(cacheKey, result);
  return result;
}
var addressRegex, isAddressCache;
var init_isAddress = __esm({
  "node_modules/viem/_esm/utils/address/isAddress.js"() {
    init_lru();
    init_getAddress();
    addressRegex = /^0x[a-fA-F0-9]{40}$/;
    isAddressCache = /* @__PURE__ */ new LruMap(8192);
  }
});

// node_modules/viem/_esm/utils/data/concat.js
function concat(values) {
  if (typeof values[0] === "string")
    return concatHex(values);
  return concatBytes2(values);
}
function concatBytes2(values) {
  let length = 0;
  for (const arr of values) {
    length += arr.length;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const arr of values) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
function concatHex(values) {
  return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
}
var init_concat = __esm({
  "node_modules/viem/_esm/utils/data/concat.js"() {
  }
});

// node_modules/viem/_esm/utils/data/slice.js
function slice(value, start, end, { strict } = {}) {
  if (isHex(value, { strict: false }))
    return sliceHex(value, start, end, {
      strict
    });
  return sliceBytes(value, start, end, {
    strict
  });
}
function assertStartOffset(value, start) {
  if (typeof start === "number" && start > 0 && start > size(value) - 1)
    throw new SliceOffsetOutOfBoundsError({
      offset: start,
      position: "start",
      size: size(value)
    });
}
function assertEndOffset(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError({
      offset: end,
      position: "end",
      size: size(value)
    });
  }
}
function sliceBytes(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = value_.slice(start, end);
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
function sliceHex(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = `0x${value_.replace("0x", "").slice((start ?? 0) * 2, (end ?? value_.length) * 2)}`;
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
var init_slice = __esm({
  "node_modules/viem/_esm/utils/data/slice.js"() {
    init_data();
    init_isHex();
    init_size();
  }
});

// node_modules/viem/_esm/utils/regex.js
var bytesRegex, integerRegex;
var init_regex2 = __esm({
  "node_modules/viem/_esm/utils/regex.js"() {
    bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
    integerRegex = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
  }
});

// node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
function encodeAbiParameters(params, values) {
  if (params.length !== values.length)
    throw new AbiEncodingLengthMismatchError({
      expectedLength: params.length,
      givenLength: values.length
    });
  const preparedParams = prepareParams({
    params,
    values
  });
  return encodeParams(preparedParams);
}
function prepareParams({ params, values }) {
  const preparedParams = [];
  for (let i = 0; i < params.length; i++) {
    preparedParams.push(prepareParam({ param: params[i], value: values[i] }));
  }
  return preparedParams;
}
function prepareParam({ param, value }) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return encodeArray(value, { length, param: { ...param, type } });
  }
  if (param.type === "tuple") {
    return encodeTuple(value, {
      param
    });
  }
  if (param.type === "address") {
    return encodeAddress(value);
  }
  if (param.type === "bool") {
    return encodeBool(value);
  }
  if (param.type.startsWith("uint") || param.type.startsWith("int")) {
    const signed = param.type.startsWith("int");
    const [, , size2 = "256"] = integerRegex.exec(param.type) ?? [];
    return encodeNumber(value, {
      signed,
      size: Number(size2)
    });
  }
  if (param.type.startsWith("bytes")) {
    return encodeBytes(value, { param });
  }
  if (param.type === "string") {
    return encodeString(value);
  }
  throw new InvalidAbiEncodingTypeError(param.type, {
    docsPath: "/docs/contract/encodeAbiParameters"
  });
}
function encodeParams(preparedParams) {
  let staticSize = 0;
  for (let i = 0; i < preparedParams.length; i++) {
    const { dynamic, encoded: encoded2 } = preparedParams[i];
    if (dynamic)
      staticSize += 32;
    else
      staticSize += size(encoded2);
  }
  const staticParams = [];
  const dynamicParams = [];
  let dynamicSize = 0;
  for (let i = 0; i < preparedParams.length; i++) {
    const { dynamic, encoded: encoded2 } = preparedParams[i];
    if (dynamic) {
      staticParams.push(numberToHex(staticSize + dynamicSize, { size: 32 }));
      dynamicParams.push(encoded2);
      dynamicSize += size(encoded2);
    } else {
      staticParams.push(encoded2);
    }
  }
  return concatHex([...staticParams, ...dynamicParams]);
}
function encodeAddress(value) {
  if (!isAddress(value))
    throw new InvalidAddressError({ address: value });
  return { dynamic: false, encoded: padHex(value.toLowerCase()) };
}
function encodeArray(value, { length, param }) {
  const dynamic = length === null;
  if (!Array.isArray(value))
    throw new InvalidArrayError(value);
  if (!dynamic && value.length !== length)
    throw new AbiEncodingArrayLengthMismatchError({
      expectedLength: length,
      givenLength: value.length,
      type: `${param.type}[${length}]`
    });
  let dynamicChild = value.length === 0 && isDynamicType(param);
  const preparedParams = [];
  for (let i = 0; i < value.length; i++) {
    const preparedParam = prepareParam({ param, value: value[i] });
    if (preparedParam.dynamic)
      dynamicChild = true;
    preparedParams.push(preparedParam);
  }
  if (dynamic || dynamicChild) {
    const data = encodeParams(preparedParams);
    if (dynamic) {
      const length2 = numberToHex(preparedParams.length, { size: 32 });
      return {
        dynamic: true,
        encoded: concatHex([length2, data])
      };
    }
    if (dynamicChild)
      return { dynamic: true, encoded: data };
  }
  return {
    dynamic: false,
    encoded: concatHex(preparedParams.map(({ encoded: encoded2 }) => encoded2))
  };
}
function encodeBytes(value, { param }) {
  const [, paramSize] = param.type.split("bytes");
  const bytesSize = size(value);
  if (!paramSize) {
    let value_ = value;
    if (bytesSize % 32 !== 0)
      value_ = padHex(value_, {
        dir: "right",
        size: Math.ceil((value.length - 2) / 2 / 32) * 32
      });
    return {
      dynamic: true,
      encoded: concatHex([
        padHex(numberToHex(bytesSize, { size: 32 })),
        value_
      ])
    };
  }
  if (bytesSize !== Number.parseInt(paramSize, 10))
    throw new AbiEncodingBytesSizeMismatchError({
      expectedSize: Number.parseInt(paramSize, 10),
      value
    });
  return { dynamic: false, encoded: padHex(value, { dir: "right" }) };
}
function encodeBool(value) {
  if (typeof value !== "boolean")
    throw new BaseError(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
  return { dynamic: false, encoded: padHex(boolToHex(value)) };
}
function encodeNumber(value, { signed, size: size2 = 256 }) {
  if (typeof size2 === "number") {
    const max = 2n ** (BigInt(size2) - (signed ? 1n : 0n)) - 1n;
    const min = signed ? -max - 1n : 0n;
    if (value > max || value < min)
      throw new IntegerOutOfRangeError({
        max: max.toString(),
        min: min.toString(),
        signed,
        size: size2 / 8,
        value: value.toString()
      });
  }
  return {
    dynamic: false,
    encoded: numberToHex(value, {
      size: 32,
      signed
    })
  };
}
function encodeString(value) {
  const hexValue = stringToHex(value);
  const partsLength = Math.ceil(size(hexValue) / 32);
  const parts = [];
  for (let i = 0; i < partsLength; i++) {
    parts.push(padHex(slice(hexValue, i * 32, (i + 1) * 32), {
      dir: "right"
    }));
  }
  return {
    dynamic: true,
    encoded: concatHex([
      padHex(numberToHex(size(hexValue), { size: 32 })),
      ...parts
    ])
  };
}
function encodeTuple(value, { param }) {
  let dynamic = false;
  const preparedParams = [];
  for (let i = 0; i < param.components.length; i++) {
    const param_ = param.components[i];
    const index = Array.isArray(value) ? i : param_.name;
    const preparedParam = prepareParam({
      param: param_,
      value: value[index]
    });
    preparedParams.push(preparedParam);
    if (preparedParam.dynamic)
      dynamic = true;
  }
  return {
    dynamic,
    encoded: dynamic ? encodeParams(preparedParams) : concatHex(preparedParams.map(({ encoded: encoded2 }) => encoded2))
  };
}
function getArrayComponents(type) {
  const matches = type.match(/^(.*)\[(\d+)?\]$/);
  return matches ? (
    // Return `null` if the array is dynamic.
    [matches[2] ? Number(matches[2]) : null, matches[1]]
  ) : void 0;
}
function isDynamicType(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components.some(isDynamicType);
  const arrayComponents = getArrayComponents(type);
  if (arrayComponents)
    return isDynamicType({ ...param, type: arrayComponents[1] });
  return false;
}
var init_encodeAbiParameters = __esm({
  "node_modules/viem/_esm/utils/abi/encodeAbiParameters.js"() {
    init_abi();
    init_address();
    init_base();
    init_encoding();
    init_isAddress();
    init_concat();
    init_pad();
    init_size();
    init_slice();
    init_toHex();
    init_regex2();
  }
});

// node_modules/viem/_esm/utils/hash/toFunctionSelector.js
var toFunctionSelector;
var init_toFunctionSelector = __esm({
  "node_modules/viem/_esm/utils/hash/toFunctionSelector.js"() {
    init_slice();
    init_toSignatureHash();
    toFunctionSelector = (fn) => slice(toSignatureHash(fn), 0, 4);
  }
});

// node_modules/viem/_esm/utils/abi/getAbiItem.js
function getAbiItem(parameters) {
  const { abi, args = [], name } = parameters;
  const isSelector = isHex(name, { strict: false });
  const abiItems = abi.filter((abiItem) => {
    if (isSelector) {
      if (abiItem.type === "function")
        return toFunctionSelector(abiItem) === name;
      if (abiItem.type === "event")
        return toEventSelector(abiItem) === name;
      return false;
    }
    return "name" in abiItem && abiItem.name === name;
  });
  if (abiItems.length === 0)
    return void 0;
  if (abiItems.length === 1)
    return abiItems[0];
  let matchedAbiItem;
  for (const abiItem of abiItems) {
    if (!("inputs" in abiItem))
      continue;
    if (!args || args.length === 0) {
      if (!abiItem.inputs || abiItem.inputs.length === 0)
        return abiItem;
      continue;
    }
    if (!abiItem.inputs)
      continue;
    if (abiItem.inputs.length === 0)
      continue;
    if (abiItem.inputs.length !== args.length)
      continue;
    const matched = args.every((arg, index) => {
      const abiParameter = "inputs" in abiItem && abiItem.inputs[index];
      if (!abiParameter)
        return false;
      return isArgOfType(arg, abiParameter);
    });
    if (matched) {
      if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
        const ambiguousTypes = getAmbiguousTypes(abiItem.inputs, matchedAbiItem.inputs, args);
        if (ambiguousTypes)
          throw new AbiItemAmbiguityError({
            abiItem,
            type: ambiguousTypes[0]
          }, {
            abiItem: matchedAbiItem,
            type: ambiguousTypes[1]
          });
      }
      matchedAbiItem = abiItem;
    }
  }
  if (matchedAbiItem)
    return matchedAbiItem;
  return abiItems[0];
}
function isArgOfType(arg, abiParameter) {
  const argType = typeof arg;
  const abiParameterType = abiParameter.type;
  switch (abiParameterType) {
    case "address":
      return isAddress(arg, { strict: false });
    case "bool":
      return argType === "boolean";
    case "function":
      return argType === "string";
    case "string":
      return argType === "string";
    default: {
      if (abiParameterType === "tuple" && "components" in abiParameter)
        return Object.values(abiParameter.components).every((component, index) => {
          return argType === "object" && isArgOfType(getComponentValue(arg, component, index), component);
        });
      if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType)) {
        if (typeof arg !== "bigint" && typeof arg !== "number")
          return false;
        if (typeof arg === "number" && !Number.isInteger(arg))
          return false;
        const signed = abiParameterType.startsWith("int");
        const bits = Number.parseInt(abiParameterType.replace(/^u?int/, "") || "256", 10);
        const max = 2n ** (BigInt(bits) - (signed ? 1n : 0n)) - 1n;
        const min = signed ? -max - 1n : 0n;
        return arg >= min && arg <= max;
      }
      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType)) {
        if (typeof arg !== "string" && !(arg instanceof Uint8Array))
          return false;
        const bytes = abiParameterType.slice(5);
        if (!bytes)
          return arg instanceof Uint8Array || isHex(arg);
        if (typeof arg === "string" && !isHex(arg))
          return false;
        return size(arg) === Number.parseInt(bytes, 10);
      }
      const arrayComponents = getArrayComponents(abiParameterType);
      if (arrayComponents) {
        const [length, type] = arrayComponents;
        return Array.isArray(arg) && (length === null || arg.length === length) && arg.every((x) => isArgOfType(x, { ...abiParameter, type }));
      }
      return false;
    }
  }
}
function getAmbiguousTypes(sourceParameters, targetParameters, args) {
  for (const parameterIndex in sourceParameters) {
    const sourceParameter = sourceParameters[parameterIndex];
    const targetParameter = targetParameters[parameterIndex];
    if (!targetParameter)
      continue;
    if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter) {
      const value2 = args[parameterIndex];
      const types2 = getAmbiguousTypes(sourceParameter.components, targetParameter.components, sourceParameter.components.map((component, index) => getComponentValue(value2, component, index)));
      if (types2)
        return types2;
      continue;
    }
    const sourceArray = getArrayComponents(sourceParameter.type);
    const targetArray = getArrayComponents(targetParameter.type);
    if (sourceArray && targetArray) {
      const types2 = getAmbiguousTypes([{ ...sourceParameter, type: sourceArray[1] }], [{ ...targetParameter, type: targetArray[1] }], [args[parameterIndex]?.[0]]);
      if (types2)
        return types2;
      if (sourceArray[1] === targetArray[1] && sourceParameter.type !== targetParameter.type)
        return [sourceParameter.type, targetParameter.type];
      continue;
    }
    const types = [sourceParameter.type, targetParameter.type];
    const value = args[parameterIndex];
    const ambiguous = (() => {
      if (types.includes("address") && (types.includes("string") || types.includes("bytes")))
        return value === void 0 || isAddress(value, { strict: false });
      if (sourceParameter.type !== targetParameter.type)
        return true;
      return false;
    })();
    if (ambiguous)
      return types;
  }
  return;
}
function getComponentValue(arg, component, index) {
  if (Array.isArray(arg))
    return arg[index];
  return arg?.[component.name];
}
var init_getAbiItem = __esm({
  "node_modules/viem/_esm/utils/abi/getAbiItem.js"() {
    init_abi();
    init_isHex();
    init_isAddress();
    init_size();
    init_toEventSelector();
    init_toFunctionSelector();
    init_encodeAbiParameters();
  }
});

// node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js
function prepareEncodeFunctionData(parameters) {
  const { abi, args, functionName } = parameters;
  let abiItem = abi[0];
  if (functionName) {
    const item = getAbiItem({
      abi,
      args,
      name: functionName
    });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(void 0, { docsPath });
  return {
    abi: [abiItem],
    functionName: toFunctionSelector(formatAbiItem2(abiItem))
  };
}
var docsPath;
var init_prepareEncodeFunctionData = __esm({
  "node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js"() {
    init_abi();
    init_toFunctionSelector();
    init_formatAbiItem2();
    init_getAbiItem();
    docsPath = "/docs/contract/encodeFunctionData";
  }
});

// node_modules/viem/_esm/utils/abi/encodeFunctionData.js
function encodeFunctionData(parameters) {
  const { args } = parameters;
  const { abi, functionName } = (() => {
    if (parameters.abi.length === 1 && parameters.functionName?.startsWith("0x"))
      return parameters;
    return prepareEncodeFunctionData(parameters);
  })();
  const abiItem = abi[0];
  const signature = functionName;
  const data = "inputs" in abiItem && abiItem.inputs ? encodeAbiParameters(abiItem.inputs, args ?? []) : void 0;
  return concatHex([signature, data ?? "0x"]);
}
var init_encodeFunctionData = __esm({
  "node_modules/viem/_esm/utils/abi/encodeFunctionData.js"() {
    init_concat();
    init_encodeAbiParameters();
    init_prepareEncodeFunctionData();
  }
});

// node_modules/viem/_esm/errors/cursor.js
var NegativeOffsetError, PositionOutOfBoundsError, RecursiveReadLimitExceededError;
var init_cursor = __esm({
  "node_modules/viem/_esm/errors/cursor.js"() {
    init_base();
    NegativeOffsetError = class extends BaseError {
      constructor({ offset }) {
        super(`Offset \`${offset}\` cannot be negative.`, {
          name: "NegativeOffsetError"
        });
      }
    };
    PositionOutOfBoundsError = class extends BaseError {
      constructor({ length, position }) {
        super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`, { name: "PositionOutOfBoundsError" });
      }
    };
    RecursiveReadLimitExceededError = class extends BaseError {
      constructor({ count, limit }) {
        super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`, { name: "RecursiveReadLimitExceededError" });
      }
    };
  }
});

// node_modules/viem/_esm/utils/cursor.js
function createCursor(bytes, { recursiveReadLimit = 8192 } = {}) {
  const cursor = Object.create(staticCursor);
  cursor.bytes = bytes;
  cursor.dataView = new DataView(bytes.buffer ?? bytes, bytes.byteOffset, bytes.byteLength);
  cursor.positionReadCount = /* @__PURE__ */ new Map();
  cursor.recursiveReadLimit = recursiveReadLimit;
  return cursor;
}
var staticCursor;
var init_cursor2 = __esm({
  "node_modules/viem/_esm/utils/cursor.js"() {
    init_cursor();
    staticCursor = {
      bytes: new Uint8Array(),
      dataView: new DataView(new ArrayBuffer(0)),
      position: 0,
      positionReadCount: /* @__PURE__ */ new Map(),
      recursiveReadCount: 0,
      recursiveReadLimit: Number.POSITIVE_INFINITY,
      assertReadLimit() {
        if (this.recursiveReadCount >= this.recursiveReadLimit)
          throw new RecursiveReadLimitExceededError({
            count: this.recursiveReadCount + 1,
            limit: this.recursiveReadLimit
          });
      },
      assertPosition(position) {
        if (position < 0 || position > this.bytes.length - 1)
          throw new PositionOutOfBoundsError({
            length: this.bytes.length,
            position
          });
      },
      decrementPosition(offset) {
        if (offset < 0)
          throw new NegativeOffsetError({ offset });
        const position = this.position - offset;
        this.assertPosition(position);
        this.position = position;
      },
      getReadCount(position) {
        return this.positionReadCount.get(position || this.position) || 0;
      },
      incrementPosition(offset) {
        if (offset < 0)
          throw new NegativeOffsetError({ offset });
        const position = this.position + offset;
        this.assertPosition(position);
        this.position = position;
      },
      inspectByte(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
      },
      inspectBytes(length, position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + length - 1);
        return this.bytes.subarray(position, position + length);
      },
      inspectUint8(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
      },
      inspectUint16(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 1);
        return this.dataView.getUint16(position);
      },
      inspectUint24(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 2);
        return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
      },
      inspectUint32(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 3);
        return this.dataView.getUint32(position);
      },
      pushByte(byte) {
        this.assertPosition(this.position);
        this.bytes[this.position] = byte;
        this.position++;
      },
      pushBytes(bytes) {
        this.assertPosition(this.position + bytes.length - 1);
        this.bytes.set(bytes, this.position);
        this.position += bytes.length;
      },
      pushUint8(value) {
        this.assertPosition(this.position);
        this.bytes[this.position] = value;
        this.position++;
      },
      pushUint16(value) {
        this.assertPosition(this.position + 1);
        this.dataView.setUint16(this.position, value);
        this.position += 2;
      },
      pushUint24(value) {
        this.assertPosition(this.position + 2);
        this.dataView.setUint16(this.position, value >> 8);
        this.dataView.setUint8(this.position + 2, value & ~4294967040);
        this.position += 3;
      },
      pushUint32(value) {
        this.assertPosition(this.position + 3);
        this.dataView.setUint32(this.position, value);
        this.position += 4;
      },
      readByte() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectByte();
        this.position++;
        return value;
      },
      readBytes(length, size2) {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectBytes(length);
        this.position += size2 ?? length;
        return value;
      },
      readUint8() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint8();
        this.position += 1;
        return value;
      },
      readUint16() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint16();
        this.position += 2;
        return value;
      },
      readUint24() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint24();
        this.position += 3;
        return value;
      },
      readUint32() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint32();
        this.position += 4;
        return value;
      },
      get remaining() {
        return this.bytes.length - this.position;
      },
      setPosition(position) {
        const oldPosition = this.position;
        this.assertPosition(position);
        this.position = position;
        return () => this.position = oldPosition;
      },
      _touch() {
        if (this.recursiveReadLimit === Number.POSITIVE_INFINITY)
          return;
        const count = this.getReadCount();
        this.positionReadCount.set(this.position, count + 1);
        if (count > 0)
          this.recursiveReadCount++;
      }
    };
  }
});

// node_modules/viem/_esm/utils/stringify.js
var stringify;
var init_stringify = __esm({
  "node_modules/viem/_esm/utils/stringify.js"() {
    stringify = (value, replacer, space) => JSON.stringify(value, (key, value_) => {
      const value2 = typeof value_ === "bigint" ? value_.toString() : value_;
      return typeof replacer === "function" ? replacer(key, value2) : value2;
    }, space);
  }
});

// node_modules/viem/_esm/utils/unit/Value.js
function format(value, decimals = 0) {
  if (!Number.isInteger(decimals) || decimals < 0)
    throw new InvalidDecimalsError({ decimals });
  let display = value.toString();
  const negative = display.startsWith("-");
  if (negative)
    display = display.slice(1);
  display = display.padStart(decimals, "0");
  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals)
  ];
  fraction = fraction.replace(/(0+)$/, "");
  return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
}
function formatGwei(wei, unit = "wei") {
  return format(wei, exponents.gwei - exponents[unit]);
}
var exponents, InvalidDecimalsError;
var init_Value = __esm({
  "node_modules/viem/_esm/utils/unit/Value.js"() {
    exponents = {
      wei: 0,
      gwei: 9,
      szabo: 12,
      finney: 15,
      ether: 18
    };
    InvalidDecimalsError = class extends Error {
      constructor({ decimals }) {
        super(`\`decimals\` must be a non-negative integer. Got \`${decimals}\`.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Value.InvalidDecimalsError"
        });
      }
    };
  }
});

// node_modules/viem/_esm/utils/unit/formatGwei.js
function formatGwei2(wei, unit = "wei") {
  return formatGwei(wei, unit);
}
var init_formatGwei = __esm({
  "node_modules/viem/_esm/utils/unit/formatGwei.js"() {
    init_Value();
  }
});

// node_modules/viem/_esm/errors/transaction.js
function prettyPrint(args) {
  const entries = Object.entries(args).map(([key, value]) => {
    if (value === void 0 || value === false)
      return null;
    return [key, value];
  }).filter(Boolean);
  const maxLength = entries.reduce((acc, [key]) => Math.max(acc, key.length), 0);
  return entries.map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`).join("\n");
}
var InvalidLegacyVError, InvalidSerializableTransactionError, InvalidStorageKeySizeError;
var init_transaction = __esm({
  "node_modules/viem/_esm/errors/transaction.js"() {
    init_base();
    InvalidLegacyVError = class extends BaseError {
      constructor({ v }) {
        super(`Invalid \`v\` value "${v}". Expected 27 or 28.`, {
          name: "InvalidLegacyVError"
        });
      }
    };
    InvalidSerializableTransactionError = class extends BaseError {
      constructor({ transaction }) {
        super("Cannot infer a transaction type from provided transaction.", {
          metaMessages: [
            "Provided Transaction:",
            "{",
            prettyPrint(transaction),
            "}",
            "",
            "To infer the type, either provide:",
            "- a `type` to the Transaction, or",
            "- an EIP-1559 Transaction with `maxFeePerGas`, or",
            "- an EIP-2930 Transaction with `gasPrice` & `accessList`, or",
            "- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or",
            "- an EIP-7702 Transaction with `authorizationList`, or",
            "- a Legacy Transaction with `gasPrice`"
          ],
          name: "InvalidSerializableTransactionError"
        });
      }
    };
    InvalidStorageKeySizeError = class extends BaseError {
      constructor({ storageKey }) {
        super(`Size for storage key "${storageKey}" is invalid. Expected 32 bytes. Got ${Math.floor((storageKey.length - 2) / 2)} bytes.`, { name: "InvalidStorageKeySizeError" });
      }
    };
  }
});

// node_modules/viem/_esm/errors/node.js
var ExecutionRevertedError, FeeCapTooHighError, FeeCapTooLowError, NonceTooHighError, NonceTooLowError, NonceMaxValueError, InsufficientFundsError, IntrinsicGasTooHighError, IntrinsicGasTooLowError, TransactionTypeNotSupportedError, TipAboveFeeCapError;
var init_node = __esm({
  "node_modules/viem/_esm/errors/node.js"() {
    init_formatGwei();
    init_base();
    ExecutionRevertedError = class extends BaseError {
      constructor({ cause, message } = {}) {
        const reason = message?.replace("execution reverted: ", "")?.replace("execution reverted", "");
        super(`Execution reverted ${reason ? `with reason: ${reason}` : "for an unknown reason"}.`, {
          cause,
          name: "ExecutionRevertedError"
        });
      }
    };
    Object.defineProperty(ExecutionRevertedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 3
    });
    Object.defineProperty(ExecutionRevertedError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /execution reverted|gas required exceeds allowance/
    });
    FeeCapTooHighError = class extends BaseError {
      constructor({ cause, maxFeePerGas } = {}) {
        super(`The fee cap (\`maxFeePerGas\`${typeof maxFeePerGas === "bigint" ? ` = ${formatGwei2(maxFeePerGas)} gwei` : ""}) cannot be higher than the maximum allowed value (2^256-1).`, {
          cause,
          name: "FeeCapTooHighError"
        });
      }
    };
    Object.defineProperty(FeeCapTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/
    });
    FeeCapTooLowError = class extends BaseError {
      constructor({ cause, maxFeePerGas } = {}) {
        super(`The fee cap (\`maxFeePerGas\`${typeof maxFeePerGas === "bigint" ? ` = ${formatGwei2(maxFeePerGas)} gwei` : ""}) cannot be lower than the block base fee.`, {
          cause,
          name: "FeeCapTooLowError"
        });
      }
    };
    Object.defineProperty(FeeCapTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/
    });
    NonceTooHighError = class extends BaseError {
      constructor({ cause, nonce } = {}) {
        super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is higher than the next one expected.`, { cause, name: "NonceTooHighError" });
      }
    };
    Object.defineProperty(NonceTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce too high/
    });
    NonceTooLowError = class extends BaseError {
      constructor({ cause, nonce } = {}) {
        super([
          `Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is lower than the current nonce of the account.`,
          "Try increasing the nonce or find the latest nonce with `getTransactionCount`."
        ].join("\n"), { cause, name: "NonceTooLowError" });
      }
    };
    Object.defineProperty(NonceTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce too low|transaction already imported|already known/
    });
    NonceMaxValueError = class extends BaseError {
      constructor({ cause, nonce } = {}) {
        super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}exceeds the maximum allowed nonce.`, { cause, name: "NonceMaxValueError" });
      }
    };
    Object.defineProperty(NonceMaxValueError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce has max value/
    });
    InsufficientFundsError = class extends BaseError {
      constructor({ cause } = {}) {
        super([
          "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account."
        ].join("\n"), {
          cause,
          metaMessages: [
            "This error could arise when the account does not have enough funds to:",
            " - pay for the total gas fee,",
            " - pay for the value to send.",
            " ",
            "The cost of the transaction is calculated as `gas * gas fee + value`, where:",
            " - `gas` is the amount of gas needed for transaction to execute,",
            " - `gas fee` is the gas fee,",
            " - `value` is the amount of ether to send to the recipient."
          ],
          name: "InsufficientFundsError"
        });
      }
    };
    Object.defineProperty(InsufficientFundsError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /insufficient funds|exceeds transaction sender account balance|outoffunds/
    });
    IntrinsicGasTooHighError = class extends BaseError {
      constructor({ cause, gas } = {}) {
        super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction exceeds the limit allowed for the block.`, {
          cause,
          name: "IntrinsicGasTooHighError"
        });
      }
    };
    Object.defineProperty(IntrinsicGasTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /intrinsic gas too high|gas limit reached/
    });
    IntrinsicGasTooLowError = class extends BaseError {
      constructor({ cause, gas } = {}) {
        super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction is too low.`, {
          cause,
          name: "IntrinsicGasTooLowError"
        });
      }
    };
    Object.defineProperty(IntrinsicGasTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /intrinsic gas too low/
    });
    TransactionTypeNotSupportedError = class extends BaseError {
      constructor({ cause }) {
        super("The transaction type is not supported for this chain.", {
          cause,
          name: "TransactionTypeNotSupportedError"
        });
      }
    };
    Object.defineProperty(TransactionTypeNotSupportedError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /transaction type not valid/
    });
    TipAboveFeeCapError = class extends BaseError {
      constructor({ cause, maxPriorityFeePerGas, maxFeePerGas } = {}) {
        super([
          `The provided tip (\`maxPriorityFeePerGas\`${typeof maxPriorityFeePerGas === "bigint" ? ` = ${formatGwei2(maxPriorityFeePerGas)} gwei` : ""}) cannot be higher than the fee cap (\`maxFeePerGas\`${typeof maxFeePerGas === "bigint" ? ` = ${formatGwei2(maxFeePerGas)} gwei` : ""}).`
        ].join("\n"), {
          cause,
          name: "TipAboveFeeCapError"
        });
      }
    };
    Object.defineProperty(TipAboveFeeCapError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max priority fee per gas higher than max fee per gas|tip higher than fee cap/
    });
  }
});

// node_modules/viem/_esm/constants/number.js
var maxInt8, maxInt16, maxInt24, maxInt32, maxInt40, maxInt48, maxInt56, maxInt64, maxInt72, maxInt80, maxInt88, maxInt96, maxInt104, maxInt112, maxInt120, maxInt128, maxInt136, maxInt144, maxInt152, maxInt160, maxInt168, maxInt176, maxInt184, maxInt192, maxInt200, maxInt208, maxInt216, maxInt224, maxInt232, maxInt240, maxInt248, maxInt256, minInt8, minInt16, minInt24, minInt32, minInt40, minInt48, minInt56, minInt64, minInt72, minInt80, minInt88, minInt96, minInt104, minInt112, minInt120, minInt128, minInt136, minInt144, minInt152, minInt160, minInt168, minInt176, minInt184, minInt192, minInt200, minInt208, minInt216, minInt224, minInt232, minInt240, minInt248, minInt256, maxUint8, maxUint16, maxUint24, maxUint32, maxUint40, maxUint48, maxUint56, maxUint64, maxUint72, maxUint80, maxUint88, maxUint96, maxUint104, maxUint112, maxUint120, maxUint128, maxUint136, maxUint144, maxUint152, maxUint160, maxUint168, maxUint176, maxUint184, maxUint192, maxUint200, maxUint208, maxUint216, maxUint224, maxUint232, maxUint240, maxUint248, maxUint256;
var init_number = __esm({
  "node_modules/viem/_esm/constants/number.js"() {
    maxInt8 = 2n ** (8n - 1n) - 1n;
    maxInt16 = 2n ** (16n - 1n) - 1n;
    maxInt24 = 2n ** (24n - 1n) - 1n;
    maxInt32 = 2n ** (32n - 1n) - 1n;
    maxInt40 = 2n ** (40n - 1n) - 1n;
    maxInt48 = 2n ** (48n - 1n) - 1n;
    maxInt56 = 2n ** (56n - 1n) - 1n;
    maxInt64 = 2n ** (64n - 1n) - 1n;
    maxInt72 = 2n ** (72n - 1n) - 1n;
    maxInt80 = 2n ** (80n - 1n) - 1n;
    maxInt88 = 2n ** (88n - 1n) - 1n;
    maxInt96 = 2n ** (96n - 1n) - 1n;
    maxInt104 = 2n ** (104n - 1n) - 1n;
    maxInt112 = 2n ** (112n - 1n) - 1n;
    maxInt120 = 2n ** (120n - 1n) - 1n;
    maxInt128 = 2n ** (128n - 1n) - 1n;
    maxInt136 = 2n ** (136n - 1n) - 1n;
    maxInt144 = 2n ** (144n - 1n) - 1n;
    maxInt152 = 2n ** (152n - 1n) - 1n;
    maxInt160 = 2n ** (160n - 1n) - 1n;
    maxInt168 = 2n ** (168n - 1n) - 1n;
    maxInt176 = 2n ** (176n - 1n) - 1n;
    maxInt184 = 2n ** (184n - 1n) - 1n;
    maxInt192 = 2n ** (192n - 1n) - 1n;
    maxInt200 = 2n ** (200n - 1n) - 1n;
    maxInt208 = 2n ** (208n - 1n) - 1n;
    maxInt216 = 2n ** (216n - 1n) - 1n;
    maxInt224 = 2n ** (224n - 1n) - 1n;
    maxInt232 = 2n ** (232n - 1n) - 1n;
    maxInt240 = 2n ** (240n - 1n) - 1n;
    maxInt248 = 2n ** (248n - 1n) - 1n;
    maxInt256 = 2n ** (256n - 1n) - 1n;
    minInt8 = -(2n ** (8n - 1n));
    minInt16 = -(2n ** (16n - 1n));
    minInt24 = -(2n ** (24n - 1n));
    minInt32 = -(2n ** (32n - 1n));
    minInt40 = -(2n ** (40n - 1n));
    minInt48 = -(2n ** (48n - 1n));
    minInt56 = -(2n ** (56n - 1n));
    minInt64 = -(2n ** (64n - 1n));
    minInt72 = -(2n ** (72n - 1n));
    minInt80 = -(2n ** (80n - 1n));
    minInt88 = -(2n ** (88n - 1n));
    minInt96 = -(2n ** (96n - 1n));
    minInt104 = -(2n ** (104n - 1n));
    minInt112 = -(2n ** (112n - 1n));
    minInt120 = -(2n ** (120n - 1n));
    minInt128 = -(2n ** (128n - 1n));
    minInt136 = -(2n ** (136n - 1n));
    minInt144 = -(2n ** (144n - 1n));
    minInt152 = -(2n ** (152n - 1n));
    minInt160 = -(2n ** (160n - 1n));
    minInt168 = -(2n ** (168n - 1n));
    minInt176 = -(2n ** (176n - 1n));
    minInt184 = -(2n ** (184n - 1n));
    minInt192 = -(2n ** (192n - 1n));
    minInt200 = -(2n ** (200n - 1n));
    minInt208 = -(2n ** (208n - 1n));
    minInt216 = -(2n ** (216n - 1n));
    minInt224 = -(2n ** (224n - 1n));
    minInt232 = -(2n ** (232n - 1n));
    minInt240 = -(2n ** (240n - 1n));
    minInt248 = -(2n ** (248n - 1n));
    minInt256 = -(2n ** (256n - 1n));
    maxUint8 = 2n ** 8n - 1n;
    maxUint16 = 2n ** 16n - 1n;
    maxUint24 = 2n ** 24n - 1n;
    maxUint32 = 2n ** 32n - 1n;
    maxUint40 = 2n ** 40n - 1n;
    maxUint48 = 2n ** 48n - 1n;
    maxUint56 = 2n ** 56n - 1n;
    maxUint64 = 2n ** 64n - 1n;
    maxUint72 = 2n ** 72n - 1n;
    maxUint80 = 2n ** 80n - 1n;
    maxUint88 = 2n ** 88n - 1n;
    maxUint96 = 2n ** 96n - 1n;
    maxUint104 = 2n ** 104n - 1n;
    maxUint112 = 2n ** 112n - 1n;
    maxUint120 = 2n ** 120n - 1n;
    maxUint128 = 2n ** 128n - 1n;
    maxUint136 = 2n ** 136n - 1n;
    maxUint144 = 2n ** 144n - 1n;
    maxUint152 = 2n ** 152n - 1n;
    maxUint160 = 2n ** 160n - 1n;
    maxUint168 = 2n ** 168n - 1n;
    maxUint176 = 2n ** 176n - 1n;
    maxUint184 = 2n ** 184n - 1n;
    maxUint192 = 2n ** 192n - 1n;
    maxUint200 = 2n ** 200n - 1n;
    maxUint208 = 2n ** 208n - 1n;
    maxUint216 = 2n ** 216n - 1n;
    maxUint224 = 2n ** 224n - 1n;
    maxUint232 = 2n ** 232n - 1n;
    maxUint240 = 2n ** 240n - 1n;
    maxUint248 = 2n ** 248n - 1n;
    maxUint256 = 2n ** 256n - 1n;
  }
});

// node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view2, byteOffset, value, isLE2) {
  if (typeof view2.setBigUint64 === "function")
    return view2.setBigUint64(byteOffset, value, isLE2);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE2 ? 4 : 0;
  const l = isLE2 ? 0 : 4;
  view2.setUint32(byteOffset + h, wh, isLE2);
  view2.setUint32(byteOffset + l, wl, isLE2);
}
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD, SHA256_IV;
var init_md = __esm({
  "node_modules/@noble/hashes/esm/_md.js"() {
    init_utils();
    HashMD = class extends Hash {
      constructor(blockLen, outputLen, padOffset, isLE2) {
        super();
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE2;
        this.buffer = new Uint8Array(blockLen);
        this.view = createView(this.buffer);
      }
      update(data) {
        aexists(this);
        data = toBytes2(data);
        abytes(data);
        const { view: view2, buffer, blockLen } = this;
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView = createView(data);
            for (; blockLen <= len - pos; pos += blockLen)
              this.process(dataView, pos);
            continue;
          }
          buffer.set(data.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view2, 0);
            this.pos = 0;
          }
        }
        this.length += data.length;
        this.roundClean();
        return this;
      }
      digestInto(out) {
        aexists(this);
        aoutput(out, this);
        this.finished = true;
        const { buffer, view: view2, blockLen, isLE: isLE2 } = this;
        let { pos } = this;
        buffer[pos++] = 128;
        clean(this.buffer.subarray(pos));
        if (this.padOffset > blockLen - pos) {
          this.process(view2, 0);
          pos = 0;
        }
        for (let i = pos; i < blockLen; i++)
          buffer[i] = 0;
        setBigUint64(view2, blockLen - 8, BigInt(this.length * 8), isLE2);
        this.process(view2, 0);
        const oview = createView(out);
        const len = this.outputLen;
        if (len % 4)
          throw new Error("_sha2: outputLen should be aligned to 32bit");
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
          throw new Error("_sha2: outputLen bigger than state");
        for (let i = 0; i < outLen; i++)
          oview.setUint32(4 * i, state[i], isLE2);
      }
      digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer, length, finished, destroyed, pos } = this;
        to.destroyed = destroyed;
        to.finished = finished;
        to.length = length;
        to.pos = pos;
        if (length % blockLen)
          to.buffer.set(buffer);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
    };
    SHA256_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
  }
});

// node_modules/@noble/hashes/esm/sha2.js
var SHA256_K, SHA256_W, SHA256, sha256;
var init_sha2 = __esm({
  "node_modules/@noble/hashes/esm/sha2.js"() {
    init_md();
    init_utils();
    SHA256_K = /* @__PURE__ */ Uint32Array.from([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    SHA256_W = /* @__PURE__ */ new Uint32Array(64);
    SHA256 = class extends HashMD {
      constructor(outputLen = 32) {
        super(64, outputLen, 8, false);
        this.A = SHA256_IV[0] | 0;
        this.B = SHA256_IV[1] | 0;
        this.C = SHA256_IV[2] | 0;
        this.D = SHA256_IV[3] | 0;
        this.E = SHA256_IV[4] | 0;
        this.F = SHA256_IV[5] | 0;
        this.G = SHA256_IV[6] | 0;
        this.H = SHA256_IV[7] | 0;
      }
      get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
      }
      // prettier-ignore
      set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
      }
      process(view2, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          SHA256_W[i] = view2.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
          const W15 = SHA256_W[i - 15];
          const W2 = SHA256_W[i - 2];
          const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
          const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
          SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
        }
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
          const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
          const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
          const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
          const T2 = sigma0 + Maj(A, B, C) | 0;
          H = G;
          G = F;
          F = E;
          E = D + T1 | 0;
          D = C;
          C = B;
          B = A;
          A = T1 + T2 | 0;
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D, E, F, G, H);
      }
      roundClean() {
        clean(SHA256_W);
      }
      destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        clean(this.buffer);
      }
    };
    sha256 = /* @__PURE__ */ createHasher(() => new SHA256());
  }
});

// node_modules/@noble/curves/esm/abstract/utils.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes2(item) {
  if (!isBytes2(item))
    throw new Error("Uint8Array expected");
}
function abool(title, value) {
  if (typeof value !== "boolean")
    throw new Error(title + " boolean expected, got " + value);
}
function numberToHexUnpadded(num) {
  const hex = num.toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n2 : BigInt("0x" + hex);
}
function bytesToHex2(bytes) {
  abytes2(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes2[bytes[i]];
  }
  return hex;
}
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function bytesToNumberBE(bytes) {
  return hexToNumber2(bytesToHex2(bytes));
}
function bytesToNumberLE(bytes) {
  abytes2(bytes);
  return hexToNumber2(bytesToHex2(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n, len) {
  return hexToBytes2(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes2(hex);
    } catch (e) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
    }
  } else if (isBytes2(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
function concatBytes3(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes2(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad2 = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  let len;
  for (len = 0; n > _0n2; n >>= _1n2, len += 1)
    ;
  return len;
}
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number");
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const h = (...b) => hmacFn(k, v, ...b);
  const reseed = (seed = u8n(0)) => {
    k = h(u8fr([0]), seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(u8fr([1]), seed);
    v = h();
  };
  const gen2 = () => {
    if (i++ >= 1e3)
      throw new Error("drbg: tried 1000 values");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes3(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while (!(res = pred(gen2())))
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject(object, validators, optValidators = {}) {
  const checkField = (fieldName, type, isOptional) => {
    const checkVal = validatorFns[type];
    if (typeof checkVal !== "function")
      throw new Error("invalid validator function");
    const val = object[fieldName];
    if (isOptional && val === void 0)
      return;
    if (!checkVal(val, object)) {
      throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
    }
  };
  for (const [fieldName, type] of Object.entries(validators))
    checkField(fieldName, type, false);
  for (const [fieldName, type] of Object.entries(optValidators))
    checkField(fieldName, type, true);
  return object;
}
function memoized(fn) {
  const map = /* @__PURE__ */ new WeakMap();
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== void 0)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}
var _0n2, _1n2, hasHexBuiltin, hexes2, asciis, isPosBig, bitMask, u8n, u8fr, validatorFns;
var init_utils2 = __esm({
  "node_modules/@noble/curves/esm/abstract/utils.js"() {
    _0n2 = /* @__PURE__ */ BigInt(0);
    _1n2 = /* @__PURE__ */ BigInt(1);
    hasHexBuiltin = // @ts-ignore
    typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
    hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
    asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
    isPosBig = (n) => typeof n === "bigint" && _0n2 <= n;
    bitMask = (n) => (_1n2 << BigInt(n)) - _1n2;
    u8n = (len) => new Uint8Array(len);
    u8fr = (arr) => Uint8Array.from(arr);
    validatorFns = {
      bigint: (val) => typeof val === "bigint",
      function: (val) => typeof val === "function",
      boolean: (val) => typeof val === "boolean",
      string: (val) => typeof val === "string",
      stringOrUint8Array: (val) => typeof val === "string" || isBytes2(val),
      isSafeInteger: (val) => Number.isSafeInteger(val),
      array: (val) => Array.isArray(val),
      field: (val, object) => object.Fp.isValid(val),
      hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
    };
  }
});

// node_modules/viem/_esm/errors/chain.js
var InvalidChainIdError;
var init_chain = __esm({
  "node_modules/viem/_esm/errors/chain.js"() {
    init_base();
    InvalidChainIdError = class extends BaseError {
      constructor({ chainId }) {
        super(typeof chainId === "number" ? `Chain ID "${chainId}" is invalid.` : "Chain ID is invalid.", { name: "InvalidChainIdError" });
      }
    };
  }
});

// node_modules/@noble/hashes/esm/hmac.js
var HMAC, hmac;
var init_hmac = __esm({
  "node_modules/@noble/hashes/esm/hmac.js"() {
    init_utils();
    HMAC = class extends Hash {
      constructor(hash2, _key) {
        super();
        this.finished = false;
        this.destroyed = false;
        ahash(hash2);
        const key = toBytes2(_key);
        this.iHash = hash2.create();
        if (typeof this.iHash.update !== "function")
          throw new Error("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad2 = new Uint8Array(blockLen);
        pad2.set(key.length > blockLen ? hash2.create().update(key).digest() : key);
        for (let i = 0; i < pad2.length; i++)
          pad2[i] ^= 54;
        this.iHash.update(pad2);
        this.oHash = hash2.create();
        for (let i = 0; i < pad2.length; i++)
          pad2[i] ^= 54 ^ 92;
        this.oHash.update(pad2);
        clean(pad2);
      }
      update(buf) {
        aexists(this);
        this.iHash.update(buf);
        return this;
      }
      digestInto(out) {
        aexists(this);
        abytes(out, this.outputLen);
        this.finished = true;
        this.iHash.digestInto(out);
        this.oHash.update(out);
        this.oHash.digestInto(out);
        this.destroy();
      }
      digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
      }
      _cloneInto(to) {
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
      destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
      }
    };
    hmac = (hash2, key, message) => new HMAC(hash2, key).update(message).digest();
    hmac.create = (hash2, key) => new HMAC(hash2, key);
  }
});

// node_modules/@noble/curves/esm/abstract/modular.js
function mod(a, b) {
  const result = a % b;
  return result >= _0n3 ? result : b + result;
}
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n3) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n3)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n3)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n3, y = _1n3, u = _1n3, v = _0n3;
  while (a !== _0n3) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n3)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function sqrt3mod4(Fp, n) {
  const p1div4 = (Fp.ORDER + _1n3) / _4n;
  const root = Fp.pow(n, p1div4);
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
function sqrt5mod8(Fp, n) {
  const p5div8 = (Fp.ORDER - _5n) / _8n;
  const n2 = Fp.mul(n, _2n2);
  const v = Fp.pow(n2, p5div8);
  const nv = Fp.mul(n, v);
  const i = Fp.mul(Fp.mul(nv, _2n2), v);
  const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
function tonelliShanks(P) {
  if (P < BigInt(3))
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n3;
  let S = 0;
  while (Q % _2n2 === _0n3) {
    Q /= _2n2;
    S++;
  }
  let Z = _2n2;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n3) / _2n2;
  return function tonelliSlow(Fp, n) {
    if (Fp.is0(n))
      return n;
    if (FpLegendre(Fp, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = Fp.mul(Fp.ONE, cc);
    let t2 = Fp.pow(n, Q);
    let R = Fp.pow(n, Q1div2);
    while (!Fp.eql(t2, Fp.ONE)) {
      if (Fp.is0(t2))
        return Fp.ZERO;
      let i = 1;
      let t_tmp = Fp.sqr(t2);
      while (!Fp.eql(t_tmp, Fp.ONE)) {
        i++;
        t_tmp = Fp.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n3 << BigInt(M - i - 1);
      const b = Fp.pow(c, exponent);
      M = i;
      c = Fp.sqr(b);
      t2 = Fp.mul(t2, c);
      R = Fp.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  return tonelliShanks(P);
}
function validateField2(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "isSafeInteger",
    BITS: "isSafeInteger"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  return validateObject(field, opts);
}
function FpPow(Fp, num, power) {
  if (power < _0n3)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n3)
    return Fp.ONE;
  if (power === _1n3)
    return num;
  let p = Fp.ONE;
  let d = num;
  while (power > _0n3) {
    if (power & _1n3)
      p = Fp.mul(p, d);
    d = Fp.sqr(d);
    power >>= _1n3;
  }
  return p;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num, i) => {
    if (Fp.is0(num))
      return acc;
    inverted[i] = acc;
    return Fp.mul(acc, num);
  }, Fp.ONE);
  const invertedAcc = Fp.inv(multipliedAcc);
  nums.reduceRight((acc, num, i) => {
    if (Fp.is0(num))
      return acc;
    inverted[i] = Fp.mul(acc, inverted[i]);
    return Fp.mul(acc, num);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  const p1mod2 = (Fp.ORDER - _1n3) / _2n2;
  const powered = Fp.pow(n, p1mod2);
  const yes = Fp.eql(powered, Fp.ONE);
  const zero = Fp.eql(powered, Fp.ZERO);
  const no = Fp.eql(powered, Fp.neg(Fp.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber(nBitLength);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field(ORDER, bitLen2, isLE2 = false, redef = {}) {
  if (ORDER <= _0n3)
    throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen2);
  if (BYTES > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let sqrtP;
  const f = Object.freeze({
    ORDER,
    isLE: isLE2,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n3,
    ONE: _1n3,
    create: (num) => mod(num, ORDER),
    isValid: (num) => {
      if (typeof num !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num);
      return _0n3 <= num && num < ORDER;
    },
    is0: (num) => num === _0n3,
    isOdd: (num) => (num & _1n3) === _1n3,
    neg: (num) => mod(-num, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num) => mod(num * num, ORDER),
    add: (lhs, rhs) => mod(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
    pow: (num, power) => FpPow(f, num, power),
    div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
    // Same as above, but doesn't normalize
    sqrN: (num) => num * num,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num) => invert(num, ORDER),
    sqrt: redef.sqrt || ((n) => {
      if (!sqrtP)
        sqrtP = FpSqrt(ORDER);
      return sqrtP(f, n);
    }),
    toBytes: (num) => isLE2 ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
    fromBytes: (bytes) => {
      if (bytes.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
      return isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    },
    // TODO: we don't need it here, move out to separate fn
    invertBatch: (lst) => FpInvertBatch(f, lst),
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov: (a, b, c) => c ? b : a
  });
  return Object.freeze(f);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE2 = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num = isLE2 ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num, fieldOrder - _1n3) + _1n3;
  return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
var _0n3, _1n3, _2n2, _3n, _4n, _5n, _8n, FIELD_FIELDS;
var init_modular = __esm({
  "node_modules/@noble/curves/esm/abstract/modular.js"() {
    init_utils();
    init_utils2();
    _0n3 = BigInt(0);
    _1n3 = BigInt(1);
    _2n2 = /* @__PURE__ */ BigInt(2);
    _3n = /* @__PURE__ */ BigInt(3);
    _4n = /* @__PURE__ */ BigInt(4);
    _5n = /* @__PURE__ */ BigInt(5);
    _8n = /* @__PURE__ */ BigInt(8);
    FIELD_FIELDS = [
      "create",
      "isValid",
      "is0",
      "neg",
      "inv",
      "sqrt",
      "sqr",
      "eql",
      "add",
      "sub",
      "mul",
      "pow",
      "div",
      "addN",
      "subN",
      "mulN",
      "sqrN"
    ];
  }
});

// node_modules/@noble/curves/esm/abstract/curve.js
function constTimeNegate(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window2, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n4;
  }
  const offsetStart = window2 * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window2 % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i);
  });
}
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function wNAF(c, bits) {
  return {
    constTimeNegate,
    hasPrecomputes(elm) {
      return getW(elm) !== 1;
    },
    // non-const time multiplication ladder
    unsafeLadder(elm, n, p = c.ZERO) {
      let d = elm;
      while (n > _0n4) {
        if (n & _1n4)
          p = p.add(d);
        d = d.double();
        n >>= _1n4;
      }
      return p;
    },
    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @param elm Point instance
     * @param W window size
     * @returns precomputed point tables flattened to a single array
     */
    precomputeWindow(elm, W) {
      const { windows, windowSize } = calcWOpts(W, bits);
      const points = [];
      let p = elm;
      let base = p;
      for (let window2 = 0; window2 < windows; window2++) {
        base = p;
        points.push(base);
        for (let i = 1; i < windowSize; i++) {
          base = base.add(p);
          points.push(base);
        }
        p = base.double();
      }
      return points;
    },
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @returns real and fake (for const-time) points
     */
    wNAF(W, precomputes, n) {
      let p = c.ZERO;
      let f = c.BASE;
      const wo = calcWOpts(W, bits);
      for (let window2 = 0; window2 < wo.windows; window2++) {
        const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window2, wo);
        n = nextN;
        if (isZero) {
          f = f.add(constTimeNegate(isNegF, precomputes[offsetF]));
        } else {
          p = p.add(constTimeNegate(isNeg, precomputes[offset]));
        }
      }
      return { p, f };
    },
    /**
     * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @param acc accumulator point to add result of multiplication
     * @returns point
     */
    wNAFUnsafe(W, precomputes, n, acc = c.ZERO) {
      const wo = calcWOpts(W, bits);
      for (let window2 = 0; window2 < wo.windows; window2++) {
        if (n === _0n4)
          break;
        const { nextN, offset, isZero, isNeg } = calcOffsets(n, window2, wo);
        n = nextN;
        if (isZero) {
          continue;
        } else {
          const item = precomputes[offset];
          acc = acc.add(isNeg ? item.negate() : item);
        }
      }
      return acc;
    },
    getPrecomputes(W, P, transform) {
      let comp = pointPrecomputes.get(P);
      if (!comp) {
        comp = this.precomputeWindow(P, W);
        if (W !== 1)
          pointPrecomputes.set(P, transform(comp));
      }
      return comp;
    },
    wNAFCached(P, n, transform) {
      const W = getW(P);
      return this.wNAF(W, this.getPrecomputes(W, P, transform), n);
    },
    wNAFCachedUnsafe(P, n, transform, prev) {
      const W = getW(P);
      if (W === 1)
        return this.unsafeLadder(P, n, prev);
      return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev);
    },
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    setWindowSize(P, W) {
      validateW(W, bits);
      pointWindowSizes.set(P, W);
      pointPrecomputes.delete(P);
    }
  };
}
function pippenger(c, fieldN, points, scalars) {
  validateMSMPoints(points, c);
  validateMSMScalars(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i = lastBits; i >= 0; i -= windowSize) {
    buckets.fill(zero);
    for (let j = 0; j < slength; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i !== 0)
      for (let j = 0; j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
function validateBasic(curve) {
  validateField2(curve.Fp);
  validateObject(curve, {
    n: "bigint",
    h: "bigint",
    Gx: "field",
    Gy: "field"
  }, {
    nBitLength: "isSafeInteger",
    nByteLength: "isSafeInteger"
  });
  return Object.freeze({
    ...nLength(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER }
  });
}
var _0n4, _1n4, pointPrecomputes, pointWindowSizes;
var init_curve = __esm({
  "node_modules/@noble/curves/esm/abstract/curve.js"() {
    init_modular();
    init_utils2();
    _0n4 = BigInt(0);
    _1n4 = BigInt(1);
    pointPrecomputes = /* @__PURE__ */ new WeakMap();
    pointWindowSizes = /* @__PURE__ */ new WeakMap();
  }
});

// node_modules/@noble/curves/esm/abstract/weierstrass.js
function validateSigVerOpts(opts) {
  if (opts.lowS !== void 0)
    abool("lowS", opts.lowS);
  if (opts.prehash !== void 0)
    abool("prehash", opts.prehash);
}
function validatePointOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    a: "field",
    b: "field"
  }, {
    allowInfinityPoint: "boolean",
    allowedPrivateKeyLengths: "array",
    clearCofactor: "function",
    fromBytes: "function",
    isTorsionFree: "function",
    toBytes: "function",
    wrapPrivateKey: "boolean"
  });
  const { endo, Fp, a } = opts;
  if (endo) {
    if (!Fp.eql(a, Fp.ZERO)) {
      throw new Error("invalid endo: CURVE.a must be 0");
    }
    if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
      throw new Error('invalid endo: expected "beta": bigint and "splitScalar": function');
    }
  }
  return Object.freeze({ ...opts });
}
function numToSizedHex(num, size2) {
  return bytesToHex2(numberToBytesBE(num, size2));
}
function weierstrassPoints(opts) {
  const CURVE = validatePointOpts(opts);
  const { Fp } = CURVE;
  const Fn = Field(CURVE.n, CURVE.nBitLength);
  const toBytes3 = CURVE.toBytes || ((_c, point, _isCompressed) => {
    const a = point.toAffine();
    return concatBytes3(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
  });
  const fromBytes = CURVE.fromBytes || ((bytes) => {
    const tail = bytes.subarray(1);
    const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
    const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
    return { x, y };
  });
  function weierstrassEquation(x) {
    const { a, b } = CURVE;
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function isWithinCurveOrder(num) {
    return inRange(num, _1n5, CURVE.n);
  }
  function normPrivateKeyToScalar(key) {
    const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
    if (lengths && typeof key !== "bigint") {
      if (isBytes2(key))
        key = bytesToHex2(key);
      if (typeof key !== "string" || !lengths.includes(key.length))
        throw new Error("invalid private key");
      key = key.padStart(nByteLength * 2, "0");
    }
    let num;
    try {
      num = typeof key === "bigint" ? key : bytesToNumberBE(ensureBytes("private key", key, nByteLength));
    } catch (error) {
      throw new Error("invalid private key, expected hex or " + nByteLength + " bytes, got " + typeof key);
    }
    if (wrapPrivateKey)
      num = mod(num, N);
    aInRange("private key", num, _1n5, N);
    return num;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point))
      throw new Error("ProjectivePoint expected");
  }
  const toAffineMemo = memoized((p, iz) => {
    const { px: x, py: y, pz: z } = p;
    if (Fp.eql(z, Fp.ONE))
      return { x, y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp.ONE : Fp.inv(z);
    const ax = Fp.mul(x, iz);
    const ay = Fp.mul(y, iz);
    const zz = Fp.mul(z, iz);
    if (is0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (!Fp.eql(zz, Fp.ONE))
      throw new Error("invZ was invalid");
    return { x: ax, y: ay };
  });
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      if (CURVE.allowInfinityPoint && !Fp.is0(p.py))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x, y } = p.toAffine();
    if (!Fp.isValid(x) || !Fp.isValid(y))
      throw new Error("bad point: x or y not FE");
    if (!isValidXY(x, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });
  class Point {
    constructor(px, py, pz) {
      if (px == null || !Fp.isValid(px))
        throw new Error("x required");
      if (py == null || !Fp.isValid(py) || Fp.is0(py))
        throw new Error("y required");
      if (pz == null || !Fp.isValid(pz))
        throw new Error("z required");
      this.px = px;
      this.py = py;
      this.pz = pz;
      Object.freeze(this);
    }
    // Does not validate if the point is on-curve.
    // Use fromHex instead, or call assertValidity() later.
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point)
        throw new Error("projective point not allowed");
      const is0 = (i) => Fp.eql(i, Fp.ZERO);
      if (is0(x) && is0(y))
        return Point.ZERO;
      return new Point(x, y, Fp.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     * Takes a bunch of Projective Points but executes only one
     * inversion on all of them. Inversion is very slow operation,
     * so this improves performance massively.
     * Optimization: converts a list of projective points to a list of identical points with Z=1.
     */
    static normalizeZ(points) {
      const toInv = FpInvertBatch(Fp, points.map((p) => p.pz));
      return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
    }
    /**
     * Converts hash string or Uint8Array to Point.
     * @param hex short/long ECDSA hex
     */
    static fromHex(hex) {
      const P = Point.fromAffine(fromBytes(ensureBytes("pointHex", hex)));
      P.assertValidity();
      return P;
    }
    // Multiplies generator point by privateKey.
    static fromPrivateKey(privateKey) {
      return Point.BASE.multiply(normPrivateKeyToScalar(privateKey));
    }
    // Multiscalar Multiplication
    static msm(points, scalars) {
      return pippenger(Point, Fn, points, scalars);
    }
    // "Private method", don't use it directly
    _setWindowSize(windowSize) {
      wnaf.setWindowSize(this, windowSize);
    }
    // A point on curve is valid if it conforms to equation.
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (Fp.isOdd)
        return !Fp.isOdd(y);
      throw new Error("Field doesn't support isOdd");
    }
    /**
     * Compare one point to another.
     */
    equals(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /**
     * Flips point to one corresponding to (x, -y) in Affine coordinates.
     */
    negate() {
      return new Point(this.px, Fp.neg(this.py), this.pz);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { px: X1, py: Y1, pz: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    wNAF(n) {
      return wnaf.wNAFCached(this, n, Point.normalizeZ);
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed private key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(sc) {
      const { endo: endo2, n: N } = CURVE;
      aInRange("scalar", sc, _0n5, N);
      const I = Point.ZERO;
      if (sc === _0n5)
        return I;
      if (this.is0() || sc === _1n5)
        return this;
      if (!endo2 || wnaf.hasPrecomputes(this))
        return wnaf.wNAFCachedUnsafe(this, sc, Point.normalizeZ);
      let { k1neg, k1, k2neg, k2 } = endo2.splitScalar(sc);
      let k1p = I;
      let k2p = I;
      let d = this;
      while (k1 > _0n5 || k2 > _0n5) {
        if (k1 & _1n5)
          k1p = k1p.add(d);
        if (k2 & _1n5)
          k2p = k2p.add(d);
        d = d.double();
        k1 >>= _1n5;
        k2 >>= _1n5;
      }
      if (k1neg)
        k1p = k1p.negate();
      if (k2neg)
        k2p = k2p.negate();
      k2p = new Point(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
      return k1p.add(k2p);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2, n: N } = CURVE;
      aInRange("scalar", scalar, _1n5, N);
      let point, fake;
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = endo2.splitScalar(scalar);
        let { p: k1p, f: f1p } = this.wNAF(k1);
        let { p: k2p, f: f2p } = this.wNAF(k2);
        k1p = wnaf.constTimeNegate(k1neg, k1p);
        k2p = wnaf.constTimeNegate(k2neg, k2p);
        k2p = new Point(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
        point = k1p.add(k2p);
        fake = f1p.add(f2p);
      } else {
        const { p, f } = this.wNAF(scalar);
        point = p;
        fake = f;
      }
      return Point.normalizeZ([point, fake])[0];
    }
    /**
     * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
     * Not using Strauss-Shamir trick: precomputation tables are faster.
     * The trick could be useful if both P and Q are not G (not in our case).
     * @returns non-zero affine point
     */
    multiplyAndAddUnsafe(Q, a, b) {
      const G = Point.BASE;
      const mul = (P, a2) => a2 === _0n5 || a2 === _1n5 || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2);
      const sum = mul(this, a).add(mul(Q, b));
      return sum.is0() ? void 0 : sum;
    }
    // Converts Projective point to affine (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    // (x, y, z) ∋ (x=x/z, y=y/z)
    toAffine(iz) {
      return toAffineMemo(this, iz);
    }
    isTorsionFree() {
      const { h: cofactor, isTorsionFree } = CURVE;
      if (cofactor === _1n5)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point, this);
      throw new Error("isTorsionFree() has not been declared for the elliptic curve");
    }
    clearCofactor() {
      const { h: cofactor, clearCofactor } = CURVE;
      if (cofactor === _1n5)
        return this;
      if (clearCofactor)
        return clearCofactor(Point, this);
      return this.multiplyUnsafe(CURVE.h);
    }
    toRawBytes(isCompressed = true) {
      abool("isCompressed", isCompressed);
      this.assertValidity();
      return toBytes3(Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      abool("isCompressed", isCompressed);
      return bytesToHex2(this.toRawBytes(isCompressed));
    }
  }
  Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
  Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
  const { endo, nBitLength } = CURVE;
  const wnaf = wNAF(Point, endo ? Math.ceil(nBitLength / 2) : nBitLength);
  return {
    CURVE,
    ProjectivePoint: Point,
    normPrivateKeyToScalar,
    weierstrassEquation,
    isWithinCurveOrder
  };
}
function validateOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    hash: "hash",
    hmac: "function",
    randomBytes: "function"
  }, {
    bits2int: "function",
    bits2int_modN: "function",
    lowS: "boolean"
  });
  return Object.freeze({ lowS: true, ...opts });
}
function weierstrass(curveDef) {
  const CURVE = validateOpts(curveDef);
  const { Fp, n: CURVE_ORDER, nByteLength, nBitLength } = CURVE;
  const compressedLen = Fp.BYTES + 1;
  const uncompressedLen = 2 * Fp.BYTES + 1;
  function modN(a) {
    return mod(a, CURVE_ORDER);
  }
  function invN(a) {
    return invert(a, CURVE_ORDER);
  }
  const { ProjectivePoint: Point, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
    ...CURVE,
    toBytes(_c, point, isCompressed) {
      const a = point.toAffine();
      const x = Fp.toBytes(a.x);
      const cat = concatBytes3;
      abool("isCompressed", isCompressed);
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
      } else {
        return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
      }
    },
    fromBytes(bytes) {
      const len = bytes.length;
      const head = bytes[0];
      const tail = bytes.subarray(1);
      if (len === compressedLen && (head === 2 || head === 3)) {
        const x = bytesToNumberBE(tail);
        if (!inRange(x, _1n5, Fp.ORDER))
          throw new Error("Point is not on curve");
        const y2 = weierstrassEquation(x);
        let y;
        try {
          y = Fp.sqrt(y2);
        } catch (sqrtError) {
          const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("Point is not on curve" + suffix);
        }
        const isYOdd = (y & _1n5) === _1n5;
        const isHeadOdd = (head & 1) === 1;
        if (isHeadOdd !== isYOdd)
          y = Fp.neg(y);
        return { x, y };
      } else if (len === uncompressedLen && head === 4) {
        const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
        const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
        return { x, y };
      } else {
        const cl = compressedLen;
        const ul = uncompressedLen;
        throw new Error("invalid Point, expected length of " + cl + ", or uncompressed " + ul + ", got " + len);
      }
    }
  });
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n5;
    return number > HALF;
  }
  function normalizeS(s) {
    return isBiggerThanHalfOrder(s) ? modN(-s) : s;
  }
  const slcNum = (b, from, to) => bytesToNumberBE(b.slice(from, to));
  class Signature {
    constructor(r, s, recovery) {
      aInRange("r", r, _1n5, CURVE_ORDER);
      aInRange("s", s, _1n5, CURVE_ORDER);
      this.r = r;
      this.s = s;
      if (recovery != null)
        this.recovery = recovery;
      Object.freeze(this);
    }
    // pair (bytes of r, bytes of s)
    static fromCompact(hex) {
      const l = nByteLength;
      hex = ensureBytes("compactSignature", hex, l * 2);
      return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
    }
    // DER encoded ECDSA signature
    // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
    static fromDER(hex) {
      const { r, s } = DER.toSig(ensureBytes("DER", hex));
      return new Signature(r, s);
    }
    /**
     * @todo remove
     * @deprecated
     */
    assertValidity() {
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(msgHash) {
      const { r, s, recovery: rec } = this;
      const h = bits2int_modN(ensureBytes("msgHash", msgHash));
      if (rec == null || ![0, 1, 2, 3].includes(rec))
        throw new Error("recovery id invalid");
      const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
      if (radj >= Fp.ORDER)
        throw new Error("recovery id 2 or 3 invalid");
      const prefix = (rec & 1) === 0 ? "02" : "03";
      const R = Point.fromHex(prefix + numToSizedHex(radj, Fp.BYTES));
      const ir = invN(radj);
      const u1 = modN(-h * ir);
      const u2 = modN(s * ir);
      const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
      if (!Q)
        throw new Error("point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this;
    }
    // DER-encoded
    toDERRawBytes() {
      return hexToBytes2(this.toDERHex());
    }
    toDERHex() {
      return DER.hexFromSig(this);
    }
    // padded bytes of r, then padded bytes of s
    toCompactRawBytes() {
      return hexToBytes2(this.toCompactHex());
    }
    toCompactHex() {
      const l = nByteLength;
      return numToSizedHex(this.r, l) + numToSizedHex(this.s, l);
    }
  }
  const utils = {
    isValidPrivateKey(privateKey) {
      try {
        normPrivateKeyToScalar(privateKey);
        return true;
      } catch (error) {
        return false;
      }
    },
    normPrivateKeyToScalar,
    /**
     * Produces cryptographically secure private key from random of size
     * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
     */
    randomPrivateKey: () => {
      const length = getMinHashLength(CURVE.n);
      return mapHashToField(CURVE.randomBytes(length), CURVE.n);
    },
    /**
     * Creates precompute table for an arbitrary EC point. Makes point "cached".
     * Allows to massively speed-up `point.multiply(scalar)`.
     * @returns cached point
     * @example
     * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
     * fast.multiply(privKey); // much faster ECDH now
     */
    precompute(windowSize = 8, point = Point.BASE) {
      point._setWindowSize(windowSize);
      point.multiply(BigInt(3));
      return point;
    }
  };
  function getPublicKey(privateKey, isCompressed = true) {
    return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
  }
  function isProbPub(item) {
    if (typeof item === "bigint")
      return false;
    if (item instanceof Point)
      return true;
    const arr = ensureBytes("key", item);
    const len = arr.length;
    const fpl = Fp.BYTES;
    const compLen = fpl + 1;
    const uncompLen = 2 * fpl + 1;
    if (CURVE.allowedPrivateKeyLengths || nByteLength === compLen) {
      return void 0;
    } else {
      return len === compLen || len === uncompLen;
    }
  }
  function getSharedSecret(privateA, publicB, isCompressed = true) {
    if (isProbPub(privateA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicB) === false)
      throw new Error("second arg must be public key");
    const b = Point.fromHex(publicB);
    return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
  }
  const bits2int = CURVE.bits2int || function(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - nBitLength;
    return delta > 0 ? num >> BigInt(delta) : num;
  };
  const bits2int_modN = CURVE.bits2int_modN || function(bytes) {
    return modN(bits2int(bytes));
  };
  const ORDER_MASK = bitMask(nBitLength);
  function int2octets(num) {
    aInRange("num < 2^" + nBitLength, num, _0n5, ORDER_MASK);
    return numberToBytesBE(num, nByteLength);
  }
  function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
    if (["recovered", "canonical"].some((k) => k in opts))
      throw new Error("sign() legacy options not supported");
    const { hash: hash2, randomBytes: randomBytes2 } = CURVE;
    let { lowS, prehash, extraEntropy: ent } = opts;
    if (lowS == null)
      lowS = true;
    msgHash = ensureBytes("msgHash", msgHash);
    validateSigVerOpts(opts);
    if (prehash)
      msgHash = ensureBytes("prehashed msgHash", hash2(msgHash));
    const h1int = bits2int_modN(msgHash);
    const d = normPrivateKeyToScalar(privateKey);
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (ent != null && ent !== false) {
      const e = ent === true ? randomBytes2(Fp.BYTES) : ent;
      seedArgs.push(ensureBytes("extraEntropy", e));
    }
    const seed = concatBytes3(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!isWithinCurveOrder(k))
        return;
      const ik = invN(k);
      const q = Point.BASE.multiply(k).toAffine();
      const r = modN(q.x);
      if (r === _0n5)
        return;
      const s = modN(ik * modN(m + r * d));
      if (s === _0n5)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n5);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = normalizeS(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, recovery);
    }
    return { seed, k2sig };
  }
  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
  function sign2(msgHash, privKey, opts = defaultSigOpts) {
    const { seed, k2sig } = prepSig(msgHash, privKey, opts);
    const C = CURVE;
    const drbg = createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
    return drbg(seed, k2sig);
  }
  Point.BASE._setWindowSize(8);
  function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
    const sg = signature;
    msgHash = ensureBytes("msgHash", msgHash);
    publicKey = ensureBytes("publicKey", publicKey);
    const { lowS, prehash, format: format2 } = opts;
    validateSigVerOpts(opts);
    if ("strict" in opts)
      throw new Error("options.strict was renamed to lowS");
    if (format2 !== void 0 && format2 !== "compact" && format2 !== "der")
      throw new Error("format must be compact or der");
    const isHex2 = typeof sg === "string" || isBytes2(sg);
    const isObj = !isHex2 && !format2 && typeof sg === "object" && sg !== null && typeof sg.r === "bigint" && typeof sg.s === "bigint";
    if (!isHex2 && !isObj)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    let _sig = void 0;
    let P;
    try {
      if (isObj)
        _sig = new Signature(sg.r, sg.s);
      if (isHex2) {
        try {
          if (format2 !== "compact")
            _sig = Signature.fromDER(sg);
        } catch (derError) {
          if (!(derError instanceof DER.Err))
            throw derError;
        }
        if (!_sig && format2 !== "der")
          _sig = Signature.fromCompact(sg);
      }
      P = Point.fromHex(publicKey);
    } catch (error) {
      return false;
    }
    if (!_sig)
      return false;
    if (lowS && _sig.hasHighS())
      return false;
    if (prehash)
      msgHash = CURVE.hash(msgHash);
    const { r, s } = _sig;
    const h = bits2int_modN(msgHash);
    const is = invN(s);
    const u1 = modN(h * is);
    const u2 = modN(r * is);
    const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
    if (!R)
      return false;
    const v = modN(R.x);
    return v === r;
  }
  return {
    CURVE,
    getPublicKey,
    getSharedSecret,
    sign: sign2,
    verify,
    ProjectivePoint: Point,
    Signature,
    utils
  };
}
var DERErr, DER, _0n5, _1n5, _2n3, _3n2, _4n2;
var init_weierstrass = __esm({
  "node_modules/@noble/curves/esm/abstract/weierstrass.js"() {
    init_curve();
    init_modular();
    init_utils2();
    DERErr = class extends Error {
      constructor(m = "") {
        super(m);
      }
    };
    DER = {
      // asn.1 DER encoding utils
      Err: DERErr,
      // Basic building block is TLV (Tag-Length-Value)
      _tlv: {
        encode: (tag, data) => {
          const { Err: E } = DER;
          if (tag < 0 || tag > 256)
            throw new E("tlv.encode: wrong tag");
          if (data.length & 1)
            throw new E("tlv.encode: unpadded data");
          const dataLen = data.length / 2;
          const len = numberToHexUnpadded(dataLen);
          if (len.length / 2 & 128)
            throw new E("tlv.encode: long form length too big");
          const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
          const t2 = numberToHexUnpadded(tag);
          return t2 + lenLen + len + data;
        },
        // v - value, l - left bytes (unparsed)
        decode(tag, data) {
          const { Err: E } = DER;
          let pos = 0;
          if (tag < 0 || tag > 256)
            throw new E("tlv.encode: wrong tag");
          if (data.length < 2 || data[pos++] !== tag)
            throw new E("tlv.decode: wrong tlv");
          const first = data[pos++];
          const isLong = !!(first & 128);
          let length = 0;
          if (!isLong)
            length = first;
          else {
            const lenLen = first & 127;
            if (!lenLen)
              throw new E("tlv.decode(long): indefinite length not supported");
            if (lenLen > 4)
              throw new E("tlv.decode(long): byte length is too big");
            const lengthBytes = data.subarray(pos, pos + lenLen);
            if (lengthBytes.length !== lenLen)
              throw new E("tlv.decode: length bytes not complete");
            if (lengthBytes[0] === 0)
              throw new E("tlv.decode(long): zero leftmost byte");
            for (const b of lengthBytes)
              length = length << 8 | b;
            pos += lenLen;
            if (length < 128)
              throw new E("tlv.decode(long): not minimal encoding");
          }
          const v = data.subarray(pos, pos + length);
          if (v.length !== length)
            throw new E("tlv.decode: wrong value length");
          return { v, l: data.subarray(pos + length) };
        }
      },
      // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
      // since we always use positive integers here. It must always be empty:
      // - add zero byte if exists
      // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
      _int: {
        encode(num) {
          const { Err: E } = DER;
          if (num < _0n5)
            throw new E("integer: negative integers are not allowed");
          let hex = numberToHexUnpadded(num);
          if (Number.parseInt(hex[0], 16) & 8)
            hex = "00" + hex;
          if (hex.length & 1)
            throw new E("unexpected DER parsing assertion: unpadded hex");
          return hex;
        },
        decode(data) {
          const { Err: E } = DER;
          if (data[0] & 128)
            throw new E("invalid signature integer: negative");
          if (data[0] === 0 && !(data[1] & 128))
            throw new E("invalid signature integer: unnecessary leading zero");
          return bytesToNumberBE(data);
        }
      },
      toSig(hex) {
        const { Err: E, _int: int, _tlv: tlv } = DER;
        const data = ensureBytes("signature", hex);
        const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
        if (seqLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
        const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
        if (sLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        return { r: int.decode(rBytes), s: int.decode(sBytes) };
      },
      hexFromSig(sig) {
        const { _tlv: tlv, _int: int } = DER;
        const rs = tlv.encode(2, int.encode(sig.r));
        const ss = tlv.encode(2, int.encode(sig.s));
        const seq = rs + ss;
        return tlv.encode(48, seq);
      }
    };
    _0n5 = BigInt(0);
    _1n5 = BigInt(1);
    _2n3 = BigInt(2);
    _3n2 = BigInt(3);
    _4n2 = BigInt(4);
  }
});

// node_modules/@noble/curves/esm/_shortw_utils.js
function getHash(hash2) {
  return {
    hash: hash2,
    hmac: (key, ...msgs) => hmac(hash2, key, concatBytes(...msgs)),
    randomBytes
  };
}
function createCurve(curveDef, defHash) {
  const create = (hash2) => weierstrass({ ...curveDef, ...getHash(hash2) });
  return { ...create(defHash), create };
}
var init_shortw_utils = __esm({
  "node_modules/@noble/curves/esm/_shortw_utils.js"() {
    init_hmac();
    init_utils();
    init_weierstrass();
  }
});

// node_modules/@noble/curves/esm/secp256k1.js
function sqrtMod(y) {
  const P = secp256k1P;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n3, P) * b3 % P;
  const b9 = pow2(b6, _3n3, P) * b3 % P;
  const b11 = pow2(b9, _2n4, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n3, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n4, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
var secp256k1P, secp256k1N, _0n6, _1n6, _2n4, divNearest, Fpk1, secp256k1;
var init_secp256k1 = __esm({
  "node_modules/@noble/curves/esm/secp256k1.js"() {
    init_sha2();
    init_shortw_utils();
    init_modular();
    secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
    secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
    _0n6 = BigInt(0);
    _1n6 = BigInt(1);
    _2n4 = BigInt(2);
    divNearest = (a, b) => (a + b / _2n4) / b;
    Fpk1 = Field(secp256k1P, void 0, void 0, { sqrt: sqrtMod });
    secp256k1 = createCurve({
      a: _0n6,
      b: BigInt(7),
      Fp: Fpk1,
      n: secp256k1N,
      Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
      Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
      h: BigInt(1),
      lowS: true,
      // Allow only low-S signatures by default in sign() and verify()
      endo: {
        // Endomorphism, see above
        beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
        splitScalar: (k) => {
          const n = secp256k1N;
          const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
          const b1 = -_1n6 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
          const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
          const b2 = a1;
          const POW_2_128 = BigInt("0x100000000000000000000000000000000");
          const c1 = divNearest(b2 * k, n);
          const c2 = divNearest(-b1 * k, n);
          let k1 = mod(k - c1 * a1 - c2 * a2, n);
          let k2 = mod(-c1 * b1 - c2 * b2, n);
          const k1neg = k1 > POW_2_128;
          const k2neg = k2 > POW_2_128;
          if (k1neg)
            k1 = n - k1;
          if (k2neg)
            k2 = n - k2;
          if (k1 > POW_2_128 || k2 > POW_2_128) {
            throw new Error("splitScalar: Endomorphism failed, k=" + k);
          }
          return { k1neg, k1, k2neg, k2 };
        }
      }
    }, sha256);
  }
});

// node_modules/genlayer-js/dist/chunk-MLKGABMK.js
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/viem/_esm/accounts/utils/publicKeyToAddress.js
init_getAddress();
init_keccak256();
function publicKeyToAddress(publicKey) {
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26);
  return checksumAddress(`0x${address}`);
}

// node_modules/viem/_esm/utils/authorization/hashAuthorization.js
init_concat();
init_toBytes();
init_toHex();

// node_modules/viem/_esm/utils/encoding/toRlp.js
init_base();
init_cursor2();
init_toBytes();
init_toHex();
function toRlp(bytes, to = "hex") {
  const encodable = getEncodable(bytes);
  const cursor = createCursor(new Uint8Array(encodable.length));
  encodable.encode(cursor);
  if (to === "hex")
    return bytesToHex(cursor.bytes);
  return cursor.bytes;
}
function getEncodable(bytes) {
  if (Array.isArray(bytes))
    return getEncodableList(bytes.map((x) => getEncodable(x)));
  return getEncodableBytes(bytes);
}
function getEncodableList(list) {
  const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
  const sizeOfBodyLength = getSizeOfLength(bodyLength);
  const length = (() => {
    if (bodyLength <= 55)
      return 1 + bodyLength;
    return 1 + sizeOfBodyLength + bodyLength;
  })();
  return {
    length,
    encode(cursor) {
      if (bodyLength <= 55) {
        cursor.pushByte(192 + bodyLength);
      } else {
        cursor.pushByte(192 + 55 + sizeOfBodyLength);
        if (sizeOfBodyLength === 1)
          cursor.pushUint8(bodyLength);
        else if (sizeOfBodyLength === 2)
          cursor.pushUint16(bodyLength);
        else if (sizeOfBodyLength === 3)
          cursor.pushUint24(bodyLength);
        else
          cursor.pushUint32(bodyLength);
      }
      for (const { encode: encode2 } of list) {
        encode2(cursor);
      }
    }
  };
}
function getEncodableBytes(bytesOrHex) {
  const bytes = typeof bytesOrHex === "string" ? hexToBytes(bytesOrHex) : bytesOrHex;
  const sizeOfBytesLength = getSizeOfLength(bytes.length);
  const length = (() => {
    if (bytes.length === 1 && bytes[0] < 128)
      return 1;
    if (bytes.length <= 55)
      return 1 + bytes.length;
    return 1 + sizeOfBytesLength + bytes.length;
  })();
  return {
    length,
    encode(cursor) {
      if (bytes.length === 1 && bytes[0] < 128) {
        cursor.pushBytes(bytes);
      } else if (bytes.length <= 55) {
        cursor.pushByte(128 + bytes.length);
        cursor.pushBytes(bytes);
      } else {
        cursor.pushByte(128 + 55 + sizeOfBytesLength);
        if (sizeOfBytesLength === 1)
          cursor.pushUint8(bytes.length);
        else if (sizeOfBytesLength === 2)
          cursor.pushUint16(bytes.length);
        else if (sizeOfBytesLength === 3)
          cursor.pushUint24(bytes.length);
        else
          cursor.pushUint32(bytes.length);
        cursor.pushBytes(bytes);
      }
    }
  };
}
function getSizeOfLength(length) {
  if (length < 2 ** 8)
    return 1;
  if (length < 2 ** 16)
    return 2;
  if (length < 2 ** 24)
    return 3;
  if (length < 2 ** 32)
    return 4;
  throw new BaseError("Length is too large.");
}

// node_modules/viem/_esm/utils/authorization/hashAuthorization.js
init_keccak256();
function hashAuthorization(parameters) {
  const { chainId, nonce, to } = parameters;
  const address = parameters.contractAddress ?? parameters.address;
  const hash2 = keccak256(concatHex([
    "0x05",
    toRlp([
      chainId ? numberToHex(chainId) : "0x",
      address,
      nonce ? numberToHex(nonce) : "0x"
    ])
  ]));
  if (to === "bytes")
    return hexToBytes(hash2);
  return hash2;
}

// node_modules/viem/_esm/utils/blob/blobsToCommitments.js
init_toBytes();
init_toHex();
function blobsToCommitments(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = [];
  for (const blob of blobs)
    commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)));
  return to === "bytes" ? commitments : commitments.map((x) => bytesToHex(x));
}

// node_modules/viem/_esm/utils/blob/blobsToProofs.js
init_toBytes();
init_toHex();
function blobsToProofs(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = typeof parameters.commitments[0] === "string" ? parameters.commitments.map((x) => hexToBytes(x)) : parameters.commitments;
  const proofs = [];
  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i];
    const commitment = commitments[i];
    proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)));
  }
  return to === "bytes" ? proofs : proofs.map((x) => bytesToHex(x));
}

// node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js
init_toHex();

// node_modules/@noble/hashes/esm/sha256.js
init_sha2();
var sha2562 = sha256;

// node_modules/viem/_esm/utils/hash/sha256.js
init_isHex();
init_toBytes();
init_toHex();
function sha2563(value, to_) {
  const to = to_ || "hex";
  const bytes = sha2562(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}

// node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js
function commitmentToVersionedHash(parameters) {
  const { commitment, version: version2 = 1 } = parameters;
  const to = parameters.to ?? (typeof commitment === "string" ? "hex" : "bytes");
  const versionedHash = sha2563(commitment, "bytes");
  versionedHash.set([version2], 0);
  return to === "bytes" ? versionedHash : bytesToHex(versionedHash);
}

// node_modules/viem/_esm/utils/blob/commitmentsToVersionedHashes.js
function commitmentsToVersionedHashes(parameters) {
  const { commitments, version: version2 } = parameters;
  const to = parameters.to ?? (typeof commitments[0] === "string" ? "hex" : "bytes");
  const hashes = [];
  for (const commitment of commitments) {
    hashes.push(commitmentToVersionedHash({
      commitment,
      to,
      version: version2
    }));
  }
  return hashes;
}

// node_modules/viem/_esm/constants/blob.js
var blobsPerTransaction = 6;
var bytesPerFieldElement = 32;
var fieldElementsPerBlob = 4096;
var bytesPerBlob = bytesPerFieldElement * fieldElementsPerBlob;
var maxBytesPerTransaction = bytesPerBlob * blobsPerTransaction - // terminator byte (0x80).
1 - // zero byte (0x00) appended to each field element.
1 * fieldElementsPerBlob * blobsPerTransaction;

// node_modules/viem/_esm/constants/kzg.js
var versionedHashVersionKzg = 1;

// node_modules/viem/_esm/errors/blob.js
init_base();
var BlobSizeTooLargeError = class extends BaseError {
  constructor({ maxSize, size: size2 }) {
    super("Blob size is too large.", {
      metaMessages: [`Max: ${maxSize} bytes`, `Given: ${size2} bytes`],
      name: "BlobSizeTooLargeError"
    });
  }
};
var EmptyBlobError = class extends BaseError {
  constructor() {
    super("Blob data must not be empty.", { name: "EmptyBlobError" });
  }
};
var InvalidVersionedHashSizeError = class extends BaseError {
  constructor({ hash: hash2, size: size2 }) {
    super(`Versioned hash "${hash2}" size is invalid.`, {
      metaMessages: ["Expected: 32", `Received: ${size2}`],
      name: "InvalidVersionedHashSizeError"
    });
  }
};
var InvalidVersionedHashVersionError = class extends BaseError {
  constructor({ hash: hash2, version: version2 }) {
    super(`Versioned hash "${hash2}" version is invalid.`, {
      metaMessages: [
        `Expected: ${versionedHashVersionKzg}`,
        `Received: ${version2}`
      ],
      name: "InvalidVersionedHashVersionError"
    });
  }
};

// node_modules/viem/_esm/utils/blob/toBlobs.js
init_cursor2();
init_size();
init_toBytes();
init_toHex();
function toBlobs(parameters) {
  const to = parameters.to ?? (typeof parameters.data === "string" ? "hex" : "bytes");
  const data = typeof parameters.data === "string" ? hexToBytes(parameters.data) : parameters.data;
  const size_ = size(data);
  if (!size_)
    throw new EmptyBlobError();
  if (size_ > maxBytesPerTransaction)
    throw new BlobSizeTooLargeError({
      maxSize: maxBytesPerTransaction,
      size: size_
    });
  const blobs = [];
  let active = true;
  let position = 0;
  while (active) {
    const blob = createCursor(new Uint8Array(bytesPerBlob));
    let size2 = 0;
    while (size2 < fieldElementsPerBlob) {
      const bytes = data.slice(position, position + (bytesPerFieldElement - 1));
      blob.pushByte(0);
      blob.pushBytes(bytes);
      if (bytes.length < 31) {
        blob.pushByte(128);
        active = false;
        break;
      }
      size2++;
      position += 31;
    }
    blobs.push(blob);
  }
  return to === "bytes" ? blobs.map((x) => x.bytes) : blobs.map((x) => bytesToHex(x.bytes));
}

// node_modules/viem/_esm/utils/blob/toBlobSidecars.js
function toBlobSidecars(parameters) {
  const { data, kzg, to } = parameters;
  const blobs = parameters.blobs ?? toBlobs({ data, to });
  const commitments = parameters.commitments ?? blobsToCommitments({ blobs, kzg, to });
  const proofs = parameters.proofs ?? blobsToProofs({ blobs, commitments, kzg, to });
  const sidecars = [];
  for (let i = 0; i < blobs.length; i++)
    sidecars.push({
      blob: blobs[i],
      commitment: commitments[i],
      proof: proofs[i]
    });
  return sidecars;
}

// node_modules/viem/_esm/utils/transaction/getTransactionType.js
init_transaction();
function getTransactionType(transaction) {
  if (transaction.type)
    return transaction.type;
  if (typeof transaction.authorizationList !== "undefined")
    return "eip7702";
  if (typeof transaction.blobs !== "undefined" || typeof transaction.blobVersionedHashes !== "undefined" || typeof transaction.maxFeePerBlobGas !== "undefined" || typeof transaction.sidecars !== "undefined")
    return "eip4844";
  if (typeof transaction.maxFeePerGas !== "undefined" || typeof transaction.maxPriorityFeePerGas !== "undefined") {
    return "eip1559";
  }
  if (typeof transaction.gasPrice !== "undefined") {
    if (typeof transaction.accessList !== "undefined")
      return "eip2930";
    return "legacy";
  }
  throw new InvalidSerializableTransactionError({ transaction });
}

// node_modules/viem/_esm/utils/authorization/serializeAuthorizationList.js
init_toHex();

// node_modules/viem/_esm/utils/transaction/serializeTransaction.js
init_transaction();
init_concat();
init_trim();
init_toHex();

// node_modules/viem/_esm/utils/transaction/assertTransaction.js
init_number();
init_address();
init_base();
init_chain();
init_node();
init_isAddress();
init_size();
init_slice();
init_fromHex();
function assertTransactionEIP7702(transaction) {
  const { authorizationList } = transaction;
  if (authorizationList) {
    for (const authorization of authorizationList) {
      const { chainId } = authorization;
      const address = authorization.address;
      if (!isAddress(address))
        throw new InvalidAddressError({ address });
      if (chainId < 0)
        throw new InvalidChainIdError({ chainId });
    }
  }
  assertTransactionEIP1559(transaction);
}
function assertTransactionEIP4844(transaction) {
  const { blobVersionedHashes } = transaction;
  if (blobVersionedHashes) {
    if (blobVersionedHashes.length === 0)
      throw new EmptyBlobError();
    for (const hash2 of blobVersionedHashes) {
      const size_ = size(hash2);
      const version2 = hexToNumber(slice(hash2, 0, 1));
      if (size_ !== 32)
        throw new InvalidVersionedHashSizeError({ hash: hash2, size: size_ });
      if (version2 !== versionedHashVersionKzg)
        throw new InvalidVersionedHashVersionError({
          hash: hash2,
          version: version2
        });
    }
  }
  assertTransactionEIP1559(transaction);
}
function assertTransactionEIP1559(transaction) {
  const { chainId, maxPriorityFeePerGas, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (typeof maxPriorityFeePerGas === "bigint" && typeof maxFeePerGas === "bigint" && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}
function assertTransactionEIP2930(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid EIP-2930 Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}
function assertTransactionLegacy(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (typeof chainId !== "undefined" && chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid Legacy Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}

// node_modules/viem/_esm/utils/transaction/serializeAccessList.js
init_address();
init_transaction();
init_isAddress();
function serializeAccessList(accessList) {
  if (!accessList || accessList.length === 0)
    return [];
  const serializedAccessList = [];
  for (let i = 0; i < accessList.length; i++) {
    const { address, storageKeys } = accessList[i];
    for (let j = 0; j < storageKeys.length; j++) {
      if (storageKeys[j].length - 2 !== 64) {
        throw new InvalidStorageKeySizeError({ storageKey: storageKeys[j] });
      }
    }
    if (!isAddress(address, { strict: false })) {
      throw new InvalidAddressError({ address });
    }
    serializedAccessList.push([address, storageKeys]);
  }
  return serializedAccessList;
}

// node_modules/viem/_esm/utils/transaction/serializeTransaction.js
function serializeTransaction(transaction, signature) {
  const type = getTransactionType(transaction);
  if (type === "eip1559")
    return serializeTransactionEIP1559(transaction, signature);
  if (type === "eip2930")
    return serializeTransactionEIP2930(transaction, signature);
  if (type === "eip4844")
    return serializeTransactionEIP4844(transaction, signature);
  if (type === "eip7702")
    return serializeTransactionEIP7702(transaction, signature);
  return serializeTransactionLegacy(transaction, signature);
}
function serializeTransactionEIP7702(transaction, signature) {
  const { authorizationList, chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP7702(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedAuthorizationList = serializeAuthorizationList(authorizationList);
  return concatHex([
    "0x04",
    toRlp([
      numberToHex(chainId),
      nonce ? numberToHex(nonce) : "0x",
      maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
      maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
      gas ? numberToHex(gas) : "0x",
      to ?? "0x",
      value ? numberToHex(value) : "0x",
      data ?? "0x",
      serializedAccessList,
      serializedAuthorizationList,
      ...toYParitySignatureArray(transaction, signature)
    ])
  ]);
}
function serializeTransactionEIP4844(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP4844(transaction);
  let blobVersionedHashes = transaction.blobVersionedHashes;
  let sidecars = transaction.sidecars;
  if (transaction.blobs && (typeof blobVersionedHashes === "undefined" || typeof sidecars === "undefined")) {
    const blobs2 = typeof transaction.blobs[0] === "string" ? transaction.blobs : transaction.blobs.map((x) => bytesToHex(x));
    const kzg = transaction.kzg;
    const commitments2 = blobsToCommitments({
      blobs: blobs2,
      kzg
    });
    if (typeof blobVersionedHashes === "undefined")
      blobVersionedHashes = commitmentsToVersionedHashes({
        commitments: commitments2
      });
    if (typeof sidecars === "undefined") {
      const proofs2 = blobsToProofs({ blobs: blobs2, commitments: commitments2, kzg });
      sidecars = toBlobSidecars({ blobs: blobs2, commitments: commitments2, proofs: proofs2 });
    }
  }
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    maxFeePerBlobGas ? numberToHex(maxFeePerBlobGas) : "0x",
    blobVersionedHashes ?? [],
    ...toYParitySignatureArray(transaction, signature)
  ];
  const blobs = [];
  const commitments = [];
  const proofs = [];
  if (sidecars)
    for (let i = 0; i < sidecars.length; i++) {
      const { blob, commitment, proof } = sidecars[i];
      blobs.push(blob);
      commitments.push(commitment);
      proofs.push(proof);
    }
  return concatHex([
    "0x03",
    sidecars ? (
      // If sidecars are enabled, envelope turns into a "wrapper":
      toRlp([serializedTransaction, blobs, commitments, proofs])
    ) : (
      // If sidecars are disabled, standard envelope is used:
      toRlp(serializedTransaction)
    )
  ]);
}
function serializeTransactionEIP1559(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP1559(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x02",
    toRlp(serializedTransaction)
  ]);
}
function serializeTransactionEIP2930(transaction, signature) {
  const { chainId, gas, data, nonce, to, value, accessList, gasPrice } = transaction;
  assertTransactionEIP2930(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    gasPrice ? numberToHex(gasPrice) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x01",
    toRlp(serializedTransaction)
  ]);
}
function serializeTransactionLegacy(transaction, signature) {
  const { chainId = 0, gas, data, nonce, to, value, gasPrice } = transaction;
  assertTransactionLegacy(transaction);
  let serializedTransaction = [
    nonce ? numberToHex(nonce) : "0x",
    gasPrice ? numberToHex(gasPrice) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x"
  ];
  if (signature) {
    const v = (() => {
      if (signature.v >= 35n) {
        const inferredChainId = (signature.v - 35n) / 2n;
        if (inferredChainId > 0)
          return signature.v;
        return 27n + (signature.v === 35n ? 0n : 1n);
      }
      if (chainId > 0)
        return BigInt(chainId * 2) + BigInt(35n + signature.v - 27n);
      const v2 = 27n + (signature.v === 27n ? 0n : 1n);
      if (signature.v !== v2)
        throw new InvalidLegacyVError({ v: signature.v });
      return v2;
    })();
    const r = trim(signature.r);
    const s = trim(signature.s);
    serializedTransaction = [
      ...serializedTransaction,
      numberToHex(v),
      r === "0x00" ? "0x" : r,
      s === "0x00" ? "0x" : s
    ];
  } else if (chainId > 0) {
    serializedTransaction = [
      ...serializedTransaction,
      numberToHex(chainId),
      "0x",
      "0x"
    ];
  }
  return toRlp(serializedTransaction);
}
function toYParitySignatureArray(transaction, signature_) {
  const signature = signature_ ?? transaction;
  const { v, yParity } = signature;
  if (typeof signature.r === "undefined")
    return [];
  if (typeof signature.s === "undefined")
    return [];
  if (typeof v === "undefined" && typeof yParity === "undefined")
    return [];
  const r = trim(signature.r);
  const s = trim(signature.s);
  const yParity_ = (() => {
    if (typeof yParity === "number")
      return yParity ? numberToHex(1) : "0x";
    if (v === 0n)
      return "0x";
    if (v === 1n)
      return numberToHex(1);
    return v === 27n ? "0x" : numberToHex(1);
  })();
  return [yParity_, r === "0x00" ? "0x" : r, s === "0x00" ? "0x" : s];
}

// node_modules/viem/_esm/utils/authorization/serializeAuthorizationList.js
function serializeAuthorizationList(authorizationList) {
  if (!authorizationList || authorizationList.length === 0)
    return [];
  const serializedAuthorizationList = [];
  for (const authorization of authorizationList) {
    const { chainId, nonce, ...signature } = authorization;
    const contractAddress = authorization.address;
    const signatureArray = toYParitySignatureArray({}, signature);
    if (signatureArray.length > 0 && signature.yParity)
      signatureArray[0] = toHex(signature.yParity);
    serializedAuthorizationList.push([
      chainId ? toHex(chainId) : "0x",
      contractAddress,
      nonce ? toHex(nonce) : "0x",
      ...signatureArray
    ]);
  }
  return serializedAuthorizationList;
}

// node_modules/viem/_esm/utils/chain/defineChain.js
function defineChain(chain2) {
  const chainInstance = {
    formatters: void 0,
    fees: void 0,
    serializers: void 0,
    ...chain2
  };
  function extend(base) {
    return (fnOrExtended) => {
      const properties = typeof fnOrExtended === "function" ? fnOrExtended(base) : fnOrExtended;
      const combined = { ...base, ...properties };
      return Object.assign(combined, { extend: extend(combined) });
    };
  }
  return Object.assign(chainInstance, {
    extend: extend(chainInstance)
  });
}

// node_modules/viem/_esm/utils/signature/hashMessage.js
init_keccak256();

// node_modules/viem/_esm/constants/strings.js
var presignMessagePrefix = "Ethereum Signed Message:\n";

// node_modules/viem/_esm/utils/signature/toPrefixedMessage.js
init_concat();
init_size();
init_toHex();
function toPrefixedMessage(message_) {
  const message = (() => {
    if (typeof message_ === "string")
      return stringToHex(message_);
    if (typeof message_.raw === "string")
      return message_.raw;
    return bytesToHex(message_.raw);
  })();
  const prefix = stringToHex(`${presignMessagePrefix}${size(message)}`);
  return concat([prefix, message]);
}

// node_modules/viem/_esm/utils/signature/hashMessage.js
function hashMessage(message, to_) {
  return keccak256(toPrefixedMessage(message), to_);
}

// node_modules/viem/_esm/utils/signature/hashTypedData.js
init_encodeAbiParameters();
init_concat();
init_toHex();
init_keccak256();

// node_modules/viem/_esm/utils/typedData.js
init_abi();
init_address();

// node_modules/viem/_esm/errors/typedData.js
init_stringify();
init_base();
var InvalidDomainError = class extends BaseError {
  constructor({ domain }) {
    super(`Invalid domain "${stringify(domain)}".`, {
      metaMessages: ["Must be a valid EIP-712 domain."]
    });
  }
};
var InvalidPrimaryTypeError = class extends BaseError {
  constructor({ primaryType, types }) {
    super(`Invalid primary type \`${primaryType}\` must be one of \`${JSON.stringify(Object.keys(types))}\`.`, {
      docsPath: "/api/glossary/Errors#typeddatainvalidprimarytypeerror",
      metaMessages: ["Check that the primary type is a key in `types`."]
    });
  }
};
var InvalidStructTypeError = class extends BaseError {
  constructor({ type }) {
    super(`Struct type "${type}" is invalid.`, {
      metaMessages: [
        'Struct type must contain only letters, digits, "_", "$" and ":", and must not be a Solidity type.'
      ],
      name: "InvalidStructTypeError"
    });
  }
};
var InvalidTypedDataTypeError = class extends BaseError {
  constructor({ type }) {
    const isAlias = /^u?int(\[[0-9]*\])*$/.test(type);
    super(`Type "${type}" is not a valid EIP-712 type.`, {
      metaMessages: isAlias ? [`Use "${type.replace(/^(u?int)/, "$&256")}" instead.`] : void 0,
      name: "InvalidTypedDataTypeError"
    });
  }
};

// node_modules/viem/_esm/utils/typedData.js
init_isAddress();
init_size();
init_toHex();
init_regex2();
function validateTypedData(parameters) {
  const { domain, message, primaryType, types } = parameters;
  const validateData = (struct, data) => {
    for (const param of struct) {
      const { name, type } = param;
      const value = data[name];
      const integerMatch = type.match(integerRegex);
      if (integerMatch && (typeof value === "number" || typeof value === "bigint")) {
        const [_type, base, size_] = integerMatch;
        numberToHex(value, {
          signed: base === "int",
          size: Number.parseInt(size_, 10) / 8
        });
      }
      if (type === "address" && typeof value === "string" && !isAddress(value))
        throw new InvalidAddressError({ address: value });
      const bytesMatch = type.match(bytesRegex);
      if (bytesMatch) {
        const [_type, size_] = bytesMatch;
        if (size_ && size(value) !== Number.parseInt(size_, 10))
          throw new BytesSizeMismatchError({
            expectedSize: Number.parseInt(size_, 10),
            givenSize: size(value)
          });
      }
      if (Object.hasOwn(types, type))
        validateData(types[type], value);
    }
  };
  for (const type of Object.keys(types))
    validateReference(type);
  for (const struct of Object.values(types))
    for (const field of struct ?? [])
      validateField(field.type, types);
  if (types.EIP712Domain && domain) {
    if (typeof domain !== "object")
      throw new InvalidDomainError({ domain });
    validateData(types.EIP712Domain, domain);
  }
  if (primaryType !== "EIP712Domain") {
    if (types[primaryType])
      validateData(types[primaryType], message);
    else
      throw new InvalidPrimaryTypeError({ primaryType, types });
  }
}
function getTypesForEIP712Domain({ domain }) {
  return [
    typeof domain?.name === "string" && { name: "name", type: "string" },
    typeof domain?.version === "string" && { name: "version", type: "string" },
    (typeof domain?.chainId === "number" || typeof domain?.chainId === "bigint") && {
      name: "chainId",
      type: "uint256"
    },
    domain?.verifyingContract && {
      name: "verifyingContract",
      type: "address"
    },
    domain?.salt && { name: "salt", type: "bytes32" }
  ].filter(Boolean);
}
function validateField(type, types) {
  const baseType = type.replace(/(\[[0-9]*\])+$/, "");
  if (baseType === "int" || baseType === "uint")
    throw new InvalidTypedDataTypeError({ type });
  if (!Object.hasOwn(types, baseType) && !isSolidityType(baseType))
    throw new InvalidTypedDataTypeError({ type });
}
function isSolidityType(type) {
  return type === "address" || type === "bool" || type === "string" || bytesRegex.test(type) || integerRegex.test(type);
}
function validateReference(type) {
  if (!/^[A-Za-z0-9_$:]+$/.test(type) || type === "address" || type === "bool" || type === "string" || /^(u?int|bytes)[0-9]*$/.test(type))
    throw new InvalidStructTypeError({ type });
}

// node_modules/viem/_esm/utils/signature/hashTypedData.js
function hashTypedData(parameters) {
  const { domain = {}, message, primaryType } = parameters;
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({
    domain,
    message,
    primaryType,
    types
  });
  const parts = ["0x1901"];
  if (domain)
    parts.push(hashDomain({
      domain,
      types
    }));
  if (primaryType !== "EIP712Domain")
    parts.push(hashStruct({
      data: message,
      primaryType,
      types
    }));
  return keccak256(concat(parts));
}
function hashDomain({ domain, types }) {
  return hashStruct({
    data: domain,
    primaryType: "EIP712Domain",
    types
  });
}
function hashStruct({ data, primaryType, types }) {
  const encoded2 = encodeData({
    data,
    primaryType,
    types
  });
  return keccak256(encoded2);
}
function encodeData({ data, primaryType, types }) {
  const encodedTypes = [{ type: "bytes32" }];
  const encodedValues = [hashType({ primaryType, types })];
  for (const field of types[primaryType]) {
    const [type, value] = encodeField({
      types,
      name: field.name,
      type: field.type,
      value: data[field.name]
    });
    encodedTypes.push(type);
    encodedValues.push(value);
  }
  return encodeAbiParameters(encodedTypes, encodedValues);
}
function hashType({ primaryType, types }) {
  const encodedHashType = toHex(encodeType({ primaryType, types }));
  return keccak256(encodedHashType);
}
function encodeType({ primaryType, types }) {
  let result = "";
  const unsortedDeps = findTypeDependencies({ primaryType, types });
  unsortedDeps.delete(primaryType);
  const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
  for (const type of deps) {
    result += `${type}(${types[type].map(({ name, type: t2 }) => `${t2} ${name}`).join(",")})`;
  }
  return result;
}
function findTypeDependencies({ primaryType: primaryType_, types }, results = /* @__PURE__ */ new Set()) {
  const primaryType = primaryType_.replace(/(\[[0-9]*\])+$/, "");
  if (results.has(primaryType) || types[primaryType] === void 0) {
    return results;
  }
  results.add(primaryType);
  for (const field of types[primaryType]) {
    findTypeDependencies({ primaryType: field.type, types }, results);
  }
  return results;
}
function encodeField({ types, name, type, value }) {
  if (types[type] !== void 0) {
    return [
      { type: "bytes32" },
      keccak256(encodeData({ data: value, primaryType: type, types }))
    ];
  }
  if (type === "bytes")
    return [{ type: "bytes32" }, keccak256(value)];
  if (type === "string")
    return [{ type: "bytes32" }, keccak256(toHex(value))];
  if (type.lastIndexOf("]") === type.length - 1) {
    const parsedType = type.slice(0, type.lastIndexOf("["));
    const typeValuePairs = value.map((item) => encodeField({
      name,
      type: parsedType,
      types,
      value: item
    }));
    return [
      { type: "bytes32" },
      keccak256(encodeAbiParameters(typeValuePairs.map(([t2]) => t2), typeValuePairs.map(([, v]) => v)))
    ];
  }
  return [{ type }, value];
}

// node_modules/viem/_esm/utils/signature/serializeSignature.js
init_secp256k1();
init_fromHex();
init_toBytes();
function serializeSignature({ r, s, to = "hex", v, yParity }) {
  const yParity_ = (() => {
    if (yParity === 0 || yParity === 1)
      return yParity;
    if (v && (v === 27n || v === 28n || v >= 35n))
      return v % 2n === 0n ? 1 : 0;
    throw new Error("Invalid `v` or `yParity` value");
  })();
  const signature = `0x${new secp256k1.Signature(hexToBigInt(r), hexToBigInt(s)).toCompactHex()}${yParity_ === 0 ? "1b" : "1c"}`;
  if (to === "hex")
    return signature;
  return hexToBytes(signature);
}

// node_modules/viem/_esm/index.js
init_encodeFunctionData();
init_toHex();

// node_modules/genlayer-js/dist/chunk-XCQTIUTU.js
var chains_exports = {};
__export(chains_exports, {
  localnet: () => localnet,
  studionet: () => studionet,
  testnetAsimov: () => testnetAsimov,
  testnetBradbury: () => testnetBradbury
});
var SIMULATOR_JSON_RPC_URL = "http://127.0.0.1:4000/api";
var CONSENSUS_MAIN_CONTRACT = {
  address: "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575",
  abi: [
    {
      inputs: [],
      name: "AccessControlBadConfirmation",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          internalType: "bytes32",
          name: "neededRole",
          type: "bytes32"
        }
      ],
      name: "AccessControlUnauthorizedAccount",
      type: "error"
    },
    {
      inputs: [],
      name: "CallerNotMessages",
      type: "error"
    },
    {
      inputs: [],
      name: "CanNotAppeal",
      type: "error"
    },
    {
      inputs: [],
      name: "EmptyTransaction",
      type: "error"
    },
    {
      inputs: [],
      name: "FinalizationNotAllowed",
      type: "error"
    },
    {
      inputs: [],
      name: "InvalidAddress",
      type: "error"
    },
    {
      inputs: [],
      name: "InvalidGhostContract",
      type: "error"
    },
    {
      inputs: [],
      name: "InvalidInitialization",
      type: "error"
    },
    {
      inputs: [],
      name: "InvalidVote",
      type: "error"
    },
    {
      inputs: [],
      name: "MaxNumOfIterationsInPendingQueueReached",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "numOfMessages",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "maxAllocatedMessages",
          type: "uint256"
        }
      ],
      name: "MaxNumOfMessagesExceeded",
      type: "error"
    },
    {
      inputs: [],
      name: "NonGenVMContract",
      type: "error"
    },
    {
      inputs: [],
      name: "NotInitializing",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        }
      ],
      name: "OwnableInvalidOwner",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error"
    },
    {
      inputs: [],
      name: "ReentrancyGuardReentrantCall",
      type: "error"
    },
    {
      inputs: [],
      name: "TransactionNotAtPendingQueueHead",
      type: "error"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "appealer",
          type: "address"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "appealBond",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "address[]",
          name: "appealValidators",
          type: "address[]"
        }
      ],
      name: "AppealStarted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "data",
          type: "bytes"
        }
      ],
      name: "ErrorMessage",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "ghostFactory",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "genManager",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "genTransactions",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "genQueue",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "genStaking",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "genMessages",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "idleness",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "tribunalAppeal",
          type: "address"
        }
      ],
      name: "ExternalContractsSet",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint64",
          name: "version",
          type: "uint64"
        }
      ],
      name: "Initialized",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "activator",
          type: "address"
        }
      ],
      name: "InternalMessageProcessed",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "activator",
          type: "address"
        }
      ],
      name: "NewTransaction",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "OwnershipTransferStarted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "OwnershipTransferred",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "previousAdminRole",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "newAdminRole",
          type: "bytes32"
        }
      ],
      name: "RoleAdminChanged",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "RoleGranted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "RoleRevoked",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "SlashAppealSubmitted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tx_id",
          type: "bytes32"
        }
      ],
      name: "TransactionAccepted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "leader",
          type: "address"
        }
      ],
      name: "TransactionActivated",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "batchId",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "address[]",
          name: "validators",
          type: "address[]"
        }
      ],
      name: "TransactionActivatedValidators",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "TransactionCancelled",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tx_id",
          type: "bytes32"
        }
      ],
      name: "TransactionFinalized",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "oldValidator",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newValidator",
          type: "address"
        }
      ],
      name: "TransactionIdleValidatorReplaced",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "validatorIndex",
          type: "uint256"
        }
      ],
      name: "TransactionIdleValidatorReplacementFailed",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newLeader",
          type: "address"
        }
      ],
      name: "TransactionLeaderRotated",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tx_id",
          type: "bytes32"
        }
      ],
      name: "TransactionLeaderTimeout",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "bytes32[]",
          name: "tx_ids",
          type: "bytes32[]"
        }
      ],
      name: "TransactionNeedsRecomputation",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tx_id",
          type: "bytes32"
        },
        {
          indexed: false,
          internalType: "address[]",
          name: "validators",
          type: "address[]"
        }
      ],
      name: "TransactionReceiptProposed",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tx_id",
          type: "bytes32"
        }
      ],
      name: "TransactionUndetermined",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "validator",
          type: "address"
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isLastVote",
          type: "bool"
        }
      ],
      name: "TribunalAppealVoteCommitted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "validator",
          type: "address"
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isLastVote",
          type: "bool"
        }
      ],
      name: "TribunalAppealVoteRevealed",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "validator",
          type: "address"
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isLastVote",
          type: "bool"
        }
      ],
      name: "VoteCommitted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "validator",
          type: "address"
        },
        {
          indexed: false,
          internalType: "enum ITransactions.VoteType",
          name: "voteType",
          type: "uint8"
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isLastVote",
          type: "bool"
        },
        {
          indexed: false,
          internalType: "enum ITransactions.ResultType",
          name: "result",
          type: "uint8"
        }
      ],
      name: "VoteRevealed",
      type: "event"
    },
    {
      inputs: [],
      name: "DEFAULT_ADMIN_ROLE",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "EVENTS_BATCH_SIZE",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes",
          name: "_vrfProof",
          type: "bytes"
        }
      ],
      name: "activateTransaction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_sender",
          type: "address"
        },
        {
          internalType: "address",
          name: "_recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "_numOfInitialValidators",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "_maxRotations",
          type: "uint256"
        },
        {
          internalType: "bytes",
          name: "_txData",
          type: "bytes"
        }
      ],
      name: "addTransaction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        }
      ],
      name: "cancelTransaction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "_commitHash",
          type: "bytes32"
        }
      ],
      name: "commitTribunalAppealVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "_commitHash",
          type: "bytes32"
        },
        {
          internalType: "uint256",
          name: "_validatorIndex",
          type: "uint256"
        }
      ],
      name: "commitVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "contracts",
      outputs: [
        {
          internalType: "contract IGenManager",
          name: "genManager",
          type: "address"
        },
        {
          internalType: "contract ITransactions",
          name: "genTransactions",
          type: "address"
        },
        {
          internalType: "contract IQueues",
          name: "genQueue",
          type: "address"
        },
        {
          internalType: "contract IGhostFactory",
          name: "ghostFactory",
          type: "address"
        },
        {
          internalType: "contract IGenStaking",
          name: "genStaking",
          type: "address"
        },
        {
          internalType: "contract IMessages",
          name: "genMessages",
          type: "address"
        },
        {
          internalType: "contract IIdleness",
          name: "idleness",
          type: "address"
        },
        {
          internalType: "contract ITribunalAppeal",
          name: "tribunalAppeal",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "_value",
          type: "uint256"
        },
        {
          internalType: "bytes",
          name: "_data",
          type: "bytes"
        }
      ],
      name: "executeMessage",
      outputs: [
        {
          internalType: "bool",
          name: "success",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        }
      ],
      name: "finalizeTransaction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "getContracts",
      outputs: [
        {
          components: [
            {
              internalType: "contract IGenManager",
              name: "genManager",
              type: "address"
            },
            {
              internalType: "contract ITransactions",
              name: "genTransactions",
              type: "address"
            },
            {
              internalType: "contract IQueues",
              name: "genQueue",
              type: "address"
            },
            {
              internalType: "contract IGhostFactory",
              name: "ghostFactory",
              type: "address"
            },
            {
              internalType: "contract IGenStaking",
              name: "genStaking",
              type: "address"
            },
            {
              internalType: "contract IMessages",
              name: "genMessages",
              type: "address"
            },
            {
              internalType: "contract IIdleness",
              name: "idleness",
              type: "address"
            },
            {
              internalType: "contract ITribunalAppeal",
              name: "tribunalAppeal",
              type: "address"
            }
          ],
          internalType: "struct IConsensusMain.ExternalContracts",
          name: "",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        }
      ],
      name: "getRoleAdmin",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "addr",
          type: "address"
        }
      ],
      name: "ghostContracts",
      outputs: [
        {
          internalType: "bool",
          name: "isGhost",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "grantRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "hasRole",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "pendingOwner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "proceedPendingQueueProcessing",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes",
          name: "_txReceipt",
          type: "bytes"
        },
        {
          internalType: "uint256",
          name: "_processingBlock",
          type: "uint256"
        },
        {
          components: [
            {
              internalType: "enum IMessages.MessageType",
              name: "messageType",
              type: "uint8"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256"
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes"
            },
            {
              internalType: "bool",
              name: "onAcceptance",
              type: "bool"
            }
          ],
          internalType: "struct IMessages.SubmittedMessage[]",
          name: "_messages",
          type: "tuple[]"
        },
        {
          internalType: "bytes",
          name: "_vrfProof",
          type: "bytes"
        }
      ],
      name: "proposeReceipt",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "callerConfirmation",
          type: "address"
        }
      ],
      name: "renounceRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "_voteHash",
          type: "bytes32"
        },
        {
          internalType: "enum ITribunalAppeal.TribunalVoteType",
          name: "_voteType",
          type: "uint8"
        },
        {
          internalType: "uint256",
          name: "_nonce",
          type: "uint256"
        }
      ],
      name: "revealTribunalAppealVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "_voteHash",
          type: "bytes32"
        },
        {
          internalType: "enum ITransactions.VoteType",
          name: "_voteType",
          type: "uint8"
        },
        {
          internalType: "uint256",
          name: "_nonce",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "_validatorIndex",
          type: "uint256"
        }
      ],
      name: "revealVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "revokeRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_ghostFactory",
          type: "address"
        },
        {
          internalType: "address",
          name: "_genManager",
          type: "address"
        },
        {
          internalType: "address",
          name: "_genTransactions",
          type: "address"
        },
        {
          internalType: "address",
          name: "_genQueue",
          type: "address"
        },
        {
          internalType: "address",
          name: "_genStaking",
          type: "address"
        },
        {
          internalType: "address",
          name: "_genMessages",
          type: "address"
        },
        {
          internalType: "address",
          name: "_idleness",
          type: "address"
        },
        {
          internalType: "address",
          name: "_tribunalAppeal",
          type: "address"
        }
      ],
      name: "setExternalContracts",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        }
      ],
      name: "submitAppeal",
      outputs: [],
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        }
      ],
      name: "submitSlashAppeal",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4"
        }
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ],
  bytecode: ""
};
var CONSENSUS_DATA_CONTRACT = {
  address: "0x88B0F18613Db92Bf970FfE264E02496e20a74D16",
  abi: [
    {
      inputs: [],
      name: "AccessControlBadConfirmation",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          internalType: "bytes32",
          name: "neededRole",
          type: "bytes32"
        }
      ],
      name: "AccessControlUnauthorizedAccount",
      type: "error"
    },
    {
      inputs: [],
      name: "InvalidInitialization",
      type: "error"
    },
    {
      inputs: [],
      name: "NotInitializing",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        }
      ],
      name: "OwnableInvalidOwner",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error"
    },
    {
      inputs: [],
      name: "ReentrancyGuardReentrantCall",
      type: "error"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint64",
          name: "version",
          type: "uint64"
        }
      ],
      name: "Initialized",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "OwnershipTransferStarted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "OwnershipTransferred",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "previousAdminRole",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "newAdminRole",
          type: "bytes32"
        }
      ],
      name: "RoleAdminChanged",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "RoleGranted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "RoleRevoked",
      type: "event"
    },
    {
      inputs: [],
      name: "DEFAULT_ADMIN_ROLE",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "uint256",
          name: "_currentTimestamp",
          type: "uint256"
        }
      ],
      name: "canFinalize",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "consensusMain",
      outputs: [
        {
          internalType: "contract IConsensusMain",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getLastAppealResult",
      outputs: [
        {
          internalType: "enum ITransactions.ResultType",
          name: "",
          type: "uint8"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestAcceptedTransaction",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData",
          name: "txData",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "startIndex",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "pageSize",
          type: "uint256"
        }
      ],
      name: "getLatestAcceptedTransactions",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData[]",
          name: "",
          type: "tuple[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestAcceptedTxCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestFinalizedTransaction",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData",
          name: "txData",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "startIndex",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "pageSize",
          type: "uint256"
        }
      ],
      name: "getLatestFinalizedTransactions",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData[]",
          name: "",
          type: "tuple[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestFinalizedTxCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestPendingTxCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "slot",
          type: "uint256"
        }
      ],
      name: "getLatestPendingTxId",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestUndeterminedTransaction",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData",
          name: "txData",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestUndeterminedTxCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getMessagesForTransaction",
      outputs: [
        {
          components: [
            {
              internalType: "enum IMessages.MessageType",
              name: "messageType",
              type: "uint8"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256"
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes"
            },
            {
              internalType: "bool",
              name: "onAcceptance",
              type: "bool"
            }
          ],
          internalType: "struct IMessages.SubmittedMessage[]",
          name: "",
          type: "tuple[]"
        },
        {
          internalType: "address",
          name: "ghostAddress",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getReadStateBlockRangeForTransaction",
      outputs: [
        {
          internalType: "uint256",
          name: "activationBlock",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "processingBlock",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "proposalBlock",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "startIndex",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "endIndex",
          type: "uint256"
        }
      ],
      name: "getRecipientQueues",
      outputs: [
        {
          components: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "head",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "tail",
                  type: "uint256"
                },
                {
                  internalType: "bytes32[]",
                  name: "txIds",
                  type: "bytes32[]"
                }
              ],
              internalType: "struct IQueues.QueueInfoView",
              name: "pending",
              type: "tuple"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "head",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "tail",
                  type: "uint256"
                },
                {
                  internalType: "bytes32[]",
                  name: "txIds",
                  type: "bytes32[]"
                }
              ],
              internalType: "struct IQueues.QueueInfoView",
              name: "accepted",
              type: "tuple"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "head",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "tail",
                  type: "uint256"
                },
                {
                  internalType: "bytes32[]",
                  name: "txIds",
                  type: "bytes32[]"
                }
              ],
              internalType: "struct IQueues.QueueInfoView",
              name: "undetermined",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "finalizedCount",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "issuedTxCount",
              type: "uint256"
            }
          ],
          internalType: "struct IQueues.RecipientQueuesView",
          name: "",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        }
      ],
      name: "getRoleAdmin",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getTotalNumOfTransactions",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getTransactionAllData",
      outputs: [
        {
          components: [
            {
              internalType: "bytes32",
              name: "id",
              type: "bytes32"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "previousStatus",
              type: "uint8"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "created",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "pending",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "activated",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "committed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "lastVote",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealSubmitted",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.Timestamps",
              name: "timestamps",
              type: "tuple"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "bool",
              name: "onAcceptanceMessages",
              type: "bool"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "address[]",
              name: "consumedValidators",
              type: "address[]"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData[]",
              name: "roundData",
              type: "tuple[]"
            }
          ],
          internalType: "struct ITransactions.Transaction",
          name: "transaction",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        },
        {
          internalType: "uint256",
          name: "_timestamp",
          type: "uint256"
        }
      ],
      name: "getTransactionData",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData",
          name: "",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "startIndex",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "endIndex",
          type: "uint256"
        }
      ],
      name: "getTransactionIndexToTxId",
      outputs: [
        {
          internalType: "bytes32[]",
          name: "",
          type: "bytes32[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        },
        {
          internalType: "uint256",
          name: "_timestamp",
          type: "uint256"
        }
      ],
      name: "getTransactionStatus",
      outputs: [
        {
          internalType: "enum ITransactions.TransactionStatus",
          name: "",
          type: "uint8"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getValidatorsForLastAppeal",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getValidatorsForLastRound",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "grantRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "hasRole",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "hasTransactionOnAcceptanceMessages",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "hasTransactionOnFinalizationMessages",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_consensusMain",
          type: "address"
        },
        {
          internalType: "address",
          name: "_transactions",
          type: "address"
        },
        {
          internalType: "address",
          name: "_queues",
          type: "address"
        }
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "pendingOwner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "queues",
      outputs: [
        {
          internalType: "contract IQueues",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "callerConfirmation",
          type: "address"
        }
      ],
      name: "renounceRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "revokeRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_consensusMain",
          type: "address"
        }
      ],
      name: "setConsensusMain",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_queues",
          type: "address"
        }
      ],
      name: "setQueues",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_transactions",
          type: "address"
        }
      ],
      name: "setTransactions",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4"
        }
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "transactions",
      outputs: [
        {
          internalType: "contract ITransactions",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ],
  bytecode: ""
};
var localnet = defineChain({
  id: 61127,
  isStudio: true,
  name: "Genlayer Localnet",
  rpcUrls: {
    default: {
      http: [SIMULATOR_JSON_RPC_URL]
    }
  },
  nativeCurrency: {
    name: "GEN Token",
    symbol: "GEN",
    decimals: 18
  },
  blockExplorers: {
    default: {
      name: "GenLayer Explorer",
      url: SIMULATOR_JSON_RPC_URL
    }
  },
  testnet: true,
  consensusMainContract: CONSENSUS_MAIN_CONTRACT,
  consensusDataContract: CONSENSUS_DATA_CONTRACT,
  stakingContract: null,
  feeManagerContract: null,
  roundsStorageContract: null,
  appealsContract: null,
  defaultNumberOfInitialValidators: 5,
  defaultConsensusMaxRotations: 3
});
var SIMULATOR_JSON_RPC_URL2 = "https://studio.genlayer.com/api";
var EXPLORER_URL = "https://genlayer-explorer.vercel.app";
var CONSENSUS_MAIN_CONTRACT2 = {
  address: "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575",
  abi: [
    {
      inputs: [],
      name: "AccessControlBadConfirmation",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          internalType: "bytes32",
          name: "neededRole",
          type: "bytes32"
        }
      ],
      name: "AccessControlUnauthorizedAccount",
      type: "error"
    },
    {
      inputs: [],
      name: "CallerNotMessages",
      type: "error"
    },
    {
      inputs: [],
      name: "CanNotAppeal",
      type: "error"
    },
    {
      inputs: [],
      name: "EmptyTransaction",
      type: "error"
    },
    {
      inputs: [],
      name: "FinalizationNotAllowed",
      type: "error"
    },
    {
      inputs: [],
      name: "InvalidAddress",
      type: "error"
    },
    {
      inputs: [],
      name: "InvalidGhostContract",
      type: "error"
    },
    {
      inputs: [],
      name: "InvalidInitialization",
      type: "error"
    },
    {
      inputs: [],
      name: "InvalidVote",
      type: "error"
    },
    {
      inputs: [],
      name: "MaxNumOfIterationsInPendingQueueReached",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "numOfMessages",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "maxAllocatedMessages",
          type: "uint256"
        }
      ],
      name: "MaxNumOfMessagesExceeded",
      type: "error"
    },
    {
      inputs: [],
      name: "NonGenVMContract",
      type: "error"
    },
    {
      inputs: [],
      name: "NotInitializing",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        }
      ],
      name: "OwnableInvalidOwner",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error"
    },
    {
      inputs: [],
      name: "ReentrancyGuardReentrantCall",
      type: "error"
    },
    {
      inputs: [],
      name: "TransactionNotAtPendingQueueHead",
      type: "error"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "appealer",
          type: "address"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "appealBond",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "address[]",
          name: "appealValidators",
          type: "address[]"
        }
      ],
      name: "AppealStarted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "data",
          type: "bytes"
        }
      ],
      name: "ErrorMessage",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "ghostFactory",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "genManager",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "genTransactions",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "genQueue",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "genStaking",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "genMessages",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "idleness",
          type: "address"
        },
        {
          indexed: false,
          internalType: "address",
          name: "tribunalAppeal",
          type: "address"
        }
      ],
      name: "ExternalContractsSet",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint64",
          name: "version",
          type: "uint64"
        }
      ],
      name: "Initialized",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "activator",
          type: "address"
        }
      ],
      name: "InternalMessageProcessed",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "activator",
          type: "address"
        }
      ],
      name: "NewTransaction",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "OwnershipTransferStarted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "OwnershipTransferred",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "previousAdminRole",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "newAdminRole",
          type: "bytes32"
        }
      ],
      name: "RoleAdminChanged",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "RoleGranted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "RoleRevoked",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "SlashAppealSubmitted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tx_id",
          type: "bytes32"
        }
      ],
      name: "TransactionAccepted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "leader",
          type: "address"
        }
      ],
      name: "TransactionActivated",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "batchId",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "address[]",
          name: "validators",
          type: "address[]"
        }
      ],
      name: "TransactionActivatedValidators",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "TransactionCancelled",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tx_id",
          type: "bytes32"
        }
      ],
      name: "TransactionFinalized",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "oldValidator",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newValidator",
          type: "address"
        }
      ],
      name: "TransactionIdleValidatorReplaced",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "validatorIndex",
          type: "uint256"
        }
      ],
      name: "TransactionIdleValidatorReplacementFailed",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newLeader",
          type: "address"
        }
      ],
      name: "TransactionLeaderRotated",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tx_id",
          type: "bytes32"
        }
      ],
      name: "TransactionLeaderTimeout",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "bytes32[]",
          name: "tx_ids",
          type: "bytes32[]"
        }
      ],
      name: "TransactionNeedsRecomputation",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tx_id",
          type: "bytes32"
        },
        {
          indexed: false,
          internalType: "address[]",
          name: "validators",
          type: "address[]"
        }
      ],
      name: "TransactionReceiptProposed",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tx_id",
          type: "bytes32"
        }
      ],
      name: "TransactionUndetermined",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "validator",
          type: "address"
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isLastVote",
          type: "bool"
        }
      ],
      name: "TribunalAppealVoteCommitted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "validator",
          type: "address"
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isLastVote",
          type: "bool"
        }
      ],
      name: "TribunalAppealVoteRevealed",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "validator",
          type: "address"
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isLastVote",
          type: "bool"
        }
      ],
      name: "VoteCommitted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "txId",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "validator",
          type: "address"
        },
        {
          indexed: false,
          internalType: "enum ITransactions.VoteType",
          name: "voteType",
          type: "uint8"
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isLastVote",
          type: "bool"
        },
        {
          indexed: false,
          internalType: "enum ITransactions.ResultType",
          name: "result",
          type: "uint8"
        }
      ],
      name: "VoteRevealed",
      type: "event"
    },
    {
      inputs: [],
      name: "DEFAULT_ADMIN_ROLE",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "EVENTS_BATCH_SIZE",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes",
          name: "_vrfProof",
          type: "bytes"
        }
      ],
      name: "activateTransaction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_sender",
          type: "address"
        },
        {
          internalType: "address",
          name: "_recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "_numOfInitialValidators",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "_maxRotations",
          type: "uint256"
        },
        {
          internalType: "bytes",
          name: "_txData",
          type: "bytes"
        }
      ],
      name: "addTransaction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        }
      ],
      name: "cancelTransaction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "_commitHash",
          type: "bytes32"
        }
      ],
      name: "commitTribunalAppealVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "_commitHash",
          type: "bytes32"
        },
        {
          internalType: "uint256",
          name: "_validatorIndex",
          type: "uint256"
        }
      ],
      name: "commitVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "contracts",
      outputs: [
        {
          internalType: "contract IGenManager",
          name: "genManager",
          type: "address"
        },
        {
          internalType: "contract ITransactions",
          name: "genTransactions",
          type: "address"
        },
        {
          internalType: "contract IQueues",
          name: "genQueue",
          type: "address"
        },
        {
          internalType: "contract IGhostFactory",
          name: "ghostFactory",
          type: "address"
        },
        {
          internalType: "contract IGenStaking",
          name: "genStaking",
          type: "address"
        },
        {
          internalType: "contract IMessages",
          name: "genMessages",
          type: "address"
        },
        {
          internalType: "contract IIdleness",
          name: "idleness",
          type: "address"
        },
        {
          internalType: "contract ITribunalAppeal",
          name: "tribunalAppeal",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "_value",
          type: "uint256"
        },
        {
          internalType: "bytes",
          name: "_data",
          type: "bytes"
        }
      ],
      name: "executeMessage",
      outputs: [
        {
          internalType: "bool",
          name: "success",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        }
      ],
      name: "finalizeTransaction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "getContracts",
      outputs: [
        {
          components: [
            {
              internalType: "contract IGenManager",
              name: "genManager",
              type: "address"
            },
            {
              internalType: "contract ITransactions",
              name: "genTransactions",
              type: "address"
            },
            {
              internalType: "contract IQueues",
              name: "genQueue",
              type: "address"
            },
            {
              internalType: "contract IGhostFactory",
              name: "ghostFactory",
              type: "address"
            },
            {
              internalType: "contract IGenStaking",
              name: "genStaking",
              type: "address"
            },
            {
              internalType: "contract IMessages",
              name: "genMessages",
              type: "address"
            },
            {
              internalType: "contract IIdleness",
              name: "idleness",
              type: "address"
            },
            {
              internalType: "contract ITribunalAppeal",
              name: "tribunalAppeal",
              type: "address"
            }
          ],
          internalType: "struct IConsensusMain.ExternalContracts",
          name: "",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        }
      ],
      name: "getRoleAdmin",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "addr",
          type: "address"
        }
      ],
      name: "ghostContracts",
      outputs: [
        {
          internalType: "bool",
          name: "isGhost",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "grantRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "hasRole",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "pendingOwner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "proceedPendingQueueProcessing",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes",
          name: "_txReceipt",
          type: "bytes"
        },
        {
          internalType: "uint256",
          name: "_processingBlock",
          type: "uint256"
        },
        {
          components: [
            {
              internalType: "enum IMessages.MessageType",
              name: "messageType",
              type: "uint8"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256"
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes"
            },
            {
              internalType: "bool",
              name: "onAcceptance",
              type: "bool"
            }
          ],
          internalType: "struct IMessages.SubmittedMessage[]",
          name: "_messages",
          type: "tuple[]"
        },
        {
          internalType: "bytes",
          name: "_vrfProof",
          type: "bytes"
        }
      ],
      name: "proposeReceipt",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "callerConfirmation",
          type: "address"
        }
      ],
      name: "renounceRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "_voteHash",
          type: "bytes32"
        },
        {
          internalType: "enum ITribunalAppeal.TribunalVoteType",
          name: "_voteType",
          type: "uint8"
        },
        {
          internalType: "uint256",
          name: "_nonce",
          type: "uint256"
        }
      ],
      name: "revealTribunalAppealVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "_voteHash",
          type: "bytes32"
        },
        {
          internalType: "enum ITransactions.VoteType",
          name: "_voteType",
          type: "uint8"
        },
        {
          internalType: "uint256",
          name: "_nonce",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "_validatorIndex",
          type: "uint256"
        }
      ],
      name: "revealVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "revokeRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_ghostFactory",
          type: "address"
        },
        {
          internalType: "address",
          name: "_genManager",
          type: "address"
        },
        {
          internalType: "address",
          name: "_genTransactions",
          type: "address"
        },
        {
          internalType: "address",
          name: "_genQueue",
          type: "address"
        },
        {
          internalType: "address",
          name: "_genStaking",
          type: "address"
        },
        {
          internalType: "address",
          name: "_genMessages",
          type: "address"
        },
        {
          internalType: "address",
          name: "_idleness",
          type: "address"
        },
        {
          internalType: "address",
          name: "_tribunalAppeal",
          type: "address"
        }
      ],
      name: "setExternalContracts",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        }
      ],
      name: "submitAppeal",
      outputs: [],
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        }
      ],
      name: "submitSlashAppeal",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4"
        }
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ],
  bytecode: ""
};
var CONSENSUS_DATA_CONTRACT2 = {
  address: "0x88B0F18613Db92Bf970FfE264E02496e20a74D16",
  abi: [
    {
      inputs: [],
      name: "AccessControlBadConfirmation",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          internalType: "bytes32",
          name: "neededRole",
          type: "bytes32"
        }
      ],
      name: "AccessControlUnauthorizedAccount",
      type: "error"
    },
    {
      inputs: [],
      name: "InvalidInitialization",
      type: "error"
    },
    {
      inputs: [],
      name: "NotInitializing",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        }
      ],
      name: "OwnableInvalidOwner",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error"
    },
    {
      inputs: [],
      name: "ReentrancyGuardReentrantCall",
      type: "error"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint64",
          name: "version",
          type: "uint64"
        }
      ],
      name: "Initialized",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "OwnershipTransferStarted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "OwnershipTransferred",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "previousAdminRole",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "newAdminRole",
          type: "bytes32"
        }
      ],
      name: "RoleAdminChanged",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "RoleGranted",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "RoleRevoked",
      type: "event"
    },
    {
      inputs: [],
      name: "DEFAULT_ADMIN_ROLE",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_txId",
          type: "bytes32"
        },
        {
          internalType: "uint256",
          name: "_currentTimestamp",
          type: "uint256"
        }
      ],
      name: "canFinalize",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "consensusMain",
      outputs: [
        {
          internalType: "contract IConsensusMain",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getLastAppealResult",
      outputs: [
        {
          internalType: "enum ITransactions.ResultType",
          name: "",
          type: "uint8"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestAcceptedTransaction",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData",
          name: "txData",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "startIndex",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "pageSize",
          type: "uint256"
        }
      ],
      name: "getLatestAcceptedTransactions",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData[]",
          name: "",
          type: "tuple[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestAcceptedTxCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestFinalizedTransaction",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData",
          name: "txData",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "startIndex",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "pageSize",
          type: "uint256"
        }
      ],
      name: "getLatestFinalizedTransactions",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData[]",
          name: "",
          type: "tuple[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestFinalizedTxCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestPendingTxCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "slot",
          type: "uint256"
        }
      ],
      name: "getLatestPendingTxId",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestUndeterminedTransaction",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData",
          name: "txData",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        }
      ],
      name: "getLatestUndeterminedTxCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getMessagesForTransaction",
      outputs: [
        {
          components: [
            {
              internalType: "enum IMessages.MessageType",
              name: "messageType",
              type: "uint8"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256"
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes"
            },
            {
              internalType: "bool",
              name: "onAcceptance",
              type: "bool"
            }
          ],
          internalType: "struct IMessages.SubmittedMessage[]",
          name: "",
          type: "tuple[]"
        },
        {
          internalType: "address",
          name: "ghostAddress",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getReadStateBlockRangeForTransaction",
      outputs: [
        {
          internalType: "uint256",
          name: "activationBlock",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "processingBlock",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "proposalBlock",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "startIndex",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "endIndex",
          type: "uint256"
        }
      ],
      name: "getRecipientQueues",
      outputs: [
        {
          components: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "head",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "tail",
                  type: "uint256"
                },
                {
                  internalType: "bytes32[]",
                  name: "txIds",
                  type: "bytes32[]"
                }
              ],
              internalType: "struct IQueues.QueueInfoView",
              name: "pending",
              type: "tuple"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "head",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "tail",
                  type: "uint256"
                },
                {
                  internalType: "bytes32[]",
                  name: "txIds",
                  type: "bytes32[]"
                }
              ],
              internalType: "struct IQueues.QueueInfoView",
              name: "accepted",
              type: "tuple"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "head",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "tail",
                  type: "uint256"
                },
                {
                  internalType: "bytes32[]",
                  name: "txIds",
                  type: "bytes32[]"
                }
              ],
              internalType: "struct IQueues.QueueInfoView",
              name: "undetermined",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "finalizedCount",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "issuedTxCount",
              type: "uint256"
            }
          ],
          internalType: "struct IQueues.RecipientQueuesView",
          name: "",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        }
      ],
      name: "getRoleAdmin",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getTotalNumOfTransactions",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getTransactionAllData",
      outputs: [
        {
          components: [
            {
              internalType: "bytes32",
              name: "id",
              type: "bytes32"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "previousStatus",
              type: "uint8"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "created",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "pending",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "activated",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "committed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "lastVote",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealSubmitted",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.Timestamps",
              name: "timestamps",
              type: "tuple"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "bool",
              name: "onAcceptanceMessages",
              type: "bool"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "address[]",
              name: "consumedValidators",
              type: "address[]"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData[]",
              name: "roundData",
              type: "tuple[]"
            }
          ],
          internalType: "struct ITransactions.Transaction",
          name: "transaction",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        },
        {
          internalType: "uint256",
          name: "_timestamp",
          type: "uint256"
        }
      ],
      name: "getTransactionData",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "currentTimestamp",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "sender",
              type: "address"
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "numOfInitialValidators",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "txSlot",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "lastVoteTimestamp",
              type: "uint256"
            },
            {
              internalType: "bytes32",
              name: "randomSeed",
              type: "bytes32"
            },
            {
              internalType: "enum ITransactions.ResultType",
              name: "result",
              type: "uint8"
            },
            {
              internalType: "bytes",
              name: "txData",
              type: "bytes"
            },
            {
              internalType: "bytes",
              name: "txReceipt",
              type: "bytes"
            },
            {
              components: [
                {
                  internalType: "enum IMessages.MessageType",
                  name: "messageType",
                  type: "uint8"
                },
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address"
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes"
                },
                {
                  internalType: "bool",
                  name: "onAcceptance",
                  type: "bool"
                }
              ],
              internalType: "struct IMessages.SubmittedMessage[]",
              name: "messages",
              type: "tuple[]"
            },
            {
              internalType: "enum IQueues.QueueType",
              name: "queueType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "queuePosition",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "activator",
              type: "address"
            },
            {
              internalType: "address",
              name: "lastLeader",
              type: "address"
            },
            {
              internalType: "enum ITransactions.TransactionStatus",
              name: "status",
              type: "uint8"
            },
            {
              internalType: "bytes32",
              name: "txId",
              type: "bytes32"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "activationBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "processingBlock",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "proposalBlock",
                  type: "uint256"
                }
              ],
              internalType: "struct ITransactions.ReadStateBlockRange",
              name: "readStateBlockRange",
              type: "tuple"
            },
            {
              internalType: "uint256",
              name: "numOfRounds",
              type: "uint256"
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "round",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "leaderIndex",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesCommitted",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "votesRevealed",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "appealBond",
                  type: "uint256"
                },
                {
                  internalType: "uint256",
                  name: "rotationsLeft",
                  type: "uint256"
                },
                {
                  internalType: "enum ITransactions.ResultType",
                  name: "result",
                  type: "uint8"
                },
                {
                  internalType: "address[]",
                  name: "roundValidators",
                  type: "address[]"
                },
                {
                  internalType: "bytes32[]",
                  name: "validatorVotesHash",
                  type: "bytes32[]"
                },
                {
                  internalType: "enum ITransactions.VoteType[]",
                  name: "validatorVotes",
                  type: "uint8[]"
                }
              ],
              internalType: "struct ITransactions.RoundData",
              name: "lastRound",
              type: "tuple"
            }
          ],
          internalType: "struct ConsensusData.TransactionData",
          name: "",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "startIndex",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "endIndex",
          type: "uint256"
        }
      ],
      name: "getTransactionIndexToTxId",
      outputs: [
        {
          internalType: "bytes32[]",
          name: "",
          type: "bytes32[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        },
        {
          internalType: "uint256",
          name: "_timestamp",
          type: "uint256"
        }
      ],
      name: "getTransactionStatus",
      outputs: [
        {
          internalType: "enum ITransactions.TransactionStatus",
          name: "",
          type: "uint8"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getValidatorsForLastAppeal",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "getValidatorsForLastRound",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "grantRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "hasRole",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "hasTransactionOnAcceptanceMessages",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_tx_id",
          type: "bytes32"
        }
      ],
      name: "hasTransactionOnFinalizationMessages",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_consensusMain",
          type: "address"
        },
        {
          internalType: "address",
          name: "_transactions",
          type: "address"
        },
        {
          internalType: "address",
          name: "_queues",
          type: "address"
        }
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "pendingOwner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "queues",
      outputs: [
        {
          internalType: "contract IQueues",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "callerConfirmation",
          type: "address"
        }
      ],
      name: "renounceRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32"
        },
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "revokeRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_consensusMain",
          type: "address"
        }
      ],
      name: "setConsensusMain",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_queues",
          type: "address"
        }
      ],
      name: "setQueues",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_transactions",
          type: "address"
        }
      ],
      name: "setTransactions",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4"
        }
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "transactions",
      outputs: [
        {
          internalType: "contract ITransactions",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ],
  bytecode: ""
};
var studionet = defineChain({
  id: 61999,
  isStudio: true,
  name: "Genlayer Studio Network",
  rpcUrls: {
    default: {
      http: [SIMULATOR_JSON_RPC_URL2]
    }
  },
  nativeCurrency: {
    name: "GEN Token",
    symbol: "GEN",
    decimals: 18
  },
  blockExplorers: {
    default: {
      name: "GenLayer Explorer",
      url: EXPLORER_URL
    }
  },
  testnet: true,
  consensusMainContract: CONSENSUS_MAIN_CONTRACT2,
  consensusDataContract: CONSENSUS_DATA_CONTRACT2,
  stakingContract: null,
  feeManagerContract: null,
  roundsStorageContract: null,
  appealsContract: null,
  defaultNumberOfInitialValidators: 5,
  defaultConsensusMaxRotations: 3
});
var VALIDATOR_WALLET_ABI = [
  // Custom errors
  { name: "NotOperator", type: "error", inputs: [] },
  { name: "InvalidAddress", type: "error", inputs: [] },
  { name: "TransferFailed", type: "error", inputs: [] },
  { name: "OperatorTransferNotReady", type: "error", inputs: [] },
  { name: "NoPendingOperator", type: "error", inputs: [] },
  // OpenZeppelin Ownable errors
  { name: "OwnableUnauthorizedAccount", type: "error", inputs: [{ name: "account", type: "address" }] },
  { name: "OwnableInvalidOwner", type: "error", inputs: [{ name: "owner", type: "address" }] },
  // Functions
  {
    name: "operator",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  },
  {
    name: "getIdentity",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "moniker", type: "string" },
          { name: "logoUri", type: "string" },
          { name: "website", type: "string" },
          { name: "description", type: "string" },
          { name: "email", type: "string" },
          { name: "twitter", type: "string" },
          { name: "telegram", type: "string" },
          { name: "github", type: "string" },
          { name: "extraCid", type: "bytes" }
        ]
      }
    ]
  },
  {
    name: "setOperator",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_operator", type: "address" }],
    outputs: []
  },
  {
    name: "setIdentity",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "moniker", type: "string" },
      { name: "logoUri", type: "string" },
      { name: "website", type: "string" },
      { name: "description", type: "string" },
      { name: "email", type: "string" },
      { name: "twitter", type: "string" },
      { name: "telegram", type: "string" },
      { name: "github", type: "string" },
      { name: "extraCid", type: "bytes" }
    ],
    outputs: []
  },
  // Staking functions (forwarded to staking contract)
  {
    name: "validatorDeposit",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: []
  },
  {
    name: "validatorExit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_shares", type: "uint256" }],
    outputs: []
  },
  {
    name: "validatorClaim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  // Two-step operator transfer
  {
    name: "initiateOperatorTransfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_newOperator", type: "address" }],
    outputs: []
  },
  {
    name: "completeOperatorTransfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "cancelOperatorTransfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "getPendingOperator",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "", type: "address" },
      { name: "", type: "uint256" }
    ]
  },
  {
    name: "getOperator",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  }
];
var STAKING_ABI = [
  // Custom errors from IGenLayerStaking
  { name: "BurnTransferFailed", type: "error", inputs: [] },
  { name: "DeepthoughtCallFailed", type: "error", inputs: [] },
  { name: "DelegatorBelowMinimumStake", type: "error", inputs: [] },
  { name: "DelegatorExitExceedsShares", type: "error", inputs: [] },
  { name: "DelegatorExitWouldBeBelowMinimum", type: "error", inputs: [] },
  { name: "DelegatorMayNotJoinTwoValidatorsSimultaneously", type: "error", inputs: [] },
  { name: "DelegatorMayNotJoinWithZeroValue", type: "error", inputs: [] },
  { name: "DelegatorMustExitAllWhenBelowMinimum", type: "error", inputs: [] },
  { name: "EpochAdvanceNotReady", type: "error", inputs: [] },
  { name: "EpochAlreadyFinalized", type: "error", inputs: [] },
  { name: "EpochNotFinalized", type: "error", inputs: [] },
  { name: "EpochNotFinished", type: "error", inputs: [] },
  { name: "FailedTransfer", type: "error", inputs: [{ name: "validator", type: "address" }] },
  { name: "InflationAlreadyInitialized", type: "error", inputs: [] },
  { name: "InflationAlreadyReceived", type: "error", inputs: [] },
  { name: "InflationInvalidAmount", type: "error", inputs: [] },
  { name: "InsufficientInflationFunds", type: "error", inputs: [] },
  { name: "InvalidAtEpoch", type: "error", inputs: [] },
  { name: "InvalidOperatorAddress", type: "error", inputs: [] },
  { name: "MaxNumberOfValidatorsReached", type: "error", inputs: [] },
  { name: "MaxValidatorsCannotBeZero", type: "error", inputs: [] },
  { name: "NFTMinterCallFailed", type: "error", inputs: [] },
  { name: "NFTMinterNotConfigured", type: "error", inputs: [] },
  { name: "NoBurning", type: "error", inputs: [] },
  { name: "NumberOfValidatorsExceedsAvailable", type: "error", inputs: [] },
  { name: "OnlyGEN", type: "error", inputs: [] },
  { name: "OnlyIdleness", type: "error", inputs: [] },
  { name: "OnlyIdlenessOrTribunal", type: "error", inputs: [] },
  { name: "OnlyTransactions", type: "error", inputs: [] },
  { name: "OnlyTransactionsOrTribunal", type: "error", inputs: [] },
  { name: "OnlyTribunal", type: "error", inputs: [] },
  { name: "OperatorAlreadyAssigned", type: "error", inputs: [] },
  { name: "PendingTribunals", type: "error", inputs: [{ name: "epoch", type: "uint256" }] },
  { name: "PreviousEpochNotFinalizable", type: "error", inputs: [] },
  { name: "ReductionFactorCannotBeZero", type: "error", inputs: [] },
  { name: "ValidatorAlreadyJoined", type: "error", inputs: [] },
  { name: "ValidatorBelowMinimumStake", type: "error", inputs: [] },
  { name: "ValidatorExitExceedsShares", type: "error", inputs: [] },
  { name: "ValidatorMayNotBeDelegator", type: "error", inputs: [] },
  { name: "ValidatorMayNotDepositZeroValue", type: "error", inputs: [] },
  { name: "ValidatorMayNotJoinWithZeroValue", type: "error", inputs: [] },
  { name: "ValidatorMustNotBeDelegator", type: "error", inputs: [] },
  { name: "ValidatorNotActive", type: "error", inputs: [] },
  { name: "ValidatorNotJoined", type: "error", inputs: [] },
  { name: "ValidatorWithdrawalExceedsStake", type: "error", inputs: [] },
  { name: "ValidatorsConsumed", type: "error", inputs: [] },
  { name: "ValidatorsUnavailable", type: "error", inputs: [] },
  // Events
  {
    name: "AllValidatorBansRemoved",
    type: "event",
    inputs: []
  },
  {
    name: "BurnFailed",
    type: "event",
    inputs: [
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    name: "BurnToL1",
    type: "event",
    inputs: [
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    name: "DelegatorClaim",
    type: "event",
    inputs: [
      { name: "delegator", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    name: "DelegatorExit",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false },
      { name: "delegator", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    name: "DelegatorJoin",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false },
      { name: "delegator", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    name: "EpochAdvance",
    type: "event",
    inputs: [
      { name: "epoch", type: "uint256", indexed: false }
    ]
  },
  {
    name: "EpochFinalize",
    type: "event",
    inputs: [
      { name: "epoch", type: "uint256", indexed: false }
    ]
  },
  {
    name: "EpochHasPendingTribunals",
    type: "event",
    inputs: [
      { name: "epoch", type: "uint256", indexed: false }
    ]
  },
  {
    name: "EpochZeroEnded",
    type: "event",
    inputs: [
      { name: "timestamp", type: "uint256", indexed: false }
    ]
  },
  {
    name: "FeesReceived",
    type: "event",
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    name: "InflationInitiated",
    type: "event",
    inputs: [
      { name: "timestamp", type: "uint256", indexed: false }
    ]
  },
  {
    name: "InflationReceived",
    type: "event",
    inputs: [
      { name: "amount", type: "uint256", indexed: false },
      { name: "epoch", type: "uint256", indexed: false }
    ]
  },
  {
    name: "QuarantinesCleanedUp",
    type: "event",
    inputs: [
      { name: "startIndex", type: "uint256", indexed: false },
      { name: "processedCount", type: "uint256", indexed: false },
      { name: "nextIndex", type: "uint256", indexed: false }
    ]
  },
  {
    name: "SetDeepthought",
    type: "event",
    inputs: [
      { name: "deepthought", type: "address", indexed: false }
    ]
  },
  {
    name: "SetDelegatorMinimumStake",
    type: "event",
    inputs: [
      { name: "delegatorMinStake", type: "uint256", indexed: false }
    ]
  },
  {
    name: "SetEpochMinDuration",
    type: "event",
    inputs: [
      { name: "epochMinDuration", type: "uint256", indexed: false }
    ]
  },
  {
    name: "SetEpochMinDurationThreshold",
    type: "event",
    inputs: [
      { name: "epochMinDurationThreshold", type: "uint256", indexed: false }
    ]
  },
  {
    name: "SetEpochZeroMinDuration",
    type: "event",
    inputs: [
      { name: "epochZeroMinDuration", type: "uint256", indexed: false }
    ]
  },
  {
    name: "SetGen",
    type: "event",
    inputs: [
      { name: "gen", type: "address", indexed: false }
    ]
  },
  {
    name: "SetMaxValidators",
    type: "event",
    inputs: [
      { name: "maxValidators", type: "uint256", indexed: false }
    ]
  },
  {
    name: "SetReductionFactor",
    type: "event",
    inputs: [
      { name: "reductionFactor", type: "uint256", indexed: false }
    ]
  },
  {
    name: "SetStakingInvariant",
    type: "event",
    inputs: [
      { name: "stakingInvariant", type: "address", indexed: false }
    ]
  },
  {
    name: "SetTransactionFeesManager",
    type: "event",
    inputs: [
      { name: "transactionFeesManager", type: "address", indexed: false }
    ]
  },
  {
    name: "SetUnbondingPeriods",
    type: "event",
    inputs: [
      { name: "delegatorUnbondingPeriod", type: "uint256", indexed: false },
      { name: "validatorUnbondingPeriod", type: "uint256", indexed: false }
    ]
  },
  {
    name: "SetValidatorMinimumStake",
    type: "event",
    inputs: [
      { name: "validatorMinStake", type: "uint256", indexed: false }
    ]
  },
  {
    name: "SetValidatorWeightParams",
    type: "event",
    inputs: [
      { name: "alpha", type: "uint256", indexed: false },
      { name: "beta", type: "uint256", indexed: false }
    ]
  },
  {
    name: "ValidatorBanRemoved",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false }
    ]
  },
  {
    name: "ValidatorBannedDeterministic",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false }
    ]
  },
  {
    name: "ValidatorBannedIdleness",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false },
      { name: "bannedAt", type: "uint256", indexed: false },
      { name: "bannedUntil", type: "uint256", indexed: false }
    ]
  },
  {
    name: "ValidatorClaim",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    name: "ValidatorDeposit",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    name: "ValidatorExit",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    name: "ValidatorJoin",
    type: "event",
    inputs: [
      { name: "operator", type: "address", indexed: false },
      { name: "validator", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    name: "ValidatorPrime",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false },
      { name: "epoch", type: "uint256", indexed: false },
      { name: "validatorRewards", type: "uint256", indexed: false },
      { name: "delegatorRewards", type: "uint256", indexed: false },
      { name: "feeRewards", type: "uint256", indexed: false },
      { name: "feePenalties", type: "uint256", indexed: false }
    ]
  },
  {
    name: "ValidatorQuarantineRemoved",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false }
    ]
  },
  {
    name: "ValidatorQuarantineRepealed",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false }
    ]
  },
  {
    name: "ValidatorQuarantined",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false },
      { name: "quarantinedAt", type: "uint256", indexed: false }
    ]
  },
  {
    name: "ValidatorSlash",
    type: "event",
    inputs: [
      { name: "validator", type: "address", indexed: false },
      { name: "validatorSlashing", type: "uint256", indexed: false },
      { name: "delegatorSlashing", type: "uint256", indexed: false },
      { name: "epoch", type: "uint256", indexed: false }
    ]
  },
  {
    name: "ValidatorsRegistered",
    type: "event",
    inputs: [
      { name: "count", type: "uint256", indexed: false }
    ]
  },
  // Functions
  {
    name: "activeValidators",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    name: "activeValidatorsCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "activeWeights",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256[]" }]
  },
  {
    name: "adminRegisterValidators",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "validatorAddresses", type: "address[]" }],
    outputs: []
  },
  {
    name: "burning",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "canAdvance",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "deepthoughtInflation",
    type: "function",
    stateMutability: "pure",
    inputs: [{ name: "_inflation", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "delegatorClaim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_delegator", type: "address" },
      { name: "_validator", type: "address" }
    ],
    outputs: []
  },
  {
    name: "delegatorDeposit",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_delegator", type: "address" },
      { name: "_validator", type: "address" },
      { name: "_index", type: "uint256" }
    ],
    outputs: [
      {
        name: "claim_",
        type: "tuple",
        components: [
          { name: "quantity", type: "uint256" },
          { name: "commit", type: "uint256" }
        ]
      },
      {
        name: "commit_",
        type: "tuple",
        components: [
          { name: "input", type: "uint256" },
          { name: "output", type: "uint256" },
          { name: "epoch", type: "uint256" },
          { name: "linkToNextCommit", type: "uint256" }
        ]
      }
    ]
  },
  {
    name: "delegatorDepositByEpoch",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_delegator", type: "address" },
      { name: "_validator", type: "address" },
      { name: "_epoch", type: "uint256" }
    ],
    outputs: [
      {
        name: "commit_",
        type: "tuple",
        components: [
          { name: "input", type: "uint256" },
          { name: "output", type: "uint256" },
          { name: "epoch", type: "uint256" },
          { name: "linkToNextCommit", type: "uint256" }
        ]
      }
    ]
  },
  {
    name: "delegatorDepositLen",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_delegator", type: "address" },
      { name: "_validator", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "delegatorExit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_validator", type: "address" },
      { name: "_amount", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "delegatorJoin",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: []
  },
  {
    name: "delegatorWithdrawal",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_delegator", type: "address" },
      { name: "_validator", type: "address" },
      { name: "_index", type: "uint256" }
    ],
    outputs: [
      {
        name: "claim_",
        type: "tuple",
        components: [
          { name: "quantity", type: "uint256" },
          { name: "commit", type: "uint256" }
        ]
      },
      {
        name: "commit_",
        type: "tuple",
        components: [
          { name: "input", type: "uint256" },
          { name: "output", type: "uint256" },
          { name: "epoch", type: "uint256" },
          { name: "linkToNextCommit", type: "uint256" }
        ]
      }
    ]
  },
  {
    name: "delegatorWithdrawalByEpoch",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_delegator", type: "address" },
      { name: "_validator", type: "address" },
      { name: "_epoch", type: "uint256" }
    ],
    outputs: [
      {
        name: "commit_",
        type: "tuple",
        components: [
          { name: "input", type: "uint256" },
          { name: "output", type: "uint256" },
          { name: "epoch", type: "uint256" },
          { name: "linkToNextCommit", type: "uint256" }
        ]
      }
    ]
  },
  {
    name: "delegatorWithdrawalLen",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_delegator", type: "address" },
      { name: "_validator", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "developerInflation",
    type: "function",
    stateMutability: "pure",
    inputs: [{ name: "_inflation", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "epoch",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "epochAdvance",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "epochEven",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "start", type: "uint256" },
      { name: "end", type: "uint256" },
      { name: "inflation", type: "uint256" },
      { name: "weight", type: "uint256" },
      { name: "weightDeposit", type: "uint256" },
      { name: "weightWithdrawal", type: "uint256" },
      { name: "vcount", type: "uint256" },
      { name: "claimed", type: "uint256" },
      { name: "stakeDeposit", type: "uint256" },
      { name: "stakeWithdrawal", type: "uint256" },
      { name: "slashed", type: "uint256" }
    ]
  },
  {
    name: "epochFinalize",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "epochFinalizeImmediate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "epochInflation",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_epoch", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "epochMinDuration",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "epochOdd",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "start", type: "uint256" },
      { name: "end", type: "uint256" },
      { name: "inflation", type: "uint256" },
      { name: "weight", type: "uint256" },
      { name: "weightDeposit", type: "uint256" },
      { name: "weightWithdrawal", type: "uint256" },
      { name: "vcount", type: "uint256" },
      { name: "claimed", type: "uint256" },
      { name: "stakeDeposit", type: "uint256" },
      { name: "stakeWithdrawal", type: "uint256" },
      { name: "slashed", type: "uint256" }
    ]
  },
  {
    name: "epochZeroMinDuration",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "finalized",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "getActivatorForSeed",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_randomSeed", type: "bytes32" },
      { name: "_txCreatedTimestamp", type: "uint256" }
    ],
    outputs: [{ name: "", type: "address" }]
  },
  {
    name: "getAllBannedValidators",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_startIndex", type: "uint256" },
      { name: "_size", type: "uint256" }
    ],
    outputs: [
      {
        name: "validatorList",
        type: "tuple[]",
        components: [
          { name: "validator", type: "address" },
          { name: "untilEpochBanned", type: "uint256" },
          { name: "permanentlyBanned", type: "bool" }
        ]
      }
    ]
  },
  {
    name: "getAllBannedValidatorsForEpoch",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_epoch", type: "uint256" },
      { name: "_startIndex", type: "uint256" },
      { name: "_size", type: "uint256" }
    ],
    outputs: [
      {
        name: "validatorList",
        type: "tuple[]",
        components: [
          { name: "validator", type: "address" },
          { name: "untilEpochBanned", type: "uint256" },
          { name: "permanentlyBanned", type: "bool" }
        ]
      }
    ]
  },
  {
    name: "getAllQuarantinedValidators",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_startIndex", type: "uint256" },
      { name: "_size", type: "uint256" }
    ],
    outputs: [
      {
        name: "validatorList",
        type: "tuple[]",
        components: [
          { name: "validator", type: "address" },
          { name: "untilEpochBanned", type: "uint256" },
          { name: "permanentlyBanned", type: "bool" }
        ]
      }
    ]
  },
  {
    name: "getAllQuarantinedValidatorsForEpoch",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_epoch", type: "uint256" },
      { name: "_startIndex", type: "uint256" },
      { name: "_size", type: "uint256" }
    ],
    outputs: [
      {
        name: "validatorList",
        type: "tuple[]",
        components: [
          { name: "validator", type: "address" },
          { name: "untilEpochBanned", type: "uint256" },
          { name: "permanentlyBanned", type: "bool" }
        ]
      }
    ]
  },
  {
    name: "getPendingDelegatorDeposits",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_delegator", type: "address" },
      { name: "_validator", type: "address" }
    ],
    outputs: [{ name: "total", type: "uint256" }]
  },
  {
    name: "getPendingDelegatorWithdrawals",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_delegator", type: "address" },
      { name: "_validator", type: "address" }
    ],
    outputs: [{ name: "total", type: "uint256" }]
  },
  {
    name: "getPendingValidatorDeposits",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [{ name: "total", type: "uint256" }]
  },
  {
    name: "getPendingValidatorWithdrawals",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [{ name: "total", type: "uint256" }]
  },
  {
    name: "getValidatorDelegators",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    name: "getValidatorDelegatorsPaginated",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_validator", type: "address" },
      { name: "_startIndex", type: "uint256" },
      { name: "_pageSize", type: "uint256" }
    ],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    name: "getValidatorQuarantineList",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    name: "getValidatorsJoined",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_startIndex", type: "uint256" },
      { name: "_pageSize", type: "uint256" }
    ],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    name: "idlenessBan",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_validator", type: "address" },
      { name: "_at", type: "uint256" },
      { name: "_until", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "idlenessBanBatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_validators", type: "address[]" },
      { name: "_quarantinedAt", type: "uint256" },
      { name: "_quarantinedUntil", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "inflationEpoch",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "inflationInit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_inflationOnset", type: "uint256" }],
    outputs: []
  },
  {
    name: "inflationReceive",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "_epoch", type: "uint256" }],
    outputs: []
  },
  {
    name: "isDelegatorOfValidator",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_validator", type: "address" },
      { name: "_delegator", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "isValidator",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "isValidatorBanned",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "setDeepthought",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_deepthought", type: "address" }],
    outputs: []
  },
  {
    name: "setDelegatorMinimumStake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_delegatorMinStake", type: "uint256" }],
    outputs: []
  },
  {
    name: "setEpochMinDuration",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_epochMinDuration", type: "uint256" }],
    outputs: []
  },
  {
    name: "setEpochMinDurationThreshold",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_epochMinDurationThreshold", type: "uint256" }],
    outputs: []
  },
  {
    name: "setEpochZeroMinDuration",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_epochZeroMinDuration", type: "uint256" }],
    outputs: []
  },
  {
    name: "setFinalizationPhase",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_finalizationPhase", type: "address" }],
    outputs: []
  },
  {
    name: "setGen",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_gen", type: "address" }],
    outputs: []
  },
  {
    name: "setIdlenessPhase",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_idlenessPhase", type: "address" }],
    outputs: []
  },
  {
    name: "setMaxValidators",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_maxValidators", type: "uint256" }],
    outputs: []
  },
  {
    name: "setReductionFactor",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_reductionFactor", type: "uint256" }],
    outputs: []
  },
  {
    name: "setRevealingPhase",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_revealingPhase", type: "address" }],
    outputs: []
  },
  {
    name: "setStakingInvariant",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_stakingInvariant", type: "address" }],
    outputs: []
  },
  {
    name: "setTransactionFeesManager",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_transactionFeesManager", type: "address" }],
    outputs: []
  },
  {
    name: "setUnbondingPeriods",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_delegatorUnbondingPeriod", type: "uint256" },
      { name: "_validatorUnbondingPeriod", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "setValidatorMinimumStake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_validatorMinStake", type: "uint256" }],
    outputs: []
  },
  {
    name: "setValidatorWeightParams",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_alpha", type: "uint256" },
      { name: "_beta", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "sharesOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_delegator", type: "address" },
      { name: "_validator", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "stakeOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_delegator", type: "address" },
      { name: "_validator", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "validatorBanDeterministic",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: []
  },
  {
    name: "validatorClaim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "validatorDelegatorCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "validatorDeposit",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_validator", type: "address" },
      { name: "_index", type: "uint256" }
    ],
    outputs: [
      { name: "epoch_", type: "uint256" },
      {
        name: "commit_",
        type: "tuple",
        components: [
          { name: "input", type: "uint256" },
          { name: "output", type: "uint256" },
          { name: "epoch", type: "uint256" },
          { name: "linkToNextCommit", type: "uint256" }
        ]
      }
    ]
  },
  {
    name: "validatorDeposit",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: []
  },
  {
    name: "validatorDepositByEpoch",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_validator", type: "address" },
      { name: "_epoch", type: "uint256" }
    ],
    outputs: [
      {
        name: "commit_",
        type: "tuple",
        components: [
          { name: "input", type: "uint256" },
          { name: "output", type: "uint256" },
          { name: "epoch", type: "uint256" },
          { name: "linkToNextCommit", type: "uint256" }
        ]
      }
    ]
  },
  {
    name: "validatorDepositLen",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "validatorExit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_amount", type: "uint256" }],
    outputs: []
  },
  {
    name: "validatorJoin",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "_operator", type: "address" }],
    outputs: [{ name: "", type: "address" }]
  },
  {
    name: "validatorJoin",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  },
  {
    name: "validatorPrime",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: []
  },
  {
    name: "validatorQuarantine",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_validator", type: "address" },
      { name: "_at", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "validatorQuarantineCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "validatorQuarantineRepeal",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: []
  },
  {
    name: "validatorSelection",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_seed", type: "bytes32" },
      { name: "_slot", type: "uint256" },
      { name: "_epoch", type: "uint256" },
      { name: "_txCreatedTimestamp", type: "uint256" },
      { name: "_number", type: "uint256" },
      { name: "_weighted", type: "bool" },
      { name: "_consumed", type: "address[]" }
    ],
    outputs: [
      { name: "leader_", type: "uint256" },
      { name: "validators_", type: "address[]" },
      { name: "penalized_", type: "address[]" }
    ]
  },
  {
    name: "validatorSelection",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_seed", type: "bytes32" },
      { name: "_slot", type: "uint256" },
      { name: "_txCreatedTimestamp", type: "uint256" },
      { name: "_number", type: "uint256" },
      { name: "_weighted", type: "bool" },
      { name: "_consumed", type: "address[]" }
    ],
    outputs: [
      { name: "leader_", type: "uint256" },
      { name: "validators_", type: "address[]" },
      { name: "penalized_", type: "address[]" }
    ]
  },
  {
    name: "validatorView",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "left", type: "address" },
          { name: "right", type: "address" },
          { name: "parent", type: "address" },
          { name: "eBanned", type: "uint256" },
          { name: "ePrimed", type: "uint256" },
          { name: "vStake", type: "uint256" },
          { name: "vShares", type: "uint256" },
          { name: "dStake", type: "uint256" },
          { name: "dShares", type: "uint256" },
          { name: "vDeposit", type: "uint256" },
          { name: "vWithdrawal", type: "uint256" },
          { name: "live", type: "bool" }
        ]
      }
    ]
  },
  {
    name: "validatorViewPrePrimed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "left", type: "address" },
          { name: "right", type: "address" },
          { name: "parent", type: "address" },
          { name: "eBanned", type: "uint256" },
          { name: "ePrimed", type: "uint256" },
          { name: "vStake", type: "uint256" },
          { name: "vShares", type: "uint256" },
          { name: "dStake", type: "uint256" },
          { name: "dShares", type: "uint256" },
          { name: "vDeposit", type: "uint256" },
          { name: "vWithdrawal", type: "uint256" },
          { name: "live", type: "bool" }
        ]
      }
    ]
  },
  {
    name: "validatorViewPrimed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "left", type: "address" },
          { name: "right", type: "address" },
          { name: "parent", type: "address" },
          { name: "eBanned", type: "uint256" },
          { name: "ePrimed", type: "uint256" },
          { name: "vStake", type: "uint256" },
          { name: "vShares", type: "uint256" },
          { name: "dStake", type: "uint256" },
          { name: "dShares", type: "uint256" },
          { name: "vDeposit", type: "uint256" },
          { name: "vWithdrawal", type: "uint256" },
          { name: "live", type: "bool" }
        ]
      }
    ]
  },
  {
    name: "validatorWithdrawal",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_validator", type: "address" },
      { name: "_index", type: "uint256" }
    ],
    outputs: [
      { name: "epoch_", type: "uint256" },
      {
        name: "commit_",
        type: "tuple",
        components: [
          { name: "input", type: "uint256" },
          { name: "output", type: "uint256" },
          { name: "epoch", type: "uint256" },
          { name: "linkToNextCommit", type: "uint256" }
        ]
      }
    ]
  },
  {
    name: "validatorWithdrawalByEpoch",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_validator", type: "address" },
      { name: "_epoch", type: "uint256" }
    ],
    outputs: [
      {
        name: "commit_",
        type: "tuple",
        components: [
          { name: "input", type: "uint256" },
          { name: "output", type: "uint256" },
          { name: "epoch", type: "uint256" },
          { name: "linkToNextCommit", type: "uint256" }
        ]
      }
    ]
  },
  {
    name: "validatorWithdrawalLen",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_validator", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "validatorMinStake",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "delegatorMinStake",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "validatorsCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "validatorsJoinedCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "validatorsRoot",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  }
];
var TESTNET_JSON_RPC_URL = "https://rpc-asimov.genlayer.com";
var STAKING_CONTRACT = {
  address: "0x63Fa5E0bb10fb6fA98F44726C5518223F767687A",
  abi: STAKING_ABI
};
var FEE_MANAGER_CONTRACT = {
  address: "0x21737AA4bea8FF12E202BF1BAB23751A95617533",
  abi: [
    {
      type: "function",
      name: "calculateMinAppealBond",
      stateMutability: "view",
      inputs: [
        { name: "_txId", type: "bytes32" },
        { name: "_round", type: "uint256" },
        { name: "_status", type: "uint8" }
      ],
      outputs: [
        { name: "totalFeesToPay", type: "uint256" }
      ]
    }
  ]
};
var ROUNDS_STORAGE_CONTRACT = {
  address: "0x1F595c0D549DE0812F127508ea1039636CFA62Cc",
  abi: [
    {
      type: "function",
      name: "getLastRoundData",
      stateMutability: "view",
      inputs: [
        { name: "txId", type: "bytes32" }
      ],
      outputs: [
        { name: "round", type: "uint256" },
        {
          name: "roundData",
          type: "tuple",
          components: [
            { name: "round", type: "uint256" },
            { name: "leaderIndex", type: "uint256" },
            { name: "votesCommitted", type: "uint256" },
            { name: "votesRevealed", type: "uint256" },
            { name: "appealBond", type: "uint256" },
            { name: "rotationsLeft", type: "uint256" },
            { name: "result", type: "uint8" },
            { name: "roundValidators", type: "address[]" },
            { name: "validatorVotes", type: "uint8[]" },
            { name: "validatorVotesHash", type: "bytes32[]" },
            { name: "validatorResultHash", type: "bytes32[]" }
          ]
        }
      ]
    },
    {
      type: "function",
      name: "getRoundData",
      stateMutability: "view",
      inputs: [
        { name: "txId", type: "bytes32" },
        { name: "round", type: "uint256" }
      ],
      outputs: [
        {
          name: "",
          type: "tuple",
          components: [
            { name: "round", type: "uint256" },
            { name: "leaderIndex", type: "uint256" },
            { name: "votesCommitted", type: "uint256" },
            { name: "votesRevealed", type: "uint256" },
            { name: "appealBond", type: "uint256" },
            { name: "rotationsLeft", type: "uint256" },
            { name: "result", type: "uint8" },
            { name: "roundValidators", type: "address[]" },
            { name: "validatorVotes", type: "uint8[]" },
            { name: "validatorVotesHash", type: "bytes32[]" },
            { name: "validatorResultHash", type: "bytes32[]" }
          ]
        }
      ]
    },
    {
      type: "function",
      name: "getRoundNumber",
      stateMutability: "view",
      inputs: [
        { name: "txId", type: "bytes32" }
      ],
      outputs: [
        { name: "", type: "uint256" }
      ]
    }
  ]
};
var APPEALS_CONTRACT = {
  address: "0x0F739Dd8f5322b9547c7d19a9621BC2ac8DF4089",
  abi: [
    {
      type: "function",
      name: "canAppeal",
      stateMutability: "view",
      inputs: [
        { name: "_txId", type: "bytes32" }
      ],
      outputs: [
        { name: "", type: "bool" }
      ]
    }
  ]
};
var EXPLORER_URL2 = "https://explorer-asimov.genlayer.com/";
var CONSENSUS_MAIN_CONTRACT3 = {
  address: "0x6CAFF6769d70824745AD895663409DC70aB5B28E",
  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "CallerNotMessages",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidDeploymentWithSalt",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidRevealLeaderData",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidVote",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotInitializing",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransactionNotFinalized",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Unauthorized",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "oldActivator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newActivator",
          "type": "address"
        }
      ],
      "name": "ActivatorReplaced",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "addressManager",
          "type": "address"
        }
      ],
      "name": "AddressManagerSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "enum ITransactions.TransactionStatus",
          "name": "newStatus",
          "type": "uint8"
        }
      ],
      "name": "AllVotesCommitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "appellant",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "bond",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address[]",
          "name": "validators",
          "type": "address[]"
        }
      ],
      "name": "AppealStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "attempted",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "succeeded",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "failed",
          "type": "uint256"
        }
      ],
      "name": "BatchFinalizationCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "txSlot",
          "type": "uint256"
        }
      ],
      "name": "CreatedTransaction",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "activator",
          "type": "address"
        }
      ],
      "name": "InternalMessageProcessed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "oldLeader",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newLeader",
          "type": "address"
        }
      ],
      "name": "LeaderIdlenessProcessed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "activator",
          "type": "address"
        }
      ],
      "name": "NewTransaction",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "ProcessIdlenessAccepted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionAccepted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "leader",
          "type": "address"
        }
      ],
      "name": "TransactionActivated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "cancelledBy",
          "type": "address"
        }
      ],
      "name": "TransactionCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionFinalizationFailed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionFinalized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionLeaderRevealed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newLeader",
          "type": "address"
        }
      ],
      "name": "TransactionLeaderRotated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionLeaderTimeout",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes32[]",
          "name": "txIds",
          "type": "bytes32[]"
        }
      ],
      "name": "TransactionNeedsRecomputation",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address[]",
          "name": "validators",
          "type": "address[]"
        }
      ],
      "name": "TransactionReceiptProposed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionUndetermined",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalUnissuedValue",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "unissuedCount",
          "type": "uint256"
        }
      ],
      "name": "UnissuedMessagesAtFinalization",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "oldValidator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newValidator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "validatorIndex",
          "type": "uint256"
        }
      ],
      "name": "ValidatorReplaced",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "ValueWithdrawalFailed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "validator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isLastVote",
          "type": "bool"
        }
      ],
      "name": "VoteCommitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "validator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum ITransactions.VoteType",
          "name": "voteType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isLastVote",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "enum ITransactions.ResultType",
          "name": "result",
          "type": "uint8"
        }
      ],
      "name": "VoteRevealed",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "EVENTS_BATCH_SIZE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "VERSION",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "acceptOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "_operator",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_vrfProof",
          "type": "bytes"
        }
      ],
      "name": "activateTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_numOfInitialValidators",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_maxRotations",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_calldata",
          "type": "bytes"
        },
        {
          "internalType": "uint256",
          "name": "_validUntil",
          "type": "uint256"
        }
      ],
      "name": "addTransaction",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "addressManager",
      "outputs": [
        {
          "internalType": "contract IAddressManager",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "cancelTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "_commitHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_validatorIndex",
          "type": "uint256"
        }
      ],
      "name": "commitVote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_numOfInitialValidators",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_maxRotations",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_calldata",
          "type": "bytes"
        },
        {
          "internalType": "uint256",
          "name": "_saltNonce",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_validUntil",
          "type": "uint256"
        }
      ],
      "name": "deploySalted",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "executeMessage",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32[]",
          "name": "_txIds",
          "type": "bytes32[]"
        }
      ],
      "name": "finalizeIdlenessTxs",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "finalizeTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "flushExternalMessages",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAddressManager",
      "outputs": [
        {
          "internalType": "contract IAddressManager",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "getPendingTransactionValue",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_addressManager",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "addr",
          "type": "address"
        }
      ],
      "name": "isGhostContract",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "leaderIdleness",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "saltAsAValidator",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "messagesAndOtherFieldsHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "otherExecutionFieldsHash",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.VoteType",
              "name": "resultValue",
              "type": "uint8"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            }
          ],
          "internalType": "struct IConsensusMain.LeaderRevealVoteParams",
          "name": "leaderRevealVoteParams",
          "type": "tuple"
        }
      ],
      "name": "leaderRevealVote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pendingOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "processIdleness",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "affectedRecipients",
          "type": "address[]"
        }
      ],
      "name": "promoteNextPendingTransactions",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "_txExecutionHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_processingBlock",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_operator",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_eqBlocksOutputs",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "_vrfProof",
          "type": "bytes"
        }
      ],
      "name": "proposeReceipt",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32[]",
          "name": "_txIds",
          "type": "bytes32[]"
        }
      ],
      "name": "redButtonFinalize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "ghost",
          "type": "address"
        }
      ],
      "name": "registerGhostContract",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "_voteHash",
          "type": "bytes32"
        },
        {
          "internalType": "enum ITransactions.VoteType",
          "name": "_voteType",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "_otherExecutionFieldsHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_nonce",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_validatorIndex",
          "type": "uint256"
        }
      ],
      "name": "revealVote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_addressManager",
          "type": "address"
        }
      ],
      "name": "setAddressManager",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "submitAppeal",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ],
  bytecode: ""
};
var CONSENSUS_DATA_CONTRACT3 = {
  address: "0x0D9d1d74d72Fa5eB94bcf746C8FCcb312a722c9B",
  abi: [
    {
      "inputs": [],
      "name": "AccessControlBadConfirmation",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "neededRole",
          "type": "bytes32"
        }
      ],
      "name": "AccessControlUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotInitializing",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousAdminRole",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newAdminRole",
          "type": "bytes32"
        }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleRevoked",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "acceptOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "addressManager",
      "outputs": [
        {
          "internalType": "contract IAddressManager",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_currentTimestamp",
          "type": "uint256"
        }
      ],
      "name": "canFinalize",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "getLatestAcceptedTransaction",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "currentTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "createdTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastVoteTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IQueues.QueueType",
              "name": "queueType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "queuePosition",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "lastLeader",
              "type": "address"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange",
              "name": "readStateBlockRange",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "numOfRounds",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "round",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "leaderIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesCommitted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesRevealed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "appealBond",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "rotationsLeft",
                  "type": "uint256"
                },
                {
                  "internalType": "enum ITransactions.ResultType",
                  "name": "result",
                  "type": "uint8"
                },
                {
                  "internalType": "address[]",
                  "name": "roundValidators",
                  "type": "address[]"
                },
                {
                  "internalType": "enum ITransactions.VoteType[]",
                  "name": "validatorVotes",
                  "type": "uint8[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorVotesHash",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorResultHash",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct ITransactions.RoundData",
              "name": "lastRound",
              "type": "tuple"
            },
            {
              "internalType": "address[]",
              "name": "consumedValidators",
              "type": "address[]"
            }
          ],
          "internalType": "struct ConsensusData.TransactionData",
          "name": "inputData",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "startIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pageSize",
          "type": "uint256"
        }
      ],
      "name": "getLatestAcceptedTransactions",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "currentTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "createdTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastVoteTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IQueues.QueueType",
              "name": "queueType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "queuePosition",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "lastLeader",
              "type": "address"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange",
              "name": "readStateBlockRange",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "numOfRounds",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "round",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "leaderIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesCommitted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesRevealed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "appealBond",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "rotationsLeft",
                  "type": "uint256"
                },
                {
                  "internalType": "enum ITransactions.ResultType",
                  "name": "result",
                  "type": "uint8"
                },
                {
                  "internalType": "address[]",
                  "name": "roundValidators",
                  "type": "address[]"
                },
                {
                  "internalType": "enum ITransactions.VoteType[]",
                  "name": "validatorVotes",
                  "type": "uint8[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorVotesHash",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorResultHash",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct ITransactions.RoundData",
              "name": "lastRound",
              "type": "tuple"
            },
            {
              "internalType": "address[]",
              "name": "consumedValidators",
              "type": "address[]"
            }
          ],
          "internalType": "struct ConsensusData.TransactionData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "getLatestAcceptedTxCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "getLatestFinalizedTransaction",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "currentTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "createdTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastVoteTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IQueues.QueueType",
              "name": "queueType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "queuePosition",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "lastLeader",
              "type": "address"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange",
              "name": "readStateBlockRange",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "numOfRounds",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "round",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "leaderIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesCommitted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesRevealed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "appealBond",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "rotationsLeft",
                  "type": "uint256"
                },
                {
                  "internalType": "enum ITransactions.ResultType",
                  "name": "result",
                  "type": "uint8"
                },
                {
                  "internalType": "address[]",
                  "name": "roundValidators",
                  "type": "address[]"
                },
                {
                  "internalType": "enum ITransactions.VoteType[]",
                  "name": "validatorVotes",
                  "type": "uint8[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorVotesHash",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorResultHash",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct ITransactions.RoundData",
              "name": "lastRound",
              "type": "tuple"
            },
            {
              "internalType": "address[]",
              "name": "consumedValidators",
              "type": "address[]"
            }
          ],
          "internalType": "struct ConsensusData.TransactionData",
          "name": "inputData",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "startIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pageSize",
          "type": "uint256"
        }
      ],
      "name": "getLatestFinalizedTransactions",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "currentTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "createdTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastVoteTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IQueues.QueueType",
              "name": "queueType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "queuePosition",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "lastLeader",
              "type": "address"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange",
              "name": "readStateBlockRange",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "numOfRounds",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "round",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "leaderIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesCommitted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesRevealed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "appealBond",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "rotationsLeft",
                  "type": "uint256"
                },
                {
                  "internalType": "enum ITransactions.ResultType",
                  "name": "result",
                  "type": "uint8"
                },
                {
                  "internalType": "address[]",
                  "name": "roundValidators",
                  "type": "address[]"
                },
                {
                  "internalType": "enum ITransactions.VoteType[]",
                  "name": "validatorVotes",
                  "type": "uint8[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorVotesHash",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorResultHash",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct ITransactions.RoundData",
              "name": "lastRound",
              "type": "tuple"
            },
            {
              "internalType": "address[]",
              "name": "consumedValidators",
              "type": "address[]"
            }
          ],
          "internalType": "struct ConsensusData.TransactionData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "getLatestFinalizedTxCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleAdmin",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "getTransactionAllData",
      "outputs": [
        {
          "components": [
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "enum ITransactions.VoteType",
              "name": "txExecutionResult",
              "type": "uint8"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "previousStatus",
              "type": "uint8"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "txOrigin",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "numOfInitialValidators",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "epoch",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "id",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "resultHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange[]",
              "name": "readStateBlockRanges",
              "type": "tuple[]"
            },
            {
              "internalType": "uint256",
              "name": "validUntil",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lockedStorageUnitPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "storageFeeUsed",
              "type": "uint256"
            }
          ],
          "internalType": "struct ITransactions.Transaction",
          "name": "transaction",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "round",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "leaderIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votesCommitted",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votesRevealed",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "appealBond",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "rotationsLeft",
              "type": "uint256"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "address[]",
              "name": "roundValidators",
              "type": "address[]"
            },
            {
              "internalType": "enum ITransactions.VoteType[]",
              "name": "validatorVotes",
              "type": "uint8[]"
            },
            {
              "internalType": "bytes32[]",
              "name": "validatorVotesHash",
              "type": "bytes32[]"
            },
            {
              "internalType": "bytes32[]",
              "name": "validatorResultHash",
              "type": "bytes32[]"
            }
          ],
          "internalType": "struct ITransactions.RoundData[]",
          "name": "roundsData",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_timestamp",
          "type": "uint256"
        }
      ],
      "name": "getTransactionData",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "currentTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "createdTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastVoteTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IQueues.QueueType",
              "name": "queueType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "queuePosition",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "lastLeader",
              "type": "address"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange",
              "name": "readStateBlockRange",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "numOfRounds",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "round",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "leaderIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesCommitted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesRevealed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "appealBond",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "rotationsLeft",
                  "type": "uint256"
                },
                {
                  "internalType": "enum ITransactions.ResultType",
                  "name": "result",
                  "type": "uint8"
                },
                {
                  "internalType": "address[]",
                  "name": "roundValidators",
                  "type": "address[]"
                },
                {
                  "internalType": "enum ITransactions.VoteType[]",
                  "name": "validatorVotes",
                  "type": "uint8[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorVotesHash",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorResultHash",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct ITransactions.RoundData",
              "name": "lastRound",
              "type": "tuple"
            },
            {
              "internalType": "address[]",
              "name": "consumedValidators",
              "type": "address[]"
            }
          ],
          "internalType": "struct ConsensusData.TransactionData",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_timestamp",
          "type": "uint256"
        }
      ],
      "name": "getTransactionStatus",
      "outputs": [
        {
          "internalType": "enum ITransactions.TransactionStatus",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "getValidatorsForLastRound",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "validators",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_addressManager",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pendingOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "callerConfirmation",
          "type": "address"
        }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_addressManager",
          "type": "address"
        }
      ],
      "name": "setAddressManager",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  bytecode: ""
};
var testnetAsimov = defineChain({
  id: 4221,
  isStudio: false,
  name: "Genlayer Asimov Testnet",
  rpcUrls: {
    default: {
      http: [TESTNET_JSON_RPC_URL]
    }
  },
  nativeCurrency: {
    name: "GEN Token",
    symbol: "GEN",
    decimals: 18
  },
  blockExplorers: {
    default: {
      name: "GenLayer Asimov Explorer",
      url: EXPLORER_URL2
    }
  },
  testnet: true,
  consensusMainContract: CONSENSUS_MAIN_CONTRACT3,
  consensusDataContract: CONSENSUS_DATA_CONTRACT3,
  stakingContract: STAKING_CONTRACT,
  feeManagerContract: FEE_MANAGER_CONTRACT,
  roundsStorageContract: ROUNDS_STORAGE_CONTRACT,
  appealsContract: APPEALS_CONTRACT,
  defaultNumberOfInitialValidators: 5,
  defaultConsensusMaxRotations: 3
});
var TESTNET_JSON_RPC_URL2 = "https://rpc-bradbury.genlayer.com";
var STAKING_CONTRACT2 = {
  address: "0x4A4449E617F8D10FDeD0b461CadEf83939E821A5",
  abi: STAKING_ABI
};
var FEE_MANAGER_CONTRACT2 = {
  address: "0xF205868bf5db79d2162843742D18D0900A9E462a",
  abi: [
    {
      type: "function",
      name: "calculateMinAppealBond",
      stateMutability: "view",
      inputs: [
        { name: "_txId", type: "bytes32" },
        { name: "_round", type: "uint256" },
        { name: "_status", type: "uint8" }
      ],
      outputs: [
        { name: "totalFeesToPay", type: "uint256" }
      ]
    }
  ]
};
var ROUNDS_STORAGE_CONTRACT2 = {
  address: "0x7134D05af13A14c0b66Fe129fb930b1d0C420e33",
  abi: [
    {
      type: "function",
      name: "getLastRoundData",
      stateMutability: "view",
      inputs: [
        { name: "txId", type: "bytes32" }
      ],
      outputs: [
        { name: "round", type: "uint256" },
        {
          name: "roundData",
          type: "tuple",
          components: [
            { name: "round", type: "uint256" },
            { name: "leaderIndex", type: "uint256" },
            { name: "votesCommitted", type: "uint256" },
            { name: "votesRevealed", type: "uint256" },
            { name: "appealBond", type: "uint256" },
            { name: "rotationsLeft", type: "uint256" },
            { name: "result", type: "uint8" },
            { name: "roundValidators", type: "address[]" },
            { name: "validatorVotes", type: "uint8[]" },
            { name: "validatorVotesHash", type: "bytes32[]" },
            { name: "validatorResultHash", type: "bytes32[]" }
          ]
        }
      ]
    },
    {
      type: "function",
      name: "getRoundData",
      stateMutability: "view",
      inputs: [
        { name: "txId", type: "bytes32" },
        { name: "round", type: "uint256" }
      ],
      outputs: [
        {
          name: "",
          type: "tuple",
          components: [
            { name: "round", type: "uint256" },
            { name: "leaderIndex", type: "uint256" },
            { name: "votesCommitted", type: "uint256" },
            { name: "votesRevealed", type: "uint256" },
            { name: "appealBond", type: "uint256" },
            { name: "rotationsLeft", type: "uint256" },
            { name: "result", type: "uint8" },
            { name: "roundValidators", type: "address[]" },
            { name: "validatorVotes", type: "uint8[]" },
            { name: "validatorVotesHash", type: "bytes32[]" },
            { name: "validatorResultHash", type: "bytes32[]" }
          ]
        }
      ]
    },
    {
      type: "function",
      name: "getRoundNumber",
      stateMutability: "view",
      inputs: [
        { name: "txId", type: "bytes32" }
      ],
      outputs: [
        { name: "", type: "uint256" }
      ]
    }
  ]
};
var APPEALS_CONTRACT2 = {
  address: "0xbb8C35AA878D09b9830aFF9e5aAC6492BFbd5471",
  abi: [
    {
      type: "function",
      name: "canAppeal",
      stateMutability: "view",
      inputs: [
        { name: "_txId", type: "bytes32" }
      ],
      outputs: [
        { name: "", type: "bool" }
      ]
    }
  ]
};
var EXPLORER_URL3 = "https://explorer-bradbury.genlayer.com/";
var CONSENSUS_MAIN_CONTRACT4 = {
  address: "0x0112Bf6e83497965A5fdD6Dad1E447a6E004271D",
  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "CallerNotMessages",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidDeploymentWithSalt",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidRevealLeaderData",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidVote",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotInitializing",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransactionNotFinalized",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Unauthorized",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "oldActivator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newActivator",
          "type": "address"
        }
      ],
      "name": "ActivatorReplaced",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "addressManager",
          "type": "address"
        }
      ],
      "name": "AddressManagerSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "enum ITransactions.TransactionStatus",
          "name": "newStatus",
          "type": "uint8"
        }
      ],
      "name": "AllVotesCommitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "appellant",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "bond",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address[]",
          "name": "validators",
          "type": "address[]"
        }
      ],
      "name": "AppealStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "attempted",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "succeeded",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "failed",
          "type": "uint256"
        }
      ],
      "name": "BatchFinalizationCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "txSlot",
          "type": "uint256"
        }
      ],
      "name": "CreatedTransaction",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "activator",
          "type": "address"
        }
      ],
      "name": "InternalMessageProcessed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "oldLeader",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newLeader",
          "type": "address"
        }
      ],
      "name": "LeaderIdlenessProcessed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "activator",
          "type": "address"
        }
      ],
      "name": "NewTransaction",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "ProcessIdlenessAccepted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionAccepted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "leader",
          "type": "address"
        }
      ],
      "name": "TransactionActivated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "cancelledBy",
          "type": "address"
        }
      ],
      "name": "TransactionCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionFinalizationFailed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionFinalized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionLeaderRevealed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newLeader",
          "type": "address"
        }
      ],
      "name": "TransactionLeaderRotated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionLeaderTimeout",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes32[]",
          "name": "txIds",
          "type": "bytes32[]"
        }
      ],
      "name": "TransactionNeedsRecomputation",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address[]",
          "name": "validators",
          "type": "address[]"
        }
      ],
      "name": "TransactionReceiptProposed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "TransactionUndetermined",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalUnissuedValue",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "unissuedCount",
          "type": "uint256"
        }
      ],
      "name": "UnissuedMessagesAtFinalization",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "oldValidator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newValidator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "validatorIndex",
          "type": "uint256"
        }
      ],
      "name": "ValidatorReplaced",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "ValueWithdrawalFailed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "validator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isLastVote",
          "type": "bool"
        }
      ],
      "name": "VoteCommitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "validator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum ITransactions.VoteType",
          "name": "voteType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isLastVote",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "enum ITransactions.ResultType",
          "name": "result",
          "type": "uint8"
        }
      ],
      "name": "VoteRevealed",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "EVENTS_BATCH_SIZE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "VERSION",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "acceptOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "_operator",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_vrfProof",
          "type": "bytes"
        }
      ],
      "name": "activateTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_numOfInitialValidators",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_maxRotations",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_calldata",
          "type": "bytes"
        },
        {
          "internalType": "uint256",
          "name": "_validUntil",
          "type": "uint256"
        }
      ],
      "name": "addTransaction",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "addressManager",
      "outputs": [
        {
          "internalType": "contract IAddressManager",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "cancelTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "_commitHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_validatorIndex",
          "type": "uint256"
        }
      ],
      "name": "commitVote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_numOfInitialValidators",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_maxRotations",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_calldata",
          "type": "bytes"
        },
        {
          "internalType": "uint256",
          "name": "_saltNonce",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_validUntil",
          "type": "uint256"
        }
      ],
      "name": "deploySalted",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "executeMessage",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32[]",
          "name": "_txIds",
          "type": "bytes32[]"
        }
      ],
      "name": "finalizeIdlenessTxs",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "finalizeTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "flushExternalMessages",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAddressManager",
      "outputs": [
        {
          "internalType": "contract IAddressManager",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        }
      ],
      "name": "getPendingTransactionValue",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_addressManager",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "addr",
          "type": "address"
        }
      ],
      "name": "isGhostContract",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "leaderIdleness",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "saltAsAValidator",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "messagesAndOtherFieldsHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "otherExecutionFieldsHash",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.VoteType",
              "name": "resultValue",
              "type": "uint8"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            }
          ],
          "internalType": "struct IConsensusMain.LeaderRevealVoteParams",
          "name": "leaderRevealVoteParams",
          "type": "tuple"
        }
      ],
      "name": "leaderRevealVote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pendingOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "processIdleness",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "affectedRecipients",
          "type": "address[]"
        }
      ],
      "name": "promoteNextPendingTransactions",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "_txExecutionHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_processingBlock",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_operator",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_eqBlocksOutputs",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "_vrfProof",
          "type": "bytes"
        }
      ],
      "name": "proposeReceipt",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32[]",
          "name": "_txIds",
          "type": "bytes32[]"
        }
      ],
      "name": "redButtonFinalize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "ghost",
          "type": "address"
        }
      ],
      "name": "registerGhostContract",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "_voteHash",
          "type": "bytes32"
        },
        {
          "internalType": "enum ITransactions.VoteType",
          "name": "_voteType",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "_otherExecutionFieldsHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_nonce",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_validatorIndex",
          "type": "uint256"
        }
      ],
      "name": "revealVote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_addressManager",
          "type": "address"
        }
      ],
      "name": "setAddressManager",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "submitAppeal",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ],
  bytecode: ""
};
var CONSENSUS_DATA_CONTRACT4 = {
  address: "0x85D7bf947A512Fc640C75327A780c90847267697",
  abi: [
    {
      "inputs": [],
      "name": "AccessControlBadConfirmation",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "neededRole",
          "type": "bytes32"
        }
      ],
      "name": "AccessControlUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotInitializing",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousAdminRole",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newAdminRole",
          "type": "bytes32"
        }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleRevoked",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "acceptOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "addressManager",
      "outputs": [
        {
          "internalType": "contract IAddressManager",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_currentTimestamp",
          "type": "uint256"
        }
      ],
      "name": "canFinalize",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "getLatestAcceptedTransaction",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "currentTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "createdTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastVoteTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IQueues.QueueType",
              "name": "queueType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "queuePosition",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "lastLeader",
              "type": "address"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange",
              "name": "readStateBlockRange",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "numOfRounds",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "round",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "leaderIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesCommitted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesRevealed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "appealBond",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "rotationsLeft",
                  "type": "uint256"
                },
                {
                  "internalType": "enum ITransactions.ResultType",
                  "name": "result",
                  "type": "uint8"
                },
                {
                  "internalType": "address[]",
                  "name": "roundValidators",
                  "type": "address[]"
                },
                {
                  "internalType": "enum ITransactions.VoteType[]",
                  "name": "validatorVotes",
                  "type": "uint8[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorVotesHash",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorResultHash",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct ITransactions.RoundData",
              "name": "lastRound",
              "type": "tuple"
            },
            {
              "internalType": "address[]",
              "name": "consumedValidators",
              "type": "address[]"
            }
          ],
          "internalType": "struct ConsensusData.TransactionData",
          "name": "inputData",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "startIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pageSize",
          "type": "uint256"
        }
      ],
      "name": "getLatestAcceptedTransactions",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "currentTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "createdTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastVoteTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IQueues.QueueType",
              "name": "queueType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "queuePosition",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "lastLeader",
              "type": "address"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange",
              "name": "readStateBlockRange",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "numOfRounds",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "round",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "leaderIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesCommitted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesRevealed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "appealBond",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "rotationsLeft",
                  "type": "uint256"
                },
                {
                  "internalType": "enum ITransactions.ResultType",
                  "name": "result",
                  "type": "uint8"
                },
                {
                  "internalType": "address[]",
                  "name": "roundValidators",
                  "type": "address[]"
                },
                {
                  "internalType": "enum ITransactions.VoteType[]",
                  "name": "validatorVotes",
                  "type": "uint8[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorVotesHash",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorResultHash",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct ITransactions.RoundData",
              "name": "lastRound",
              "type": "tuple"
            },
            {
              "internalType": "address[]",
              "name": "consumedValidators",
              "type": "address[]"
            }
          ],
          "internalType": "struct ConsensusData.TransactionData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "getLatestAcceptedTxCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "getLatestFinalizedTransaction",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "currentTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "createdTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastVoteTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IQueues.QueueType",
              "name": "queueType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "queuePosition",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "lastLeader",
              "type": "address"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange",
              "name": "readStateBlockRange",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "numOfRounds",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "round",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "leaderIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesCommitted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesRevealed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "appealBond",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "rotationsLeft",
                  "type": "uint256"
                },
                {
                  "internalType": "enum ITransactions.ResultType",
                  "name": "result",
                  "type": "uint8"
                },
                {
                  "internalType": "address[]",
                  "name": "roundValidators",
                  "type": "address[]"
                },
                {
                  "internalType": "enum ITransactions.VoteType[]",
                  "name": "validatorVotes",
                  "type": "uint8[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorVotesHash",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorResultHash",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct ITransactions.RoundData",
              "name": "lastRound",
              "type": "tuple"
            },
            {
              "internalType": "address[]",
              "name": "consumedValidators",
              "type": "address[]"
            }
          ],
          "internalType": "struct ConsensusData.TransactionData",
          "name": "inputData",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "startIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pageSize",
          "type": "uint256"
        }
      ],
      "name": "getLatestFinalizedTransactions",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "currentTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "createdTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastVoteTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IQueues.QueueType",
              "name": "queueType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "queuePosition",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "lastLeader",
              "type": "address"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange",
              "name": "readStateBlockRange",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "numOfRounds",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "round",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "leaderIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesCommitted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesRevealed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "appealBond",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "rotationsLeft",
                  "type": "uint256"
                },
                {
                  "internalType": "enum ITransactions.ResultType",
                  "name": "result",
                  "type": "uint8"
                },
                {
                  "internalType": "address[]",
                  "name": "roundValidators",
                  "type": "address[]"
                },
                {
                  "internalType": "enum ITransactions.VoteType[]",
                  "name": "validatorVotes",
                  "type": "uint8[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorVotesHash",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorResultHash",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct ITransactions.RoundData",
              "name": "lastRound",
              "type": "tuple"
            },
            {
              "internalType": "address[]",
              "name": "consumedValidators",
              "type": "address[]"
            }
          ],
          "internalType": "struct ConsensusData.TransactionData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "getLatestFinalizedTxCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleAdmin",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "getTransactionAllData",
      "outputs": [
        {
          "components": [
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "enum ITransactions.VoteType",
              "name": "txExecutionResult",
              "type": "uint8"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "previousStatus",
              "type": "uint8"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "txOrigin",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "numOfInitialValidators",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "epoch",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "id",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "resultHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange[]",
              "name": "readStateBlockRanges",
              "type": "tuple[]"
            },
            {
              "internalType": "uint256",
              "name": "validUntil",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lockedStorageUnitPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "storageFeeUsed",
              "type": "uint256"
            }
          ],
          "internalType": "struct ITransactions.Transaction",
          "name": "transaction",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "round",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "leaderIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votesCommitted",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votesRevealed",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "appealBond",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "rotationsLeft",
              "type": "uint256"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "address[]",
              "name": "roundValidators",
              "type": "address[]"
            },
            {
              "internalType": "enum ITransactions.VoteType[]",
              "name": "validatorVotes",
              "type": "uint8[]"
            },
            {
              "internalType": "bytes32[]",
              "name": "validatorVotesHash",
              "type": "bytes32[]"
            },
            {
              "internalType": "bytes32[]",
              "name": "validatorResultHash",
              "type": "bytes32[]"
            }
          ],
          "internalType": "struct ITransactions.RoundData[]",
          "name": "roundsData",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_timestamp",
          "type": "uint256"
        }
      ],
      "name": "getTransactionData",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "currentTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "initialRotations",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "txSlot",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "createdTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastVoteTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "randomSeed",
              "type": "bytes32"
            },
            {
              "internalType": "enum ITransactions.ResultType",
              "name": "result",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txExecutionHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "txCalldata",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "eqBlocksOutputs",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "enum IMessages.MessageType",
                  "name": "messageType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                },
                {
                  "internalType": "bool",
                  "name": "onAcceptance",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "saltNonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IMessages.SubmittedMessage[]",
              "name": "messages",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IQueues.QueueType",
              "name": "queueType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "queuePosition",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "activator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "lastLeader",
              "type": "address"
            },
            {
              "internalType": "enum ITransactions.TransactionStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txId",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "activationBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "processingBlock",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "proposalBlock",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ITransactions.ReadStateBlockRange",
              "name": "readStateBlockRange",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "numOfRounds",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "round",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "leaderIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesCommitted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votesRevealed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "appealBond",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "rotationsLeft",
                  "type": "uint256"
                },
                {
                  "internalType": "enum ITransactions.ResultType",
                  "name": "result",
                  "type": "uint8"
                },
                {
                  "internalType": "address[]",
                  "name": "roundValidators",
                  "type": "address[]"
                },
                {
                  "internalType": "enum ITransactions.VoteType[]",
                  "name": "validatorVotes",
                  "type": "uint8[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorVotesHash",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "validatorResultHash",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct ITransactions.RoundData",
              "name": "lastRound",
              "type": "tuple"
            },
            {
              "internalType": "address[]",
              "name": "consumedValidators",
              "type": "address[]"
            }
          ],
          "internalType": "struct ConsensusData.TransactionData",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_timestamp",
          "type": "uint256"
        }
      ],
      "name": "getTransactionStatus",
      "outputs": [
        {
          "internalType": "enum ITransactions.TransactionStatus",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        }
      ],
      "name": "getValidatorsForLastRound",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "validators",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_addressManager",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pendingOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "callerConfirmation",
          "type": "address"
        }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_addressManager",
          "type": "address"
        }
      ],
      "name": "setAddressManager",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  bytecode: ""
};
var testnetBradbury = defineChain({
  id: 4221,
  isStudio: false,
  name: "Genlayer Bradbury Testnet",
  rpcUrls: {
    default: {
      http: [TESTNET_JSON_RPC_URL2]
    }
  },
  nativeCurrency: {
    name: "GEN Token",
    symbol: "GEN",
    decimals: 18
  },
  blockExplorers: {
    default: {
      name: "GenLayer Bradbury Explorer",
      url: EXPLORER_URL3
    }
  },
  testnet: true,
  consensusMainContract: CONSENSUS_MAIN_CONTRACT4,
  consensusDataContract: CONSENSUS_DATA_CONTRACT4,
  stakingContract: STAKING_CONTRACT2,
  feeManagerContract: FEE_MANAGER_CONTRACT2,
  roundsStorageContract: ROUNDS_STORAGE_CONTRACT2,
  appealsContract: APPEALS_CONTRACT2,
  defaultNumberOfInitialValidators: 5,
  defaultConsensusMaxRotations: 3
});

// node_modules/genlayer-js/dist/chunk-EY35NPSE.js
var CalldataAddress = class {
  bytes;
  constructor(addr) {
    if (addr.length != 20) {
      throw new Error(`invalid address length ${addr}`);
    }
    this.bytes = addr;
  }
};

// node_modules/viem/_esm/accounts/generatePrivateKey.js
init_secp256k1();
init_toHex();
function generatePrivateKey() {
  return toHex(secp256k1.utils.randomPrivateKey());
}

// node_modules/viem/_esm/accounts/privateKeyToAccount.js
init_secp256k1();
init_toHex();

// node_modules/viem/_esm/accounts/toAccount.js
init_address();
init_isAddress();
function toAccount(source) {
  if (typeof source === "string") {
    if (!isAddress(source, { strict: false }))
      throw new InvalidAddressError({ address: source });
    return {
      address: source,
      type: "json-rpc"
    };
  }
  if (!isAddress(source.address, { strict: false }))
    throw new InvalidAddressError({ address: source.address });
  return {
    address: source.address,
    nonceManager: source.nonceManager,
    sign: source.sign,
    signAuthorization: source.signAuthorization,
    signMessage: source.signMessage,
    signTransaction: source.signTransaction,
    signTypedData: source.signTypedData,
    source: "custom",
    type: "local"
  };
}

// node_modules/viem/_esm/accounts/utils/sign.js
init_secp256k1();
init_isHex();
init_toBytes();
init_toHex();
var extraEntropy = false;
async function sign({ hash: hash2, privateKey, to = "object" }) {
  const { r, s, recovery } = secp256k1.sign(hash2.slice(2), privateKey.slice(2), {
    lowS: true,
    extraEntropy: isHex(extraEntropy, { strict: false }) ? hexToBytes(extraEntropy) : extraEntropy
  });
  const signature = {
    r: numberToHex(r, { size: 32 }),
    s: numberToHex(s, { size: 32 }),
    v: recovery ? 28n : 27n,
    yParity: recovery
  };
  return (() => {
    if (to === "bytes" || to === "hex")
      return serializeSignature({ ...signature, to });
    return signature;
  })();
}

// node_modules/viem/_esm/accounts/utils/signAuthorization.js
async function signAuthorization(parameters) {
  const { chainId, nonce, privateKey, to = "object" } = parameters;
  const address = parameters.contractAddress ?? parameters.address;
  const signature = await sign({
    hash: hashAuthorization({ address, chainId, nonce }),
    privateKey,
    to
  });
  if (to === "object")
    return {
      address,
      chainId,
      nonce,
      ...signature
    };
  return signature;
}

// node_modules/viem/_esm/accounts/utils/signMessage.js
async function signMessage({ message, privateKey }) {
  return await sign({ hash: hashMessage(message), privateKey, to: "hex" });
}

// node_modules/viem/_esm/accounts/utils/signTransaction.js
init_keccak256();
async function signTransaction(parameters) {
  const { privateKey, transaction, serializer = serializeTransaction } = parameters;
  const signableTransaction = (() => {
    if (transaction.type === "eip4844")
      return {
        ...transaction,
        sidecars: false
      };
    return transaction;
  })();
  const signature = await sign({
    hash: keccak256(await serializer(signableTransaction)),
    privateKey
  });
  return await serializer(transaction, signature);
}

// node_modules/viem/_esm/accounts/utils/signTypedData.js
async function signTypedData(parameters) {
  const { privateKey, ...typedData } = parameters;
  return await sign({
    hash: hashTypedData(typedData),
    privateKey,
    to: "hex"
  });
}

// node_modules/viem/_esm/accounts/privateKeyToAccount.js
function privateKeyToAccount(privateKey, options = {}) {
  const { nonceManager } = options;
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false));
  const address = publicKeyToAddress(publicKey);
  const account = toAccount({
    address,
    nonceManager,
    async sign({ hash: hash2 }) {
      return sign({ hash: hash2, privateKey, to: "hex" });
    },
    async signAuthorization(authorization) {
      return signAuthorization({ ...authorization, privateKey });
    },
    async signMessage({ message }) {
      return signMessage({ message, privateKey });
    },
    async signTransaction(transaction, { serializer } = {}) {
      return signTransaction({ privateKey, transaction, serializer });
    },
    async signTypedData(typedData) {
      return signTypedData({ ...typedData, privateKey });
    }
  });
  return {
    ...account,
    publicKey,
    source: "privateKey"
  };
}

// node_modules/genlayer-js/dist/index.js
var calldata_exports = {};
__export(calldata_exports, {
  decode: () => decode,
  encode: () => encode,
  makeCalldataObject: () => makeCalldataObject,
  toString: () => toString
});
var BITS_IN_TYPE = 3;
var TYPE_SPECIAL = 0;
var TYPE_PINT = 1;
var TYPE_NINT = 2;
var TYPE_BYTES = 3;
var TYPE_STR = 4;
var TYPE_ARR = 5;
var TYPE_MAP = 6;
var SPECIAL_NULL = 0 << BITS_IN_TYPE | TYPE_SPECIAL;
var SPECIAL_FALSE = 1 << BITS_IN_TYPE | TYPE_SPECIAL;
var SPECIAL_TRUE = 2 << BITS_IN_TYPE | TYPE_SPECIAL;
var SPECIAL_ADDR = 3 << BITS_IN_TYPE | TYPE_SPECIAL;
function reportError(msg, data) {
  throw new Error(`invalid calldata input '${data}'`);
}
function writeNum(to, data) {
  if (data === 0n) {
    to.push(0);
    return;
  }
  while (data > 0) {
    let cur = Number(data & 0x7fn);
    data >>= 7n;
    if (data > 0) {
      cur |= 128;
    }
    to.push(cur);
  }
}
function encodeNumWithType(to, data, type) {
  const res = data << BigInt(BITS_IN_TYPE) | BigInt(type);
  writeNum(to, res);
}
function encodeNum(to, data) {
  if (data >= 0n) {
    encodeNumWithType(to, data, TYPE_PINT);
  } else {
    encodeNumWithType(to, -data - 1n, TYPE_NINT);
  }
}
function compareString(l, r) {
  for (let index = 0; index < l.length && index < r.length; index++) {
    const cur = l[index] - r[index];
    if (cur !== 0) {
      return cur;
    }
  }
  return l.length - r.length;
}
function encodeMap(to, arr) {
  const newEntries = Array.from(
    arr,
    ([k, v]) => [
      Array.from(k, (x) => x.codePointAt(0)),
      new TextEncoder().encode(k),
      v
    ]
  );
  newEntries.sort((v1, v2) => compareString(v1[0], v2[0]));
  for (let i = 1; i < newEntries.length; i++) {
    if (compareString(newEntries[i - 1][0], newEntries[i][0]) === 0) {
      throw new Error(`duplicate key '${new TextDecoder().decode(newEntries[i][1])}'`);
    }
  }
  encodeNumWithType(to, BigInt(newEntries.length), TYPE_MAP);
  for (const [, k, v] of newEntries) {
    writeNum(to, BigInt(k.length));
    for (const c of k) {
      to.push(c);
    }
    encodeImpl(to, v);
  }
}
function encodeImpl(to, data) {
  if (data === null || data === void 0) {
    to.push(SPECIAL_NULL);
    return;
  }
  if (data === true) {
    to.push(SPECIAL_TRUE);
    return;
  }
  if (data === false) {
    to.push(SPECIAL_FALSE);
    return;
  }
  switch (typeof data) {
    case "number": {
      if (!Number.isInteger(data)) {
        reportError("floats are not supported", data);
      }
      encodeNum(to, BigInt(data));
      return;
    }
    case "bigint": {
      encodeNum(to, data);
      return;
    }
    case "string": {
      const str = new TextEncoder().encode(data);
      encodeNumWithType(to, BigInt(str.length), TYPE_STR);
      for (const c of str) {
        to.push(c);
      }
      return;
    }
    case "object": {
      if (data instanceof Uint8Array) {
        encodeNumWithType(to, BigInt(data.length), TYPE_BYTES);
        for (const c of data) {
          to.push(c);
        }
      } else if (data instanceof Array) {
        encodeNumWithType(to, BigInt(data.length), TYPE_ARR);
        for (const c of data) {
          encodeImpl(to, c);
        }
      } else if (data instanceof Map) {
        encodeMap(to, data);
      } else if (data instanceof CalldataAddress) {
        to.push(SPECIAL_ADDR);
        for (const c of data.bytes) {
          to.push(c);
        }
      } else if (Object.getPrototypeOf(data) === Object.prototype) {
        encodeMap(to, Object.entries(data));
      } else {
        reportError("unknown object type", data);
      }
      return;
    }
    default:
      reportError("unknown base type", data);
  }
}
function encode(data) {
  const arr = [];
  encodeImpl(arr, data);
  return new Uint8Array(arr);
}
function makeCalldataObject(method, args, kwargs) {
  let ret = {};
  if (method) {
    ret["method"] = method;
  }
  if (args && args.length > 0) {
    ret["args"] = args;
  }
  if (kwargs) {
    if (kwargs instanceof Map) {
      if (kwargs.size > 0) {
        ret["kwargs"] = kwargs;
      }
    } else {
      let hasVal = false;
      for (const _k in kwargs) {
        hasVal = true;
        break;
      }
      if (hasVal) {
        ret["kwargs"] = kwargs;
      }
    }
  }
  return ret;
}
function readULeb128(data, index) {
  let res = 0n;
  let accum = 0n;
  let shouldContinue = true;
  while (shouldContinue) {
    const byte = data[index.i];
    index.i++;
    const rest = byte & 127;
    res += BigInt(rest) * (1n << accum);
    accum += 7n;
    shouldContinue = byte >= 128;
  }
  return res;
}
function decodeImpl(data, index) {
  const cur = readULeb128(data, index);
  switch (cur) {
    case BigInt(SPECIAL_NULL):
      return null;
    case BigInt(SPECIAL_TRUE):
      return true;
    case BigInt(SPECIAL_FALSE):
      return false;
    case BigInt(SPECIAL_ADDR): {
      const res = data.slice(index.i, index.i + 20);
      index.i += 20;
      return new CalldataAddress(res);
    }
  }
  const type = Number(cur & 0xffn) & (1 << BITS_IN_TYPE) - 1;
  const rest = cur >> BigInt(BITS_IN_TYPE);
  switch (type) {
    case TYPE_BYTES: {
      const ret = data.slice(index.i, index.i + Number(rest));
      index.i += Number(rest);
      return ret;
    }
    case TYPE_PINT:
      return rest;
    case TYPE_NINT:
      return -1n - rest;
    case TYPE_STR: {
      const ret = data.slice(index.i, index.i + Number(rest));
      index.i += Number(rest);
      return new TextDecoder("utf-8").decode(ret);
    }
    case TYPE_ARR: {
      const ret = [];
      let elems = rest;
      while (elems > 0) {
        elems--;
        ret.push(decodeImpl(data, index));
      }
      return ret;
    }
    case TYPE_MAP: {
      const ret = /* @__PURE__ */ new Map();
      let elems = rest;
      while (elems > 0) {
        elems--;
        const strLen = Number(readULeb128(data, index));
        const key = data.slice(index.i, index.i + strLen);
        index.i += strLen;
        const keyStr = new TextDecoder("utf-8").decode(key);
        ret.set(keyStr, decodeImpl(data, index));
      }
      return ret;
    }
    default:
      throw new Error(`can't decode type from ${type} rest is ${rest} at pos ${index.i}`);
  }
}
function decode(data) {
  const index = { i: 0 };
  const res = decodeImpl(data, index);
  if (index.i !== data.length) {
    throw new Error("some data left");
  }
  return res;
}
function reportError2(msg, data) {
  throw new Error(`invalid calldata input '${data}'`);
}
function toStringImplMap(data, to) {
  to.push("{");
  for (const [k, v] of data) {
    to.push(JSON.stringify(k));
    to.push(":");
    toStringImpl(v, to);
  }
  to.push("}");
}
function toStringImpl(data, to) {
  if (data === null || data === void 0) {
    to.push("null");
    return;
  }
  if (data === true) {
    to.push("true");
    return;
  }
  if (data === false) {
    to.push("false");
    return;
  }
  switch (typeof data) {
    case "number": {
      if (!Number.isInteger(data)) {
        reportError2("floats are not supported", data);
      }
      to.push(data.toString());
      return;
    }
    case "bigint": {
      to.push(data.toString());
      return;
    }
    case "string": {
      to.push(JSON.stringify(data));
      return;
    }
    case "object": {
      if (data instanceof Uint8Array) {
        to.push("b#");
        for (const b of data) {
          to.push(b.toString(16));
        }
      } else if (data instanceof Array) {
        to.push("[");
        for (const c of data) {
          toStringImpl(c, to);
          to.push(",");
        }
        to.push("]");
      } else if (data instanceof Map) {
        toStringImplMap(data.entries(), to);
      } else if (data instanceof CalldataAddress) {
        to.push("addr#");
        for (const c of data.bytes) {
          to.push(c.toString(16));
        }
      } else if (Object.getPrototypeOf(data) === Object.prototype) {
        toStringImplMap(Object.entries(data), to);
      } else {
        reportError2("unknown object type", data);
      }
      return;
    }
    default:
      reportError2("unknown base type", data);
  }
}
function toString(data) {
  const to = [];
  toStringImpl(data, to);
  return to.join("");
}
var transactions_exports = {};
__export(transactions_exports, {
  serialize: () => serialize,
  serializeOne: () => serializeOne
});
function serializeOne(data) {
  return toHex(data);
}
function serialize(data) {
  return toRlp(data.map(serializeOne));
}
var abi_exports = {};
__export(abi_exports, {
  STAKING_ABI: () => STAKING_ABI,
  VALIDATOR_WALLET_ABI: () => VALIDATOR_WALLET_ABI,
  calldata: () => calldata,
  transactions: () => transactions
});
var calldata = calldata_exports;
var transactions = transactions_exports;
var COMBINED_ERROR_ABI = [...STAKING_ABI, ...VALIDATOR_WALLET_ABI];
var generatePrivateKey2 = () => generatePrivateKey();
var createAccount = (accountPrivateKey) => {
  const privateKey = accountPrivateKey || generatePrivateKey2();
  const account = privateKeyToAccount(privateKey);
  return account;
};

// site/src/i18n.js
var STRINGS = {
  zh: {
    title: "SketchVerdict \xB7 \u7ED8\u753B\u731C\u8C1C\u6D3E\u5BF9",
    subtitle: "\u753B\u51FA\u79D8\u5BC6\u6982\u5FF5\uFF0C\u7B49\u522B\u4EBA\u731C\u4E2D\u2014\u2014\u5171\u8BC6\u88C1\u51B3\u753B\u4F5C\uFF0C\u786E\u5B9A\u6027\u4EE3\u7801\u5206\u8D26\u3002",
    network: "\u7F51\u7EDC",
    contract: "\u5408\u7EA6",
    live: "LIVE",
    readbackPending: "\u672A\u786E\u8BA4 \xB7 \u7B49\u5F85 FINALIZED \u8BFB\u56DE",
    readbackOk: "\u2713 \u5DF2\u8BFB\u56DE FINALIZED Studionet \u72B6\u6001",
    offlineBanner: "\u672C\u5730\u793A\u610F\u9884\u89C8\u6A21\u5F0F\uFF08\u975E\u94FE\u4E0A\u7ED3\u679C\uFF09\u2014\u2014\u5199\u94FE\u6309\u94AE\u4E0E\u6863\u6848\u5BFC\u51FA\u5DF2\u7981\u7528",
    staticMode: "\u9759\u6001\u6A21\u5F0F",
    langToggle: "EN",
    viewHuman: "Human \u89C6\u56FE",
    viewMachine: "Machine \u89C6\u56FE",
    walletTitle: "\u94B1\u5305",
    connectInjected: "\u8FDE\u63A5\u6CE8\u5165\u94B1\u5305\uFF08OKX / MetaMask / Rabby / Coinbase\uFF09",
    useTempSigner: "\u542F\u7528\u6D4F\u89C8\u5668\u4E34\u65F6\u7B7E\u540D\u5668",
    disconnect: "\u65AD\u5F00",
    noWallet: "\u672A\u68C0\u6D4B\u5230\u6CE8\u5165\u94B1\u5305",
    wrongNetwork: "\u94B1\u5305\u7F51\u7EDC\u4E0D\u662F Stable Studionet\uFF08Chain ID 61999\uFF09\uFF0C\u8BF7\u5207\u6362\u7F51\u7EDC",
    walletReadLabel: "\u5F53\u524D\u8BFB\u53D6\u8FDE\u63A5",
    walletWriteLabel: "\u5199\u94FE\u4EA4\u6613\u7B7E\u540D\u65B9\uFF1A\u6D4F\u89C8\u5668\u4E34\u65F6\u6D4B\u8BD5\u8D26\u53F7",
    walletWriteSuffix: "\u2014\u2014 \u975E\u7528\u6237\u4E3B\u94B1\u5305\u7B7E\u540D",
    walletNotCreated: "\u4E34\u65F6\u7B7E\u540D\u5668\u672A\u521B\u5EFA\uFF08\u70B9\u51FB\u201C\u542F\u7528\u6D4F\u89C8\u5668\u4E34\u65F6\u7B7E\u540D\u5668\u201D\uFF09",
    walletTempNote: "\u4E34\u65F6\u6D4B\u8BD5\u8D26\u53F7\u4EC5\u5B58\u4E8E\u5F53\u524D\u6D4F\u89C8\u5668\u4F1A\u8BDD\u5185\u5B58\uFF0C\u5173\u95ED\u9875\u9762\u5373\u9500\u6BC1\uFF0C\u7EDD\u4E0D\u843D\u76D8\u3001\u4E0D\u4E0A\u4F20\u3002",
    roundLabel: "\u8F6E\u6B21",
    stageLabel: "\u9636\u6BB5",
    stage1: "\u4F5C\u753B",
    stage2: "\u731C\u6D4B",
    stage3: "\u88C1\u51B3",
    stage4: "\u7ED3\u7B97",
    rolloverPool: "\u6EDA\u5B58\u5956\u6C60",
    currentPot: "\u672C\u8F6E\u5956\u6C60",
    roundCount: "\u8F6E\u6B21\u603B\u6570",
    unconfirmed: "\u672A\u786E\u8BA4",
    unconfirmedLong: "\u672A\u786E\u8BA4 / Unconfirmed\uFF08\u7B49\u5F85\u94FE\u4E0A FINALIZED \u8BFB\u56DE\uFF09",
    hidden: "\u672A\u63ED\u793A",
    dashUnconfirmed: "\u2014\uFF08\u672A\u786E\u8BA4\uFF09",
    pendingReadback: "\u7B49\u5F85\u8BFB\u56DE",
    consoleTitle: "\u56DE\u5408\u63A7\u5236\u53F0",
    timerTitle: "\u9636\u6BB5\u8BA1\u65F6\u5668",
    timeLeft: "\u5269\u4F59",
    deadline: "\u622A\u6B62\uFF08UTC \u5206\u949F\uFF09",
    drawingDeadline: "\u4F5C\u753B\u622A\u6B62",
    revealDeadline: "\u63ED\u793A\u622A\u6B62",
    challengeDeadline: "\u6311\u6218\u622A\u6B62",
    timeoutRescue: "\u89E6\u53D1\u8D85\u65F6\u4FDD\u62A4\u7ED3\u7B97",
    timeoutRescueHint: "\u4EC5\u5728\u622A\u6B62\u65F6\u95F4\u8FC7\u540E\u53EF\u7528\uFF1B\u4EFB\u610F\u53C2\u4E0E\u8005\u53EF\u89E6\u53D1\u3002",
    commitTitle: "\u79D8\u5BC6\u6982\u5FF5\u627F\u8BFA",
    categoryHint: "\u7C7B\u522B\u63D0\u793A",
    commitOnChain: "\u94FE\u4E0A Commit SHA-256",
    commitLocked: "\u5DF2\u9501\u5B9A",
    vaultTitle: "\u753B\u8005\u672C\u5730\u4FDD\u9669\u7BB1\uFF08\u4E0D\u51FA\u6D4F\u89C8\u5668\uFF09",
    vaultWarn: "\u6982\u5FF5\u4E0E\u76D0\u53EA\u5B58\u5728\u4F60\u7684\u6D4F\u89C8\u5668\u5185\u5B58\u91CC\u3002\u4E22\u76D0\u6216\u5173\u9875\u5C06\u65E0\u6CD5\u63ED\u793A\uFF01",
    conceptLabel: "\u79D8\u5BC6\u6982\u5FF5\uFF08\u82F1\u6587\uFF09",
    saltLabel: "\u76D0\uFF08Salt\uFF09",
    autoGenSalt: "\u81EA\u52A8\u751F\u6210\u76D0",
    startRound: "\u5F00\u5C40\u5E76\u9501\u5B9A\u6982\u5FF5",
    startStakeNote: "\u5F00\u5C40\u8D28\u62BC 10 GEN\uFF08\u753B\u8005\uFF09\u3002",
    drawDuration: "\u4F5C\u753B\u65F6\u957F\uFF08\u5206\u949F\uFF09",
    guessDuration: "\u731C\u6D4B\u65F6\u957F\uFF08\u5206\u949F\uFF09",
    canvasTitle: "\u753B\u5E03",
    canvasWarn: "\u4EC5\u9650\u56FE\u5F62\u63CF\u7ED8\u2014\u2014\u753B\u5E03\u5185\u5199\u5355\u8BCD / \u5B57\u6BCD / \u8C10\u97F3\u5C06\u89E6\u53D1 AI \u966A\u5BA1\u56E2 DRAWING_MISS \u96F6\u5206\u88C1\u51B3\u3002",
    brush: "\u753B\u7B14",
    eraser: "\u6A61\u76AE\u64E6",
    clear: "\u6E05\u7A7A",
    brushSize: "\u7C97\u7EC6",
    imageSha: "\u56FE\u7247 SHA-256",
    imageBytes: "\u56FE\u7247\u5B57\u8282",
    b64Size: "Base64 \u957F\u5EA6",
    submitDrawing: "\u9501\u5B9A\u753B\u4F5C\u54C8\u5E0C\u5E76\u8FDB\u5165\u731C\u8C1C\u9636\u6BB5",
    submitDrawingNote: "\u63D0\u4EA4 384\xD7384 PNG \u5B57\u8282\uFF08Base64\uFF09\u4E0A\u94FE\uFF0C\u54C8\u5E0C\u5373\u9501\u5B9A\u503C\u3002",
    guessTitle: "\u5B9E\u65F6\u731C\u6D4B\u6D41",
    guessPlaceholder: "\u8F93\u5165\u82F1\u6587\u6982\u5FF5\u8BCD\u2026",
    submitGuess: "\u8D28\u62BC\u5E76\u4E0A\u94FE\u731C\u6D4B\uFF085 GEN\uFF09",
    guessNote: "\u6BCF\u8F6E\u6BCF\u4EBA\u9650\u731C\u4E00\u6B21\uFF1B\u731C\u4E2D\u8005\u6309\u94FE\u4E0A\u987A\u5E8F\u53D6\u6700\u5FEB\u3002",
    guessCorrect: "\u731C\u4E2D",
    guessWrong: "\u672A\u731C\u4E2D",
    guessPending: "\u5F85\u6838\u9A8C",
    payoutTitle: "\u5956\u91D1\u699C",
    drawerPayout: "\u753B\u8005\u5206\u5F97",
    guesserPayouts: "\u731C\u8005\u5206\u5F97",
    rolloverNext: "\u6EDA\u5B58\u4E0B\u4E00\u8F6E",
    totalPot: "\u5956\u6C60\u603B\u989D",
    fastestGuesser: "\u6700\u5FEB\u731C\u4E2D\u8005",
    scoreTitle: "\u73A9\u5BB6\u79EF\u5206\u4E0E\u4F59\u989D",
    myScore: "\u6211\u7684\u79EF\u5206",
    myBalance: "\u53EF\u63D0\u53D6\u4F59\u989D\uFF08GEN\uFF09",
    withdraw: "\u63D0\u53D6\u4F59\u989D",
    revealTitle: "\u966A\u5BA1\u56E2\u63ED\u793A\u53F0",
    revealWaiting: "\u7B49\u5F85 FINALIZED \u8BFB\u56DE\u2026",
    revealSteps: "\u9A8C\u8BC1\u8005\u590D\u6838\u6B65\u9AA4\uFF1A\u2460 \u6838\u9A8C\u6982\u5FF5\u627F\u8BFA\u539F\u50CF \u2461 \u91CD\u7B97\u753B\u4F5C SHA-256 \u2462 \u7B5B\u67E5\u5199\u5B57\u4F5C\u5F0A\u95E8 \u2463 \u8BC4\u5B9A\u89C6\u89C9\u8BED\u4E49\u7C97\u6863 \u2464 \u6267\u884C\u786E\u5B9A\u6027\u5206\u8D26",
    commitMatch: "\u6982\u5FF5\u627F\u8BFA\u6838\u9A8C",
    imageMatch: "\u56FE\u7247 SHA-256 \u6838\u9A8C",
    cheatGate: "\u5199\u5B57\u4F5C\u5F0A\u95E8",
    verdictLabel: "\u753B\u4F5C\u88C1\u51B3",
    reasonLabel: "\u539F\u56E0\u7801",
    verdictFull: "\u753B\u4F5C\u5951\u5408 \xB7 \u6EE1\u989D\u5206\u6C60",
    verdictFullEn: "DRAWING_MATCHES (FULL SPLIT)",
    verdictPartialUnguessed: "\u753B\u4F5C\u5951\u5408\u4F46\u65E0\u4EBA\u731C\u4E2D \xB7 \u5168\u989D\u6EDA\u5B58",
    verdictWeak: "\u5F31\u8BED\u4E49\u63CF\u7ED8 \xB7 \u534A\u6C60\u6EDA\u5B58",
    verdictWeakUnguessed: "\u5F31\u8BED\u4E49\u4E14\u65E0\u4EBA\u731C\u4E2D \xB7 \u5168\u989D\u6EDA\u5B58",
    verdictMiss: "\u753B\u4F5C\u672A\u901A\u8FC7 \xB7 \u96F6\u5206\u6EDA\u5B58",
    verdictUnconfirmed: "\u672A\u786E\u8BA4\uFF08\u7B49\u5F85 FINALIZED \u8BFB\u56DE\uFF09",
    autoTriggerBanner: "\u68C0\u6D4B\u5230\u6709\u73A9\u5BB6\u9996\u6B21\u731C\u4E2D\uFF01\u6B63\u5728\u81EA\u52A8\u53D1\u8D77\u63ED\u793A\u4E0E\u966A\u5BA1\u56E2\u7ED3\u7B97\u2026\u2026",
    revealNow: "\u63ED\u793A\u5E76\u81EA\u52A8\u7ED3\u7B97",
    challengeTitle: "\u6311\u6218\uFF08\u63ED\u793A\u540E 10 \u5206\u949F\u7A97\u53E3\u5185\uFF09",
    correctedHash: "\u4FEE\u6B63\u540E\u7684\u54C8\u5E0C\uFF0864 \u4F4D\u5341\u516D\u8FDB\u5236\uFF09",
    challengeBtn: "\u53D1\u8D77\u6311\u6218\uFF08\u8D28\u62BC 5 GEN\uFF09",
    settleBtn: "\u7ED3\u7B97\uFF08\u7A97\u53E3\u7ED3\u675F\u540E\uFF09",
    galleryTitle: "\u88C1\u51B3\u753B\u5ECA",
    evidenceTab: "\u8BC4\u5BA1\u8BC1\u636E\u9875",
    galleryTab: "\u88C1\u51B3\u753B\u5ECA",
    exportDossier: "\u5BFC\u51FA\u8F6E\u6B21\u6838\u9A8C\u6863\u6848 JSON",
    exportDisabledNote: "\u4EC5 SETTLED \u4E14 FINALIZED \u8BFB\u56DE\u540E\u53EF\u5BFC\u51FA",
    expandDetails: "\u5C55\u5F00\u94FE\u4E0A\u8BE6\u60C5",
    collapseDetails: "\u6536\u8D77\u8BE6\u60C5",
    demoTitle: "\u516C\u5F00\u6F14\u793A\u6848\u4F8B\uFF08\u4E00\u952E\u88C5\u586B\uFF09",
    demoCase1: "CASE-1 \u6B63\u5E38\u624B\u7ED8\u81EA\u884C\u8F66",
    demoCase2: "CASE-2 \u6781\u7B80\u706F\u5854\u8349\u56FE\uFF08\u5F31\u5339\u914D\uFF09",
    demoCase3: "CASE-3 \u76F4\u63A5\u5199\u5355\u8BCD VOLCANO\uFF08\u4F5C\u5F0A\u62E6\u622A\uFF09",
    demoCase4: "CASE-4 \u65E0\u5173\u56FE\uFF08\u89C6\u89C9\u4E0D\u7B26\uFF09",
    demoLoaded: "\u5DF2\u88C5\u586B\u6F14\u793A\u753B\u4F5C\uFF0CSHA-256 \u89C1\u753B\u5E03\u4E0B\u65B9",
    demoShaMatch: "\u539F\u59CB SHA \u4E0E\u8BC1\u636E\u8BB0\u5F55\u4E00\u81F4",
    canvasPresetBlank: "\u7A7A\u767D\u753B\u5E03 \u2014 \u5C1A\u672A\u4F5C\u753B",
    canvasPresetDrawn: "\u672C\u5730\u4F5C\u753B \u2014 \u672A\u4E0A\u94FE\uFF08\u4EC5\u672C\u673A\uFF09",
    canvasPresetDemo: "\u6F14\u793A\u753B\u4F5C \xB7 \u793A\u610F \u2014 \u975E\u94FE\u4E0A\u7ED3\u679C\uFF0C\u539F\u59CB SHA \u4E0E\u8BC1\u636E\u8BB0\u5F55\u4E00\u81F4",
    noImage: "\u65E0\u56FE\u7247\uFF08\u672C\u8F6E\u672A\u63D0\u4EA4\u753B\u4F5C\uFF09",
    evidenceTitle: "\u8BC4\u5BA1\u8BC1\u636E",
    claimsTitle: "\u4E3B\u5F20",
    anchorsTitle: "\u951A\u70B9",
    txTableTitle: "\u6838\u5FC3\u4EA4\u6613",
    advTitle: "\u5BF9\u6297\u6848\u4F8B",
    notProveTitle: "\u672C\u9879\u76EE\u4E0D\u8BC1\u660E\u4EC0\u4E48",
    claim1: "\u6982\u5FF5\u5728\u731C\u6D4B\u524D\u5DF2\u54C8\u5E0C\u9501\u5B9A\uFF1B\u63ED\u793A\u65F6\u4EE3\u7801\u6838\u9A8C\u539F\u50CF\uFF0C\u4E0D\u7B26\u5219\u62D2\u7EDD\u3002",
    claim2: "\u753B\u4F5C\u5B57\u8282\u5B58\u4E8E\u94FE\u4E0A\uFF0C\u9A8C\u8BC1\u8005\u88C1\u51B3\u94FE\u4E0A\u5B57\u8282\uFF0C\u4E0D\u62C9\u53D6\u4EFB\u4F55 URL\u3002",
    claim3: "\u731C\u6D4B\u6B63\u8BEF\u4E0E\u6700\u5FEB\u731C\u4E2D\u8005\u7531\u786E\u5B9A\u6027\u4EE3\u7801\u5224\u5B9A\uFF0C\u4E0D\u7531 LLM \u51B3\u5B9A\u3002",
    claim4: "\u5199\u5B57\u4F5C\u5F0A\u4E00\u7968\u5426\u51B3\uFF1A\u5373\u4F7F\u6709\u540C\u8C0B\u731C\u4E2D\uFF0C\u4F5C\u5F0A\u8F6E\u6B21\u6240\u6709\u4EBA\u5747\u4E3A 0 \u5206\u3002",
    claim5: "\u6311\u6218\u53EF\u7528\u4FEE\u6B63\u54C8\u5E0C\u7FFB\u76D8\uFF1B\u7ED3\u7B97\u540E\u5956\u6C60\u5206\u914D\u7CBE\u786E\u5230 wei\uFF0C\u603B\u548C\u6052\u7B49\u4E8E\u5956\u6C60\u603B\u989D\u3002",
    anchor1: 'concept_commit = SHA256(salt + "|" + \u6982\u5FF5)\uFF0C\u5F00\u5C40\u524D\u9501\u5B9A\u3002',
    anchor2: "image_sha256 \u5728\u63D0\u4EA4\u65F6\u9501\u5B9A\u3001\u63ED\u793A\u65F6\u7531\u4EE3\u7801\u91CD\u7B97\u94FE\u4E0A\u5B57\u8282\u590D\u6838\u3002",
    anchor3: "\u6311\u6218\u7A97\u53E3 10 \u5206\u949F\uFF1B\u7A97\u53E3\u5173\u95ED\u540E\u65B9\u53EF\u7ED3\u7B97\uFF0C\u7ED3\u7B97\u5373\u51BB\u7ED3\u3002",
    notProve1: "\u4E0D\u8BC1\u660E\u753B\u4F5C\u672C\u8EAB\u7684\u827A\u672F\u8D28\u91CF\uFF0C\u53EA\u8BC1\u660E\u7C97\u6863\u8BED\u4E49\u5339\u914D\uFF08MATCHES / WEAK / MISS\uFF09\u3002",
    notProve2: "\u4E0D\u8BC1\u660E\u94FE\u4E0B\u8EAB\u4EFD\uFF1B\u5730\u5740\u5373\u73A9\u5BB6\uFF0C\u5206\u6570\u4E0E\u4F59\u989D\u53EA\u8BA4\u5730\u5740\u3002",
    notProve3: "\u4E0D\u8BC1\u660E\u8BC4\u5BA1\u56E2\u5BF9\u540C\u4E00\u753B\u4F5C\u6C38\u8FDC\u7ED9\u51FA\u540C\u4E00\u7C97\u6863\uFF1B\u7C97\u6863\u662F\u5171\u8BC6\u8F93\u51FA\uFF0C\u4E0D\u662F\u786E\u5B9A\u6027\u51FD\u6570\u3002",
    sourceSha: "\u6E90\u7801 SHA-256",
    viewTx: "\u67E5\u770B\u4EA4\u6613",
    tabCanvas: "\u753B\u5E03 / \u63ED\u793A",
    tabGuesses: "\u731C\u6D4B\u6D41",
    tabGallery: "\u753B\u5ECA",
    tabEvidence: "\u8BC1\u636E\u9875",
    refresh: "\u5237\u65B0\u8BFB\u56DE",
    txSubmitted: "\u4EA4\u6613\u5DF2\u63D0\u4EA4",
    txFinalized: "\u4EA4\u6613\u5DF2 FINALIZED",
    txFailed: "\u4EA4\u6613\u672A\u8FBE\u6210\u5171\u8BC6",
    txError: "\u51FA\u9519\u4E86",
    readingBack: "\u6B63\u5728\u8BFB\u56DE FINALIZED \u72B6\u6001\u2026",
    needTempSigner: "\u8BF7\u5148\u542F\u7528\u6D4F\u89C8\u5668\u4E34\u65F6\u7B7E\u540D\u5668",
    needRound: "\u8BF7\u5148\u8F93\u5165\u8F6E\u6B21 ID",
    needConcept: "\u8BF7\u8F93\u5165\u82F1\u6587\u79D8\u5BC6\u6982\u5FF5",
    needSalt: "\u8BF7\u5148\u751F\u6210\u6216\u8F93\u5165\u76D0",
    needDrawing: "\u8BF7\u5148\u5728\u753B\u5E03\u4E0A\u4F5C\u753B\u6216\u88C5\u586B\u6F14\u793A\u6848\u4F8B",
    needGuess: "\u8BF7\u8F93\u5165\u82F1\u6587\u731C\u6D4B\u8BCD",
    needHash: "\u8BF7\u8F93\u5165 64 \u4F4D\u5341\u516D\u8FDB\u5236\u54C8\u5E0C",
    invalidRoundId: "\u8F6E\u6B21 ID \u987B\u4E3A 1\u201348 \u4E2A\u5B57\u7B26",
    copied: "\u5DF2\u590D\u5236",
    roundIdLabel: "\u8F6E\u6B21 ID",
    conceptCommitLocal: "\u672C\u5730\u8BA1\u7B97\u7684\u627F\u8BFA\uFF08\u5F85\u94FE\u4E0A\u8BFB\u56DE\u786E\u8BA4\uFF09",
    footerNote: "Stable Studionet \xB7 Chain ID 61999 \xB7 \u6D4B\u8BD5\u7F51 GEN\uFF0C\u65E0\u73B0\u91D1\u6210\u672C",
    lastReadback: "\u6700\u8FD1\u8BFB\u56DE",
    neverReadBack: "\u5C1A\u672A\u8BFB\u56DE",
    potSplitBar: "\u5956\u6C60\u53BB\u5411",
    drawerShare: "\u753B\u8005",
    guesserShare: "\u731C\u8005",
    rolloverShare: "\u6EDA\u5B58",
    guessesCount: "\u731C\u6D4B",
    seqNo: "\u5E8F\u53F7",
    stake: "\u8D28\u62BC",
    statusLabel: "\u72B6\u6001",
    challengeOutcome: "\u6311\u6218\u7ED3\u679C",
    challenges: "\u6311\u6218\u8BB0\u5F55",
    settledBy: "\u7ED3\u7B97\u65B9",
    imageByteLen: "\u56FE\u7247\u5B57\u8282\u957F\u5EA6",
    roundDetail: "\u8F6E\u6B21\u94FE\u4E0A\u8BE6\u60C5",
    noGallery: "\u6682\u65E0\u5DF2\u7ED3\u7B97\u8F6E\u6B21\uFF08\u9700 FINALIZED \u8BFB\u56DE\u540E\u663E\u793A\uFF09",
    noGuesses: "\u6682\u65E0\u731C\u6D4B\uFF08\u9700 FINALIZED \u8BFB\u56DE\u540E\u663E\u793A\uFF09",
    loadDemo: "\u88C5\u586B",
    demoShaMismatch: "\u6F14\u793A\u753B\u4F5C SHA-256 \u4E0E\u8BC1\u636E\u8BB0\u5F55\u4E0D\u4E00\u81F4\uFF0C\u5DF2\u62D2\u7EDD\u88C5\u586B",
    machineNote: "Machine \u89C6\u56FE\uFF1A\u7EAF\u6587\u672C\u952E\u503C\u7EC8\u7AEF\uFF0C\u5168\u90E8\u53D6\u81EA FINALIZED \u8BFB\u56DE\u3002",
    exportBlocked: "\u5BFC\u51FA\u5DF2\u62E6\u622A\uFF1A\u7B49\u5F85 FINALIZED \u94FE\u4E0A\u8BFB\u56DE\u4E14\u8F6E\u6B21 SETTLED",
    canvasReadonly: "\u731C\u6D4B\u9636\u6BB5\uFF1A\u753B\u5E03\u5DF2\u9501\u5B9A\u4E3A\u53EA\u8BFB\u5C55\u793A",
    canvasActive: "\u4F5C\u753B\u9636\u6BB5\uFF1A\u753B\u5E03\u53EF\u7ED8\u5236",
    currentRound: "\u5F53\u524D\u8F6E\u6B21",
    playerStatsNote: "\u5206\u6570\u4E0E\u4F59\u989D\u4EC5\u6765\u81EA FINALIZED \u8BFB\u56DE\u3002"
  },
  en: {
    title: "SketchVerdict \xB7 Draw-and-Guess Party",
    subtitle: "Draw a secret concept, let others guess it \u2014 consensus grades the drawing, deterministic code splits the pot.",
    network: "Network",
    contract: "Contract",
    live: "LIVE",
    readbackPending: "Unconfirmed \xB7 awaiting FINALIZED readback",
    readbackOk: "\u2713 Read from FINALIZED Studionet state",
    offlineBanner: "Local preview mode (not an on-chain result) \u2014 writes and dossier export are disabled",
    staticMode: "Static Mode",
    langToggle: "\u4E2D\u6587",
    viewHuman: "Human view",
    viewMachine: "Machine view",
    walletTitle: "Wallet",
    connectInjected: "Connect injected wallet (OKX / MetaMask / Rabby / Coinbase)",
    useTempSigner: "Enable in-browser Ephemeral Signer",
    disconnect: "Disconnect",
    noWallet: "No injected wallet detected",
    wrongNetwork: "Wallet is not on Stable Studionet (Chain ID 61999) \u2014 please switch networks",
    walletReadLabel: "Read connection",
    walletWriteLabel: "Write-transaction signer: in-browser ephemeral test account",
    walletWriteSuffix: "\u2014 not your main wallet signature",
    walletNotCreated: "Ephemeral signer not created (click \u201CEnable in-browser Ephemeral Signer\u201D)",
    walletTempNote: "The ephemeral test account lives only in this browser session memory; it is destroyed when the page closes, never written to disk or uploaded.",
    roundLabel: "Round",
    stageLabel: "Stage",
    stage1: "Drawing",
    stage2: "Guessing",
    stage3: "Judged",
    stage4: "Settled",
    rolloverPool: "Rollover pool",
    currentPot: "Current pot",
    roundCount: "Rounds",
    unconfirmed: "Unconfirmed",
    unconfirmedLong: "Unconfirmed (awaiting FINALIZED on-chain readback)",
    hidden: "Hidden",
    dashUnconfirmed: "\u2014 (Unconfirmed)",
    pendingReadback: "Awaiting readback",
    consoleTitle: "Round console",
    timerTitle: "Stage timer",
    timeLeft: "Remaining",
    deadline: "Deadline (UTC minute)",
    drawingDeadline: "Drawing deadline",
    revealDeadline: "Reveal deadline",
    challengeDeadline: "Challenge deadline",
    timeoutRescue: "Trigger timeout auto-settle",
    timeoutRescueHint: "Available only after the deadline; any participant can trigger it.",
    commitTitle: "Secret concept commitment",
    categoryHint: "Category hint",
    commitOnChain: "On-chain Commit SHA-256",
    commitLocked: "Locked",
    vaultTitle: "Drawer vault (never leaves this browser)",
    vaultWarn: "Concept and salt live only in your browser memory. Lose the salt or close the page and you cannot reveal!",
    conceptLabel: "Secret concept (English)",
    saltLabel: "Salt",
    autoGenSalt: "Generate salt",
    startRound: "Start round & lock concept",
    startStakeNote: "Starter stake 10 GEN (drawer).",
    drawDuration: "Drawing duration (min)",
    guessDuration: "Guessing duration (min)",
    canvasTitle: "Canvas",
    canvasWarn: "Graphics only \u2014 writing words / letters / homophones on the canvas triggers a DRAWING_MISS zero-score verdict from the AI jury.",
    brush: "Brush",
    eraser: "Eraser",
    clear: "Clear",
    brushSize: "Size",
    imageSha: "Image SHA-256",
    imageBytes: "Image bytes",
    b64Size: "Base64 length",
    submitDrawing: "Lock drawing hash & enter guessing stage",
    submitDrawingNote: "Submits the 384\xD7384 PNG bytes (Base64) on-chain; the hash is the lock.",
    guessTitle: "Live guess stream",
    guessPlaceholder: "Type an English concept word\u2026",
    submitGuess: "Stake & submit guess (5 GEN)",
    guessNote: "One guess per player per round; the fastest correct guesser is decided by on-chain order.",
    guessCorrect: "Correct",
    guessWrong: "Wrong",
    guessPending: "Pending",
    payoutTitle: "Payout board",
    drawerPayout: "Drawer payout",
    guesserPayouts: "Guesser payouts",
    rolloverNext: "Rollover to next round",
    totalPot: "Total pot",
    fastestGuesser: "Fastest guesser",
    scoreTitle: "Player score & balance",
    myScore: "My score",
    myBalance: "Withdrawable balance (GEN)",
    withdraw: "Withdraw balance",
    revealTitle: "Jury reveal stage",
    revealWaiting: "Waiting for FINALIZED readback\u2026",
    revealSteps: "Validator checks: \u2460 verify concept-commit preimage \u2461 re-hash drawing SHA-256 \u2462 text-cheat gate \u2463 coarse visual tier \u2464 deterministic split",
    commitMatch: "Concept-commit check",
    imageMatch: "Image SHA-256 check",
    cheatGate: "Text-cheat gate",
    verdictLabel: "Drawing verdict",
    reasonLabel: "Reason code",
    verdictFull: "Full match \xB7 full split",
    verdictFullEn: "DRAWING_MATCHES (FULL SPLIT)",
    verdictPartialUnguessed: "Matched but unguessed \xB7 full rollover",
    verdictWeak: "Weak depiction \xB7 half-pool rollover",
    verdictWeakUnguessed: "Weak and unguessed \xB7 full rollover",
    verdictMiss: "Drawing rejected \xB7 zero-score rollover",
    verdictUnconfirmed: "Unconfirmed (awaiting FINALIZED readback)",
    autoTriggerBanner: "A first correct guess was detected! Auto-sending reveal & jury settlement\u2026",
    revealNow: "Reveal & auto-settle",
    challengeTitle: "Challenge (within 10 min after reveal)",
    correctedHash: "Corrected hash (64-char hex)",
    challengeBtn: "Challenge (stake 5 GEN)",
    settleBtn: "Settle (after window closes)",
    galleryTitle: "Verdict gallery",
    evidenceTab: "Reviewer evidence",
    galleryTab: "Verdict gallery",
    exportDossier: "Export round dossier JSON",
    exportDisabledNote: "Exportable only when SETTLED with FINALIZED readback",
    expandDetails: "Expand on-chain detail",
    collapseDetails: "Collapse detail",
    demoTitle: "Public demo cases (one-click load)",
    demoCase1: "CASE-1 Normal hand-drawn bicycle",
    demoCase2: "CASE-2 Minimal lighthouse sketch (weak)",
    demoCase3: "CASE-3 Word VOLCANO written out (cheat blocked)",
    demoCase4: "CASE-4 Unrelated image (visual miss)",
    demoLoaded: "Demo drawing loaded; SHA-256 shown below the canvas",
    demoShaMatch: "Original SHA matches the evidence record",
    canvasPresetBlank: "Blank canvas \u2014 nothing drawn yet",
    canvasPresetDrawn: "Local drawing \u2014 not on-chain (this browser only)",
    canvasPresetDemo: "Demo drawing \xB7 for illustration \u2014 not an on-chain result; original SHA matches the evidence record",
    noImage: "No image (no drawing submitted this round)",
    demoShaMismatch: "Demo drawing SHA-256 does NOT match the evidence record \u2014 load refused",
    evidenceTitle: "Reviewer evidence",
    claimsTitle: "Claims",
    anchorsTitle: "Anchors",
    txTableTitle: "Core transactions",
    advTitle: "Adversarial cases",
    notProveTitle: "What this does not prove",
    claim1: "The concept is hash-locked before any guess; code verifies the preimage at reveal and rejects on mismatch.",
    claim2: "Drawing bytes live on-chain; validators judge the stored bytes and never fetch any URL.",
    claim3: "Guess correctness and the fastest guesser are decided by deterministic code, not by the LLM.",
    claim4: "A text cheat is a veto: even a correct accomplice guess earns zero on a cheating round.",
    claim5: "A challenge with a corrected hash can flip the verdict; after settle, the split is exact to the wei and always sums to the total pot.",
    anchor1: 'concept_commit = SHA256(salt + "|" + concept), locked at start.',
    anchor2: "image_sha256 is locked at submit and re-computed from the stored bytes by code at reveal.",
    anchor3: "Challenge window is 10 minutes; settle is possible only after it closes, and SETTLED is frozen.",
    notProve1: "It does not prove artistic quality \u2014 only a coarse semantic tier (MATCHES / WEAK / MISS).",
    notProve2: "It does not prove off-chain identity; the address is the player, and score and balance follow the address.",
    notProve3: "It does not prove the jury returns the same tier for the same drawing forever; the tier is a consensus output, not a deterministic function.",
    sourceSha: "Source SHA-256",
    viewTx: "View transaction",
    tabCanvas: "Canvas / Reveal",
    tabGuesses: "Guess stream",
    tabGallery: "Gallery",
    tabEvidence: "Evidence",
    refresh: "Refresh readback",
    txSubmitted: "Transaction submitted",
    txFinalized: "Transaction FINALIZED",
    txFailed: "Transaction did not reach consensus",
    txError: "Something went wrong",
    readingBack: "Reading back FINALIZED state\u2026",
    needTempSigner: "Please enable the in-browser Ephemeral Signer first",
    needRound: "Please enter a round ID",
    needConcept: "Please enter the secret concept in English",
    needSalt: "Please generate or enter a salt",
    needDrawing: "Please draw on the canvas or load a demo case first",
    needGuess: "Please enter a guess in English",
    needHash: "Please enter a 64-char hex hash",
    invalidRoundId: "Round ID must be 1\u201348 characters",
    copied: "Copied",
    roundIdLabel: "Round ID",
    conceptCommitLocal: "Locally computed commitment (pending on-chain readback)",
    footerNote: "Stable Studionet \xB7 Chain ID 61999 \xB7 testnet GEN, zero cash cost",
    lastReadback: "Last readback",
    neverReadBack: "Never read back",
    potSplitBar: "Pot split",
    drawerShare: "Drawer",
    guesserShare: "Guessers",
    rolloverShare: "Rollover",
    guessesCount: "Guesses",
    seqNo: "Seq",
    stake: "Stake",
    statusLabel: "Status",
    challengeOutcome: "Challenge outcome",
    challenges: "Challenge records",
    settledBy: "Settled by",
    imageByteLen: "Image byte length",
    roundDetail: "Round on-chain detail",
    noGallery: "No settled rounds yet (shown only after FINALIZED readback)",
    noGuesses: "No guesses yet (shown only after FINALIZED readback)",
    loadDemo: "Load",
    machineNote: "Machine view: plain-text key-value terminal, all values from FINALIZED readback.",
    exportBlocked: "Export blocked: awaiting FINALIZED on-chain readback with SETTLED status",
    canvasReadonly: "Guessing stage: canvas is locked read-only",
    canvasActive: "Drawing stage: canvas is drawable",
    currentRound: "Current round",
    playerStatsNote: "Score and balance come only from FINALIZED readback."
  }
};
function t(lang2, key) {
  const v = STRINGS[lang2]?.[key] ?? STRINGS.en[key];
  if (v === void 0) throw new Error("missing i18n key: " + key);
  return v;
}

// site/src/dossier.js
function verdictClass(round) {
  const v = round.drawing_verdict;
  const correct = (round.correct_guessers || []).length;
  if (v === "DRAWING_MATCHES" && correct >= 1) return "FULL_MATCH_SETTLED";
  if (v === "DRAWING_MATCHES" && correct === 0) return "PARTIAL_UNGUESSED_ZERO_PAYOUT";
  if (v === "DRAWING_WEAK" && correct >= 1) return "PARTIAL_WEAK_HALF_ROLLOVER";
  if (v === "DRAWING_WEAK" && correct === 0) return "PARTIAL_WEAK_ZERO_PAYOUT";
  if (v === "DRAWING_MISS") return "REJECTED_DRAWING_MISS";
  return "UNCONFIRMED";
}
function verdictTone(round) {
  const v = round.drawing_verdict;
  const correct = (round.correct_guessers || []).length;
  if (v === "DRAWING_MATCHES" && correct >= 1) return "teal";
  if (v === "DRAWING_MATCHES" || v === "DRAWING_WEAK") return "amber";
  if (v === "DRAWING_MISS") return "crimson";
  return "navy";
}
function buildDossier(round, readback) {
  if (!readback || readback.finalized !== true || !round || round.status !== "SETTLED") {
    throw new Error("Export blocked: awaiting FINALIZED on-chain readback");
  }
  const vc = verdictClass(round);
  if (vc === "UNCONFIRMED") {
    throw new Error("Export blocked: awaiting FINALIZED on-chain readback");
  }
  return {
    dossier_version: "sketchverdict-dossier-1",
    contract: readback.contract_address,
    source_sha256: readback.source_sha256,
    readback_finalized_at: readback.readback_at,
    round_id: round.round_id,
    drawer: round.drawer,
    concept_commit: round.concept_commit,
    category_hint: round.category_hint,
    status: round.status,
    revealed_concept: round.revealed_concept,
    has_written_text_cheat: round.has_written_text_cheat,
    visual_depiction_tier: round.visual_depiction_tier,
    drawing_verdict: round.drawing_verdict,
    reason_code: round.reason_code,
    verdict_class: vc,
    image_sha256: round.image_sha256,
    image_byte_len: round.image_byte_len,
    guesses: round.guesses,
    correct_guessers: round.correct_guessers,
    fastest_guesser: round.fastest_guesser,
    total_pot_wei: round.total_pot_wei,
    drawer_payout_wei: round.drawer_payout_wei,
    guesser_payouts: round.guesser_payouts,
    next_rollover_pool_wei: round.next_rollover_pool_wei,
    challenges: round.challenges,
    settled_by: round.settled_by
  };
}

// site/src/evidence-data.js
var EVIDENCE_DATA = {
  "contract": "0x56C85764c91F439185f446e019BB70A877458b54",
  "deploy_tx": "0x0cddebb7db0464d2b6f677f29a1e59885d79b192fe4fc536cdc5d11f291d81ce",
  "source_sha256": "0fc91d3c93fabad3178bfb1559540bba52c26277e8d0935dac43ecae62b15a47",
  "tx_count": 64,
  "txs": [
    {
      "label": "deploy",
      "hash": "0x0cddebb7db0464d2b6f677f29a1e59885d79b192fe4fc536cdc5d11f291d81ce"
    },
    {
      "label": "R1:start",
      "hash": "0x35af00e554a0748e8f0072dc5e577e7ab6f5eb1c1edc8492d2f2dc1741715292"
    },
    {
      "label": "R1:draw",
      "hash": "0xbbacc50d938dc2fc5585b3c729a886a24a2ea1ab6f6d30ca9b8b1e3dc6e49f62"
    },
    {
      "label": "R10-2:self-guess",
      "hash": "0x5f68460d8e1795264caca10e5deee691550e778f702c91f4c76827004d7c8fc5"
    },
    {
      "label": "R1:guess-A-car",
      "hash": "0xf349706d11ff17ea99d639fffddb8ad41384948cac0fdd0fb003e56da4fb1e5c"
    },
    {
      "label": "R1:guess-B-bicycle",
      "hash": "0x5efa50cdd51bd92163bca8ce35cdb4bdd3ab75c2bec3959aa31b4887732a1a5f"
    },
    {
      "label": "R1:guess-C-bicycle",
      "hash": "0x94e5991bd40298cb4aae0c5d48c2cc68b2d666ab7633ecb588fdc5be5a597cda"
    },
    {
      "label": "R10-1:dup-guess",
      "hash": "0xe8cb27901415d7ef3004bd6eedea1e4a01267552ad9e647620a5f9fd6ec9a5fa"
    },
    {
      "label": "R10-5:second-drawing",
      "hash": "0xa76ef65b1c4d4dcbeb8d53d5c8be6d957c917e57a4240743449ebb1ada263ee3"
    },
    {
      "label": "R10-3:non-drawer-reveal",
      "hash": "0x3a40d67cd5ac807b6ce10aac463d4f4f9c83bfd102ebe0c8fd413881f153e7a9"
    },
    {
      "label": "R10-4:wrong-salt",
      "hash": "0x810d2e95143c93a5f39d20c25c2507c825501f66fbb906c26a8bc3e61b994be2"
    },
    {
      "label": "R1:reveal",
      "hash": "0xa438046d56baf0dd0a314b9ba54492f7706bf71c3754d8a5d26eacf9cde1cb33"
    },
    {
      "label": "R1:settle",
      "hash": "0x65d823b0c8343d90ea1b08e85a304308721abe9432e56e0d3cb113351196f540"
    },
    {
      "label": "R10-6:re-reveal-settled",
      "hash": "0x2fd41a7ad2569edb3d655934cd2324f943e7ae629146f6c41aa15b672f6adda0"
    },
    {
      "label": "R10-7:dup-round-id",
      "hash": "0x19ea8e7f6398d4165c468f3cb571cfd8884824471262a54a4f3e2ffef86fcc53"
    },
    {
      "label": "R2:start",
      "hash": "0x0b41e122d34d800950dac591a044c6c87730cf259eb2ac859a6bae6f9bf36e15"
    },
    {
      "label": "R2:draw",
      "hash": "0x259102cdc3adfd69c089d4d721e022d6df29db41e4db597d410c522b5644c7c1"
    },
    {
      "label": "R2:guess-A",
      "hash": "0x69ceeb70b6d4bc49154eb13a32cc37aa1783e378f562b54e5111f6bcacdb9b51"
    },
    {
      "label": "R2:guess-B",
      "hash": "0xd313072c62520b5b357f5bae6134c314950f6a09c356a557716b12f29b8ef92e"
    },
    {
      "label": "R2:reveal",
      "hash": "0x3a5b0c2995a6ba76620f8c2a5bf6f741f77fe135226d8f8ea50ca043a090d5f7"
    },
    {
      "label": "R2:settle",
      "hash": "0x191ccfe7bdd93454501ab215d7965dcb49344e67719204082ec392768c06a51a"
    },
    {
      "label": "R2b:start",
      "hash": "0xc1e9d2ea7e0a6738e7491a6e46a35b5da7bac981857524839a1b592e1945778c"
    },
    {
      "label": "R2b:draw",
      "hash": "0x84cb45a81e66175938c2135fb7b8b79d14146adde71d49c1b7dcf1673d472856"
    },
    {
      "label": "R2b:guess-A",
      "hash": "0x8e0f2ac6beb99d68f1bd9ee18c25d080f36d60b07c29beebe4f440c7024a3209"
    },
    {
      "label": "R2b:guess-B",
      "hash": "0xc6c5dcc2b88649144abf1041890e7f2537502f7cc856e0df3d1d3b0e6e368163"
    },
    {
      "label": "R2b:reveal",
      "hash": "0x1a5ea8fd80b9d39fe42e05168c5b288164ced2808e42eaef99eaa63de8f894d4"
    },
    {
      "label": "R2b:settle",
      "hash": "0xfc95248c4477f03e59deba255a9d3628c8580b8fa98f27ca2c3927d7a3c387dc"
    },
    {
      "label": "R3:start",
      "hash": "0x56fb55b772dcef0251779c58a344706b67d8755074dd24eaf0e6bbbd1b1774c3"
    },
    {
      "label": "R3:draw",
      "hash": "0x478d103edcdb9f9f3d0bb7eeea1eb2e999633aeb34b7bc5626a1308327ff790e"
    },
    {
      "label": "R3:guess-A",
      "hash": "0xaf51b21af1296616162660ab10c92984ea7537a7f8a4f5be547a0ba0470e6589"
    },
    {
      "label": "R3:reveal",
      "hash": "0x61929e4e1f5b36e3f49939b7e20d507d743222d2d5954cff250cd0e3361316cc"
    },
    {
      "label": "R4:start",
      "hash": "0x27b797c42dd1fb8fcb089888873befc6ee0b3055b6d80bd4827eec7a5f81dd7a"
    },
    {
      "label": "R4:draw",
      "hash": "0xca92c68ad9eec347540d5cff4a4999cdbecdac55f118a291200a409e0174fce8"
    },
    {
      "label": "R4:guess-A",
      "hash": "0x925612a2034ed695fba6f3e4af2332bc32cf21e02b15e06caa6b2a0b873de5a9"
    },
    {
      "label": "R4:reveal",
      "hash": "0x7bb992935f70ef9f118f7d86d8a0feb9e803af884ee0ab1ceb52633fb0d1c3e3"
    },
    {
      "label": "R4:settle",
      "hash": "0x5b62e17aefc2f52c537c62a32b023a3effd410b2966d0dd9dcbc01439d25c9ce"
    },
    {
      "label": "R5:start",
      "hash": "0x27ee81dcebc5b5ae28b436093d4442660ff1e47749f2d3ee6c175b478127a42c"
    },
    {
      "label": "R5:draw-wrong-hash",
      "hash": "0x802dcfa681288eb7a71cac3901ae73161c80a1274cd8ccf5b0427870c0eb1a04"
    },
    {
      "label": "R5:guess-B",
      "hash": "0x93c5032a60ad610ad206808e16437cfbcf4bdb8348924e2ea329b29a9b15ad6b"
    },
    {
      "label": "R5:reveal",
      "hash": "0x07208321a09f25977e641e6282a3ac9220d584aa2532573dbdf9cd18946a1542"
    },
    {
      "label": "R5:challenge-true-hash",
      "hash": "0xa959ee576b2ba5982104063f8e2eb6c57bb51ec7a4ea0dc1c04cabc2d6c21619"
    },
    {
      "label": "R5:settle",
      "hash": "0x3083f935663f01366f471fa3054177b4f556a8341addf2d97e1a38ebc26dc234"
    },
    {
      "label": "R6:start",
      "hash": "0x56ba145b10671d9a2361d4079ac488e97ade7677eeef4f55234a2287e95687a2"
    },
    {
      "label": "R6:draw",
      "hash": "0x6283d42b589d1d37279b67e8c96667b3438439f7c6c3ab6bda0015c2030dd83a"
    },
    {
      "label": "R6:guess-B",
      "hash": "0xcdd00c11d599e434c401f30e3989036a1ac4001daab03ab2e466bfc8fe429321"
    },
    {
      "label": "R6:reveal",
      "hash": "0xa7a24a7a0775102ed5cfa3a13966118fd96e3b12b370d3cb206a1b83cfbe0fb3"
    },
    {
      "label": "R6:challenge-wrong-hash",
      "hash": "0xd22adccec6bc6a25e67ad066affb9d991bbadf242a5e6c8d178c5bf6d329a62c"
    },
    {
      "label": "R6:challenge-second-blocked",
      "hash": "0xfb142def6875982a923a144c8f89813bababccde693d31aa5438da515b5af332"
    },
    {
      "label": "R6:settle",
      "hash": "0xf42e7f748d383aa6b5b5396ef05e99cd287c39a69c8d66007961f34f9d62b022"
    },
    {
      "label": "R7:start",
      "hash": "0xdaad560339793bd2e7d81cdb754f300f512468f1575ddd9404982698d8f17ed2"
    },
    {
      "label": "R7:timeout",
      "hash": "0x1f191c2aa94a5a87002bf50cd4c56d8bb066133baaec8a941a44fc00285e3e65"
    },
    {
      "label": "R8:start",
      "hash": "0xa176e4eb586304d573d73695177f558aec305f1ba2f254175c481aeab21b0f2a"
    },
    {
      "label": "R8:draw",
      "hash": "0x84392109f967cf0074e062a4253c6dd31b1d1b684c4bd90cb3865f8231a3dc37"
    },
    {
      "label": "R8:guess-A",
      "hash": "0x37d16c787101f939d6cff02d7c4b09aeb9217a7a4c4c8cc9cf8ee676ea3b0f00"
    },
    {
      "label": "R8:guess-B",
      "hash": "0x5845fe7987ebf00a50d9d85c074081c87b702271bba7679827f37130fcf417a2"
    },
    {
      "label": "R8:timeout",
      "hash": "0x7b99ee4a9d0f554c47dbd5451135f42274d1644000e492d22cbde9f229b8acdf"
    },
    {
      "label": "R9:start",
      "hash": "0x62f75c56c3277b9cba753ac7d19db7da9349f48ce96dadc83fe902189faa0928"
    },
    {
      "label": "R9:draw",
      "hash": "0xfd5c1f0ba0c112432134535b5cd605b0cad32309942e41913bc23c2ccbb4c88f"
    },
    {
      "label": "R9:guess-B",
      "hash": "0x17858c1993e337c66de374470908ae8fa774e2c8abe3a0693c3ba15c3bac4384"
    },
    {
      "label": "R9:reveal",
      "hash": "0x02708317dfee337f59fe6fcedae623145e9e4c548efba74b896deb96d94bfa6b"
    },
    {
      "label": "R9:settle",
      "hash": "0xfa2e165619c1becd0505b68980064eecb28e6f31f656a580578fa99a0f1bd717"
    },
    {
      "label": "R11:withdraw-drawer",
      "hash": "0xfbd9e669b5b20a3c14afe2277850937cbfabb30ec2d63c555b797a444408da62"
    },
    {
      "label": "R11:withdraw-B",
      "hash": "0x591df1e9d616a27c7cd75a957263f30207e4143764ad9b0ab35b66317ef45b81"
    },
    {
      "label": "R11:withdraw-zero",
      "hash": "0xc73b8c765a0616b6ac2f871e640f9c28f1d3968b1edc7167f6847d0b0c20b222"
    }
  ]
};

// site/src/app.js
var RPC_URL = "https://studio.genlayer.com/api";
var CHAIN_ID = 61999;
var CONTRACT_ADDRESS = "0x56C85764c91F439185f446e019BB70A877458b54";
var SOURCE_SHA256 = "0fc91d3c93fabad3178bfb1559540bba52c26277e8d0935dac43ecae62b15a47";
var EXPLORER = "https://explorer-studio.genlayer.com";
var GEN = 10n ** 18n;
var CANVAS_SIZE = 384;
var INK_COLORS = ["#111927", "#1D4ED8", "#0F766E", "#B45309", "#B91C1C"];
var PAPER = "#F4F6FA";
var $ = (s) => document.querySelector(s);
var $$ = (s) => Array.from(document.querySelectorAll(s));
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
var { calldata: calldata2, transactions: transactions2 } = abi_exports;
var lang = localStorage.getItem("sv-lang") || "zh";
var view = "human";
var staticMode = new URLSearchParams(location.search).has("static") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var snapshot = null;
var readbackOk = () => snapshot?.finalized === true;
var readingBack = false;
var wallet = null;
var tempAccount = null;
var vault = null;
var currentRoundId = "";
var autoRevealFired = {};
var expandedGallery = /* @__PURE__ */ new Set();
var galleryTab = "gallery";
var utcMinuteOffset = 0;
var chain = { ...studionet, rpcUrls: { default: { http: [RPC_URL] } } };
function esc(v) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function shortAddr(a) {
  return a ? `${a.slice(0, 6)}\u2026${a.slice(-4)}` : t(lang, "unconfirmed");
}
function normalizeConcept(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, " ").replace(/[^a-z0-9 ]/g, "");
}
function fmtGen(weiStr) {
  try {
    const w = BigInt(weiStr ?? "0");
    const neg = w < 0n;
    const abs = neg ? -w : w;
    const whole = abs / GEN;
    const frac = abs % GEN;
    const fracStr = frac.toString().padStart(18, "0").replace(/0+$/, "").slice(0, 6);
    return `${neg ? "-" : ""}${whole}${fracStr ? "." + fracStr : ""} GEN`;
  } catch {
    return t(lang, "unconfirmed");
  }
}
function fmtGenExact(weiStr) {
  try {
    const w = BigInt(weiStr ?? "0");
    const base = fmtGen(weiStr);
    const sub = w % GEN % 10n ** 12n;
    return sub === 0n ? base : `${base} + ${sub} wei`;
  } catch {
    return t(lang, "unconfirmed");
  }
}
async function sha256Hex(bytes) {
  const d = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function b64encode(bytes) {
  let s = "";
  const chunk = 32768;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}
function b64decode(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function utcMinuteNow() {
  try {
    const r = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=UTC", { signal: AbortSignal.timeout(8e3) });
    const j = await r.json();
    return Math.floor((/* @__PURE__ */ new Date(j.dateTime + "Z")).getTime() / 6e4);
  } catch {
    return Math.floor(Date.now() / 6e4) + utcMinuteOffset;
  }
}
function minuteToUTC(minStr) {
  const m = parseInt(minStr, 10);
  if (!Number.isFinite(m)) return t(lang, "unconfirmed");
  return new Date(m * 6e4).toISOString().slice(0, 16).replace("T", " ") + " UTC";
}
function encoded(method, args = []) {
  return transactions2.serialize([calldata2.encode(calldata2.makeCalldataObject(method, args, {})), false]);
}
async function rpcCall(method, params = []) {
  for (let attempt = 0; attempt < 6; attempt++) {
    let res;
    try {
      res = await fetch(RPC_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
        signal: AbortSignal.timeout(6e4)
      });
    } catch {
      await sleep(Math.min(5e3 * (attempt + 1), 3e4));
      continue;
    }
    if (!res.ok) {
      await sleep(Math.min(5e3 * (attempt + 1), 3e4));
      continue;
    }
    let body;
    try {
      body = await res.json();
    } catch {
      await sleep(Math.min(5e3 * (attempt + 1), 3e4));
      continue;
    }
    if (body.error) throw new Error(body.error.message || JSON.stringify(body.error));
    return body.result;
  }
  throw new Error("RPC_RETRY_EXHAUSTED");
}
async function readFinal(functionName, args = []) {
  const result = await rpcCall("gen_call", [{
    type: "read",
    to: CONTRACT_ADDRESS,
    from: "0x0000000000000000000000000000000000000000",
    data: encoded(functionName, args),
    transaction_hash_variant: "latest-final"
  }]);
  if (result && typeof result === "object" && result.status && result.status.code !== 0) {
    throw new Error(result.status.message);
  }
  const hex = typeof result === "string" ? result : result?.data;
  if (typeof hex !== "string") throw new Error("INVALID_READ_RESULT");
  const plain = hex.startsWith("0x") ? hex.slice(2) : hex;
  const value = calldata2.decode(Uint8Array.from(plain.match(/../g) || [], (x) => parseInt(x, 16)));
  return { value, finalized: true, readAt: (/* @__PURE__ */ new Date()).toISOString() };
}
async function readJson(functionName, args = []) {
  const r = await readFinal(functionName, args);
  return { data: r.value === "" ? null : JSON.parse(r.value), finalized: r.finalized, readAt: r.readAt };
}
async function refreshSnapshot() {
  if (readingBack) return;
  readingBack = true;
  renderStatus();
  try {
    const roomR = await readJson("get_room_state", []);
    const galleryR = await readJson("get_gallery", []);
    const roundId = currentRoundId || roomR.data?.current_round_id || "";
    const roundR = roundId ? await readJson("get_round", [roundId]) : null;
    const galleryRounds = {};
    let finalized = roomR.finalized && galleryR.finalized && (roundR ? roundR.finalized : true);
    for (const e of galleryR.data?.entries || []) {
      try {
        const rr = await readJson("get_round", [e.round_id]);
        galleryRounds[e.round_id] = rr.data;
        finalized = finalized && rr.finalized;
      } catch {
      }
    }
    let statsR = null;
    if (wallet?.address) {
      try {
        statsR = await readJson("get_player_stats", [wallet.address.toLowerCase()]);
        finalized = finalized && statsR.finalized;
      } catch {
        statsR = null;
      }
    }
    snapshot = {
      room: roomR.data,
      round: roundR ? roundR.data : null,
      gallery: galleryR.data,
      galleryRounds,
      stats: statsR ? statsR.data : null,
      finalized,
      readAt: roomR.readAt,
      readBackAt: roomR.readAt
    };
    const fired = await maybeAutoReveal();
    if (fired) setTimeout(() => refreshSnapshot(), 5e3);
  } catch (error) {
    setNotice(`${t(lang, "txError")} (${error.message})`, "error");
  } finally {
    readingBack = false;
    renderAll();
  }
}
async function maybeAutoReveal() {
  if (!snapshot?.round || !vault) return false;
  const r = snapshot.round;
  if (r.status !== "GUESSING" || vault.roundId !== r.round_id) return false;
  const norm = normalizeConcept(vault.concept);
  const hit = (r.guesses || []).find((g) => g.normalized_guess === norm);
  if (hit && !autoRevealFired[r.round_id]) {
    autoRevealFired[r.round_id] = true;
    setNotice(t(lang, "autoTriggerBanner"), "info");
    await runWrite(
      t(lang, "revealNow"),
      "reveal_and_auto_settle",
      [r.round_id, norm, vault.salt],
      0n,
      true
    );
    return true;
  }
  try {
    const nowMin = await utcMinuteNow();
    if (!hit && r.reveal_deadline_minute && nowMin > parseInt(r.reveal_deadline_minute, 10) && !autoRevealFired[r.round_id + ":timeout"]) {
      autoRevealFired[r.round_id + ":timeout"] = true;
      await runWrite(
        t(lang, "revealNow"),
        "reveal_and_auto_settle",
        [r.round_id, norm, vault.salt],
        0n,
        true
      );
      return true;
    }
  } catch {
  }
  return false;
}
function envelope(sender, to, data) {
  const entry = chain.consensusMainContract.abi.find(
    (x) => x.type === "function" && x.name === "addTransaction"
  );
  const args = [sender, to, 5, 3, data];
  if (entry.inputs.length === 6) args.push(BigInt(Math.floor(Date.now() / 1e3) + 3600));
  return encodeFunctionData({ abi: [entry], functionName: "addTransaction", args });
}
async function waitFinalized(hash2, timeoutMs = 15 * 60 * 1e3) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const receipt = await rpcCall("eth_getTransactionByHash", [hash2]);
    if (receipt?.status === "FINALIZED") return receipt;
    await sleep(6e3);
  }
  return null;
}
async function ensureTempFunded(minWei) {
  if (!tempAccount) tempAccount = createAccount();
  const bal = BigInt(await rpcCall("eth_getBalance", [tempAccount.address, "latest"]));
  if (bal < BigInt(minWei) + GEN) {
    await rpcCall("sim_fundAccount", [tempAccount.address, 100 * 10 ** 18]);
  }
  return tempAccount;
}
async function sendWrite(method, args, valueWei = 0n) {
  if (!tempAccount) throw new Error("ENABLE_TEMPORARY_TEST_ACCOUNT");
  const data = transactions2.serialize([
    calldata2.encode(calldata2.makeCalldataObject(method, args, {})),
    false
  ]);
  const nonce = await rpcCall("eth_getTransactionCount", [tempAccount.address, "latest"]);
  const serialized = await tempAccount.signTransaction({
    chainId: CHAIN_ID,
    type: "legacy",
    to: chain.consensusMainContract.address,
    data: envelope(tempAccount.address, CONTRACT_ADDRESS, data),
    nonce: Number(BigInt(nonce)),
    gas: 20000000n,
    gasPrice: 0n,
    value: BigInt(valueWei)
  });
  return rpcCall("eth_sendRawTransaction", [serialized]);
}
async function runWrite(label, method, args, valueWei = 0n, quiet = false) {
  if (!tempAccount) {
    setNotice(t(lang, "needTempSigner"), "error");
    return null;
  }
  try {
    await ensureTempFunded(valueWei);
  } catch (e) {
    setNotice(`${t(lang, "txError")} (${e.message})`, "error");
    return null;
  }
  if (!quiet) setNotice(`${t(lang, "txSubmitted")}: ${label}\u2026`, "info");
  let hash2;
  try {
    hash2 = await sendWrite(method, args, valueWei);
  } catch (error) {
    setNotice(`${t(lang, "txError")} (${error.message})`, "error");
    return null;
  }
  setNotice(`${t(lang, "txSubmitted")}: ${String(hash2).slice(0, 18)}\u2026 \u2014 ${t(lang, "readingBack")}`, "info");
  const receipt = await waitFinalized(hash2);
  if (!receipt) {
    setNotice(`${t(lang, "txError")} (FINALIZED timeout ${String(hash2).slice(0, 18)}\u2026)`, "error");
    return null;
  }
  const leaders = receipt.consensus_data?.leader_receipt;
  const leader = Array.isArray(leaders) ? leaders.find((x) => x.mode === "leader") || leaders[0] : leaders;
  if (receipt.result_name !== "MAJORITY_AGREE" || leader?.execution_result !== "SUCCESS") {
    setNotice(`${t(lang, "txFailed")}: ${receipt.result_name}/${leader?.execution_result}`, "error");
    return null;
  }
  setNotice(`${t(lang, "txFinalized")}: ${String(hash2).slice(0, 18)}\u2026`, "ok");
  await refreshSnapshot();
  return receipt;
}
async function connectInjected() {
  const provider = window.okxwallet || window.ethereum;
  if (!provider) {
    setNotice(t(lang, "noWallet"), "error");
    return;
  }
  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const chainIdHex = await provider.request({ method: "eth_chainId" });
    if (parseInt(chainIdHex, 16) !== CHAIN_ID) {
      setNotice(t(lang, "wrongNetwork"), "error");
      return;
    }
    wallet = {
      kind: "injected",
      address: (accounts[0] || "").toLowerCase(),
      label: `${window.okxwallet ? "OKX Wallet" : "Injected EVM Wallet"} ${(accounts[0] || "").slice(0, 6)}\u2026${(accounts[0] || "").slice(-4)}`
    };
    renderWallet();
    renderAll();
    refreshSnapshot();
  } catch (error) {
    setNotice(`${t(lang, "txError")} (${error.message})`, "error");
  }
}
async function useTempAccount() {
  if (!tempAccount) tempAccount = createAccount();
  wallet = {
    kind: "temp",
    address: tempAccount.address.toLowerCase(),
    label: `${tempAccount.address.slice(0, 6)}\u2026${tempAccount.address.slice(-4)} (${t(lang, "walletTemp")})`
  };
  renderWallet();
  renderAll();
  refreshSnapshot();
}
function disconnectWallet() {
  wallet = null;
  renderWallet();
  renderAll();
}
var canvas;
var ctx;
var drawing = false;
var lastPt = null;
var brushColor = INK_COLORS[0];
var brushSize = 6;
var currentImageBytes = null;
var currentImageB64 = "";
var currentImageSha = "";
var presetLoaded = null;
var canvasContent = "blank";
var demoOriginal = null;
function initCanvas() {
  canvas = $("#draw-canvas");
  ctx = canvas.getContext("2d");
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  canvasContent = "blank";
  demoOriginal = null;
  const pos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_SIZE / rect.width),
      y: (e.clientY - rect.top) * (CANVAS_SIZE / rect.height)
    };
  };
  canvas.addEventListener("pointerdown", (e) => {
    if (canvas.dataset.locked === "1") return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    if (canvasContent === "demo") {
      canvasContent = "drawn";
      demoOriginal = null;
      presetLoaded = null;
    } else if (canvasContent === "blank") {
      canvasContent = "drawn";
    }
    drawing = true;
    lastPt = pos(e);
    dot(lastPt);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(lastPt.x, lastPt.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPt = p;
  });
  const endStroke = async (e) => {
    if (!drawing) return;
    drawing = false;
    lastPt = null;
    await updateExport();
  };
  canvas.addEventListener("pointerup", endStroke);
  canvas.addEventListener("pointercancel", endStroke);
}
function dot(p) {
  ctx.fillStyle = brushColor;
  ctx.beginPath();
  ctx.arc(p.x, p.y, brushSize / 2, 0, Math.PI * 2);
  ctx.fill();
}
function clearCanvas() {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  presetLoaded = null;
  canvasContent = "blank";
  demoOriginal = null;
  updateExport();
}
function canvasToBlob() {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
async function updateExport() {
  if (canvasContent === "demo" && demoOriginal) {
    currentImageBytes = b64decode(demoOriginal.b64);
    currentImageB64 = demoOriginal.b64;
    currentImageSha = demoOriginal.sha;
    renderCanvasMeta();
    return;
  }
  const blob = await canvasToBlob();
  const buf = new Uint8Array(await blob.arrayBuffer());
  currentImageBytes = buf;
  currentImageB64 = b64encode(buf);
  currentImageSha = await sha256Hex(buf);
  renderCanvasMeta();
}
function renderCanvasMeta() {
  const preset = $("#canvas-preset");
  if (canvasContent === "blank") {
    $("#image-sha").textContent = t(lang, "unconfirmed");
    $("#image-bytes").textContent = "\u2014";
    $("#b64-size").textContent = "\u2014";
    if (preset) preset.textContent = t(lang, "canvasPresetBlank");
    return;
  }
  if (canvasContent === "demo" && demoOriginal) {
    $("#image-sha").textContent = demoOriginal.sha;
    $("#image-bytes").textContent = String(demoOriginal.bytes);
    $("#b64-size").textContent = String(demoOriginal.b64.length);
    if (preset) preset.textContent = `${t(lang, "canvasPresetDemo")} \xB7 ${demoOriginal.id}`;
    return;
  }
  $("#image-sha").textContent = currentImageSha || t(lang, "unconfirmed");
  $("#image-bytes").textContent = currentImageBytes ? String(currentImageBytes.length) : "\u2014";
  $("#b64-size").textContent = currentImageB64 ? String(currentImageB64.length) : "\u2014";
  if (preset) preset.textContent = t(lang, "canvasPresetDrawn");
}
var DEMO_CASES = [
  {
    id: "CASE-1",
    file: "bicycle.b64",
    concept: "bicycle",
    sha: "3aefeb2ef18da01f9c14d74340d94c9076201b20f2d2fadfeea72bb829527e14",
    labelKey: "demoCase1"
  },
  {
    id: "CASE-2",
    file: "lighthouse-vague.b64",
    concept: "lighthouse",
    sha: "7a0fd68a508352df8a689d2f4f7bbdeee6a1f27292033bed372dd602cee108d1",
    labelKey: "demoCase2"
  },
  {
    id: "CASE-3",
    file: "volcano-text.b64",
    concept: "volcano",
    sha: "d0da6341b39ca4d868d1f75bb2fbbb525c050a007008ff95881dddbf7c59c666",
    labelKey: "demoCase3"
  },
  {
    id: "CASE-4",
    file: "crank.b64",
    concept: "crank",
    sha: "e2bb96fcbb14606c63f77e853c59e160ccd4d196081cd8729e0b95747a53a546",
    labelKey: "demoCase4"
  }
];
async function loadDemoCase(c) {
  try {
    const res = await fetch(`dist/assets/${c.file}`);
    if (!res.ok) throw new Error("DEMO_ASSET_MISSING");
    const b64 = (await res.text()).trim();
    const bytes = b64decode(b64);
    const sha = await sha256Hex(bytes);
    if (sha !== c.sha) {
      setNotice(t(lang, "demoShaMismatch"), "error");
      return;
    }
    const blob = new Blob([bytes], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    URL.revokeObjectURL(url);
    presetLoaded = c.id;
    canvasContent = "demo";
    demoOriginal = { id: c.id, sha: c.sha, bytes: bytes.length, b64 };
    await updateExport();
    setNotice(`${t(lang, "demoLoaded")} \u2014 ${t(lang, "demoShaMatch")}`, "ok");
  } catch (e) {
    setNotice(`${t(lang, "txError")} (${e.message})`, "error");
  }
}
function setNotice(msg, kind) {
  const n = $("#notice");
  if (!n) return;
  n.textContent = msg;
  n.dataset.kind = kind || "info";
}
function renderStatus() {
  const m = $("#readback-marker");
  if (snapshot?.finalized) {
    m.textContent = `\u2713 Read from FINALIZED Studionet state \xB7 ${snapshot.readBackAt}`;
    m.classList.add("ok");
  } else {
    m.textContent = t(lang, "readbackPending");
    m.classList.remove("ok");
  }
  $("#last-readback").textContent = snapshot?.finalized ? snapshot.readBackAt : t(lang, "neverReadBack");
  $("#offline-banner").hidden = readbackOk();
}
function renderWallet() {
  const cap = $("#wallet-capsule");
  if (!wallet) {
    cap.textContent = t(lang, "unconfirmed");
  } else {
    cap.textContent = wallet.label;
  }
  $$(".signer-addr").forEach((el) => {
    el.textContent = tempAccount ? tempAccount.address.toLowerCase() : t(lang, "walletNotCreated");
  });
  $("#btn-temp").disabled = !!tempAccount;
}
function applyI18n() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  $$("[data-i18n]").forEach((el) => {
    el.textContent = t(lang, el.dataset.i18n);
  });
  $$("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(lang, el.dataset.i18nPh);
  });
  $("#lang-toggle").textContent = t(lang, "langToggle");
  $("#static-toggle").textContent = `${t(lang, "staticMode")}: ${staticMode ? "ON" : "OFF"}`;
}
function verdictStampHTML(round) {
  if (!round || round.status !== "SETTLED" || !round.drawing_verdict) {
    return `<div class="stamp unconfirmed"><span>${esc(t(lang, "verdictUnconfirmed"))}</span></div>`;
  }
  const tone = verdictTone(round);
  const vc = verdictClass(round);
  const label = vc === "FULL_MATCH_SETTLED" ? t(lang, "verdictFull") : vc === "PARTIAL_UNGUESSED_ZERO_PAYOUT" ? t(lang, "verdictPartialUnguessed") : vc === "PARTIAL_WEAK_HALF_ROLLOVER" ? t(lang, "verdictWeak") : vc === "PARTIAL_WEAK_ZERO_PAYOUT" ? t(lang, "verdictWeakUnguessed") : t(lang, "verdictMiss");
  return `<div class="stamp ${tone}"><span class="stamp-verdict">${esc(round.drawing_verdict)}</span><span class="stamp-label">${esc(label)}</span></div>`;
}
function potSplitHTML(round) {
  if (!round || round.status !== "SETTLED") {
    return `<div class="splitbar unconfirmed"><span>${esc(t(lang, "unconfirmed"))}</span></div>`;
  }
  const total = BigInt(round.total_pot_wei || "0");
  const drawer = BigInt(round.drawer_payout_wei || "0");
  const guessers = Object.values(round.guesser_payouts || {}).reduce((a, v) => a + BigInt(v || "0"), 0n);
  const roll = BigInt(round.next_rollover_pool_wei || "0");
  const pct = (v) => total > 0n ? Number(v * 10000n / total) / 100 : 0;
  return `<div class="splitbar" role="img" aria-label="${esc(t(lang, "potSplitBar"))}">
    <div class="split-drawer" style="width:${pct(drawer)}%"></div>
    <div class="split-guesser" style="width:${pct(guessers)}%"></div>
    <div class="split-roll" style="width:${pct(roll)}%"></div></div>
  <div class="split-legend"><span>${esc(t(lang, "drawerShare"))} ${esc(fmtGen(drawer.toString()))}</span><span>${esc(t(lang, "guesserShare"))} ${esc(fmtGen(guessers.toString()))}</span><span>${esc(t(lang, "rolloverShare"))} ${esc(fmtGen(roll.toString()))}</span></div>`;
}
function renderAll() {
  applyI18n();
  renderStatus();
  renderWallet();
  renderRoom();
  renderConsole();
  renderCanvasState();
  renderGuesses();
  renderPayouts();
  renderGallery();
  renderEvidence();
  renderMachine();
}
function renderRoom() {
  const live = readbackOk();
  const room = live ? snapshot.room : null;
  $("#pool-rollover").textContent = room ? fmtGen(room.rollover_pool_wei) : t(lang, "dashUnconfirmed");
  $("#round-count").textContent = room ? String(room.round_count) : t(lang, "dashUnconfirmed");
  const rid = live ? snapshot.round?.round_id || room?.current_round_id || "" : "";
  $("#round-id-display").textContent = rid || t(lang, "unconfirmed");
  if (rid && !currentRoundId) {
    currentRoundId = rid;
    $("#round-id").value = rid;
  }
  const stage = live ? snapshot.round?.status || "" : "";
  const stages = ["DRAWING", "GUESSING", "JUDGED", "SETTLED"];
  $("#pipeline").innerHTML = stages.map((s, i) => {
    const active = stage === s;
    const label = live ? `${i + 1}. ${s}` : `${i + 1}. ${t(lang, "unconfirmed")}`;
    return `<span class="pipe-step${active ? " active" : ""}">${esc(label)}</span>`;
  }).join('<span class="pipe-arrow">\u2192</span>');
  const pot = live ? snapshot.round : null;
  $("#pool-current").textContent = pot?.total_pot_wei ? fmtGen(pot.total_pot_wei) : t(lang, "dashUnconfirmed");
}
function renderConsole() {
  const r = readbackOk() ? snapshot.round : null;
  const u = () => t(lang, "unconfirmed");
  $("#c-status").textContent = r ? r.status : u();
  $("#c-commit").textContent = r?.concept_commit || u();
  $("#c-category").textContent = r?.category_hint || u();
  $("#c-draw-deadline").textContent = r?.drawing_deadline_minute ? minuteToUTC(r.drawing_deadline_minute) : u();
  $("#c-reveal-deadline").textContent = r?.reveal_deadline_minute ? minuteToUTC(r.reveal_deadline_minute) : u();
  $("#c-challenge-deadline").textContent = r?.challenge_deadline_minute ? minuteToUTC(r.challenge_deadline_minute) : u();
  $("#c-concept").textContent = r?.revealed_concept || t(lang, "hidden");
  $("#c-cheat").textContent = r?.has_written_text_cheat || u();
  $("#c-tier").textContent = r?.visual_depiction_tier || u();
  const localCommit = $("#vault-commit");
  if (vault) {
    localCommit.textContent = t(lang, "conceptCommitLocal");
  } else {
    localCommit.textContent = "\u2014";
  }
  $("#vault-concept").textContent = vault ? vault.concept : "\u2014";
  $("#vault-salt").textContent = vault ? vault.salt : "\u2014";
  $("#vault-round").textContent = vault ? vault.roundId : "\u2014";
  updateTimeoutButton();
}
function renderCanvasState() {
  const r = readbackOk() ? snapshot.round : null;
  const locked = !!r && r.status !== "DRAWING";
  if (canvas) canvas.dataset.locked = locked ? "1" : "0";
  $("#canvas-state").textContent = !readbackOk() ? t(lang, "unconfirmed") : locked ? t(lang, "canvasReadonly") : t(lang, "canvasActive");
  renderCanvasMeta();
  const stage = $("#reveal-stage");
  if (!r) {
    stage.innerHTML = `<p class="reveal-wait">${esc(t(lang, "revealWaiting"))}</p>${verdictStampHTML(null)}`;
    return;
  }
  const checks = [
    [t(lang, "commitMatch"), r.status === "JUDGED" || r.status === "SETTLED" ? "\u2713" : t(lang, "unconfirmed")],
    [t(lang, "imageMatch"), r.status === "JUDGED" || r.status === "SETTLED" ? "\u2713" : t(lang, "unconfirmed")],
    [t(lang, "cheatGate"), r.has_written_text_cheat ? r.has_written_text_cheat === "NO" ? "PASSED (NO)" : "FAILED (YES)" : t(lang, "unconfirmed")]
  ];
  stage.innerHTML = `
    <dl class="checks">${checks.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd class="mono">${esc(v)}</dd></div>`).join("")}</dl>
    <div class="stamp-wrap${r.status === "SETTLED" && !staticMode ? " animate-in" : ""}">${verdictStampHTML(r)}</div>
    <dl class="reveal-facts">
      <div><dt>${esc(t(lang, "verdictLabel"))}</dt><dd class="mono">${esc(r.drawing_verdict || t(lang, "unconfirmed"))}</dd></div>
      <div><dt>${esc(t(lang, "reasonLabel"))}</dt><dd class="mono">${esc(r.reason_code || t(lang, "pendingReadback"))}</dd></div>
      <div><dt>${esc(t(lang, "fastestGuesser"))}</dt><dd class="mono">${esc(r.fastest_guesser ? shortAddr(r.fastest_guesser) : t(lang, "unconfirmed"))}</dd></div>
    </dl>`;
}
function renderGuesses() {
  const box = $("#guess-stream");
  const r = readbackOk() ? snapshot.round : null;
  if (!r) {
    box.innerHTML = `<p class="empty">${esc(t(lang, "unconfirmedLong"))}</p>`;
    return;
  }
  const guesses = [...r.guesses || []].sort((a, b) => a.seq_no - b.seq_no);
  if (!guesses.length) {
    box.innerHTML = `<p class="empty">${esc(t(lang, "noGuesses"))}</p>`;
    return;
  }
  box.innerHTML = guesses.map((g) => {
    const badge = !g.verdict ? t(lang, "guessPending") : g.verdict === "GUESS_CORRECT" ? t(lang, "guessCorrect") : t(lang, "guessWrong");
    const cls = !g.verdict ? "unconfirmed" : g.verdict === "GUESS_CORRECT" ? "correct" : "wrong";
    return `<div class="guess"><span class="mono">#${String(g.seq_no).padStart(2, "0")}</span>
      <span class="mono">${esc(shortAddr(g.address))}</span>
      <span class="guess-text">${esc(g.normalized_guess)}</span>
      <span class="guess-badge ${cls}">${esc(badge)}</span>
      <span class="mono guess-stake">${esc(fmtGen(g.stake_wei))}</span></div>`;
  }).join("");
  $("#guess-count").textContent = String(guesses.length);
}
function renderPayouts() {
  const r = readbackOk() ? snapshot.round : null;
  const room = readbackOk() ? snapshot.room : null;
  const u = () => t(lang, "dashUnconfirmed");
  $("#p-drawer").textContent = r?.status === "SETTLED" ? fmtGen(r.drawer_payout_wei) : u();
  const guessTotal = r?.status === "SETTLED" ? Object.values(r.guesser_payouts || {}).reduce((a, v) => a + BigInt(v || "0"), 0n).toString() : null;
  $("#p-guessers").textContent = guessTotal !== null ? fmtGen(guessTotal) : u();
  $("#p-rollover").textContent = r?.status === "SETTLED" ? fmtGen(r.next_rollover_pool_wei) : room ? fmtGen(room.rollover_pool_wei) : u();
  $("#p-total").textContent = r?.status === "SETTLED" ? fmtGen(r.total_pot_wei) : u();
  $("#p-fastest").textContent = r?.status === "SETTLED" ? r.fastest_guesser ? shortAddr(r.fastest_guesser) : "\u2014" : u();
  const stats = readbackOk() ? snapshot.stats : null;
  $("#p-score").textContent = stats ? String(stats.score) : u();
  $("#p-balance").textContent = stats ? fmtGen(stats.balance_wei) : u();
  $("#split-wrap").innerHTML = potSplitHTML(r);
}
function galleryCard(e, detail) {
  if (!detail) {
    return `<article class="gcard tone-navy" data-round="${esc(e.round_id)}">
    <div class="gcard-head">
      <div class="thumb thumb-empty">${esc(t(lang, "unconfirmed"))}</div>
      <span class="gcard-meta"><span class="gcard-id mono">${esc(e.round_id)}</span>
      <span class="gcard-verdict mono">${esc(t(lang, "unconfirmed"))}</span></span>
    </div>
    <div class="gcard-body"><span>${esc(t(lang, "unconfirmedLong"))}</span></div>
  </article>`;
  }
  const tone = verdictTone(detail);
  const hasImage = !!detail.image_b64 && !!detail.image_sha256;
  const thumb = hasImage ? `<img class="thumb" alt="drawing ${esc(e.round_id)}" src="data:image/png;base64,${esc(detail.image_b64)}">` : `<div class="thumb thumb-empty">${esc(t(lang, "noImage"))}</div>`;
  const open = expandedGallery.has(e.round_id);
  return `<article class="gcard tone-${tone}" data-round="${esc(e.round_id)}">
    <button type="button" class="gcard-head" data-expand="${esc(e.round_id)}" aria-expanded="${open}">
      ${thumb}
      <span class="gcard-meta"><span class="gcard-id mono">${esc(e.round_id)} \xB7 ${esc(detail.revealed_concept || "")}</span>
      <span class="gcard-verdict mono">${esc(detail.drawing_verdict || t(lang, "unconfirmed"))}</span>
      <span class="gcard-reason mono">${esc(detail.reason_code || "")}</span></span>
    </button>
    <div class="gcard-body">
      <div>${esc(t(lang, "fastestGuesser"))}: <span class="mono">${esc(detail.fastest_guesser ? shortAddr(detail.fastest_guesser) : "\u2014")}</span></div>
      ${potSplitHTML(detail)}
      <button type="button" class="btn secondary" data-export="${esc(e.round_id)}"
        ${detail.status === "SETTLED" && snapshot?.finalized ? "" : "disabled"}>${esc(t(lang, "exportDossier"))}</button>
      <span class="hint">${esc(t(lang, "exportDisabledNote"))}</span>
    </div>
    ${open && detail ? `<div class="gcard-detail"><h4>${esc(t(lang, "roundDetail"))}</h4>
      <dl class="kv">
        <div><dt>concept_commit</dt><dd class="mono">${esc(detail.concept_commit || "")}</dd></div>
        <div><dt>image_sha256</dt><dd class="mono">${esc(detail.image_sha256 || "")}</dd></div>
        <div><dt>image_byte_len</dt><dd class="mono">${esc(String(detail.image_byte_len ?? ""))}</dd></div>
        <div><dt>revealed_concept</dt><dd class="mono">${esc(detail.revealed_concept || "")}</dd></div>
        <div><dt>has_written_text_cheat</dt><dd class="mono">${esc(detail.has_written_text_cheat || "")}</dd></div>
        <div><dt>visual_depiction_tier</dt><dd class="mono">${esc(detail.visual_depiction_tier || "")}</dd></div>
        <div><dt>reason_code</dt><dd class="mono">${esc(detail.reason_code || "")}</dd></div>
        <div><dt>drawer</dt><dd class="mono">${esc(detail.drawer || "")}</dd></div>
        <div><dt>guesses</dt><dd class="mono">${esc(JSON.stringify(detail.guesses || []))}</dd></div>
        <div><dt>challenges</dt><dd class="mono">${esc(JSON.stringify(detail.challenges || []))}</dd></div>
        <div><dt>settled_by</dt><dd class="mono">${esc(detail.settled_by || "")}</dd></div>
      </dl></div>` : ""}
  </article>`;
}
function renderGallery() {
  const box = $("#gallery");
  if (!readbackOk()) {
    box.innerHTML = `<p class="empty">${esc(t(lang, "unconfirmedLong"))}</p>`;
    return;
  }
  const entries = snapshot.gallery?.entries || [];
  if (!entries.length) {
    box.innerHTML = `<p class="empty">${esc(t(lang, "noGallery"))}</p>`;
    return;
  }
  box.innerHTML = entries.map((e) => galleryCard(e, snapshot.galleryRounds[e.round_id] || null)).join("");
}
function renderEvidence() {
  const box = $("#evidence");
  if (!readbackOk()) {
    box.innerHTML = `<p class="empty">${esc(t(lang, "unconfirmedLong"))}</p>`;
    return;
  }
  const txRows = EVIDENCE_DATA.txs.map((tx) => `<tr><td>${esc(tx.label)}</td><td class="mono"><a href="${EXPLORER}/tx/${esc(tx.hash)}" target="_blank" rel="noreferrer">${esc(tx.hash.slice(0, 18))}\u2026</a></td></tr>`).join("");
  const roundRows = (snapshot.gallery?.entries || []).map((e) => {
    const d = snapshot.galleryRounds[e.round_id];
    if (!d) {
      return `<tr><td class="mono">${esc(e.round_id)}</td><td colspan="7">${esc(t(lang, "unconfirmed"))}</td></tr>`;
    }
    const guessers = Object.entries(d.guesser_payouts || {}).map(([a, v]) => `${shortAddr(a)} ${fmtGen(v)}`).join(", ") || "\u2014";
    return `<tr><td class="mono">${esc(d.round_id)}</td><td class="mono">${esc(d.revealed_concept || "")}</td><td class="mono">${esc(d.drawing_verdict || t(lang, "unconfirmed"))}</td><td class="mono">${esc(d.reason_code || "")}</td><td>${esc(fmtGenExact(d.total_pot_wei))}</td><td>${esc(fmtGen(d.drawer_payout_wei))}</td><td>${esc(guessers)}</td><td>${esc(fmtGen(d.next_rollover_pool_wei))}</td></tr>`;
  }).join("");
  box.innerHTML = `
    <h3>${esc(t(lang, "claimsTitle"))}</h3>
    <ol>${[1, 2, 3, 4, 5].map((i) => `<li>${esc(t(lang, "claim" + i))}</li>`).join("")}</ol>
    <h3>${esc(t(lang, "anchorsTitle"))}</h3>
    <ol>${[1, 2, 3].map((i) => `<li>${esc(t(lang, "anchor" + i))}</li>`).join("")}</ol>
    <dl class="kv">
      <div><dt>${esc(t(lang, "contract"))}</dt><dd class="mono"><a href="${EXPLORER}/address/${CONTRACT_ADDRESS}" target="_blank" rel="noreferrer">${CONTRACT_ADDRESS}</a></dd></div>
      <div><dt>${esc(t(lang, "sourceSha"))}</dt><dd class="mono">${SOURCE_SHA256}</dd></div>
      <div><dt>Deploy tx</dt><dd class="mono"><a href="${EXPLORER}/tx/${EVIDENCE_DATA.deploy_tx}" target="_blank" rel="noreferrer">${EVIDENCE_DATA.deploy_tx}</a></dd></div>
    </dl>
    <h3>${esc(t(lang, "txTableTitle"))} (${EVIDENCE_DATA.tx_count})</h3>
    <div class="table-wrap"><table class="tx-table"><thead><tr><th>Label</th><th>Tx hash</th></tr></thead><tbody>${txRows}</tbody></table></div>
    <h3>${esc(t(lang, "advTitle"))}</h3>
    <div class="table-wrap"><table class="tx-table"><thead><tr><th>Round</th><th>Concept</th><th>Verdict</th><th>Reason</th><th>Pot</th><th>Drawer</th><th>Guessers</th><th>Rollover</th></tr></thead><tbody>${roundRows}</tbody></table></div>
    <p class="adv-note">R3 volcano text-cheat MISS \xB7 R4 crank VISUAL_MISS \xB7 R5 challenge flip (wrong lock \u2192 corrected \u2192 MATCHES) \xB7 R6 failed challenge (wrong hash, deposit forfeited) \xB7 R7/R8 timeouts \xB7 R10 negative battery (7 rejected calls) \xB7 R2 deviation: jury returned MATCHES, not pre-registered WEAK \u2014 recorded as-is in evidence/EVIDENCE.md.</p>
    <h3>${esc(t(lang, "notProveTitle"))}</h3>
    <ol>${[1, 2, 3].map((i) => `<li>${esc(t(lang, "notProve" + i))}</li>`).join("")}</ol>`;
}
function renderMachine() {
  const pre = $("#machine-view");
  if (view !== "machine") {
    pre.hidden = true;
    return;
  }
  pre.hidden = false;
  const lines = [];
  lines.push(`CONTRACT ....... ${CONTRACT_ADDRESS}`);
  lines.push(`SOURCE_SHA256 . ${SOURCE_SHA256}`);
  lines.push(`CHAIN_ID ...... ${CHAIN_ID}`);
  lines.push(`RPC ........... ${RPC_URL}`);
  if (!snapshot?.finalized) {
    lines.push(`READBACK ...... UNCONFIRMED`);
    lines.push(`STATUS ........ UNCONFIRMED`);
    lines.push(`VERDICT ....... UNCONFIRMED`);
    lines.push(`PAYOUTS ....... UNCONFIRMED`);
  } else {
    lines.push(`READBACK ...... FINALIZED @ ${snapshot.readBackAt}`);
    const r = snapshot.round || {};
    lines.push(`ROUND_ID ...... ${r.round_id || ""}`);
    lines.push(`STATUS ........ ${r.status || ""}`);
    lines.push(`CONCEPT_COMMIT  ${r.concept_commit || ""}`);
    lines.push(`IMAGE_SHA256 .. ${r.image_sha256 || ""}`);
    lines.push(`VERDICT ....... ${r.drawing_verdict || ""}`);
    lines.push(`REASON_CODE ... ${r.reason_code || ""}`);
    lines.push(`FASTEST ....... ${r.fastest_guesser || ""}`);
    lines.push(`DRAWER_PAYOUT . ${r.drawer_payout_wei || ""}`);
    lines.push(`TOTAL_POT ..... ${r.total_pot_wei || ""}`);
    lines.push(`ROLLOVER ...... ${snapshot.room?.rollover_pool_wei || ""}`);
    lines.push(`GALLERY_ENTRIES ${snapshot.gallery?.entries?.length ?? 0}`);
  }
  pre.textContent = lines.join("\n");
}
var timeoutCheckRunning = false;
async function updateTimeoutButton() {
  const btn = $("#btn-timeout");
  if (!btn) return;
  const r = readbackOk() ? snapshot.round : null;
  if (!r || r.status !== "DRAWING" && r.status !== "GUESSING") {
    btn.disabled = true;
    return;
  }
  if (timeoutCheckRunning) return;
  timeoutCheckRunning = true;
  try {
    const nowMin = await utcMinuteNow();
    const dl = r.status === "DRAWING" ? parseInt(r.drawing_deadline_minute, 10) : parseInt(r.reveal_deadline_minute, 10);
    btn.disabled = !(Number.isFinite(dl) && nowMin > dl);
  } catch {
    btn.disabled = true;
  }
  timeoutCheckRunning = false;
}
function exportRoundDossier(roundId) {
  const round = snapshot?.galleryRounds[roundId] || (snapshot?.round?.round_id === roundId ? snapshot.round : null);
  const dossier = buildDossier(round, snapshot ? { finalized: snapshot.finalized, contract_address: CONTRACT_ADDRESS, source_sha256: SOURCE_SHA256, readback_at: snapshot.readBackAt } : null);
  const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `sketchverdict-dossier-${roundId}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
async function onStartRound() {
  const roundId = $("#round-id").value.trim();
  const concept = normalizeConcept($("#concept").value);
  let salt = $("#salt").value.trim();
  if (!salt) {
    salt = Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("");
    $("#salt").value = salt;
  }
  if (!roundId || roundId.length > 48) {
    setNotice(t(lang, "invalidRoundId"), "error");
    return;
  }
  if (!concept) {
    setNotice(t(lang, "needConcept"), "error");
    return;
  }
  const category = $("#category").value.trim().slice(0, 40) || "GENERAL";
  const drawMin = Math.max(1, Math.min(1440, parseInt($("#draw-min").value, 10) || 5));
  const guessMin = Math.max(1, Math.min(1440, parseInt($("#guess-min").value, 10) || 10));
  const commit = await sha256Hex(new TextEncoder().encode(`${salt}|${concept}`));
  vault = { roundId, concept, salt };
  currentRoundId = roundId;
  renderConsole();
  await runWrite(t(lang, "startRound"), "start_round", [roundId, commit, category, drawMin, guessMin], 10n * GEN);
}
async function onSubmitDrawing() {
  const roundId = currentRoundId || $("#round-id").value.trim();
  if (!roundId) {
    setNotice(t(lang, "needRound"), "error");
    return;
  }
  await updateExport();
  if (!currentImageB64 || !currentImageSha) {
    setNotice(t(lang, "needDrawing"), "error");
    return;
  }
  await runWrite(t(lang, "submitDrawing"), "submit_drawing", [roundId, currentImageB64, currentImageSha], 0n);
}
async function onSubmitGuess() {
  const roundId = currentRoundId || $("#round-id").value.trim();
  const guess = normalizeConcept($("#guess-input").value);
  if (!roundId) {
    setNotice(t(lang, "needRound"), "error");
    return;
  }
  if (!guess) {
    setNotice(t(lang, "needGuess"), "error");
    return;
  }
  await runWrite(t(lang, "submitGuess"), "submit_guess", [roundId, guess], 5n * GEN);
}
async function onReveal() {
  const roundId = currentRoundId || $("#round-id").value.trim();
  if (!vault || vault.roundId !== roundId) {
    setNotice(t(lang, "needSalt"), "error");
    return;
  }
  await runWrite(
    t(lang, "revealNow"),
    "reveal_and_auto_settle",
    [roundId, normalizeConcept(vault.concept), vault.salt],
    0n
  );
}
async function onChallenge() {
  const roundId = currentRoundId || $("#round-id").value.trim();
  const hash2 = $("#challenge-hash").value.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(hash2)) {
    setNotice(t(lang, "needHash"), "error");
    return;
  }
  await runWrite(t(lang, "challengeBtn"), "challenge", [roundId, hash2], 5n * GEN);
}
async function onSettle() {
  const roundId = currentRoundId || $("#round-id").value.trim();
  if (!roundId) {
    setNotice(t(lang, "needRound"), "error");
    return;
  }
  await runWrite(t(lang, "settleBtn"), "settle", [roundId], 0n);
}
async function onTimeout() {
  const roundId = currentRoundId || $("#round-id").value.trim();
  if (!roundId) {
    setNotice(t(lang, "needRound"), "error");
    return;
  }
  await runWrite(t(lang, "timeoutRescue"), "trigger_timeout_auto_settle", [roundId], 0n);
}
async function onWithdraw() {
  await runWrite(t(lang, "withdraw"), "withdraw", [], 0n);
}
function bindEvents() {
  $("#lang-toggle").addEventListener("click", () => {
    lang = lang === "zh" ? "en" : "zh";
    localStorage.setItem("sv-lang", lang);
    renderAll();
  });
  $("#static-toggle").addEventListener("click", () => {
    staticMode = !staticMode;
    document.documentElement.classList.toggle("static-mode", staticMode);
    renderAll();
  });
  $("#btn-connect").addEventListener("click", connectInjected);
  $("#btn-temp").addEventListener("click", useTempAccount);
  $("#btn-disconnect").addEventListener("click", disconnectWallet);
  $("#btn-refresh").addEventListener("click", refreshSnapshot);
  $("#btn-gen-salt").addEventListener("click", () => {
    $("#salt").value = Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("");
  });
  $("#btn-start").addEventListener("click", onStartRound);
  $("#btn-draw").addEventListener("click", onSubmitDrawing);
  $("#btn-guess").addEventListener("click", onSubmitGuess);
  $("#btn-reveal").addEventListener("click", onReveal);
  $("#btn-challenge").addEventListener("click", onChallenge);
  $("#btn-settle").addEventListener("click", onSettle);
  $("#btn-timeout").addEventListener("click", onTimeout);
  $("#btn-withdraw").addEventListener("click", onWithdraw);
  $("#btn-clear").addEventListener("click", clearCanvas);
  $("#btn-eraser").addEventListener("click", () => {
    brushColor = PAPER;
    $$(".swatch").forEach((s) => s.classList.remove("active"));
    $("#btn-eraser").classList.add("active");
  });
  $$(".swatch").forEach((s) => s.addEventListener("click", () => {
    brushColor = s.dataset.color;
    $$(".swatch").forEach((x) => x.classList.remove("active"));
    $("#btn-eraser").classList.remove("active");
    s.classList.add("active");
  }));
  $$(".brush-size").forEach((b) => b.addEventListener("click", () => {
    brushSize = parseInt(b.dataset.size, 10);
    $$(".brush-size").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
  }));
  $$(".demo-btn").forEach((b) => b.addEventListener("click", () => {
    const c = DEMO_CASES.find((x) => x.id === b.dataset.case);
    if (c) loadDemoCase(c);
  }));
  $$(".deck-tab").forEach((b) => b.addEventListener("click", () => {
    galleryTab = b.dataset.deck;
    $$(".deck-tab").forEach((x) => x.classList.toggle("active", x === b));
    $("#gallery-wrap").hidden = galleryTab !== "gallery";
    $("#evidence-wrap").hidden = galleryTab !== "evidence";
  }));
  $$(".mobile-tab").forEach((b) => b.addEventListener("click", () => {
    $$(".mobile-tab").forEach((x) => x.classList.toggle("active", x === b));
    const tab = b.dataset.mtab;
    $("#col-left").classList.toggle("mtab-hidden", tab !== "console" && tab !== "canvas");
    $("#col-centre").classList.toggle("mtab-hidden", tab !== "canvas");
    $("#col-right").classList.toggle("mtab-hidden", tab !== "guesses");
    $("#deck").classList.toggle("mtab-hidden", tab !== "gallery" && tab !== "evidence");
    if (tab === "gallery" || tab === "evidence") {
      galleryTab = tab;
      $$(".deck-tab").forEach((x) => x.classList.toggle("active", x.dataset.deck === tab));
      $("#gallery-wrap").hidden = tab !== "gallery";
      $("#evidence-wrap").hidden = tab !== "evidence";
    }
  }));
  $$(".view-pill button").forEach((b) => b.addEventListener("click", () => {
    view = b.dataset.view;
    $$(".view-pill button").forEach((x) => x.classList.toggle("active", x === b));
    $("#human-view").hidden = view !== "human";
    renderMachine();
  }));
  document.addEventListener("click", (e) => {
    const exp = e.target.closest("[data-expand]");
    if (exp) {
      const id = exp.dataset.expand;
      if (expandedGallery.has(id)) expandedGallery.delete(id);
      else expandedGallery.add(id);
      renderGallery();
      return;
    }
    const ex = e.target.closest("[data-export]");
    if (ex) {
      try {
        exportRoundDossier(ex.dataset.export);
      } catch (err) {
        setNotice(t(lang, "exportBlocked") + ` (${err.message})`, "error");
      }
    }
  });
  $("#round-id").addEventListener("change", (e) => {
    currentRoundId = e.target.value.trim();
    refreshSnapshot();
  });
  setInterval(() => {
    if (!document.hidden) refreshSnapshot();
  }, 3e4);
  setInterval(updateTimeoutButton, 15e3);
}
document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.toggle("static-mode", staticMode);
  $("#contract-link").href = `${EXPLORER}/address/${CONTRACT_ADDRESS}`;
  $("#contract-link-full").href = `${EXPLORER}/address/${CONTRACT_ADDRESS}`;
  initCanvas();
  bindEvents();
  updateExport();
  renderAll();
  refreshSnapshot();
});
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/utils.js:
@noble/curves/esm/abstract/modular.js:
@noble/curves/esm/abstract/curve.js:
@noble/curves/esm/abstract/weierstrass.js:
@noble/curves/esm/_shortw_utils.js:
@noble/curves/esm/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
