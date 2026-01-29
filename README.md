# Bornevia Carousel Prototype - React Native

Native Android prototype dengan carousel smooth untuk 3 login screens dari design Bornevia.

## Features

- ✨ Smooth carousel transitions dengan native animations
- 📱 Native Android app (React Native)
- 🎨 Modern UI matching Figma design
- ⚡ Fast dan performant dengan native drivers
- 🔄 Auto-play dengan pause on interaction
- 👆 Native swipe gestures dengan PanResponder
- 🎬 Lottie animations dari JSON files
- 🎭 Fade-in animations saat slide change

## Prerequisites

- Node.js (v18 atau lebih tinggi)
- npm atau yarn
- Android Studio dengan Android SDK
- Java JDK 17
- Android emulator atau physical Android device

## Setup

### 1. Install Android Studio & SDK

1. Download [Android Studio](https://developer.android.com/studio)
2. Install Android SDK Platform 34 via SDK Manager
3. Setup environment variables (lihat `SETUP_ANDROID_STUDIO.md`)

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Android Project

Buka folder `android/` di Android Studio untuk first-time Gradle sync.

### 4. Start Metro Bundler

**Terminal 1:**
```bash
npm start
```

### 5. Run on Android

**Terminal 2:**
```bash
npm run android
```

**Atau via Android Studio:**
1. Buka folder `android/` di Android Studio
2. Start emulator atau connect device
3. Klik Run button (green play icon)

> 📖 **Lihat `SETUP_ANDROID_STUDIO.md` untuk panduan lengkap setup Android Studio**

## Project Structure

```
├── App.js                    # Main app entry point
├── index.js                  # App registration
├── android/                   # Android native code
│   ├── app/
│   │   └── src/main/
│   │       ├── java/com/borneviacarousel/
│   │       └── res/
│   └── build.gradle
├── assets/
│   └── animations/
│       ├── 1.json
│       ├── 2.json
│       └── 3.json
└── src/
    └── components/
        ├── Carousel.js       # Native carousel dengan PanResponder
        └── CarouselSlide.js  # Slide component dengan Lottie
```

## Build APK

```bash
cd android
./gradlew assembleRelease
```

APK akan ada di: `android/app/build/outputs/apk/release/app-release.apk`

## Features Details

### Native Swipe Gestures
- Menggunakan React Native `PanResponder` untuk gesture handling
- Swipe kiri untuk next slide
- Swipe kanan untuk previous slide
- Minimum swipe distance: 50px
- Smooth spring animations

### Lottie Animations
- Setiap slide punya Lottie animation sendiri dari JSON files
- Animasi auto-play saat slide aktif
- Animasi loop terus menerus
- Native performance dengan `lottie-react-native`

### Native Animations
- Menggunakan `Animated` API dengan native driver untuk 60fps
- Smooth fade-in saat slide change
- Staggered animations untuk title, description, dan button
- Spring physics untuk feel yang natural

## Troubleshooting

### Metro bundler error
```bash
npm start -- --reset-cache
```

### Android build error
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Lottie animation tidak muncul
- Pastikan JSON files ada di `assets/animations/`
- Check bahwa path di `Carousel.js` benar
- Verify JSON files valid Lottie format

### Node modules issues
```bash
rm -rf node_modules
npm install
```

## Development Tips

- Gunakan `adb logcat` untuk melihat logs Android
- Shake device untuk open developer menu
- Enable hot reload di developer menu
- Use React Native Debugger untuk debugging

## Performance

- Semua animasi menggunakan native driver untuk 60fps
- Lottie animations dioptimasi untuk mobile
- Gesture handling native dan responsive
- Tidak ada web dependencies - pure native code
