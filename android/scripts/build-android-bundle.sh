#!/usr/bin/env bash
# ==============================================================================
# Vanguard Ballistics: Android App Bundle (.aab) Build Script
# Uses Google's official Bubblewrap CLI (Trusted Web Activity - TWA)
# Produces Google Play Store ready App Bundle: app-release-bundle.aab
# ==============================================================================

set -e

echo "=== VANGUARD BALLISTICS: ANDROID APP BUNDLE GENERATOR ==="
echo "Target Package: com.vanguard.ballistics"
echo "Format: Android App Bundle (.aab)"

# 1. Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required to run Bubblewrap."
    exit 1
fi

# 2. Check if Java is installed (needed for Android SDK compiler)
if ! command -v java &> /dev/null; then
    echo "Notice: Java (JDK 17+) is required by Gradle to compile .aab on this machine."
    echo "If building locally or in CI/CD (GitHub Actions), ensure openjdk-17-jdk is installed:"
    echo "  sudo apt update && sudo apt install -y openjdk-17-jdk"
fi

# 3. Check for existing twa-manifest.json
if [ ! -f "twa-manifest.json" ]; then
    echo "Error: twa-manifest.json not found in project root."
    exit 1
fi

echo "Step 1: Installing / invoking @bubblewrap/cli..."
# Run bubblewrap build using the existing twa-manifest.json
npx @bubblewrap/cli build

echo ""
echo "=== BUILD COMPLETE ==="
echo "Your production Android App Bundle has been compiled to:"
echo "  ./app-release-bundle.aab"
echo ""
echo "Next Steps for Google Play Console:"
echo "1. Log into Google Play Console (https://play.google.com/console)"
echo "2. Create or select 'Vanguard Ballistics'"
echo "3. Go to Release > Production / Internal Testing"
echo "4. Upload 'app-release-bundle.aab'"
echo "5. Submit for review and publish!"
