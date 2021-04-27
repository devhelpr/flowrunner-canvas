export const ieee754 = (n: number) => {

  // Buffer is not defined... this is not compatible with web worker
  var farr = new Float32Array(1);
  farr[0] = n;
  var barr = new Int8Array(farr.buffer)
  return Uint8Array.from(barr);
  /*const buf = Buffer.alloc(4);
  buf.writeFloatLE(n, 0);
  return Uint8Array.from(buf);
  */
};

export const encodeString = (str: string) => [
  str.length,
  ...str.split("").map(s => s.charCodeAt(0))
];

export const signedLEB128 = (n: number) => {
  const buffer : any = [];
  let more = true;
  const isNegative = n < 0;
  const bitCount = Math.ceil(Math.log2(Math.abs(n))) + 1;
  while (more) {
    let byte = n & 0x7f;
    n >>= 7;
    if (isNegative) {
      n = n | -(1 << (bitCount - 8));
    }
    if ((n === 0 && (byte & 0x40) === 0) || (n === -1 && (byte & 0x40) !== 0x40)) {
      more = false;
    } else {
      byte |= 0x80;
    }
    buffer.push(byte);
  }
  return buffer;
};

export const unsignedLEB128 = (value: number) => {
  const buffer : any[] = [];
  do {
    let byte = value & 0x7f;
    value >>>= 7;
    if (value !== 0) {
      byte |= 0x80;
    }
    buffer.push(byte);
  } while (value !== 0);
  return buffer;
};
