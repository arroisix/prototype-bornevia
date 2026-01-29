# Setup Android Studio untuk React Native

Panduan lengkap cara setup project ini di Android Studio.

## Prerequisites

1. **Android Studio** - Download dari [developer.android.com](https://developer.android.com/studio)
2. **Java JDK 17** - Biasanya sudah included dengan Android Studio
3. **Android SDK** - Install via Android Studio SDK Manager

## Step 1: Install Android Studio

1. Download dan install Android Studio
2. Buka Android Studio
3. Pilih "More Actions" → "SDK Manager"
4. Install:
   - Android SDK Platform 34
   - Android SDK Build-Tools
   - Android Emulator
   - Intel x86 Emulator Accelerator (HAXM) - untuk emulator lebih cepat

## Step 2: Setup Environment Variables

### macOS/Linux:
Tambahkan ke `~/.zshrc` atau `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Lalu reload:
```bash
source ~/.zshrc
```

### Verify:
```bash
echo $ANDROID_HOME
# Should show: /Users/yourname/Library/Android/sdk
```

## Step 3: Install Dependencies Project

```bash
cd /Users/indra/prototype-bornevia
npm install
```

## Step 4: Buka Project di Android Studio

### Opsi A: Buka folder `android/` saja (Recommended)

1. Buka Android Studio
2. Pilih "Open an Existing Project"
3. Navigate ke: `/Users/indra/prototype-bornevia/android`
4. Klik "OK"
5. Tunggu Gradle sync selesai (bisa beberapa menit pertama kali)

### Opsi B: Buka seluruh project root

1. Buka Android Studio
2. Pilih "Open an Existing Project"
3. Navigate ke: `/Users/indra/prototype-bornevia`
4. Klik "OK"
5. Android Studio akan detect `android/` folder

## Step 5: Setup Android Emulator

1. Di Android Studio, klik "More Actions" → "Virtual Device Manager"
2. Klik "Create Device"
3. Pilih device (contoh: Pixel 5)
4. Pilih System Image (contoh: API 34, Android 14)
5. Klik "Finish"
6. Klik play button untuk start emulator

**Atau** buat via command line:
```bash
# List available system images
$ANDROID_HOME/emulator/emulator -list-avds

# Start emulator
$ANDROID_HOME/emulator/emulator -avd Pixel_5_API_34
```

## Step 6: Run Project

### Cara 1: Via Terminal (Recommended)

**Terminal 1 - Start Metro:**
```bash
cd /Users/indra/prototype-bornevia
npm start
```

**Terminal 2 - Run Android:**
```bash
cd /Users/indra/prototype-bornevia
npm run android
```

### Cara 2: Via Android Studio

1. Pastikan emulator sudah running
2. Di Android Studio, klik "Run" button (green play icon)
3. Atau: Run → Run 'app'
4. Atau shortcut: `Shift + F10`

### Cara 3: Via Command Line (tanpa Android Studio UI)

```bash
# Terminal 1
npm start

# Terminal 2
npm run android
```

## Step 7: Troubleshooting

### Error: "SDK location not found"
```bash
# Buat file local.properties di android/
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

### Error: "Gradle sync failed"
```bash
cd android
./gradlew clean
cd ..
npm start -- --reset-cache
```

### Error: "Could not find or load main class"
```bash
# Install Java JDK 17
# Verify Java version
java -version
# Should show: openjdk version "17.x.x"
```

### Metro bundler tidak connect
1. Pastikan Metro bundler running di terminal
2. Check bahwa port 8081 tidak blocked
3. Di emulator, tekan `Cmd+M` (Mac) untuk open dev menu
4. Pilih "Settings" → "Debug server host" → masukkan: `localhost:8081`

### Emulator lambat
1. Enable Hardware Acceleration (HAXM)
2. Atau gunakan physical device via USB debugging

## Step 8: Build APK

### Via Android Studio:
1. Build → Generate Signed Bundle / APK
2. Pilih APK
3. Create new keystore (untuk release) atau gunakan debug keystore
4. Klik "Finish"

### Via Command Line:
```bash
cd android
./gradlew assembleRelease
# APK ada di: app/build/outputs/apk/release/app-release.apk
```

## Tips

1. **First time setup bisa lama** - Gradle download banyak dependencies
2. **Gunakan physical device** - Lebih cepat dari emulator
3. **Enable USB Debugging** - Untuk connect physical device
4. **Hot Reload** - Otomatis enabled, shake device untuk dev menu

## Quick Commands

```bash
# Start Metro
npm start

# Run Android
npm run android

# Clean build
cd android && ./gradlew clean && cd ..

# Reset Metro cache
npm start -- --reset-cache

# Check connected devices
adb devices

# View logs
adb logcat | grep ReactNativeJS
```

## Next Steps

Setelah project berhasil running:
1. Test swipe gestures
2. Verify Lottie animations loading
3. Check fade-in animations
4. Test auto-play carousel

Selamat coding! 🚀


