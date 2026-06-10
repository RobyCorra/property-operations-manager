import sharp from 'sharp';
import fs from 'fs';

// Splash: sfondo dark, casa bianca centrata e più piccola
const svgSplash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732" width="2732" height="2732">
  <rect width="2732" height="2732" fill="#1C1C1E"/>
  <!-- Casa centrata, scala ~40% rispetto alla canvas -->
  <polygon points="1366,860 870,1300 1862,1300" fill="white"/>
  <rect x="950" y="1285" width="832" height="620" fill="white"/>
  <!-- Porta -->
  <rect x="1222" y="1520" width="364" height="385" rx="16" fill="#1C1C1E"/>
  <!-- Nome app sotto -->
  <text x="1366" y="2080"
    font-family="-apple-system, 'Helvetica Neue', sans-serif"
    font-size="120"
    font-weight="300"
    fill="white"
    text-anchor="middle"
    opacity="0.7"
    letter-spacing="20">PROPOPS</text>
</svg>`;

const outDir = '/Users/robertocorradino/property-operations-manager/ios/App/App/Assets.xcassets/Splash.imageset';
fs.mkdirSync(outDir, { recursive: true });

const buf = Buffer.from(svgSplash);

await sharp(buf).resize(2732, 2732).png().toFile(`${outDir}/splash.png`);
await sharp(buf).resize(1366, 1366).png().toFile(`${outDir}/splash@0.5x.png`);

// Contents.json per Xcode
fs.writeFileSync(`${outDir}/Contents.json`, JSON.stringify({
  images: [
    { idiom: "universal", scale: "1x", filename: "splash@0.5x.png" },
    { idiom: "universal", scale: "2x", filename: "splash.png" }
  ],
  info: { author: "xcode", version: 1 }
}, null, 2));

console.log('Splash screen generata ✓');
