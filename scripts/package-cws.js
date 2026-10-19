import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

/**
 * Pure Node.js ZIP archive generator with zero dependencies.
 * Produces standard ZIP files with forward-slash paths, UTF-8 filenames,
 * and standard DEFLATE compression.
 */

// CRC-32 lookup table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function calculateCrc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function toDosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (Math.floor(date.getSeconds() / 2));
  return { dosDate, dosTime };
}

export function createZipArchive(files, outputPath) {
  const localHeaders = [];
  const centralHeaders = [];
  let currentOffset = 0;

  const now = new Date();
  const { dosDate, dosTime } = toDosDateTime(now);

  for (const file of files) {
    const relativePath = file.relativePath.replace(/\\/g, '/');
    const pathBuf = Buffer.from(relativePath, 'utf8');
    const rawData = file.data;
    const uncompressedSize = rawData.length;
    const crc32 = calculateCrc32(rawData);

    // Deflate compression
    const compressedData = zlib.deflateRawSync(rawData, { level: 9 });
    const compressedSize = compressedData.length;

    // Local file header (30 bytes + filename)
    const localHeader = Buffer.alloc(30 + pathBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4);         // version needed (2.0)
    localHeader.writeUInt16LE(0x0800, 6);     // flags (bit 11 = UTF-8)
    localHeader.writeUInt16LE(8, 8);          // compression method (DEFLATE)
    localHeader.writeUInt16LE(dosTime, 10);   // mod time
    localHeader.writeUInt16LE(dosDate, 12);   // mod date
    localHeader.writeUInt32LE(crc32, 14);     // crc32
    localHeader.writeUInt32LE(compressedSize, 18);   // compressed size
    localHeader.writeUInt32LE(uncompressedSize, 22); // uncompressed size
    localHeader.writeUInt16LE(pathBuf.length, 26);   // filename length
    localHeader.writeUInt16LE(0, 28);         // extra length
    pathBuf.copy(localHeader, 30);

    localHeaders.push(localHeader);
    localHeaders.push(compressedData);

    // Central directory header (46 bytes + filename)
    const centralHeader = Buffer.alloc(46 + pathBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(20, 4);         // version made by
    centralHeader.writeUInt16LE(20, 6);         // version needed
    centralHeader.writeUInt16LE(0x0800, 8);     // flags
    centralHeader.writeUInt16LE(8, 10);         // compression method
    centralHeader.writeUInt16LE(dosTime, 12);   // mod time
    centralHeader.writeUInt16LE(dosDate, 14);   // mod date
    centralHeader.writeUInt32LE(crc32, 16);     // crc32
    centralHeader.writeUInt32LE(compressedSize, 20);   // compressed size
    centralHeader.writeUInt32LE(uncompressedSize, 24); // uncompressed size
    centralHeader.writeUInt16LE(pathBuf.length, 28);   // filename length
    centralHeader.writeUInt16LE(0, 30);         // extra length
    centralHeader.writeUInt16LE(0, 32);         // comment length
    centralHeader.writeUInt16LE(0, 34);         // disk number start
    centralHeader.writeUInt16LE(0, 36);         // internal attrs
    centralHeader.writeUInt32LE(0, 38);         // external attrs
    centralHeader.writeUInt32LE(currentOffset, 42); // local header offset
    pathBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);

    currentOffset += localHeader.length + compressedData.length;
  }

  const centralDirOffset = currentOffset;
  const centralDirBuffer = Buffer.concat(centralHeaders);
  const centralDirSize = centralDirBuffer.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);       // signature
  eocd.writeUInt16LE(0, 4);                // disk number
  eocd.writeUInt16LE(0, 6);                // disk start
  eocd.writeUInt16LE(files.length, 8);      // entries on disk
  eocd.writeUInt16LE(files.length, 10);     // total entries
  eocd.writeUInt32LE(centralDirSize, 12);   // central dir size
  eocd.writeUInt32LE(centralDirOffset, 16); // central dir offset
  eocd.writeUInt16LE(0, 20);               // comment length

  const fullArchive = Buffer.concat([...localHeaders, centralDirBuffer, eocd]);
  fs.writeFileSync(outputPath, fullArchive);
  return fullArchive.length;
}

function collectFilesRecursively(dir, rootDir = dir) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    // Ignore OS junk and hidden files
    if (item.name === '.DS_Store' || item.name === 'Thumbs.db' || item.name.startsWith('.')) {
      continue;
    }
    if (item.isDirectory()) {
      results = results.concat(collectFilesRecursively(fullPath, rootDir));
    } else {
      const relativePath = path.relative(rootDir, fullPath);
      results.push({
        relativePath,
        data: fs.readFileSync(fullPath)
      });
    }
  }
  return results;
}

function runPackage() {
  const extensionDir = path.resolve('extension');
  const manifestPath = path.join(extensionDir, 'manifest.json');
  const outputZipPath = path.resolve('pulsex-cws.zip');

  if (!fs.existsSync(manifestPath)) {
    console.error('Error: extension/manifest.json not found!');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`\n========================================`);
  console.log(` Packaging PulseX v${manifest.version} for Chrome Web Store`);
  console.log(`========================================\n`);

  console.log(`Manifest Check:`);
  console.log(` - Name: ${manifest.name}`);
  console.log(` - Version: ${manifest.version}`);
  console.log(` - Manifest Version: ${manifest.manifest_version}`);
  console.log(` - Description (${manifest.description.length} chars): "${manifest.description}"`);

  if (manifest.description.length > 132) {
    console.warn(`\n[WARNING] Manifest description exceeds 132 characters! CWS will truncate or reject.`);
  }

  const files = collectFilesRecursively(extensionDir);
  console.log(`\nArchiving ${files.length} extension files to pulsex-cws.zip:`);
  for (const f of files) {
    const normalized = f.relativePath.replace(/\\/g, '/');
    console.log(`  + ${normalized} (${f.data.length} bytes)`);
  }

  const zipSize = createZipArchive(files, outputZipPath);
  console.log(`\nSUCCESS: Packaged ${files.length} files into pulsex-cws.zip (${(zipSize / 1024).toFixed(1)} KB)`);
  console.log(`Location: ${outputZipPath}`);
  console.log(`Ready for direct upload to Chrome Developer Dashboard!\n`);
}

runPackage();
