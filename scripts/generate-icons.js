import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Minimal pure Node.js PNG generator with CRC32 and DEFLATE
function createPngBuffer(width, height, drawPixelFn) {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel;
  const rawData = Buffer.alloc((scanlineLength + 1) * height);

  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * (scanlineLength + 1);
    rawData[scanlineOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      const pixelOffset = scanlineOffset + 1 + (x * bytesPerPixel);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeInt32BE(crc, 8 + len);
    return buf;
  }

  // Precomputed CRC table
  const crcTable = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1);
  }

  // PNG Header
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Draw Obsidian Emerald Cyber Theme: Dark rounded box with glowing emerald/cyan pulse
function drawPulseXIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Center coordinates (-1 to 1)
  const cx = (x - w / 2) / (w / 2);
  const cy = (y - h / 2) / (h / 2);
  const dist = Math.sqrt(cx * cx + cy * cy);

  // Rounded squircle border
  const cornerR = 0.85;
  const inBox = Math.pow(Math.abs(cx), 3) + Math.pow(Math.abs(cy), 3) <= 1.0;

  if (!inBox) {
    return [0, 0, 0, 0]; // Transparent outer
  }

  // Obsidian gradient background: dark slate (#0a1017) to dark emerald (#022c22)
  let r = Math.floor(10 + ny * 5);
  let g = Math.floor(16 + ny * 28);
  let b = Math.floor(23 + ny * 10);
  let a = 255;

  // Emerald glowing border
  const borderDist = Math.abs(Math.pow(Math.abs(cx), 3) + Math.pow(Math.abs(cy), 3) - 0.88);
  if (borderDist < 0.12) {
    const glow = (1 - borderDist / 0.12);
    r = Math.floor(r * (1 - glow) + 16 * glow);
    g = Math.floor(g * (1 - glow) + 185 * glow);
    b = Math.floor(b * (1 - glow) + 129 * glow);
  }

  // Draw Pulse Wave line: y = pulse(x)
  // Wave key points: 0.2 -> mid, 0.4 -> dip, 0.5 -> peak, 0.6 -> drop, 0.7 -> recovery, 0.8 -> mid
  const midY = 0.5;
  let targetY = midY;
  if (nx >= 0.2 && nx < 0.38) targetY = midY;
  else if (nx >= 0.38 && nx < 0.48) targetY = midY - 0.22 * (nx - 0.38) / 0.10;
  else if (nx >= 0.48 && nx < 0.58) targetY = (midY - 0.22) + 0.46 * (nx - 0.48) / 0.10;
  else if (nx >= 0.58 && nx < 0.68) targetY = (midY + 0.24) - 0.34 * (nx - 0.58) / 0.10;
  else if (nx >= 0.68 && nx < 0.78) targetY = (midY - 0.10) + 0.10 * (nx - 0.68) / 0.10;
  else targetY = midY;

  const lineDist = Math.abs(ny - targetY);
  const thickness = w <= 16 ? 0.12 : 0.055;
  if (nx >= 0.18 && nx <= 0.82 && lineDist < thickness) {
    const intensity = 1 - lineDist / thickness;
    // Cyan to Emerald gradient
    const pulseR = Math.floor(6 + nx * 10);
    const pulseG = Math.floor(182 + (1 - nx) * 30);
    const pulseB = Math.floor(212 - nx * 83);
    r = Math.floor(r * (1 - intensity) + pulseR * intensity);
    g = Math.floor(g * (1 - intensity) + pulseG * intensity);
    b = Math.floor(b * (1 - intensity) + pulseB * intensity);
  }

  return [r, g, b, a];
}

const iconDir = path.resolve('extension/icons');
if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const buf = createPngBuffer(size, size, drawPulseXIcon);
  const outPath = path.join(iconDir, `icon${size}.png`);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated ${outPath} (${buf.length} bytes)`);
}
