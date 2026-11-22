# Vanguard Ballistics: Android App Bundle (.AAB) Project

This is the complete, official Trusted Web Activity (TWA) Android project for Vanguard Ballistics: Tactical Operations.

## How to Build the Android App Bundle (.aab):

### Option 1: Using Android Studio (Recommended)
1. Open Android Studio.
2. Select **Open** and choose this `android-project` folder.
3. Wait for Gradle sync to complete.
4. Click on the top menu: **Build > Generate Signed Bundle / APK...**
5. Select **Android App Bundle** (.aab) and click Next.
6. Create or select your release keystore.
7. Click **Create** / **Finish**.
8. Your `.aab` file will be generated in `app/release/app-release.aab` ready for Google Play Console!

### Option 2: Using Command Line (Terminal)
```bash
# In this directory:
./gradlew bundleRelease
```
The compiled Android App Bundle will be output to:
`app/build/outputs/bundle/release/app-release.aab`

### Option 3: Google Play Console Upload
1. Log into https://play.google.com/console
2. Select your app: **Vanguard Ballistics** (`com.vanguard.ballistics`)
3. Navigate to **Release > Production** (or Internal Testing)
4. Upload `app-release.aab`
5. Roll out to Google Play!
