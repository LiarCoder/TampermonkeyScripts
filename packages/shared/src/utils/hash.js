/**
 * Calculates the MD5 digest for a string.
 *
 * @param {string} input Text to hash.
 * @returns {string} Lowercase hexadecimal MD5 digest.
 */
export const md5 = (input) => {
  const rotateLeft = (value, shift) => (value << shift) | (value >>> (32 - shift));
  const addUnsigned = (x, y) => {
    const x4 = x & 0x40000000;
    const y4 = y & 0x40000000;
    const x8 = x & 0x80000000;
    const y8 = y & 0x80000000;
    const result = (x & 0x3fffffff) + (y & 0x3fffffff);
    if (x4 & y4) {
      return result ^ 0x80000000 ^ x8 ^ y8;
    }
    if (x4 | y4) {
      if (result & 0x40000000) {
        return result ^ 0xc0000000 ^ x8 ^ y8;
      }
      return result ^ 0x40000000 ^ x8 ^ y8;
    }
    return result ^ x8 ^ y8;
  };
  const f = (x, y, z) => (x & y) | (~x & z);
  const g = (x, y, z) => (x & z) | (y & ~z);
  const h = (x, y, z) => x ^ y ^ z;
  const i = (x, y, z) => y ^ (x | ~z);
  const round = (fn, a, b, c, d, x, s, ac) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, fn(b, c, d)), addUnsigned(x, ac)), s), b);
  const utf8 = unescape(encodeURIComponent(input));
  const words = [];
  const length = utf8.length;
  for (let index = 0; index < length; index++) {
    words[index >> 2] |= utf8.charCodeAt(index) << ((index % 4) * 8);
  }
  words[length >> 2] |= 0x80 << ((length % 4) * 8);
  words[(((length + 8) >> 6) + 1) * 16 - 2] = length * 8;

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let k = 0; k < words.length; k += 16) {
    const aa = a;
    const bb = b;
    const cc = c;
    const dd = d;

    a = round(f, a, b, c, d, words[k + 0], 7, 0xd76aa478);
    d = round(f, d, a, b, c, words[k + 1], 12, 0xe8c7b756);
    c = round(f, c, d, a, b, words[k + 2], 17, 0x242070db);
    b = round(f, b, c, d, a, words[k + 3], 22, 0xc1bdceee);
    a = round(f, a, b, c, d, words[k + 4], 7, 0xf57c0faf);
    d = round(f, d, a, b, c, words[k + 5], 12, 0x4787c62a);
    c = round(f, c, d, a, b, words[k + 6], 17, 0xa8304613);
    b = round(f, b, c, d, a, words[k + 7], 22, 0xfd469501);
    a = round(f, a, b, c, d, words[k + 8], 7, 0x698098d8);
    d = round(f, d, a, b, c, words[k + 9], 12, 0x8b44f7af);
    c = round(f, c, d, a, b, words[k + 10], 17, 0xffff5bb1);
    b = round(f, b, c, d, a, words[k + 11], 22, 0x895cd7be);
    a = round(f, a, b, c, d, words[k + 12], 7, 0x6b901122);
    d = round(f, d, a, b, c, words[k + 13], 12, 0xfd987193);
    c = round(f, c, d, a, b, words[k + 14], 17, 0xa679438e);
    b = round(f, b, c, d, a, words[k + 15], 22, 0x49b40821);

    a = round(g, a, b, c, d, words[k + 1], 5, 0xf61e2562);
    d = round(g, d, a, b, c, words[k + 6], 9, 0xc040b340);
    c = round(g, c, d, a, b, words[k + 11], 14, 0x265e5a51);
    b = round(g, b, c, d, a, words[k + 0], 20, 0xe9b6c7aa);
    a = round(g, a, b, c, d, words[k + 5], 5, 0xd62f105d);
    d = round(g, d, a, b, c, words[k + 10], 9, 0x2441453);
    c = round(g, c, d, a, b, words[k + 15], 14, 0xd8a1e681);
    b = round(g, b, c, d, a, words[k + 4], 20, 0xe7d3fbc8);
    a = round(g, a, b, c, d, words[k + 9], 5, 0x21e1cde6);
    d = round(g, d, a, b, c, words[k + 14], 9, 0xc33707d6);
    c = round(g, c, d, a, b, words[k + 3], 14, 0xf4d50d87);
    b = round(g, b, c, d, a, words[k + 8], 20, 0x455a14ed);
    a = round(g, a, b, c, d, words[k + 13], 5, 0xa9e3e905);
    d = round(g, d, a, b, c, words[k + 2], 9, 0xfcefa3f8);
    c = round(g, c, d, a, b, words[k + 7], 14, 0x676f02d9);
    b = round(g, b, c, d, a, words[k + 12], 20, 0x8d2a4c8a);

    a = round(h, a, b, c, d, words[k + 5], 4, 0xfffa3942);
    d = round(h, d, a, b, c, words[k + 8], 11, 0x8771f681);
    c = round(h, c, d, a, b, words[k + 11], 16, 0x6d9d6122);
    b = round(h, b, c, d, a, words[k + 14], 23, 0xfde5380c);
    a = round(h, a, b, c, d, words[k + 1], 4, 0xa4beea44);
    d = round(h, d, a, b, c, words[k + 4], 11, 0x4bdecfa9);
    c = round(h, c, d, a, b, words[k + 7], 16, 0xf6bb4b60);
    b = round(h, b, c, d, a, words[k + 10], 23, 0xbebfbc70);
    a = round(h, a, b, c, d, words[k + 13], 4, 0x289b7ec6);
    d = round(h, d, a, b, c, words[k + 0], 11, 0xeaa127fa);
    c = round(h, c, d, a, b, words[k + 3], 16, 0xd4ef3085);
    b = round(h, b, c, d, a, words[k + 6], 23, 0x4881d05);
    a = round(h, a, b, c, d, words[k + 9], 4, 0xd9d4d039);
    d = round(h, d, a, b, c, words[k + 12], 11, 0xe6db99e5);
    c = round(h, c, d, a, b, words[k + 15], 16, 0x1fa27cf8);
    b = round(h, b, c, d, a, words[k + 2], 23, 0xc4ac5665);

    a = round(i, a, b, c, d, words[k + 0], 6, 0xf4292244);
    d = round(i, d, a, b, c, words[k + 7], 10, 0x432aff97);
    c = round(i, c, d, a, b, words[k + 14], 15, 0xab9423a7);
    b = round(i, b, c, d, a, words[k + 5], 21, 0xfc93a039);
    a = round(i, a, b, c, d, words[k + 12], 6, 0x655b59c3);
    d = round(i, d, a, b, c, words[k + 3], 10, 0x8f0ccc92);
    c = round(i, c, d, a, b, words[k + 10], 15, 0xffeff47d);
    b = round(i, b, c, d, a, words[k + 1], 21, 0x85845dd1);
    a = round(i, a, b, c, d, words[k + 8], 6, 0x6fa87e4f);
    d = round(i, d, a, b, c, words[k + 15], 10, 0xfe2ce6e0);
    c = round(i, c, d, a, b, words[k + 6], 15, 0xa3014314);
    b = round(i, b, c, d, a, words[k + 13], 21, 0x4e0811a1);
    a = round(i, a, b, c, d, words[k + 4], 6, 0xf7537e82);
    d = round(i, d, a, b, c, words[k + 11], 10, 0xbd3af235);
    c = round(i, c, d, a, b, words[k + 2], 15, 0x2ad7d2bb);
    b = round(i, b, c, d, a, words[k + 9], 21, 0xeb86d391);

    a = addUnsigned(a, aa);
    b = addUnsigned(b, bb);
    c = addUnsigned(c, cc);
    d = addUnsigned(d, dd);
  }

  const wordToHex = (value) => {
    let output = "";
    for (let count = 0; count <= 3; count++) {
      output += `0${((value >>> (count * 8)) & 255).toString(16)}`.slice(-2);
    }
    return output;
  };

  return `${wordToHex(a)}${wordToHex(b)}${wordToHex(c)}${wordToHex(d)}`;
};
