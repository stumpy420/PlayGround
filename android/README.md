# Android / Trusted Web Activity

The web build is wrapped as a Trusted Web Activity (TWA) with Bubblewrap. All
host, path, icon and signing values are kept in sync by one script:

```bash
TWA_HOST=go.ondev.store \
TWA_BASE_PATH=/stumpy420/PlayGround/ \
TWA_FINGERPRINT="AA:BB:CC:..." \
node android/scripts/configure-twa.mjs
```

`TWA_FINGERPRINT` is the SHA-256 fingerprint of the certificate that signs the
uploaded App Bundle. Find it in Play Console under **App integrity → App signing
key certificate**, or with `keytool -list -v -keystore android.keystore`. If it
is omitted, the script keeps the value already present in
`android/well-known/assetlinks.json`.

The script rewrites:

- `android/twa-manifest.json` (host, start URL, icon URLs, shortcuts)
- `android/android-project/app/build.gradle` (Gradle manifest placeholders)
- `.well-known/assetlinks.json` and `android/well-known/assetlinks.json`

## Asset links

Digital Asset Links must be served from the **origin root**, not from the app
sub-path:

```text
https://<host>/.well-known/assetlinks.json
```

If the game is hosted at `https://go.ondev.store/stumpy420/PlayGround/`, the
file still has to be published at `https://go.ondev.store/.well-known/assetlinks.json`.
Without it Android falls back to a Custom Tab instead of a fullscreen TWA.

## Build

From the repository root, with Bubblewrap:

```bash
cd android && ./scripts/build-android-bundle.sh
```

The wrapper changes into `android/`, where `twa-manifest.json` lives. The
checked-in Gradle project embeds the same placeholders, so it can also be opened
in Android Studio or built directly with the Android SDK (`gradle bundleRelease`
from `android/android-project/`). No Gradle wrapper is checked in.

## Deep links

The launcher shortcuts open:

- `?mode=campaign` — campaign operations panel
- `?mode=armory` — gunsmith armory panel

`?mode=skirmish`, `?mode=settings` and `?mode=manual` are also supported.
