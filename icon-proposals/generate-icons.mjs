import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgSource = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1C1C1E"/>
      <stop offset="100%" style="stop-color:#2C2C2E"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="224" fill="url(#bg)"/>
  <polygon points="512,220 220,500 804,500" fill="white"/>
  <rect x="300" y="490" width="424" height="320" fill="white"/>
  <rect x="420" y="620" width="184" height="190" rx="8" fill="#1C1C1E"/>
</svg>`;

const svgBuffer = Buffer.from(svgSource);

const iosOut = '/Users/robertocorradino/property-operations-manager/ios/App/App/Assets.xcassets/AppIcon.appiconset';
const androidBase = '/Users/robertocorradino/property-operations-manager/android/app/src/main/res';

const iosSizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];

const androidSizes = [
  { size: 48,  dir: 'mipmap-mdpi' },
  { size: 72,  dir: 'mipmap-hdpi' },
  { size: 96,  dir: 'mipmap-xhdpi' },
  { size: 144, dir: 'mipmap-xxhdpi' },
  { size: 192, dir: 'mipmap-xxxhdpi' },
];

fs.mkdirSync(iosOut, { recursive: true });

for (const size of iosSizes) {
  await sharp(svgBuffer).resize(size, size).png().toFile(path.join(iosOut, `icon-${size}.png`));
  console.log(`iOS ${size}x${size} ✓`);
}

for (const { size, dir } of androidSizes) {
  const outDir = path.join(androidBase, dir);
  fs.mkdirSync(outDir, { recursive: true });
  await sharp(svgBuffer).resize(size, size).png().toFile(path.join(outDir, 'ic_launcher.png'));
  await sharp(svgBuffer).resize(size, size).png().toFile(path.join(outDir, 'ic_launcher_round.png'));
  console.log(`Android ${dir} ${size}x${size} ✓`);
}

console.log('\nTutte le icone generate!');
