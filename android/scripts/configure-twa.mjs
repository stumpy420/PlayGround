#!/usr/bin/env node
// Keeps the TWA manifest, Gradle placeholders and Digital Asset Links in sync.
//
// Usage:
//   TWA_HOST=go.ondev.store \
//   TWA_BASE_PATH=/stumpy420/PlayGround/ \
//   TWA_FINGERPRINT="AA:BB:..." \
//   node android/scripts/configure-twa.mjs
//
// The fingerprint must be the SHA-256 of the certificate that actually signs the
// uploaded App Bundle (Play Console > App integrity > App signing key certificate).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..', '..');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const host = (process.env.TWA_HOST || 'go.ondev.store').replace(/^https?:\/\//, '').replace(/\/+$/, '');
let basePath = process.env.TWA_BASE_PATH || '/stumpy420/PlayGround/';
if (!basePath.startsWith('/')) basePath = `/${basePath}`;
if (!basePath.endsWith('/')) basePath = `${basePath}/`;

const packageId = process.env.TWA_PACKAGE || 'com.vanguard.ballistics';
const existingLinks = readJson(path.join(root, 'android/well-known/assetlinks.json'));
const existingFingerprint = existingLinks?.[0]?.target?.sha256_cert_fingerprints?.[0];
const fingerprint = (process.env.TWA_FINGERPRINT || existingFingerprint || '').toUpperCase();
if (!/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(fingerprint)) {
  console.error('TWA_FINGERPRINT must be a SHA-256 certificate fingerprint (32 colon-separated bytes).');
  process.exit(1);
}

const origin = `https://${host}`;
const startUrl = `${basePath}index.html`;
const toUrl = (relative) => `${origin}${basePath}${relative.replace(/^\//, '')}`;

const twa = readJson(path.join(root, 'android/twa-manifest.json'));
Object.assign(twa, {
  packageId,
  host,
  startUrl,
  iconUrl: toUrl('assets/icon-512.png'),
  maskableIconUrl: toUrl('assets/icon-512.png'),
  webManifestUrl: toUrl('manifest.webmanifest'),
  shortcuts: [
    {
      name: 'Deploy Campaign',
      shortName: 'Campaign',
      url: `${startUrl}?mode=campaign`,
      icon: toUrl('assets/icon-192.png'),
    },
    {
      name: 'Gunsmith Armory',
      shortName: 'Gunsmith',
      url: `${startUrl}?mode=armory`,
      icon: toUrl('assets/icon-192.png'),
    },
  ],
});
delete twa.scope;
writeJson(path.join(root, 'android/twa-manifest.json'), twa);
writeJson(path.join(root, 'android/android-project/twa-manifest.json'), twa);

const statements = [{
  relation: ['delegate_permission/common.handle_all_urls'],
  target: {
    namespace: 'android_app',
    package_name: packageId,
    sha256_cert_fingerprints: [fingerprint],
  },
}];
writeJson(path.join(root, 'android/well-known/assetlinks.json'), statements);
writeJson(path.join(root, '.well-known/assetlinks.json'), statements);

const gradlePath = path.join(root, 'android/android-project/app/build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle
  .replace(/hostName:\s*"[^"]*"/, `hostName: "${host}"`)
  .replace(/defaultUrl:\s*"[^"]*"/, `defaultUrl: "${origin}${startUrl}"`)
  .replace(/"sha256_cert_fingerprints":\s*\[[^\]]*\]/g, `"sha256_cert_fingerprints": ["${fingerprint}"]`);
fs.writeFileSync(gradlePath, gradle);

console.log('TWA configuration written:');
console.log(`  host:        ${host}`);
console.log(`  start URL:   ${origin}${startUrl}`);
console.log(`  manifest:    ${origin}${basePath}manifest.webmanifest`);
console.log(`  package:     ${packageId}`);
console.log(`  fingerprint: ${fingerprint}`);
console.log('');
console.log(`Remember: https://${host}/.well-known/assetlinks.json must serve the same statements.`);
console.log('If this project is hosted under a sub-path, publish that file at the domain root.');
