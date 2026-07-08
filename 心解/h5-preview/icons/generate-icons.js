const fs = require('fs');
const path = require('path');

const iconDir = path.dirname(__filename);

const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3d6751"/>
      <stop offset="100%" style="stop-color:#5a9a73"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="url(#grad)"/>
  <path d="M50 30 L50 60 M35 45 L50 60 L65 45" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="50" cy="40" r="6" fill="#ffffff"/>
</svg>
`.trim();

fs.writeFileSync(path.join(iconDir, 'icon.svg'), svgContent);

function createPNG(width, height) {
  const png = Buffer.alloc(8 + 25 + 12 + 25 + 12);
  let offset = 0;
  
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  signature.copy(png, offset);
  offset += 8;
  
  function addChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    length.copy(png, offset);
    offset += 4;
    
    const typeBuffer = Buffer.from(type);
    typeBuffer.copy(png, offset);
    offset += 4;
    
    data.copy(png, offset);
    offset += data.length;
    
    const crcData = Buffer.alloc(4 + data.length);
    typeBuffer.copy(crcData, 0);
    data.copy(crcData, 4);
    const crc = crc32(crcData);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc >>> 0, 0);
    crcBuffer.copy(png, offset);
    offset += 4;
  }
  
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return crc ^ 0xFFFFFFFF;
  }
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  addChunk('IHDR', ihdr);
  
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      const cx = width / 2, cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const radius = Math.min(width, height) * 0.45;
      
      if (dist < radius) {
        const t = dist / radius;
        const r = Math.round(61 + (90 - 61) * t);
        const g = Math.round(103 + (154 - 103) * t);
        const b = Math.round(81 + (115 - 81) * t);
        rawData.push(r, g, b, 255);
      } else {
        rawData.push(249, 250, 246, 255);
      }
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  addChunk('IDAT', compressed);
  addChunk('IEND', Buffer.alloc(0));
  
  return png.slice(0, offset);
}

const sizes = [72, 96, 128, 192, 512];
sizes.forEach(size => {
  const png = createPNG(size, size);
  fs.writeFileSync(path.join(iconDir, `icon-${size}x${size}.png`), png);
  console.log(`Generated icon-${size}x${size}.png`);
});

console.log('All icons generated successfully!');