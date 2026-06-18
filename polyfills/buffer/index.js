"use strict";

function decodeBinaryToUtf8(binary) {
  if (typeof TextDecoder !== "undefined") {
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  }

  try {
    return decodeURIComponent(
      binary
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  } catch {
    return binary;
  }
}

function atobFallback(input) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = String(input).replace(/=+$/, "");
  let output = "";

  if (str.length % 4 === 1) {
    throw new Error("Invalid base64 string.");
  }

  for (
    let bc = 0, bs, buffer, idx = 0;
    (buffer = str.charAt(idx++));
    ~buffer &&
    ((bs = bc % 4 ? bs * 64 + buffer : buffer),
    bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
}

function decodeBase64(value) {
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");

  if (typeof globalThis.atob === "function") {
    return globalThis.atob(normalized);
  }

  return atobFallback(normalized);
}

class BufferShim {
  constructor(text) {
    this.text = text;
  }

  toString(encoding = "utf-8") {
    if (encoding === "utf-8" || encoding === "utf8") {
      return this.text;
    }

    return this.text;
  }

  static from(value, encoding = "utf-8") {
    if (encoding === "base64") {
      return new BufferShim(decodeBinaryToUtf8(decodeBase64(value)));
    }

    return new BufferShim(String(value));
  }
}

module.exports = {
  Buffer: BufferShim,
};
