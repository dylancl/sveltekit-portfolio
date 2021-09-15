var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __require = typeof require !== "undefined" ? require : (x) => {
  throw new Error('Dynamic require of "' + x + '" is not supported');
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require3() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    if (error2 instanceof FetchBaseError) {
      throw error2;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error2 = new AbortError("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error2) {
                reject(error2);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error2) => {
        reject(error2);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error2) => {
          reject(error2);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error2) => {
          reject(error2);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error2) => {
              reject(error2);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error2) => {
              reject(error2);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error2) => {
          reject(error2);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, dataUriToBuffer$1, Readable, wm, Blob, fetchBlob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let buffer;
          if (element instanceof Buffer) {
            buffer = element;
          } else if (ArrayBuffer.isView(element)) {
            buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
          } else if (element instanceof ArrayBuffer) {
            buffer = Buffer.from(element);
          } else if (element instanceof Blob) {
            buffer = element;
          } else {
            buffer = Buffer.from(typeof element === "string" ? element : String(element));
          }
          size += buffer.length || buffer.size || 0;
          return buffer;
        });
        const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
        wm.set(this, {
          type: /[^\u0020-\u007E]/.test(type) ? "" : type,
          size,
          parts
        });
      }
      get size() {
        return wm.get(this).size;
      }
      get type() {
        return wm.get(this).type;
      }
      async text() {
        return Buffer.from(await this.arrayBuffer()).toString();
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of this.stream()) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        return Readable.from(read(wm.get(this).parts));
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = wm.get(this).parts.values();
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            blobParts.push(chunk);
            added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
            relativeStart = 0;
            if (added >= span) {
              break;
            }
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        Object.assign(wm.get(blob), { size: span, parts: blobParts });
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob;
    Blob$1 = fetchBlob;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (err) => {
            const error2 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
            this[INTERNALS$2].error = error2;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback) {
        for (const name of this.keys()) {
          callback(this.get(name), name);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status || 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal !== null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/vanta/dist/vanta.halo.min.js
var require_vanta_halo_min = __commonJS({
  "node_modules/vanta/dist/vanta.halo.min.js"(exports, module2) {
    init_shims();
    !function(e, t) {
      typeof exports == "object" && typeof module2 == "object" ? module2.exports = t() : typeof define == "function" && define.amd ? define([], t) : typeof exports == "object" ? exports._vantaEffect = t() : e._vantaEffect = t();
    }(typeof self != "undefined" ? self : exports, function() {
      return function(e) {
        var t = {};
        function n(i) {
          if (t[i])
            return t[i].exports;
          var o = t[i] = { i, l: false, exports: {} };
          return e[i].call(o.exports, o, o.exports, n), o.l = true, o.exports;
        }
        return n.m = e, n.c = t, n.d = function(e2, t2, i) {
          n.o(e2, t2) || Object.defineProperty(e2, t2, { enumerable: true, get: i });
        }, n.r = function(e2) {
          typeof Symbol != "undefined" && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
        }, n.t = function(e2, t2) {
          if (1 & t2 && (e2 = n(e2)), 8 & t2)
            return e2;
          if (4 & t2 && typeof e2 == "object" && e2 && e2.__esModule)
            return e2;
          var i = Object.create(null);
          if (n.r(i), Object.defineProperty(i, "default", { enumerable: true, value: e2 }), 2 & t2 && typeof e2 != "string")
            for (var o in e2)
              n.d(i, o, function(t3) {
                return e2[t3];
              }.bind(null, o));
          return i;
        }, n.n = function(e2) {
          var t2 = e2 && e2.__esModule ? function() {
            return e2.default;
          } : function() {
            return e2;
          };
          return n.d(t2, "a", t2), t2;
        }, n.o = function(e2, t2) {
          return Object.prototype.hasOwnProperty.call(e2, t2);
        }, n.p = "", n(n.s = 11);
      }([function(e, t, n) {
        "use strict";
        function i(e2, t2) {
          for (let n2 in t2)
            t2.hasOwnProperty(n2) && (e2[n2] = t2[n2]);
          return e2;
        }
        function o() {
          return typeof navigator != "undefined" ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 600 : null;
        }
        n.d(t, "c", function() {
          return i;
        }), n.d(t, "e", function() {
          return o;
        }), n.d(t, "i", function() {
          return s2;
        }), n.d(t, "h", function() {
          return r;
        }), n.d(t, "g", function() {
          return a;
        }), n.d(t, "f", function() {
          return c;
        }), n.d(t, "a", function() {
          return h;
        }), n.d(t, "b", function() {
          return l;
        }), n.d(t, "d", function() {
          return u;
        }), Number.prototype.clamp = function(e2, t2) {
          return Math.min(Math.max(this, e2), t2);
        };
        const s2 = (e2) => e2[Math.floor(Math.random() * e2.length)];
        function r(e2, t2) {
          return e2 == null && (e2 = 0), t2 == null && (t2 = 1), e2 + Math.random() * (t2 - e2);
        }
        function a(e2, t2) {
          return e2 == null && (e2 = 0), t2 == null && (t2 = 1), Math.floor(e2 + Math.random() * (t2 - e2 + 1));
        }
        const c = (e2) => document.querySelector(e2), h = (e2) => typeof e2 == "number" ? "#" + ("00000" + e2.toString(16)).slice(-6) : e2, l = (e2, t2 = 1) => {
          const n2 = h(e2), i2 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(n2), o2 = i2 ? { r: parseInt(i2[1], 16), g: parseInt(i2[2], 16), b: parseInt(i2[3], 16) } : null;
          return "rgba(" + o2.r + "," + o2.g + "," + o2.b + "," + t2 + ")";
        }, u = (e2) => 0.299 * e2.r + 0.587 * e2.g + 0.114 * e2.b;
      }, function(e, t, n) {
        "use strict";
        n.d(t, "a", function() {
          return r;
        });
        var i = n(0);
        const o = typeof window == "object";
        let s2 = o && window.THREE || {};
        o && !window.VANTA && (window.VANTA = {});
        const r = o && window.VANTA || {};
        r.register = (e2, t2) => r[e2] = (e3) => new t2(e3), r.version = "0.5.21";
        const a = function() {
          return Array.prototype.unshift.call(arguments, "[VANTA]"), console.error.apply(this, arguments);
        };
        r.VantaBase = class {
          constructor(e2 = {}) {
            if (!o)
              return false;
            r.current = this, this.windowMouseMoveWrapper = this.windowMouseMoveWrapper.bind(this), this.windowTouchWrapper = this.windowTouchWrapper.bind(this), this.windowGyroWrapper = this.windowGyroWrapper.bind(this), this.resize = this.resize.bind(this), this.animationLoop = this.animationLoop.bind(this), this.restart = this.restart.bind(this);
            const t2 = typeof this.getDefaultOptions == "function" ? this.getDefaultOptions() : this.defaultOptions;
            if (this.options = Object(i.c)({ mouseControls: true, touchControls: true, gyroControls: false, minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1 }, t2), (e2 instanceof HTMLElement || typeof e2 == "string") && (e2 = { el: e2 }), Object(i.c)(this.options, e2), this.options.THREE && (s2 = this.options.THREE), this.el = this.options.el, this.el == null)
              a('Instance needs "el" param!');
            else if (!(this.options.el instanceof HTMLElement)) {
              const e3 = this.el;
              if (this.el = Object(i.f)(e3), !this.el)
                return void a("Cannot find element", e3);
            }
            this.prepareEl(), this.initThree(), this.setSize();
            try {
              this.init();
            } catch (e3) {
              return a("Init error", e3), this.renderer && this.renderer.domElement && this.el.removeChild(this.renderer.domElement), void (this.options.backgroundColor && (console.log("[VANTA] Falling back to backgroundColor"), this.el.style.background = Object(i.a)(this.options.backgroundColor)));
            }
            this.initMouse(), this.resize(), this.animationLoop();
            const n2 = window.addEventListener;
            n2("resize", this.resize), window.requestAnimationFrame(this.resize), this.options.mouseControls && (n2("scroll", this.windowMouseMoveWrapper), n2("mousemove", this.windowMouseMoveWrapper)), this.options.touchControls && (n2("touchstart", this.windowTouchWrapper), n2("touchmove", this.windowTouchWrapper)), this.options.gyroControls && n2("deviceorientation", this.windowGyroWrapper);
          }
          setOptions(e2 = {}) {
            Object(i.c)(this.options, e2), this.triggerMouseMove();
          }
          prepareEl() {
            let e2, t2;
            if (typeof Node != "undefined" && Node.TEXT_NODE)
              for (e2 = 0; e2 < this.el.childNodes.length; e2++) {
                const t3 = this.el.childNodes[e2];
                if (t3.nodeType === Node.TEXT_NODE) {
                  const e3 = document.createElement("span");
                  e3.textContent = t3.textContent, t3.parentElement.insertBefore(e3, t3), t3.remove();
                }
              }
            for (e2 = 0; e2 < this.el.children.length; e2++)
              t2 = this.el.children[e2], getComputedStyle(t2).position === "static" && (t2.style.position = "relative"), getComputedStyle(t2).zIndex === "auto" && (t2.style.zIndex = 1);
            getComputedStyle(this.el).position === "static" && (this.el.style.position = "relative");
          }
          applyCanvasStyles(e2, t2 = {}) {
            Object(i.c)(e2.style, { position: "absolute", zIndex: 0, top: 0, left: 0, background: "" }), Object(i.c)(e2.style, t2), e2.classList.add("vanta-canvas");
          }
          initThree() {
            s2.WebGLRenderer ? (this.renderer = new s2.WebGLRenderer({ alpha: true, antialias: true }), this.el.appendChild(this.renderer.domElement), this.applyCanvasStyles(this.renderer.domElement), isNaN(this.options.backgroundAlpha) && (this.options.backgroundAlpha = 1), this.scene = new s2.Scene()) : console.warn("[VANTA] No THREE defined on window");
          }
          getCanvasElement() {
            return this.renderer ? this.renderer.domElement : this.p5renderer ? this.p5renderer.canvas : void 0;
          }
          getCanvasRect() {
            const e2 = this.getCanvasElement();
            return !!e2 && e2.getBoundingClientRect();
          }
          windowMouseMoveWrapper(e2) {
            const t2 = this.getCanvasRect();
            if (!t2)
              return false;
            const n2 = e2.clientX - t2.left, i2 = e2.clientY - t2.top;
            n2 >= 0 && i2 >= 0 && n2 <= t2.width && i2 <= t2.height && (this.mouseX = n2, this.mouseY = i2, this.options.mouseEase || this.triggerMouseMove(n2, i2));
          }
          windowTouchWrapper(e2) {
            const t2 = this.getCanvasRect();
            if (!t2)
              return false;
            if (e2.touches.length === 1) {
              const n2 = e2.touches[0].clientX - t2.left, i2 = e2.touches[0].clientY - t2.top;
              n2 >= 0 && i2 >= 0 && n2 <= t2.width && i2 <= t2.height && (this.mouseX = n2, this.mouseY = i2, this.options.mouseEase || this.triggerMouseMove(n2, i2));
            }
          }
          windowGyroWrapper(e2) {
            const t2 = this.getCanvasRect();
            if (!t2)
              return false;
            const n2 = Math.round(2 * e2.alpha) - t2.left, i2 = Math.round(2 * e2.beta) - t2.top;
            n2 >= 0 && i2 >= 0 && n2 <= t2.width && i2 <= t2.height && (this.mouseX = n2, this.mouseY = i2, this.options.mouseEase || this.triggerMouseMove(n2, i2));
          }
          triggerMouseMove(e2, t2) {
            e2 === void 0 && t2 === void 0 && (this.options.mouseEase ? (e2 = this.mouseEaseX, t2 = this.mouseEaseY) : (e2 = this.mouseX, t2 = this.mouseY)), this.uniforms && (this.uniforms.iMouse.value.x = e2 / this.scale, this.uniforms.iMouse.value.y = t2 / this.scale);
            const n2 = e2 / this.width, i2 = t2 / this.height;
            typeof this.onMouseMove == "function" && this.onMouseMove(n2, i2);
          }
          setSize() {
            this.scale || (this.scale = 1), Object(i.e)() && this.options.scaleMobile ? this.scale = this.options.scaleMobile : this.options.scale && (this.scale = this.options.scale), this.width = Math.max(this.el.offsetWidth, this.options.minWidth), this.height = Math.max(this.el.offsetHeight, this.options.minHeight);
          }
          initMouse() {
            (!this.mouseX && !this.mouseY || this.mouseX === this.options.minWidth / 2 && this.mouseY === this.options.minHeight / 2) && (this.mouseX = this.width / 2, this.mouseY = this.height / 2, this.triggerMouseMove(this.mouseX, this.mouseY));
          }
          resize() {
            this.setSize(), this.camera && (this.camera.aspect = this.width / this.height, typeof this.camera.updateProjectionMatrix == "function" && this.camera.updateProjectionMatrix()), this.renderer && (this.renderer.setSize(this.width, this.height), this.renderer.setPixelRatio(window.devicePixelRatio / this.scale)), typeof this.onResize == "function" && this.onResize();
          }
          isOnScreen() {
            const e2 = this.el.offsetHeight, t2 = this.el.getBoundingClientRect(), n2 = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop, i2 = t2.top + n2;
            return i2 - window.innerHeight <= n2 && n2 <= i2 + e2;
          }
          animationLoop() {
            return this.t || (this.t = 0), this.t += 1, this.t2 || (this.t2 = 0), this.t2 += this.options.speed || 1, this.uniforms && (this.uniforms.iTime.value = 0.016667 * this.t2), this.options.mouseEase && (this.mouseEaseX = this.mouseEaseX || this.mouseX || 0, this.mouseEaseY = this.mouseEaseY || this.mouseY || 0, Math.abs(this.mouseEaseX - this.mouseX) + Math.abs(this.mouseEaseY - this.mouseY) > 0.1 && (this.mouseEaseX += 0.05 * (this.mouseX - this.mouseEaseX), this.mouseEaseY += 0.05 * (this.mouseY - this.mouseEaseY), this.triggerMouseMove(this.mouseEaseX, this.mouseEaseY))), (this.isOnScreen() || this.options.forceAnimate) && (typeof this.onUpdate == "function" && this.onUpdate(), this.scene && this.camera && (this.renderer.render(this.scene, this.camera), this.renderer.setClearColor(this.options.backgroundColor, this.options.backgroundAlpha)), this.fps && this.fps.update && this.fps.update(), typeof this.afterRender == "function" && this.afterRender()), this.req = window.requestAnimationFrame(this.animationLoop);
          }
          restart() {
            if (this.scene)
              for (; this.scene.children.length; )
                this.scene.remove(this.scene.children[0]);
            typeof this.onRestart == "function" && this.onRestart(), this.init();
          }
          init() {
            typeof this.onInit == "function" && this.onInit();
          }
          destroy() {
            typeof this.onDestroy == "function" && this.onDestroy();
            const e2 = window.removeEventListener;
            e2("touchstart", this.windowTouchWrapper), e2("touchmove", this.windowTouchWrapper), e2("scroll", this.windowMouseMoveWrapper), e2("mousemove", this.windowMouseMoveWrapper), e2("deviceorientation", this.windowGyroWrapper), e2("resize", this.resize), window.cancelAnimationFrame(this.req), this.renderer && (this.renderer.domElement && this.el.removeChild(this.renderer.domElement), this.renderer = null, this.scene = null), r.current === this && (r.current = null);
          }
        }, t.b = r.VantaBase;
      }, function(e, t, n) {
        "use strict";
        n.d(t, "b", function() {
          return r;
        });
        var i = n(1), o = n(0);
        n.d(t, "a", function() {
          return i.a;
        });
        let s2 = typeof window == "object" && window.THREE;
        class r extends i.b {
          constructor(e2) {
            (s2 = e2.THREE || s2).Color.prototype.toVector = function() {
              return new s2.Vector3(this.r, this.g, this.b);
            }, super(e2), this.updateUniforms = this.updateUniforms.bind(this);
          }
          init() {
            this.mode = "shader", this.uniforms = { iTime: { type: "f", value: 1 }, iResolution: { type: "v2", value: new s2.Vector2(1, 1) }, iDpr: { type: "f", value: window.devicePixelRatio || 1 }, iMouse: { type: "v2", value: new s2.Vector2(this.mouseX || 0, this.mouseY || 0) } }, super.init(), this.fragmentShader && this.initBasicShader();
          }
          setOptions(e2) {
            super.setOptions(e2), this.updateUniforms();
          }
          initBasicShader(e2 = this.fragmentShader, t2 = this.vertexShader) {
            t2 || (t2 = "uniform float uTime;\nuniform vec2 uResolution;\nvoid main() {\n  gl_Position = vec4( position, 1.0 );\n}"), this.updateUniforms(), typeof this.valuesChanger == "function" && this.valuesChanger();
            const n2 = new s2.ShaderMaterial({ uniforms: this.uniforms, vertexShader: t2, fragmentShader: e2 }), i2 = this.options.texturePath;
            i2 && (this.uniforms.iTex = { type: "t", value: new s2.TextureLoader().load(i2) });
            const o2 = new s2.Mesh(new s2.PlaneGeometry(2, 2), n2);
            this.scene.add(o2), this.camera = new s2.Camera(), this.camera.position.z = 1;
          }
          updateUniforms() {
            const e2 = {};
            let t2, n2;
            for (t2 in this.options)
              n2 = this.options[t2], t2.toLowerCase().indexOf("color") !== -1 ? e2[t2] = { type: "v3", value: new s2.Color(n2).toVector() } : typeof n2 == "number" && (e2[t2] = { type: "f", value: n2 });
            return Object(o.c)(this.uniforms, e2);
          }
          resize() {
            super.resize(), this.uniforms.iResolution.value.x = this.width / this.scale, this.uniforms.iResolution.value.y = this.height / this.scale;
          }
        }
      }, , , , , , , , , function(e, t, n) {
        "use strict";
        n.r(t);
        var i = n(2);
        let o = typeof window == "object" && window.THREE;
        class s2 extends i.b {
          getDefaultOptions() {
            return { baseColor: 6745, color2: 15918901, backgroundColor: 1251907, amplitudeFactor: 1, ringFactor: 1, rotationFactor: 1, xOffset: 0, yOffset: 0, size: 1, speed: 1, mouseEase: true, scaleMobile: 1, scale: 1 };
          }
          onInit() {
            const e2 = { minFilter: o.LinearFilter, magFilter: o.LinearFilter, format: o.RGBFormat }, t2 = this.width * window.devicePixelRatio / this.scale, n2 = this.height * window.devicePixelRatio / this.scale;
            this.bufferTarget = new o.WebGLRenderTarget(t2, n2, e2), this.bufferFeedback = new o.WebGLRenderTarget(t2, n2, e2);
          }
          initBasicShader(e2, t2) {
            super.initBasicShader(e2, t2), this.uniforms.iBuffer = { type: "t", value: this.bufferTarget.texture };
          }
          onUpdate() {
            this.uniforms.iBuffer.value = this.bufferFeedback.texture;
            const e2 = this.renderer;
            e2.setRenderTarget(this.bufferTarget), e2.render(this.scene, this.camera), e2.setRenderTarget(null), e2.clear();
            let t2 = this.bufferTarget;
            this.bufferTarget = this.bufferFeedback, this.bufferFeedback = t2;
          }
          onResize() {
            if (this.bufferTarget) {
              const e2 = this.width * window.devicePixelRatio / this.scale, t2 = this.height * window.devicePixelRatio / this.scale;
              this.bufferTarget.setSize(e2, t2), this.bufferFeedback.setSize(e2, t2);
            }
          }
          onDestroy() {
            this.bufferTarget = null, this.bufferFeedback = null;
          }
        }
        t.default = i.a.register("HALO", s2), s2.prototype.fragmentShader = "uniform vec2 iResolution;\nuniform float iDpr;\nuniform vec2 iMouse;\nuniform float iTime;\n\nuniform float xOffset;\nuniform float yOffset;\nuniform vec3 baseColor;\nuniform vec3 color2;\nuniform vec3 backgroundColor;\nuniform float size;\nuniform float shape;\nuniform float ringFactor;\nuniform float rotationFactor;\nuniform float amplitudeFactor;\n\nuniform sampler2D iBuffer;\nuniform sampler2D iTex;\nconst float PI = 3.14159265359;\n\n// float length2(vec2 p) { return dot(p, p); }\n\n// float noise(vec2 p){\n//   return fract(sin(fract(sin(p.x) * (43.13311)) + p.y) * 31.0011);\n// }\n\n// float worley(vec2 p) {\n//     float d = 1e30;\n//     for (int xo = -1; xo <= 1; ++xo) {\n//         for (int yo = -1; yo <= 1; ++yo) {\n//             vec2 tp = floor(p) + vec2(xo, yo);\n//             d = min(d, length2(p - tp - vec2(noise(tp))));\n//         }\n//     }\n//     vec2 uv = gl_FragCoord.xy / iResolution.xy;\n//     float timeOffset =  0.15 * sin(iTime * 2.0 + 10.0*(uv.x - uv.y));\n//     return 3.0*exp(-4.0*abs(2.0*d - 1.0 + timeOffset));\n// }\n\n// float fworley(vec2 p) {\n//     return sqrt(\n//     1.1 * // light\n//     worley(p*10. + .3 + iTime*.0525) *\n//     sqrt(worley(p * 50. / size + 0.1 + iTime * -0.75)) *\n//     4.1 *\n//     sqrt(sqrt(worley(p * -1. + 9.3))));\n// }\n\nvec4 j2hue(float c) {\n  return .5+.5*cos(6.28*c+vec4(0,-2.1,2.1,0));\n}\n\nvec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }\n\nfloat snoise(vec2 v){\n  const vec4 C = vec4(0.211324865405187, 0.366025403784439,\n           -0.577350269189626, 0.024390243902439);\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n  vec2 i1;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n  i = mod(i, 289.0);\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n  + i.x + vec3(0.0, i1.x, 1.0 ));\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),\n    dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\nvec2 sincos( float x ){return vec2(sin(x), cos(x));}\nvec2 rotate2d(vec2 uv, float phi){vec2 t = sincos(phi); return vec2(uv.x*t.y-uv.y*t.x, uv.x*t.x+uv.y*t.y);}\nvec3 rotate3d(vec3 p, vec3 v, float phi){ v = normalize(v); vec2 t = sincos(-phi); float s = t.x, c = t.y, x =-v.x, y =-v.y, z =-v.z; mat4 M = mat4(x*x*(1.-c)+c,x*y*(1.-c)-z*s,x*z*(1.-c)+y*s,0.,y*x*(1.-c)+z*s,y*y*(1.-c)+c,y*z*(1.-c)-x*s,0.,z*x*(1.-c)-y*s,z*y*(1.-c)+x*s,z*z*(1.-c)+c,0.,0.,0.,0.,1.);return (vec4(p,1.)*M).xyz;}\n\n// Classic Perlin 3D Noise\n// by Stefan Gustavson\nvec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}\nvec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}\nvec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}\nfloat p3d(vec3 P){\n  vec3 Pi0 = floor(P); // Integer part for indexing\n  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1\n  Pi0 = mod(Pi0, 289.0);\n  Pi1 = mod(Pi1, 289.0);\n  vec3 Pf0 = fract(P); // Fractional part for interpolation\n  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = Pi0.zzzz;\n  vec4 iz1 = Pi1.zzzz;\n\n  vec4 ixy = permute(permute(ix) + iy);\n  vec4 ixy0 = permute(ixy + iz0);\n  vec4 ixy1 = permute(ixy + iz1);\n\n  vec4 gx0 = ixy0 / 7.0;\n  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\n  gx0 = fract(gx0);\n  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n  vec4 sz0 = step(gz0, vec4(0.0));\n  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\n  vec4 gx1 = ixy1 / 7.0;\n  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\n  gx1 = fract(gx1);\n  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n  vec4 sz1 = step(gz1, vec4(0.0));\n  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\n  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n\n  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n  g000 *= norm0.x;\n  g010 *= norm0.y;\n  g100 *= norm0.z;\n  g110 *= norm0.w;\n  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n  g001 *= norm1.x;\n  g011 *= norm1.y;\n  g101 *= norm1.z;\n  g111 *= norm1.w;\n\n  float n000 = dot(g000, Pf0);\n  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n  float n111 = dot(g111, Pf1);\n\n  vec3 fade_xyz = fade(Pf0);\n  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n  return 2.2 * n_xyz;\n}\n\n\nvoid main() {\n  vec2 res2 = iResolution.xy * iDpr;\n  vec2 pixel = vec2(gl_FragCoord.xy - 0.5 * res2) / res2.y; // center-origin pixel coord\n  pixel.x -= xOffset * res2.x / res2.y;\n  pixel.y -= yOffset;\n\n  vec2 uv = gl_FragCoord.xy / res2; // 0 to 1\n\n  // float nn1 = snoise(uv * 0.25 + iTime * 0.005 + mixedColor.b * 0.01) * 0.1;\n  // float nn2 = snoise(uv * 0.25 + iTime * 0.005 + mixedColor.b * 0.01 + 1000.) * 0.1;\n  // uv += vec2(nn1, nn2);\n\n  // PERLIN DISTORTION\n  // float noiseScale = 10.;\n  // float timeScale = 0.5;\n  // uv += vec2( p3d(vec3(uv * noiseScale, iTime * timeScale)), p3d(vec3(1000. + uv * noiseScale , iTime * timeScale)) ) * 0.001;\n\n  // uv = rotate2d(uv, 0.001);\n  // pixel = rotate2d(pixel, 0.001);\n\n  vec2 mouse2 = (iMouse * iDpr / res2 - 0.5) * vec2(1.,-1.);\n  vec2 uvBig = (uv - 0.5) * 0.996 + 0.5;\n\n  vec4 oldImage = texture2D(iBuffer, uv);\n  vec3 mixedColor = oldImage.rgb - backgroundColor;\n\n  // float spinDist = 0.002 + 0.002 * sin(iTime * 0.4);\n  float cropDist = 0.01;\n  float cropXOffset = 0.2;\n  float cropYOffset = 0.2;\n  // float cropXOffset = 0.4 + 0.1 * sin(iTime * 0.4);\n  // float cropYOffset = 0.4 + 0.1 * cos(iTime * 0.6);\n\n  vec2 offset = uv + vec2((mixedColor.g - cropXOffset) * cropDist, (mixedColor.r - cropYOffset) * cropDist);\n\n  // float nn = snoise(uv * 10.) * 0.001;\n  // offset += nn;\n\n  float spinDist = 0.001;\n  float spinSpeed = 0.2 + 0.15 * cos(iTime * 0.5);\n  float timeFrac = mod(iTime, 6.5);\n  vec2 offset2 = uvBig + vec2(cos(timeFrac * spinSpeed) * spinDist, sin(timeFrac * spinSpeed) * spinDist);\n\n  mixedColor = texture2D(iBuffer, offset).rgb * 0.4\n    + texture2D(iBuffer, offset2).rgb * 0.6\n    - backgroundColor;\n\n\n  // mixedColor *= .875;\n  float fadeAmt = 0.0015; // fade this amount each frame // 0.002\n  mixedColor = (mixedColor - fadeAmt) * .995;\n\n  // float nn = snoise(uvBig * 10.) * 20.;\n  // mixedColor *= clamp(nn, 0.98, 1.0);\n\n  vec4 spectrum = abs( abs( .95*atan(uv.x, uv.y) -vec4(0,2,4,0) ) -3. )-1.;\n  float angle = atan(pixel.x, pixel.y);\n  float dist = length(pixel - mouse2*0.15) * 8. + sin(iTime) * .01;\n\n  // mixedColor *= pow(1.-dist*0.002, 2.);\n\n\n  // Flowery shapes\n  // float edge = abs(dist * 0.5);\n  float flowerPeaks = .05 * amplitudeFactor * size;\n  float flowerPetals = 7.;\n  float edge = abs((dist + sin(angle * flowerPetals + iTime * 0.5) * sin(iTime * 1.5) * flowerPeaks) * 0.65 / size);\n  // float edge = abs((dist + sin(angle * 4. + iTime * 2.) * sin(iTime * 3.) * 0.75) * 1.);\n\n  // vec4 rainbow = abs( abs( .95*mod(iTime * 1., 2. * PI) - vec4(0,2,4,0) ) -3. )-1.;\n  // vec4 rainbow = vec4(0,2,4,0);\n\n  float colorChangeSpeed = 0.75 + 0.05 * sin(iTime) * 1.5;\n  float rainbowInput = timeFrac * colorChangeSpeed;\n  // NOISE!\n  // float nn = snoise(uv * 0.25 + iTime * 0.005 + mixedColor.b * 0.01) * 20.;\n  // rainbowInput += nn;\n\n  float brightness = 0.7;\n  vec4 rainbow = sqrt(j2hue(cos(rainbowInput))) + vec4(baseColor,0) - 1.0 + brightness;\n  float factor = smoothstep(1., .9, edge) * pow(edge, 2.);\n  vec3 color = rainbow.rgb * smoothstep(1., .9, edge) * pow(edge, 20.);\n  vec4 ring = vec4(\n    backgroundColor + clamp( mixedColor + color, 0., 1.)\n    , 1.0);\n\n  // float t = fworley(uv * u_resolution.xy / 1500.0);\n  // t *= exp(-length2(abs(0.7*uv - 1.0)));\n  // float tExp = pow(t, 2. - t);\n  // vec3 c1 = color1 * (1.0 - t);\n  // vec3 c2 = color2 * tExp;\n  // vec4 cells = vec4(mixedColor * 0.25, 1.) + vec4(pow(t, 1.0 - t) * (c1 + c2), 1.0);\n  // gl_FragColor = clamp(ring + cells * 0.5, 0.0, 1.0);\n\n  // float nn = snoise(uv * 10.) * 0.01; // creepy!\n  gl_FragColor = ring;\n}\n";
      }]);
    });
  }
});

// node_modules/ts-results/index.js
var require_ts_results = __commonJS({
  "node_modules/ts-results/index.js"(exports, module2) {
    init_shims();
    (function(factory) {
      if (typeof module2 === "object" && typeof module2.exports === "object") {
        var v = factory(require, exports);
        if (v !== void 0)
          module2.exports = v;
      } else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./result", "./option"], factory);
      }
    })(function(require2, exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      var tslib_1 = require2("tslib");
      tslib_1.__exportStar(require2("./result"), exports2);
      tslib_1.__exportStar(require2("./option"), exports2);
    });
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();
var import_vanta_halo_min = __toModule(require_vanta_halo_min());
var import_ts_results = __toModule(require_ts_results());
var __require2 = typeof require !== "undefined" ? require : (x) => {
  throw new Error('Dynamic require of "' + x + '" is not supported');
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler2) {
    return;
  }
  const params = route.params(match);
  const response = await handler2({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  context,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape$1(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped$2 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape$1(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$2) {
      result += escaped$2[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
function coalesce_to_error(err) {
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    context: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      context: loaded ? loaded.context : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  ssr:
    if (page_config.ssr) {
      let context = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              context,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    context: node_loaded.context,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            });
          }
        }
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    });
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(request2.path);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
function custom_event(type, detail, bubbles = false) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, false, detail);
  return e;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
var escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$3 = {
  code: "#svelte-announcer.svelte-9z6sc{position:absolute;left:0;top:0;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\t-webkit-clip-path: inset(50%);\\n\\t\\t        clip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}</style>"],"names":[],"mappings":"AAsDC,iBAAiB,aAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,iBAAiB,CAAE,MAAM,GAAG,CAAC,CACrB,SAAS,CAAE,MAAM,GAAG,CAAC,CAC7B,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$3);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
var base = "";
var assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var template = ({ head, body }) => '<!DOCTYPE html>\r\n<html lang="en" data-theme="luxury">\r\n\r\n<head>\r\n    <meta charset="utf-8" />\r\n    <link rel="icon" href="/favicon.ico" />\r\n    <meta name="viewport" content="width=device-width, initial-scale=1" /> ' + head + '\r\n</head>\r\n\r\n<body>\r\n    <div id="svelte">' + body + "</div>\r\n</body>\r\n\r\n</html>";
var options = null;
var default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-c6d6caec.js",
      css: [assets + "/_app/assets/start-c446e5f0.css"],
      js: [assets + "/_app/start-c6d6caec.js", assets + "/_app/chunks/vendor-1587177f.js", assets + "/_app/chunks/preload-helper-ec9aa979.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "blurry-gradient-haikei.png", "size": 41969, "type": "image/png" }, { "file": "chrome_m031mgF0sC.png", "size": 163864, "type": "image/png" }, { "file": "embedImage.png", "size": 173669, "type": "image/png" }, { "file": "favicon-32x32.png", "size": 2893, "type": "image/png" }, { "file": "icons/email.svg", "size": 260, "type": "image/svg+xml" }, { "file": "icons/express.svg", "size": 787, "type": "image/svg+xml" }, { "file": "icons/firebase.svg", "size": 333, "type": "image/svg+xml" }, { "file": "icons/github.svg", "size": 839, "type": "image/svg+xml" }, { "file": "icons/jest.svg", "size": 3242, "type": "image/svg+xml" }, { "file": "icons/laravel-icon.svg", "size": 969, "type": "image/svg+xml" }, { "file": "icons/link.svg", "size": 456, "type": "image/svg+xml" }, { "file": "icons/linkedin.svg", "size": 627, "type": "image/svg+xml" }, { "file": "icons/mongodb.svg", "size": 1506, "type": "image/svg+xml" }, { "file": "icons/netlify.svg", "size": 4445, "type": "image/svg+xml" }, { "file": "icons/nodejs.svg", "size": 1647, "type": "image/svg+xml" }, { "file": "icons/npm.svg", "size": 331, "type": "image/svg+xml" }, { "file": "icons/passport.svg", "size": 357, "type": "image/svg+xml" }, { "file": "icons/react-icon.svg", "size": 1443, "type": "image/svg+xml" }, { "file": "icons/sass.svg", "size": 1236, "type": "image/svg+xml" }, { "file": "icons/sequelize-icon.svg", "size": 2806, "type": "image/svg+xml" }, { "file": "icons/socketdotio.svg", "size": 878, "type": "image/svg+xml" }, { "file": "icons/svelte-icon.svg", "size": 1990, "type": "image/svg+xml" }, { "file": "icons/symfony-icon.svg", "size": 1897, "type": "image/svg+xml" }, { "file": "icons/tailwind-css-icon.svg", "size": 858, "type": "image/svg+xml" }, { "file": "icons/webpack.svg", "size": 833, "type": "image/svg+xml" }, { "file": "icons/website.svg", "size": 848, "type": "image/svg+xml" }, { "file": "images/arlan.png", "size": 196842, "type": "image/png" }, { "file": "images/arlan1.png", "size": 171999, "type": "image/png" }, { "file": "images/moviecollection.png", "size": 1509709, "type": "image/png" }, { "file": "images/moviecollection1.png", "size": 1347248, "type": "image/png" }, { "file": "images/moviecollection2.png", "size": 1698294, "type": "image/png" }, { "file": "images/shibe.host.png", "size": 385462, "type": "image/png" }, { "file": "images/shibe.host1.png", "size": 148620, "type": "image/png" }, { "file": "images/shibe.host2.png", "size": 106085, "type": "image/png" }, { "file": "images/web1.png", "size": 33998, "type": "image/png" }, { "file": "robots.txt", "size": 70, "type": "text/plain" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/projects\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return projects_json;
      })
    },
    {
      type: "page",
      pattern: /^\/projects\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/projects.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/projects.svelte": () => Promise.resolve().then(function() {
    return projects;
  }),
  "src/routes/about.svelte": () => Promise.resolve().then(function() {
    return about;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-de240bdb.js", "css": ["assets/pages/__layout.svelte-65961d33.css"], "js": ["pages/__layout.svelte-de240bdb.js", "chunks/vendor-1587177f.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-69240488.js", "css": [], "js": ["error.svelte-69240488.js", "chunks/vendor-1587177f.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-c8635b95.js", "css": ["assets/pages/index.svelte-1c99386a.css"], "js": ["pages/index.svelte-c8635b95.js", "chunks/preload-helper-ec9aa979.js", "chunks/vendor-1587177f.js"], "styles": [] }, "src/routes/projects.svelte": { "entry": "pages/projects.svelte-6b9d3d10.js", "css": [], "js": ["pages/projects.svelte-6b9d3d10.js", "chunks/vendor-1587177f.js"], "styles": [] }, "src/routes/about.svelte": { "entry": "pages/about.svelte-a28904a2.js", "css": [], "js": ["pages/about.svelte-a28904a2.js", "chunks/vendor-1587177f.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var projects$1 = [
  {
    name: "shibe.host",
    title: "shibe.host - a private file uploading service",
    date: "2021-04-03T00:00:00.000Z",
    excerpt: "shibe.host is a private file uploading service, primarily focused on embeddable images to be used on Discord. The backend runs on Nodejs + Express, while the frontend was made using SvelteKit.",
    images: [
      "/images/shibe.host.png",
      "/images/shibe.host1.png",
      "/images/shibe.host2.png"
    ],
    link: "https://shibe.host",
    tags: [
      "NodeJS",
      "Express",
      "SvelteKit",
      "Mongoose",
      "Tailwind"
    ]
  },
  {
    name: "arlan",
    title: "Arlan - a cryptocurrency webshop",
    date: "2021-04-03T00:00:00.000Z",
    excerpt: "Arlan was a college assignment which tasked us with designing and developing a webshop that does something unique.",
    images: [
      "/images/arlan.png",
      "/images/arlan1.png"
    ],
    gh_link: "https://github.com/pgmgent-pgm-4/webshop-arlan",
    tags: [
      "NodeJS",
      "Express",
      "Passport",
      "Sequelize",
      "Jest"
    ],
    finished: true
  },
  {
    name: "movc",
    title: "{MovC} - a movie/show database",
    date: "2021-04-03T00:00:00.000Z",
    excerpt: "MovieCollection is a React app utilizing TheMovieDatbase's API to show the last movies and shows.",
    gh_link: "https://github.com/pgmgent-pgm-4/movie-application-dylancl",
    images: [
      "/images/moviecollection.png",
      "/images/moviecollection1.png",
      "/images/moviecollection2.png"
    ],
    tags: [
      "React",
      "Firebase",
      "Jest",
      "Storybook",
      "Sass"
    ],
    finished: true
  }
];
async function get({ query, locals }) {
  return {
    status: 200,
    body: projects$1
  };
}
var projects_json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get
});
var Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<footer class="${"p-2 footer rounded-none bg-base-200 text-white font-bold"}"><div class="${"container mx-auto flex justify-center flex-wrap items-center"}"><p class="${"flex"}">Made with <span class="${"text-red-500"}">\u2764 </span> using SvelteKit
    </p></div></footer>`;
});
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<link rel="${"stylesheet"}" href="${"https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.1/styles/github.min.css"}" data-svelte="svelte-1487djy"><link rel="${"preconnect"}" href="${"https://fonts.googleapis.com"}" data-svelte="svelte-1487djy"><link rel="${"preconnect"}" href="${"https://fonts.gstatic.com"}" crossorigin data-svelte="svelte-1487djy"><link href="${"https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap"}" rel="${"stylesheet"}" data-svelte="svelte-1487djy"><meta property="${"og:title"}" content="${"Dylan Cathelijn"}" data-svelte="svelte-1487djy"><meta property="${"og:description"}" content="${"fullstack developer based in Belgium"}" data-svelte="svelte-1487djy"><meta property="${"og:image"}" content="${"/embedImage.png"}" data-svelte="svelte-1487djy"><meta property="${"og:url"}" content="${"https://loving-blackwell-b19372.netlify.app/"}" data-svelte="svelte-1487djy">`, ""}

<div><div class="${"font-sans"}">${slots.default ? slots.default({}) : ``}</div>
  ${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}</div>`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
function load$2({ error: error2, status }) {
  return { props: { error: error2, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<h1>${escape(status)}</h1>

<pre>${escape(error2.message)}</pre>



${error2.frame ? `<pre>${escape(error2.frame)}</pre>` : ``}
${error2.stack ? `<pre>${escape(error2.stack)}</pre>` : ``}`;
});
var error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load: load$2
});
var Saos = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { animation = "none" } = $$props;
  let { animation_out = "none; opacity: 0" } = $$props;
  let { once = false } = $$props;
  let { top = 0 } = $$props;
  let { bottom = 0 } = $$props;
  let { css_observer = "" } = $$props;
  let { css_animation = "" } = $$props;
  const dispatch = createEventDispatcher();
  let observing = true;
  const countainer = `__saos-${Math.random()}__`;
  if ($$props.animation === void 0 && $$bindings.animation && animation !== void 0)
    $$bindings.animation(animation);
  if ($$props.animation_out === void 0 && $$bindings.animation_out && animation_out !== void 0)
    $$bindings.animation_out(animation_out);
  if ($$props.once === void 0 && $$bindings.once && once !== void 0)
    $$bindings.once(once);
  if ($$props.top === void 0 && $$bindings.top && top !== void 0)
    $$bindings.top(top);
  if ($$props.bottom === void 0 && $$bindings.bottom && bottom !== void 0)
    $$bindings.bottom(bottom);
  if ($$props.css_observer === void 0 && $$bindings.css_observer && css_observer !== void 0)
    $$bindings.css_observer(css_observer);
  if ($$props.css_animation === void 0 && $$bindings.css_animation && css_animation !== void 0)
    $$bindings.css_animation(css_animation);
  {
    dispatch("update", { observing });
  }
  return `<div${add_attribute("id", countainer, 0)}${add_attribute("style", css_observer, 0)}>${`<div style="${"animation: " + escape(animation) + "; " + escape(css_animation)}">${slots.default ? slots.default({}) : ``}</div>`}</div>`;
});
var technologies = [
  {
    name: "nodejs",
    icon: "icons/nodejs.svg"
  },
  {
    name: "expressjs",
    icon: "icons/express.svg"
  },
  {
    name: "mongodb",
    icon: "icons/mongodb.svg"
  },
  {
    name: "sequelize",
    icon: "icons/sequelize-icon.svg"
  },
  {
    name: "sveltekit",
    icon: "icons/svelte-icon.svg"
  },
  {
    name: "reactjs",
    icon: "icons/react-icon.svg"
  },
  {
    name: "tailwind",
    icon: "icons/tailwind-css-icon.svg"
  },
  {
    name: "webpack",
    icon: "icons/webpack.svg"
  },
  {
    name: "jest",
    icon: "icons/jest.svg"
  },
  {
    name: "laravel",
    icon: "icons/laravel-icon.svg"
  },
  {
    name: "symfony",
    icon: "icons/symfony-icon.svg"
  },
  {
    name: "github",
    icon: "icons/github.svg"
  },
  {
    name: "npm",
    icon: "icons/npm.svg"
  },
  {
    name: "netlify",
    icon: "icons/netlify.svg"
  },
  {
    name: "firebase",
    icon: "icons/firebase.svg"
  },
  {
    name: "socket.io",
    icon: "icons/socketdotio.svg"
  },
  {
    name: "sass",
    icon: "icons/sass.svg"
  },
  {
    name: "passportjs",
    icon: "icons/passport.svg"
  }
];
var css$2 = {
  code: ".overlay.svelte-omfzo3{position:fixed;top:0;width:100%;height:100%;background:rgba(0, 0, 0, 0.6);z-index:99;display:flex;justify-content:center;align-items:center}.aa-popup.svelte-omfzo3{box-shadow:3px 3px 17px 0 rgba(0, 0, 0, 0.17);min-width:200px;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards;max-height:calc(100% - 10px);display:flex;flex-direction:column;justify-content:space-between}.footer.svelte-omfzo3{margin:0 24px 24px 24px;display:flex;justify-content:flex-end}@media(max-width: 480px){.popup.svelte-omfzo3{height:calc(100% - 32px);width:calc(100% - 32px)}}",
  map: `{"version":3,"file":"Modal.svelte","sources":["Modal.svelte"],"sourcesContent":["<script>\\r\\n    import { onMount } from \\"svelte\\";\\r\\n    import { fade, fly } from \\"svelte/transition\\";\\r\\n    import { createEventDispatcher } from \\"svelte\\";\\r\\n\\r\\n    export let header = \\"\\";\\r\\n    export let tags = \\"\\";\\r\\n    export let projectLink;\\r\\n    export let isOpen = false;\\r\\n\\r\\n\\r\\n    let popupRef;\\r\\n    let footerRef = null;\\r\\n    let headerRef = null;\\r\\n    let overflowState = \\"\\";\\r\\n    const dispatch = createEventDispatcher();\\r\\n    const close = () => {\\r\\n        dispatch(\\"close\\", \\"\\");\\r\\n    };\\r\\n\\r\\n    const handleKeyDown = (event) => {\\r\\n        if (event.keyCode === 27) close();\\r\\n    };\\r\\n\\r\\n    onMount(() => {\\r\\n        window.addEventListener(\\"keydown\\", handleKeyDown);\\r\\n        document.body.appendChild(popupRef);\\r\\n        return () => {\\r\\n            window.removeEventListener(\\"keydown\\", handleKeyDown);\\r\\n            document.body.removeChild(popupRef);\\r\\n        };\\r\\n    });\\r\\n    $: {\\r\\n        if (typeof window !== \\"undefined\\") {\\r\\n            if (isOpen) {\\r\\n                overflowState = document.body.style.overflow;\\r\\n                document.body.style.overflow = \\"hidden\\";\\r\\n            } else {\\r\\n                document.body.style.overflow = overflowState;\\r\\n            }\\r\\n        }\\r\\n    }\\r\\n<\/script>\\r\\n\\r\\n<div>\\r\\n    <div bind:this={popupRef}>\\r\\n        {#if isOpen}\\r\\n            <div\\r\\n                class={\`overlay \${$$props.class || \\"\\"}\`}\\r\\n                transition:fade|local\\r\\n                on:click={close}\\r\\n            >\\r\\n                <div\\r\\n                    class=\\"aa-popup px-8 pt-4 bg-base-200 max-w-screen-xl\\"\\r\\n                    transition:fade|local={{\\r\\n                        duration: 300,\\r\\n                        y: -500,\\r\\n                        opacity: 0.9,\\r\\n                    }}\\r\\n                    on:click={(e) => e.stopPropagation()}\\r\\n                >\\r\\n                    <div class=\\"flex flex-wrap justify-between items-center -mx-2\\">\\r\\n                        <div>\\r\\n                            {#if tags}\\r\\n                                {@html tags}\\r\\n                            {/if}\\r\\n                        </div>\\r\\n                        <a target=\\"_blank\\" href={projectLink}><img class=\\"h-8\\" src={projectLink.includes('https://github.com') ? '/icons/github.svg' : '/icons/website.svg'} alt=\\"GitHub icon\\"></a>\\r\\n                    </div>\\r\\n                    <div class=\\"mb-3\\" class:header={header || !Boolean(headerRef)}>\\r\\n                        {#if header}\\r\\n                            <h1 class=\\"text-2xl text-gray-300 font-bold\\">{header}</h1>\\r\\n                        {:else}\\r\\n                            <slot name=\\"header\\">\\r\\n                                <div bind:this={headerRef} />\\r\\n                            </slot>\\r\\n                        {/if}\\r\\n                    </div>\\r\\n\\r\\n                    <div class=\\"content mb-3 overflow-y-hidden\\">\\r\\n                        <p class=\\"text-gray-300\\">\\r\\n                            <slot />\\r\\n                        </p>\\r\\n                    </div>\\r\\n                </div>\\r\\n            </div>\\r\\n        {/if}\\r\\n    </div>\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n    .overlay {\\r\\n        position: fixed;\\r\\n        top: 0;\\r\\n        width: 100%;\\r\\n        height: 100%;\\r\\n        background: rgba(0, 0, 0, 0.6);\\r\\n\\r\\n        z-index: 99;\\r\\n        display: flex;\\r\\n        justify-content: center;\\r\\n        align-items: center;\\r\\n    }\\r\\n\\r\\n    .aa-popup {\\r\\n        box-shadow: 3px 3px 17px 0 rgba(0, 0, 0, 0.17);\\r\\n        min-width: 200px;\\r\\n        -webkit-animation-fill-mode: forwards;\\r\\n                animation-fill-mode: forwards;\\r\\n        max-height: calc(100% - 10px);\\r\\n        display: flex;\\r\\n        flex-direction: column;\\r\\n        justify-content: space-between;\\r\\n    }\\r\\n\\r\\n    .footer {\\r\\n        margin: 0 24px 24px 24px;\\r\\n        display: flex;\\r\\n        justify-content: flex-end;\\r\\n    }\\r\\n    @media (max-width: 480px) {\\r\\n        .popup {\\r\\n            height: calc(100% - 32px);\\r\\n            width: calc(100% - 32px);\\r\\n        }\\r\\n    }</style>\\r\\n"],"names":[],"mappings":"AA2FI,QAAQ,cAAC,CAAC,AACN,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,CAAC,CACN,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAE9B,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,AACvB,CAAC,AAED,SAAS,cAAC,CAAC,AACP,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAC9C,SAAS,CAAE,KAAK,CAChB,2BAA2B,CAAE,QAAQ,CAC7B,mBAAmB,CAAE,QAAQ,CACrC,UAAU,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CAC7B,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,eAAe,CAAE,aAAa,AAClC,CAAC,AAED,OAAO,cAAC,CAAC,AACL,MAAM,CAAE,CAAC,CAAC,IAAI,CAAC,IAAI,CAAC,IAAI,CACxB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,QAAQ,AAC7B,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACvB,MAAM,cAAC,CAAC,AACJ,MAAM,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CACzB,KAAK,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,AAC5B,CAAC,AACL,CAAC"}`
};
var Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { header = "" } = $$props;
  let { tags = "" } = $$props;
  let { projectLink } = $$props;
  let { isOpen = false } = $$props;
  let popupRef;
  let headerRef = null;
  let overflowState = "";
  createEventDispatcher();
  if ($$props.header === void 0 && $$bindings.header && header !== void 0)
    $$bindings.header(header);
  if ($$props.tags === void 0 && $$bindings.tags && tags !== void 0)
    $$bindings.tags(tags);
  if ($$props.projectLink === void 0 && $$bindings.projectLink && projectLink !== void 0)
    $$bindings.projectLink(projectLink);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  $$result.css.add(css$2);
  {
    {
      if (typeof window !== "undefined") {
        if (isOpen) {
          overflowState = document.body.style.overflow;
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = overflowState;
        }
      }
    }
  }
  return `<div><div${add_attribute("this", popupRef, 0)}>${isOpen ? `<div class="${escape(null_to_empty(`overlay ${$$props.class || ""}`)) + " svelte-omfzo3"}"><div class="${"aa-popup px-8 pt-4 bg-base-200 max-w-screen-xl svelte-omfzo3"}"><div class="${"flex flex-wrap justify-between items-center -mx-2"}"><div>${tags ? `<!-- HTML_TAG_START -->${tags}<!-- HTML_TAG_END -->` : ``}</div>
                        <a target="${"_blank"}"${add_attribute("href", projectLink, 0)}><img class="${"h-8"}"${add_attribute("src", projectLink.includes("https://github.com") ? "/icons/github.svg" : "/icons/website.svg", 0)} alt="${"GitHub icon"}"></a></div>
                    <div class="${["mb-3", header || !Boolean(headerRef) ? "header" : ""].join(" ").trim()}">${header ? `<h1 class="${"text-2xl text-gray-300 font-bold"}">${escape(header)}</h1>` : `${slots.header ? slots.header({}) : `
                                <div${add_attribute("this", headerRef, 0)}></div>
                            `}`}</div>

                    <div class="${"content mb-3 overflow-y-hidden"}"><p class="${"text-gray-300"}">${slots.default ? slots.default({}) : ``}</p></div></div></div>` : ``}</div>
</div>`;
});
var css$1 = {
  code: `:root{--color-1:#f72585ff;--color-2:#b5179eff;--color-3:#7209b7ff;--color-4:#560badff;--color-5:#480ca8ff;--color-6:#3a0ca3ff;--color-7:#3f37c9ff;--color-8:#4361eeff;--color-9:#4895efff;--color-10:#4cc9f0ff}.card.svelte-18th5ak.svelte-18th5ak{box-shadow:0 0 var(--color-4);transition:0.5s ease}.card.svelte-18th5ak.svelte-18th5ak:hover{box-shadow:-6px 6px var(--color-7);transform:translate(6px, -6px)}.hero.svelte-18th5ak.svelte-18th5ak{background-color:black}@media screen and (max-width: 768px){.hero.svelte-18th5ak.svelte-18th5ak{background-color:#000000;background-color:#000000;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3CradialGradient id='a' gradientUnits='objectBoundingBox'%3E%3Cstop offset='0' stop-color='%23151515'/%3E%3Cstop offset='1' stop-color='%23000000'/%3E%3C/radialGradient%3E%3ClinearGradient id='b' gradientUnits='userSpaceOnUse' x1='0' y1='750' x2='1550' y2='750'%3E%3Cstop offset='0' stop-color='%230b0b0b'/%3E%3Cstop offset='1' stop-color='%23000000'/%3E%3C/linearGradient%3E%3Cpath id='s' fill='url(%23b)' d='M1549.2 51.6c-5.4 99.1-20.2 197.6-44.2 293.6c-24.1 96-57.4 189.4-99.3 278.6c-41.9 89.2-92.4 174.1-150.3 253.3c-58 79.2-123.4 152.6-195.1 219c-71.7 66.4-149.6 125.8-232.2 177.2c-82.7 51.4-170.1 94.7-260.7 129.1c-90.6 34.4-184.4 60-279.5 76.3C192.6 1495 96.1 1502 0 1500c96.1-2.1 191.8-13.3 285.4-33.6c93.6-20.2 185-49.5 272.5-87.2c87.6-37.7 171.3-83.8 249.6-137.3c78.4-53.5 151.5-114.5 217.9-181.7c66.5-67.2 126.4-140.7 178.6-218.9c52.3-78.3 96.9-161.4 133-247.9c36.1-86.5 63.8-176.2 82.6-267.6c18.8-91.4 28.6-184.4 29.6-277.4c0.3-27.6 23.2-48.7 50.8-48.4s49.5 21.8 49.2 49.5c0 0.7 0 1.3-0.1 2L1549.2 51.6z'/%3E%3Cg id='g'%3E%3Cuse href='%23s' transform='scale(0.12) rotate(60)'/%3E%3Cuse href='%23s' transform='scale(0.2) rotate(10)'/%3E%3Cuse href='%23s' transform='scale(0.25) rotate(40)'/%3E%3Cuse href='%23s' transform='scale(0.3) rotate(-20)'/%3E%3Cuse href='%23s' transform='scale(0.4) rotate(-30)'/%3E%3Cuse href='%23s' transform='scale(0.5) rotate(20)'/%3E%3Cuse href='%23s' transform='scale(0.6) rotate(60)'/%3E%3Cuse href='%23s' transform='scale(0.7) rotate(10)'/%3E%3Cuse href='%23s' transform='scale(0.835) rotate(-40)'/%3E%3Cuse href='%23s' transform='scale(0.9) rotate(40)'/%3E%3Cuse href='%23s' transform='scale(1.05) rotate(25)'/%3E%3Cuse href='%23s' transform='scale(1.2) rotate(8)'/%3E%3Cuse href='%23s' transform='scale(1.333) rotate(-60)'/%3E%3Cuse href='%23s' transform='scale(1.45) rotate(-30)'/%3E%3Cuse href='%23s' transform='scale(1.6) rotate(10)'/%3E%3C/g%3E%3C/defs%3E%3Cg transform='translate(1920 0)'%3E%3Cg transform='translate(0 1245)'%3E%3Ccircle fill='url(%23a)' r='3000'/%3E%3Cg opacity='0.5'%3E%3Ccircle fill='url(%23a)' r='2000'/%3E%3Ccircle fill='url(%23a)' r='1800'/%3E%3Ccircle fill='url(%23a)' r='1700'/%3E%3Ccircle fill='url(%23a)' r='1651'/%3E%3Ccircle fill='url(%23a)' r='1450'/%3E%3Ccircle fill='url(%23a)' r='1250'/%3E%3Ccircle fill='url(%23a)' r='1175'/%3E%3Ccircle fill='url(%23a)' r='900'/%3E%3Ccircle fill='url(%23a)' r='750'/%3E%3Ccircle fill='url(%23a)' r='500'/%3E%3Ccircle fill='url(%23a)' r='380'/%3E%3Ccircle fill='url(%23a)' r='250'/%3E%3C/g%3E%3Cg %3E%3Cuse href='%23g' transform='rotate(10)'/%3E%3Cuse href='%23g' transform='rotate(120)'/%3E%3Cuse href='%23g' transform='rotate(240)'/%3E%3C/g%3E%3Ccircle fill-opacity='0.51' fill='url(%23a)' r='3000'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");background-attachment:fixed;background-size:cover}}.backdrop-blur.svelte-18th5ak.svelte-18th5ak{height:100%;width:100%;-webkit-backdrop-filter:blur(0.1rem);backdrop-filter:blur(0.1rem)}.hero-content.svelte-18th5ak.svelte-18th5ak{z-index:10}svg.svelte-18th5ak text.svelte-18th5ak{font-family:"Inter";letter-spacing:10px;fill:linear-gradient(to top, #30cfd0 0%, #330867 100%);stroke:var(--color-7);letter-spacing:0.1em;stroke-width:4;filter:drop-shadow(0px 3px 3px rgba(0, 0, 0, 1));-webkit-animation:svelte-18th5ak-textAnimate 10s cubic-bezier(0.86, 0, 0.07, 1) alternate;animation:svelte-18th5ak-textAnimate 10s cubic-bezier(0.86, 0, 0.07, 1) alternate}@-webkit-keyframes svelte-18th5ak-textAnimate{0%{stroke-dasharray:0 50%;stroke-dashoffset:20%;fill:var(--color-1)}10%{fill:var(--color-2)}20%{fill:var(--color-3)}30%{fill:var(--color-4)}40%{fill:var(--color-5)}50%{fill:var(--color-6)}60%{fill:var(--color-7)}100%{stroke-dasharray:50% 0;stroke-dashoffstet:-20%;fill:var(--color-7)}}@keyframes svelte-18th5ak-textAnimate{0%{stroke-dasharray:0 50%;stroke-dashoffset:20%;fill:var(--color-1)}10%{fill:var(--color-2)}20%{fill:var(--color-3)}30%{fill:var(--color-4)}40%{fill:var(--color-5)}50%{fill:var(--color-6)}60%{fill:var(--color-7)}100%{stroke-dasharray:50% 0;stroke-dashoffstet:-20%;fill:var(--color-7)}}`,
  map: `{"version":3,"file":"Hero.svelte","sources":["Hero.svelte"],"sourcesContent":["<script>\\r\\n  import Saos from \\"saos/src/Saos.svelte\\";\\r\\n  import { onMount } from \\"svelte\\";\\r\\n  const contactInformation = [\\r\\n    {\\r\\n      link: \\"https://github.com/dylancl\\",\\r\\n      icon: \\"icons/github.svg\\",\\r\\n      name: \\"GitHub\\",\\r\\n      alt: \\"GitHub\\",\\r\\n    },\\r\\n    {\\r\\n      link: \\"https://www.linkedin.com/in/dylan-cathelijn-00551214b/\\",\\r\\n      icon: \\"icons/linkedin.svg\\",\\r\\n      name: \\"LinkedIn\\",\\r\\n      alt: \\"LinkedIn\\",\\r\\n    },\\r\\n    {\\r\\n      link: \\"mailto:dylan_cathelyn@hotmail.be\\",\\r\\n      icon: \\"icons/email.svg\\",\\r\\n      name: \\"Email\\",\\r\\n      alt: \\"Email\\",\\r\\n    },\\r\\n  ];\\r\\n\\r\\n  $: innerWidth = 0;\\r\\n\\r\\n  import HALO from \\"vanta/dist/vanta.halo.min.js\\";\\r\\n  onMount(() => {\\r\\n    if (innerWidth > 800) {\\r\\n      const vanta = HALO({\\r\\n        el: document.querySelector(\\".vanta\\"),\\r\\n        mouseControls: true,\\r\\n        touchControls: true,\\r\\n        gyroControls: true,\\r\\n        minHeight: 200.0,\\r\\n        scaleMobile: 0.5,\\r\\n        yOffsetMobile: -0.8,\\r\\n        minWidth: 200.0,\\r\\n        baseColor: 0x155aff,\\r\\n        amplitudeFactor: 1,\\r\\n        backgroundColor: 0x0,\\r\\n        xOffset: 0.6,\\r\\n        yOffset: -0.31,\\r\\n        size: 3.0,\\r\\n      });\\r\\n    }\\r\\n  });\\r\\n<\/script>\\r\\n\\r\\n<svelte:window bind:innerWidth />\\r\\n\\r\\n<svelte:head>\\r\\n  <link rel=\\"preconnect\\" href=\\"https://fonts.googleapis.com\\" />\\r\\n  <link rel=\\"preconnect\\" href=\\"https://fonts.gstatic.com\\" crossorigin />\\r\\n  <link\\r\\n    href=\\"https://fonts.googleapis.com/css2?family=Heebo:wght@700;900&display=swap\\"\\r\\n    rel=\\"stylesheet\\"\\r\\n  />\\r\\n  <script\\r\\n    src=\\"https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js\\"><\/script>\\r\\n</svelte:head>\\r\\n\\r\\n<div class=\\"hero vanta min-h-screen bg-base-200\\">\\r\\n  <div class=\\"backdrop-blur flex justify-center items-center\\">\\r\\n    <div class=\\"text-center hero-content w-full\\">\\r\\n      <div class=\\"w-full\\">\\r\\n        <svg class=\\"h-50 sm:h-64 md:h-72 lg:h-96 w-full drop-shadow-2xl\\">\\r\\n          <text\\r\\n            class=\\"text-7xl sm:text-8xl md:text-9xl xl:text-11xl md:font-extrabold\\"\\r\\n            x=\\"0\\"\\r\\n            y=\\"0\\"\\r\\n            fill=\\"#3f37c9ff\\"\\r\\n          >\\r\\n            <tspan x=\\"0\\" y=\\"40%\\">Dylan</tspan>\\r\\n            <tspan x=\\"0\\" y=\\"90%\\">Cathelijn</tspan>\\r\\n          </text>\\r\\n        </svg>\\r\\n        <p class=\\"text-left text-lg text-white font-bold prose md:ml-4\\">\\r\\n          full-stack developer based in Belgium\\r\\n        </p>\\r\\n        <div\\r\\n          class=\\"grid grid-cols-1 md:grid-cols-3 md:ml-4 mt-4 w-full md:w-1/2 lg:w-1/3 gap-7\\"\\r\\n        >\\r\\n          {#each contactInformation as contactInfo}\\r\\n            <div>\\r\\n              <Saos\\r\\n                once={true}\\r\\n                animation={\\"fade-in-fwd 1s ease-in-out both\\"}\\r\\n                css_animation={\\"animation-delay: 9s;\\"}\\r\\n              >\\r\\n                <a href={contactInfo.link}>\\r\\n                  <div\\r\\n                    class=\\"card bg-base-200 p-0 rounded-none text-white shadow-2xl\\"\\r\\n                  >\\r\\n                    <div class=\\"card-body p-3\\">\\r\\n                      <p class=\\"font-bold uppercase\\">\\r\\n                        {contactInfo.name}\\r\\n                      </p>\\r\\n                    </div>\\r\\n                  </div>\\r\\n                </a>\\r\\n              </Saos>\\r\\n            </div>\\r\\n          {/each}\\r\\n        </div>\\r\\n      </div>\\r\\n    </div>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  :root {\\r\\n    --color-1: #f72585ff;\\r\\n    --color-2: #b5179eff;\\r\\n    --color-3: #7209b7ff;\\r\\n    --color-4: #560badff;\\r\\n    --color-5: #480ca8ff;\\r\\n    --color-6: #3a0ca3ff;\\r\\n    --color-7: #3f37c9ff;\\r\\n    --color-8: #4361eeff;\\r\\n    --color-9: #4895efff;\\r\\n    --color-10: #4cc9f0ff;\\r\\n  }\\r\\n\\r\\n  .card {\\r\\n    box-shadow: 0 0 var(--color-4);\\r\\n    transition: 0.5s ease;\\r\\n  }\\r\\n\\r\\n  .card:hover {\\r\\n    box-shadow: -6px 6px var(--color-7);\\r\\n    transform: translate(6px, -6px);\\r\\n  }\\r\\n\\r\\n  .hero {\\r\\n    background-color: black;\\r\\n  }\\r\\n\\r\\n  @media screen and (max-width: 768px) {\\r\\n    .hero {\\r\\n      background-color: #000000;\\r\\n      background-color: #000000;\\r\\n      background-image: url(\\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3CradialGradient id='a' gradientUnits='objectBoundingBox'%3E%3Cstop offset='0' stop-color='%23151515'/%3E%3Cstop offset='1' stop-color='%23000000'/%3E%3C/radialGradient%3E%3ClinearGradient id='b' gradientUnits='userSpaceOnUse' x1='0' y1='750' x2='1550' y2='750'%3E%3Cstop offset='0' stop-color='%230b0b0b'/%3E%3Cstop offset='1' stop-color='%23000000'/%3E%3C/linearGradient%3E%3Cpath id='s' fill='url(%23b)' d='M1549.2 51.6c-5.4 99.1-20.2 197.6-44.2 293.6c-24.1 96-57.4 189.4-99.3 278.6c-41.9 89.2-92.4 174.1-150.3 253.3c-58 79.2-123.4 152.6-195.1 219c-71.7 66.4-149.6 125.8-232.2 177.2c-82.7 51.4-170.1 94.7-260.7 129.1c-90.6 34.4-184.4 60-279.5 76.3C192.6 1495 96.1 1502 0 1500c96.1-2.1 191.8-13.3 285.4-33.6c93.6-20.2 185-49.5 272.5-87.2c87.6-37.7 171.3-83.8 249.6-137.3c78.4-53.5 151.5-114.5 217.9-181.7c66.5-67.2 126.4-140.7 178.6-218.9c52.3-78.3 96.9-161.4 133-247.9c36.1-86.5 63.8-176.2 82.6-267.6c18.8-91.4 28.6-184.4 29.6-277.4c0.3-27.6 23.2-48.7 50.8-48.4s49.5 21.8 49.2 49.5c0 0.7 0 1.3-0.1 2L1549.2 51.6z'/%3E%3Cg id='g'%3E%3Cuse href='%23s' transform='scale(0.12) rotate(60)'/%3E%3Cuse href='%23s' transform='scale(0.2) rotate(10)'/%3E%3Cuse href='%23s' transform='scale(0.25) rotate(40)'/%3E%3Cuse href='%23s' transform='scale(0.3) rotate(-20)'/%3E%3Cuse href='%23s' transform='scale(0.4) rotate(-30)'/%3E%3Cuse href='%23s' transform='scale(0.5) rotate(20)'/%3E%3Cuse href='%23s' transform='scale(0.6) rotate(60)'/%3E%3Cuse href='%23s' transform='scale(0.7) rotate(10)'/%3E%3Cuse href='%23s' transform='scale(0.835) rotate(-40)'/%3E%3Cuse href='%23s' transform='scale(0.9) rotate(40)'/%3E%3Cuse href='%23s' transform='scale(1.05) rotate(25)'/%3E%3Cuse href='%23s' transform='scale(1.2) rotate(8)'/%3E%3Cuse href='%23s' transform='scale(1.333) rotate(-60)'/%3E%3Cuse href='%23s' transform='scale(1.45) rotate(-30)'/%3E%3Cuse href='%23s' transform='scale(1.6) rotate(10)'/%3E%3C/g%3E%3C/defs%3E%3Cg transform='translate(1920 0)'%3E%3Cg transform='translate(0 1245)'%3E%3Ccircle fill='url(%23a)' r='3000'/%3E%3Cg opacity='0.5'%3E%3Ccircle fill='url(%23a)' r='2000'/%3E%3Ccircle fill='url(%23a)' r='1800'/%3E%3Ccircle fill='url(%23a)' r='1700'/%3E%3Ccircle fill='url(%23a)' r='1651'/%3E%3Ccircle fill='url(%23a)' r='1450'/%3E%3Ccircle fill='url(%23a)' r='1250'/%3E%3Ccircle fill='url(%23a)' r='1175'/%3E%3Ccircle fill='url(%23a)' r='900'/%3E%3Ccircle fill='url(%23a)' r='750'/%3E%3Ccircle fill='url(%23a)' r='500'/%3E%3Ccircle fill='url(%23a)' r='380'/%3E%3Ccircle fill='url(%23a)' r='250'/%3E%3C/g%3E%3Cg %3E%3Cuse href='%23g' transform='rotate(10)'/%3E%3Cuse href='%23g' transform='rotate(120)'/%3E%3Cuse href='%23g' transform='rotate(240)'/%3E%3C/g%3E%3Ccircle fill-opacity='0.51' fill='url(%23a)' r='3000'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\\");\\r\\n      background-attachment: fixed;\\r\\n      background-size: cover;\\r\\n    }\\r\\n  }\\r\\n\\r\\n  .backdrop-blur {\\r\\n    height: 100%;\\r\\n    width: 100%;\\r\\n    -webkit-backdrop-filter: blur(0.1rem);\\r\\n            backdrop-filter: blur(0.1rem);\\r\\n  }\\r\\n\\r\\n  .hero-content {\\r\\n    z-index: 10;\\r\\n  }\\r\\n\\r\\n  svg text {\\r\\n    font-family: \\"Inter\\";\\r\\n    letter-spacing: 10px;\\r\\n    fill: linear-gradient(to top, #30cfd0 0%, #330867 100%);\\r\\n    stroke: var(--color-7);\\r\\n    letter-spacing: 0.1em;\\r\\n    stroke-width: 4;\\r\\n    filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 1));\\r\\n    -webkit-animation: textAnimate 10s cubic-bezier(0.86, 0, 0.07, 1) alternate;\\r\\n            animation: textAnimate 10s cubic-bezier(0.86, 0, 0.07, 1) alternate;\\r\\n  }\\r\\n\\r\\n  @-webkit-keyframes textAnimate {\\r\\n    0% {\\r\\n      stroke-dasharray: 0 50%;\\r\\n      stroke-dashoffset: 20%;\\r\\n      fill: var(--color-1);\\r\\n    }\\r\\n\\r\\n    10% {\\r\\n      fill: var(--color-2);\\r\\n    }\\r\\n\\r\\n    20% {\\r\\n      fill: var(--color-3);\\r\\n    }\\r\\n\\r\\n    30% {\\r\\n      fill: var(--color-4);\\r\\n    }\\r\\n\\r\\n    40% {\\r\\n      fill: var(--color-5);\\r\\n    }\\r\\n\\r\\n    50% {\\r\\n      fill: var(--color-6);\\r\\n    }\\r\\n\\r\\n    60% {\\r\\n      fill: var(--color-7);\\r\\n    }\\r\\n\\r\\n    100% {\\r\\n      stroke-dasharray: 50% 0;\\r\\n      stroke-dashoffstet: -20%;\\r\\n      fill: var(--color-7);\\r\\n    }\\r\\n  }\\r\\n\\r\\n  @keyframes textAnimate {\\r\\n    0% {\\r\\n      stroke-dasharray: 0 50%;\\r\\n      stroke-dashoffset: 20%;\\r\\n      fill: var(--color-1);\\r\\n    }\\r\\n\\r\\n    10% {\\r\\n      fill: var(--color-2);\\r\\n    }\\r\\n\\r\\n    20% {\\r\\n      fill: var(--color-3);\\r\\n    }\\r\\n\\r\\n    30% {\\r\\n      fill: var(--color-4);\\r\\n    }\\r\\n\\r\\n    40% {\\r\\n      fill: var(--color-5);\\r\\n    }\\r\\n\\r\\n    50% {\\r\\n      fill: var(--color-6);\\r\\n    }\\r\\n\\r\\n    60% {\\r\\n      fill: var(--color-7);\\r\\n    }\\r\\n\\r\\n    100% {\\r\\n      stroke-dasharray: 50% 0;\\r\\n      stroke-dashoffstet: -20%;\\r\\n      fill: var(--color-7);\\r\\n    }\\r\\n  }</style>\\r\\n"],"names":[],"mappings":"AA+GE,KAAK,AAAC,CAAC,AACL,SAAS,CAAE,SAAS,CACpB,SAAS,CAAE,SAAS,CACpB,SAAS,CAAE,SAAS,CACpB,SAAS,CAAE,SAAS,CACpB,SAAS,CAAE,SAAS,CACpB,SAAS,CAAE,SAAS,CACpB,SAAS,CAAE,SAAS,CACpB,SAAS,CAAE,SAAS,CACpB,SAAS,CAAE,SAAS,CACpB,UAAU,CAAE,SAAS,AACvB,CAAC,AAED,KAAK,8BAAC,CAAC,AACL,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,SAAS,CAAC,CAC9B,UAAU,CAAE,IAAI,CAAC,IAAI,AACvB,CAAC,AAED,mCAAK,MAAM,AAAC,CAAC,AACX,UAAU,CAAE,IAAI,CAAC,GAAG,CAAC,IAAI,SAAS,CAAC,CACnC,SAAS,CAAE,UAAU,GAAG,CAAC,CAAC,IAAI,CAAC,AACjC,CAAC,AAED,KAAK,8BAAC,CAAC,AACL,gBAAgB,CAAE,KAAK,AACzB,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACpC,KAAK,8BAAC,CAAC,AACL,gBAAgB,CAAE,OAAO,CACzB,gBAAgB,CAAE,OAAO,CACzB,gBAAgB,CAAE,IAAI,gyFAAgyF,CAAC,CACvzF,qBAAqB,CAAE,KAAK,CAC5B,eAAe,CAAE,KAAK,AACxB,CAAC,AACH,CAAC,AAED,cAAc,8BAAC,CAAC,AACd,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,uBAAuB,CAAE,KAAK,MAAM,CAAC,CAC7B,eAAe,CAAE,KAAK,MAAM,CAAC,AACvC,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,OAAO,CAAE,EAAE,AACb,CAAC,AAED,kBAAG,CAAC,IAAI,eAAC,CAAC,AACR,WAAW,CAAE,OAAO,CACpB,cAAc,CAAE,IAAI,CACpB,IAAI,CAAE,gBAAgB,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CACvD,MAAM,CAAE,IAAI,SAAS,CAAC,CACtB,cAAc,CAAE,KAAK,CACrB,YAAY,CAAE,CAAC,CACf,MAAM,CAAE,YAAY,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACjD,iBAAiB,CAAE,0BAAW,CAAC,GAAG,CAAC,aAAa,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,SAAS,CACnE,SAAS,CAAE,0BAAW,CAAC,GAAG,CAAC,aAAa,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,SAAS,AAC7E,CAAC,AAED,mBAAmB,0BAAY,CAAC,AAC9B,EAAE,AAAC,CAAC,AACF,gBAAgB,CAAE,CAAC,CAAC,GAAG,CACvB,iBAAiB,CAAE,GAAG,CACtB,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,IAAI,AAAC,CAAC,AACJ,gBAAgB,CAAE,GAAG,CAAC,CAAC,CACvB,kBAAkB,CAAE,IAAI,CACxB,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AACH,CAAC,AAED,WAAW,0BAAY,CAAC,AACtB,EAAE,AAAC,CAAC,AACF,gBAAgB,CAAE,CAAC,CAAC,GAAG,CACvB,iBAAiB,CAAE,GAAG,CACtB,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AAED,IAAI,AAAC,CAAC,AACJ,gBAAgB,CAAE,GAAG,CAAC,CAAC,CACvB,kBAAkB,CAAE,IAAI,CACxB,IAAI,CAAE,IAAI,SAAS,CAAC,AACtB,CAAC,AACH,CAAC"}`
};
var Hero = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const contactInformation = [
    {
      link: "https://github.com/dylancl",
      icon: "icons/github.svg",
      name: "GitHub",
      alt: "GitHub"
    },
    {
      link: "https://www.linkedin.com/in/dylan-cathelijn-00551214b/",
      icon: "icons/linkedin.svg",
      name: "LinkedIn",
      alt: "LinkedIn"
    },
    {
      link: "mailto:dylan_cathelyn@hotmail.be",
      icon: "icons/email.svg",
      name: "Email",
      alt: "Email"
    }
  ];
  $$result.css.add(css$1);
  return `

${$$result.head += `<link rel="${"preconnect"}" href="${"https://fonts.googleapis.com"}" data-svelte="svelte-1gyjakw"><link rel="${"preconnect"}" href="${"https://fonts.gstatic.com"}" crossorigin data-svelte="svelte-1gyjakw"><link href="${"https://fonts.googleapis.com/css2?family=Heebo:wght@700;900&display=swap"}" rel="${"stylesheet"}" data-svelte="svelte-1gyjakw"><script src="${"https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js"}" data-svelte="svelte-1gyjakw"><\/script>`, ""}

<div class="${"hero vanta min-h-screen bg-base-200 svelte-18th5ak"}"><div class="${"backdrop-blur flex justify-center items-center svelte-18th5ak"}"><div class="${"text-center hero-content w-full svelte-18th5ak"}"><div class="${"w-full"}"><svg class="${"h-50 sm:h-64 md:h-72 lg:h-96 w-full drop-shadow-2xl svelte-18th5ak"}"><text class="${"text-7xl sm:text-8xl md:text-9xl xl:text-11xl md:font-extrabold svelte-18th5ak"}" x="${"0"}" y="${"0"}" fill="${"#3f37c9ff"}"><tspan x="${"0"}" y="${"40%"}">Dylan</tspan>
            <tspan x="${"0"}" y="${"90%"}">Cathelijn</tspan></text></svg>
        <p class="${"text-left text-lg text-white font-bold prose md:ml-4"}">full-stack developer based in Belgium
        </p>
        <div class="${"grid grid-cols-1 md:grid-cols-3 md:ml-4 mt-4 w-full md:w-1/2 lg:w-1/3 gap-7"}">${each(contactInformation, (contactInfo) => `<div>${validate_component(Saos, "Saos").$$render($$result, {
    once: true,
    animation: "fade-in-fwd 1s ease-in-out both",
    css_animation: "animation-delay: 9s;"
  }, {}, {
    default: () => `<a${add_attribute("href", contactInfo.link, 0)}><div class="${"card bg-base-200 p-0 rounded-none text-white shadow-2xl svelte-18th5ak"}"><div class="${"card-body p-3"}"><p class="${"font-bold uppercase"}">${escape(contactInfo.name)}
                      </p></div>
                  </div></a>
              `
  })}
            </div>`)}</div></div></div></div>
</div>`;
});
var css = {
  code: '.projectLink.svelte-1ih9el3 h1.svelte-1ih9el3::after{content:"";display:block;width:0;height:4px;margin-top:-0.3rem;background:var(--color-7);transition:width ease-in-out 0.5s}.projectLink.svelte-1ih9el3 h1.svelte-1ih9el3:hover::after{width:100%}.card.svelte-1ih9el3.svelte-1ih9el3{box-shadow:0 0 var(--color-4);transition:0.5s ease}.card.svelte-1ih9el3.svelte-1ih9el3:hover{box-shadow:-6px 6px var(--color-7);transform:translate(6px, -6px)}@-webkit-keyframes fade-in-fwd{0%{transform:translateZ(-80px);opacity:0}100%{transform:translateZ(0);opacity:1}}@keyframes fade-in-fwd{0%{transform:translateZ(-80px);opacity:0}100%{transform:translateZ(0);opacity:1}}@-webkit-keyframes fade-in-bottom{0%{transform:translateY(50px);opacity:0}100%{transform:translateY(0);opacity:1}}@keyframes fade-in-bottom{0%{transform:translateY(50px);opacity:0}100%{transform:translateY(0);opacity:1}}.card.svelte-1ih9el3.svelte-1ih9el3{height:100%;min-height:100%}',
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n  export async function load({ fetch }) {\\r\\n    const res = await fetch(\`/projects.json\`);\\r\\n    const projects = await res.json();\\r\\n    return {\\r\\n      props: { projects },\\r\\n    };\\r\\n  }\\r\\n<\/script>\\r\\n\\r\\n<script>\\r\\n  import Saos from \\"saos/src/Saos.svelte\\";\\r\\n  import technologies from \\"$lib/tech.json\\";\\r\\n  import Modal from \\"$lib/Modal.svelte\\";\\r\\n  import { onMount } from \\"svelte\\";\\r\\n  import Hero from \\"$lib/Hero.svelte\\";\\r\\n  export let projects;\\r\\n\\r\\n  let Carousel;\\r\\n  let carousel; // for calling methods of carousel instance\\r\\n  onMount(async () => {\\r\\n    const module = await import(\\"svelte-carousel\\");\\r\\n    Carousel = module.default;\\r\\n  });\\r\\n\\r\\n  let clickedProject;\\r\\n  let foundProject;\\r\\n  let projectTags;\\r\\n  let isOpen = false;\\r\\n  const close = () => (isOpen = false);\\r\\n  const open = (e) => {\\r\\n    clickedProject = e.target.offsetParent.dataset.id;\\r\\n    getProject(clickedProject);\\r\\n    isOpen = true;\\r\\n  };\\r\\n\\r\\n  const getProject = (clickedProj) => {\\r\\n    const project = projects.find((project) => project.name == clickedProj);\\r\\n    projectTags =\\r\\n      project &&\\r\\n      project.tags\\r\\n        .map((tag) => {\\r\\n          return \`\\r\\n      <span class=\\"tag text-xs uppercase font-semibold mb-1 ml-2 text-blue-500\\">\${tag}</span>\`;\\r\\n        })\\r\\n        .join(\\"\\");\\r\\n    foundProject = project;\\r\\n  };\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n  <title>Dylan Cathelijn - portfolio</title>\\r\\n</svelte:head>\\r\\n\\r\\n<Hero />\\r\\n<div class=\\"container mx-auto\\">\\r\\n  <div class=\\"my-20\\">\\r\\n    <h1 class=\\"text-4xl my-8 font-bold text-white\\">About me</h1>\\r\\n    <Saos\\r\\n      once={true}\\r\\n      animation={\\"fade-in-bottom 1s ease-in-out both\\"}\\r\\n      css_animation={\\"height: 100%\\"}\\r\\n    >\\r\\n      <p\\r\\n        class=\\" text-lg bg-base-200 p-5 rounded-none leading-normal text-white \\"\\r\\n      >\\r\\n        Hi \u{1F44B}, I'm Dylan Cathelijn. I\u2019m a 22 yr old aspiring fullstack web\\r\\n        developer living in Belgium. Since the age of 10 I've been obsessed with\\r\\n        anything relating to computers, and eventually found my passion to be\\r\\n        making websites. I'm currently enrolled at Arteveldehogeschool in the\\r\\n        Programming course where I'm sharpening my skills and learning to work\\r\\n        with modern webtechnologies. I'm fortunate enough to live in an age\\r\\n        where I'm able to find a ton of information online and use that\\r\\n        information to teach myself new things. I'm passionate about learning\\r\\n        new technologies, and I'm always looking for new ways to improve myself.\\r\\n      </p>\\r\\n    </Saos>\\r\\n  </div>\\r\\n\\r\\n  <div class=\\"my-20\\">\\r\\n    <a class=\\"projectLink flex items-center\\" href=\\"/projects\\">\\r\\n      <h1 class=\\"text-4xl my-8 font-bold text-white\\">Projects</h1>\\r\\n      <img class=\\"h-5 mt-3 ml-2\\" src=\\"/icons/link.svg\\" alt=\\"link icon\\" />\\r\\n    </a>\\r\\n    <div class=\\"grid grid-cols-1 md:grid-cols-3 gap-7 place-items-stretch\\">\\r\\n      {#each projects as project}\\r\\n        <Saos\\r\\n          animation={\\"fade-in-bottom 1s ease-in-out both\\"}\\r\\n          css_animation={\\"height: 100%\\"}\\r\\n        >\\r\\n          <button\\r\\n            on:click={open}\\r\\n            data-id={project.name}\\r\\n            class=\\"card text-left bordered bg-base-200 rounded-none text-white shadow-lg\\"\\r\\n          >\\r\\n            <div class=\\"card-body\\" data-id={project.name}>\\r\\n              <div class=\\"flex -mx-1 flex-wrap\\">\\r\\n                {#each project.tags as tag}\\r\\n                  <span\\r\\n                    class=\\"tag text-xs uppercase font-semibold mb-1 px-1 text-blue-500\\"\\r\\n                    >{tag}\\r\\n                  </span>\\r\\n                {/each}\\r\\n              </div>\\r\\n              <h2 class=\\"card-title text-2xl font-bold break-all\\">\\r\\n                {project.title}\\r\\n              </h2>\\r\\n              <p class=\\"text-gray-500\\">{project.excerpt}</p>\\r\\n            </div>\\r\\n          </button>\\r\\n        </Saos>\\r\\n      {/each}\\r\\n    </div>\\r\\n  </div>\\r\\n\\r\\n  <div class=\\"my-20\\">\\r\\n    <h1 class=\\"text-4xl my-8 font-bold text-white\\">\\r\\n      Technologies I &#10084;&#65039;\\r\\n    </h1>\\r\\n    <div class=\\"grid grid-cols-1 md:grid-cols-3 gap-7 place-items-stretch\\">\\r\\n      {#each technologies as tech}\\r\\n        <Saos\\r\\n          animation={\\"fade-in-bottom 1s ease-in-out both\\"}\\r\\n          css_animation={\\"height: 100%\\"}\\r\\n        >\\r\\n          <div\\r\\n            class=\\"card bordered bg-base-200 px-4 flex flex-row justify-between items-center rounded-none text-white shadow-lg transform transition duration-500 hover:scale-105\\"\\r\\n          >\\r\\n            <p class=\\"text-lg font-bold uppercase\\">{tech.name}</p>\\r\\n            <img class=\\"w-10 h-16\\" src={tech.icon} alt=\\"\\" />\\r\\n          </div>\\r\\n        </Saos>\\r\\n      {/each}\\r\\n    </div>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<Modal\\r\\n  {isOpen}\\r\\n  on:close={close}\\r\\n  tags={projectTags}\\r\\n  projectLink={foundProject\\r\\n    ? foundProject.gh_link\\r\\n      ? foundProject.gh_link\\r\\n      : foundProject.link\\r\\n    : null}\\r\\n  header={foundProject && foundProject.title}\\r\\n>\\r\\n  {#if foundProject}\\r\\n    <svelte:component\\r\\n      this={Carousel}\\r\\n      bind:this={carousel}\\r\\n      autoplay\\r\\n      pauseOnFocus\\r\\n      autoplayProgressVisible\\r\\n      arrows={false}\\r\\n    >\\r\\n      {#each foundProject.images as src}\\r\\n        <img {src} class=\\"carouselImg min-w-full\\" alt=\\"nature\\" />\\r\\n      {/each}\\r\\n    </svelte:component>\\r\\n  {/if}\\r\\n</Modal>\\r\\n\\r\\n<style>\\r\\n  .projectLink h1::after {\\r\\n    content: \\"\\";\\r\\n    display: block;\\r\\n    width: 0;\\r\\n    height: 4px;\\r\\n    margin-top: -0.3rem;\\r\\n    background: var(--color-7);\\r\\n    transition: width ease-in-out 0.5s;\\r\\n  }\\r\\n\\r\\n  .projectLink h1:hover::after {\\r\\n    width: 100%;\\r\\n  }\\r\\n\\r\\n  .card {\\r\\n    box-shadow: 0 0 var(--color-4);\\r\\n    transition: 0.5s ease;\\r\\n  }\\r\\n\\r\\n  .card:hover {\\r\\n    box-shadow: -6px 6px var(--color-7);\\r\\n    transform: translate(6px, -6px);\\r\\n  }\\r\\n\\r\\n  /**\\r\\n * ----------------------------------------\\r\\n * animation fade-in-fwd\\r\\n * ----------------------------------------\\r\\n */\\r\\n  @-webkit-keyframes -global-fade-in-fwd {\\r\\n    0% {\\r\\n      transform: translateZ(-80px);\\r\\n      opacity: 0;\\r\\n    }\\r\\n    100% {\\r\\n      transform: translateZ(0);\\r\\n      opacity: 1;\\r\\n    }\\r\\n  }\\r\\n  @keyframes -global-fade-in-fwd {\\r\\n    0% {\\r\\n      transform: translateZ(-80px);\\r\\n      opacity: 0;\\r\\n    }\\r\\n    100% {\\r\\n      transform: translateZ(0);\\r\\n      opacity: 1;\\r\\n    }\\r\\n  }\\r\\n\\r\\n  @-webkit-keyframes -global-fade-in-bottom {\\r\\n    0% {\\r\\n      transform: translateY(50px);\\r\\n      opacity: 0;\\r\\n    }\\r\\n    100% {\\r\\n      transform: translateY(0);\\r\\n      opacity: 1;\\r\\n    }\\r\\n  }\\r\\n  @keyframes -global-fade-in-bottom {\\r\\n    0% {\\r\\n      transform: translateY(50px);\\r\\n      opacity: 0;\\r\\n    }\\r\\n    100% {\\r\\n      transform: translateY(0);\\r\\n      opacity: 1;\\r\\n    }\\r\\n  }\\r\\n\\r\\n  .card {\\r\\n    height: 100%;\\r\\n    min-height: 100%;\\r\\n  }\\r\\n\\r\\n  /* .carouselImg {\\r\\n    min-width: 100% !important;\\r\\n    min-height: 100% !important;\\r\\n  } */</style>\\r\\n"],"names":[],"mappings":"AAqKE,2BAAY,CAAC,iBAAE,OAAO,AAAC,CAAC,AACtB,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,GAAG,CACX,UAAU,CAAE,OAAO,CACnB,UAAU,CAAE,IAAI,SAAS,CAAC,CAC1B,UAAU,CAAE,KAAK,CAAC,WAAW,CAAC,IAAI,AACpC,CAAC,AAED,2BAAY,CAAC,iBAAE,MAAM,OAAO,AAAC,CAAC,AAC5B,KAAK,CAAE,IAAI,AACb,CAAC,AAED,KAAK,8BAAC,CAAC,AACL,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,SAAS,CAAC,CAC9B,UAAU,CAAE,IAAI,CAAC,IAAI,AACvB,CAAC,AAED,mCAAK,MAAM,AAAC,CAAC,AACX,UAAU,CAAE,IAAI,CAAC,GAAG,CAAC,IAAI,SAAS,CAAC,CACnC,SAAS,CAAE,UAAU,GAAG,CAAC,CAAC,IAAI,CAAC,AACjC,CAAC,AAOD,mBAAmB,AAAQ,WAAW,AAAC,CAAC,AACtC,EAAE,AAAC,CAAC,AACF,SAAS,CAAE,WAAW,KAAK,CAAC,CAC5B,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,SAAS,CAAE,WAAW,CAAC,CAAC,CACxB,OAAO,CAAE,CAAC,AACZ,CAAC,AACH,CAAC,AACD,WAAW,AAAQ,WAAW,AAAC,CAAC,AAC9B,EAAE,AAAC,CAAC,AACF,SAAS,CAAE,WAAW,KAAK,CAAC,CAC5B,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,SAAS,CAAE,WAAW,CAAC,CAAC,CACxB,OAAO,CAAE,CAAC,AACZ,CAAC,AACH,CAAC,AAED,mBAAmB,AAAQ,cAAc,AAAC,CAAC,AACzC,EAAE,AAAC,CAAC,AACF,SAAS,CAAE,WAAW,IAAI,CAAC,CAC3B,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,SAAS,CAAE,WAAW,CAAC,CAAC,CACxB,OAAO,CAAE,CAAC,AACZ,CAAC,AACH,CAAC,AACD,WAAW,AAAQ,cAAc,AAAC,CAAC,AACjC,EAAE,AAAC,CAAC,AACF,SAAS,CAAE,WAAW,IAAI,CAAC,CAC3B,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,SAAS,CAAE,WAAW,CAAC,CAAC,CACxB,OAAO,CAAE,CAAC,AACZ,CAAC,AACH,CAAC,AAED,KAAK,8BAAC,CAAC,AACL,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IAAI,AAClB,CAAC"}`
};
async function load$1({ fetch: fetch2 }) {
  const res = await fetch2(`/projects.json`);
  const projects2 = await res.json();
  return { props: { projects: projects2 } };
}
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { projects: projects2 } = $$props;
  let foundProject;
  let projectTags;
  let isOpen = false;
  if ($$props.projects === void 0 && $$bindings.projects && projects2 !== void 0)
    $$bindings.projects(projects2);
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `${$$result.title = `<title>Dylan Cathelijn - portfolio</title>`, ""}`, ""}

${validate_component(Hero, "Hero").$$render($$result, {}, {}, {})}
<div class="${"container mx-auto"}"><div class="${"my-20"}"><h1 class="${"text-4xl my-8 font-bold text-white"}">About me</h1>
    ${validate_component(Saos, "Saos").$$render($$result, {
      once: true,
      animation: "fade-in-bottom 1s ease-in-out both",
      css_animation: "height: 100%"
    }, {}, {
      default: () => `<p class="${"text-lg bg-base-200 p-5 rounded-none leading-normal text-white "}">Hi \u{1F44B}, I&#39;m Dylan Cathelijn. I\u2019m a 22 yr old aspiring fullstack web
        developer living in Belgium. Since the age of 10 I&#39;ve been obsessed with
        anything relating to computers, and eventually found my passion to be
        making websites. I&#39;m currently enrolled at Arteveldehogeschool in the
        Programming course where I&#39;m sharpening my skills and learning to work
        with modern webtechnologies. I&#39;m fortunate enough to live in an age
        where I&#39;m able to find a ton of information online and use that
        information to teach myself new things. I&#39;m passionate about learning
        new technologies, and I&#39;m always looking for new ways to improve myself.
      </p>`
    })}</div>

  <div class="${"my-20"}"><a class="${"projectLink flex items-center svelte-1ih9el3"}" href="${"/projects"}"><h1 class="${"text-4xl my-8 font-bold text-white svelte-1ih9el3"}">Projects</h1>
      <img class="${"h-5 mt-3 ml-2"}" src="${"/icons/link.svg"}" alt="${"link icon"}"></a>
    <div class="${"grid grid-cols-1 md:grid-cols-3 gap-7 place-items-stretch"}">${each(projects2, (project) => `${validate_component(Saos, "Saos").$$render($$result, {
      animation: "fade-in-bottom 1s ease-in-out both",
      css_animation: "height: 100%"
    }, {}, {
      default: () => `<button${add_attribute("data-id", project.name, 0)} class="${"card text-left bordered bg-base-200 rounded-none text-white shadow-lg svelte-1ih9el3"}"><div class="${"card-body"}"${add_attribute("data-id", project.name, 0)}><div class="${"flex -mx-1 flex-wrap"}">${each(project.tags, (tag) => `<span class="${"tag text-xs uppercase font-semibold mb-1 px-1 text-blue-500"}">${escape(tag)}
                  </span>`)}</div>
              <h2 class="${"card-title text-2xl font-bold break-all"}">${escape(project.title)}</h2>
              <p class="${"text-gray-500"}">${escape(project.excerpt)}</p>
            </div></button>
        `
    })}`)}</div></div>

  <div class="${"my-20"}"><h1 class="${"text-4xl my-8 font-bold text-white"}">Technologies I \u2764\uFE0F
    </h1>
    <div class="${"grid grid-cols-1 md:grid-cols-3 gap-7 place-items-stretch"}">${each(technologies, (tech) => `${validate_component(Saos, "Saos").$$render($$result, {
      animation: "fade-in-bottom 1s ease-in-out both",
      css_animation: "height: 100%"
    }, {}, {
      default: () => `<div class="${"card bordered bg-base-200 px-4 flex flex-row justify-between items-center rounded-none text-white shadow-lg transform transition duration-500 hover:scale-105 svelte-1ih9el3"}"><p class="${"text-lg font-bold uppercase"}">${escape(tech.name)}</p>
            <img class="${"w-10 h-16"}"${add_attribute("src", tech.icon, 0)} alt="${""}"></div>
        `
    })}`)}</div></div></div>

${validate_component(Modal, "Modal").$$render($$result, {
      isOpen,
      tags: projectTags,
      projectLink: null,
      header: foundProject
    }, {}, {
      default: () => `${``}`
    })}`;
  } while (!$$settled);
  return $$rendered;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  load: load$1
});
async function load({ fetch: fetch2 }) {
  const res = await fetch2(`/projects.json`);
  const projects2 = await res.json();
  return { props: { projects: projects2 } };
}
var Projects = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  console.log(import_ts_results.Ok);
  let { projects: projects2 } = $$props;
  if ($$props.projects === void 0 && $$bindings.projects && projects2 !== void 0)
    $$bindings.projects(projects2);
  return `<div class="${"container mx-auto my-20"}"><h1 class="${"text-7xl text-white my-10"}">Projects I&#39;ve worked on</h1>
  <div class="${"grid grid-cols-1 gap-10 place-items-stretch"}">${each(projects2, (project, index2) => `${validate_component(Saos, "Saos").$$render($$result, {
    animation: "fade-in-bottom 1s ease-in-out both"
  }, {}, {
    default: () => `<button${add_attribute("data-id", project.name, 0)} class="${"card w-full card-side text-left bordered bg-base-200 rounded-none text-white shadow-lg"}"><div class="${"w-2/5"}"><img${add_attribute("src", project.images[0], 0)} alt="${""}"></div>
          <div class="${"card-body w-1/2 " + escape(index2 % 2 ? "order-first" : "order-last")}"${add_attribute("data-id", project.name, 0)}><div class="${"flex -mx-1 flex-wrap"}">${each(project.tags, (tag) => `<span class="${"tag text-xs uppercase font-semibold mb-1 px-1 text-blue-500"}">${escape(tag)}
                </span>`)}</div>
            <h2 class="${"card-title text-2xl font-bold break-all"}">${escape(project.title)}</h2>
            <p class="${"text-gray-500"}">${escape(project.excerpt)}</p>
          </div></button>
      `
  })}`)}</div></div>`;
});
var projects = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Projects,
  load
});
var About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `${$$result.title = `<title>About</title>`, ""}`, ""}

<h1>About</h1>
<p>Recently, SvelteKit is released in public beta. And we could finally see what Rich Harris called &quot;<a href="${"https://www.youtube.com/watch?v=qSfdtmcZ4d0"}">Futuristic Web Development</a>&quot; is made of. It&#39;s always better to learn with project, so I made this little blog with SvelteKit and deployed it on the Github Pages.</p>
<p>The Github repo for this blog is <a href="${"https://github.com/svelteland/svelte-kit-blog-demo"}">svelte-kit-blog-demo</a>.</p>`;
});
var about = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": About
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const encoding = isBase64Encoded ? "base64" : headers["content-encoding"] || "utf-8";
  const rawBody = typeof body === "string" ? Buffer.from(body, encoding) : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      ...splitHeaders(rendered.headers),
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
function splitHeaders(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
