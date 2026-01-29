# Quick Start Guide

## Cara Paling Cepat Run Project

### Step 1: Install Android Studio
1. Download: https://developer.android.com/studio
2. Install dan buka Android Studio
3. Setup Wizard → Install Android SDK

### Step 2: Setup Environment (macOS)

Buka terminal dan jalankan:
```bash
# Tambahkan ke ~/.zshrc
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Install Dependencies
```bash
cd /Users/indra/prototype-bornevia
npm install
```

### Step 4: Buka di Android Studio
1. Buka Android Studio
2. File → Open
3. Pilih folder: `/Users/indra/prototype-bornevia/android`
4. Tunggu Gradle sync selesai (pertama kali bisa 5-10 menit)

### Step 5: Buat Emulator
1. Di Android Studio: Tools → Device Manager
2. Create Device → Pilih Pixel 5
3. Download System Image (API 34)
4. Finish → Start emulator

### Step 6: Run Project

**Cara 1: Via Terminal (Paling Mudah)**
```bash
# Terminal 1
npm start

# Terminal 2 (setelah Metro running)
npm run android
```

**Cara 2: Via Android Studio**
1. Pastikan emulator running
2. Klik Run button (▶️) di Android Studio
3. Atau: Run → Run 'app'

## Troubleshooting Cepat

### "SDK location not found"
```bash
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

### "Gradle sync failed"
```bash
cd android
./gradlew clean
cd ..
```

### Metro tidak connect
- Pastikan `npm start` running
- Di emulator: Cmd+M → Settings → Debug server host → `localhost:8081`

## Tips
- **Pertama kali setup bisa lama** - Gradle download dependencies
- **Gunakan physical device** - Lebih cepat dari emulator
- **Enable USB Debugging** - Untuk connect device via USB

Untuk panduan lengkap, lihat `SETUP_ANDROID_STUDIO.md`


