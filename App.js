import React, { useState, useRef, useEffect } from 'react';
import { StatusBar, StyleSheet, View, Animated, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Carousel from './src/components/Carousel';
import MainApp from './src/screens/MainApp';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMainApp, setShowMainApp] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  const [carouselReady, setCarouselReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Crossfade animation - splash fades out while carousel is already rendered behind
  const splashOpacity = useRef(new Animated.Value(1)).current;

  // Login transition animations
  const loginTransition = useRef(new Animated.Value(0)).current;
  const mainAppTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const mainAppScale = useRef(new Animated.Value(0.95)).current;
  const mainAppOpacity = useRef(new Animated.Value(0)).current;

  const handleLogin = () => {
    console.log('Login pressed');
    setIsTransitioning(true);
    setShowMainApp(true);

    // Premium transition: carousel scales down + fades, main app slides up with spring
    Animated.parallel([
      // Carousel exit animation
      Animated.timing(loginTransition, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // MainApp entrance - slide up with spring
      Animated.spring(mainAppTranslateY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      // MainApp scale
      Animated.spring(mainAppScale, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      // MainApp opacity
      Animated.timing(mainAppOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLoggedIn(true);
      setIsTransitioning(false);
    });
  };

  const handleSignUp = () => {
    console.log('Sign Up pressed');
    handleLogin(); // Use same premium transition
  };

  const handleLogout = () => {
    console.log('Logout pressed');
    setIsLoggedIn(false);
    setShowMainApp(false);
    setCurrentSlide(0);
    // Reset animation values
    loginTransition.setValue(0);
    mainAppTranslateY.setValue(SCREEN_HEIGHT);
    mainAppScale.setValue(0.95);
    mainAppOpacity.setValue(0);
  };

  const handleSplashFinish = () => {
    // Start carousel entrance animation first
    setCarouselReady(true);

    // Delay splash fade to let carousel become visible first
    // Carousel opacity animation is 150ms, we wait 100ms then fade splash over 200ms
    // This ensures carousel is nearly fully opaque before splash is gone
    setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setSplashFinished(true);
      });
    }, 100);
  };

  // After transition complete, show only MainApp
  if (isLoggedIn && !isTransitioning) {
    return (
      <SafeAreaProvider>
        <MainApp onLogout={handleLogout} />
      </SafeAreaProvider>
    );
  }

  const isRedBackground = currentSlide === 1;

  // Carousel exit animations
  const carouselScale = loginTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });

  const carouselOpacity = loginTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const carouselTranslateY = loginTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar
          barStyle={isRedBackground && splashFinished && !isTransitioning ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent={true}
        />

        {/* Carousel with exit animation */}
        <Animated.View
          style={[
            styles.screenContainer,
            {
              opacity: carouselOpacity,
              transform: [
                { scale: carouselScale },
                { translateY: carouselTranslateY },
              ],
            },
          ]}
        >
          <Carousel
            onSlideChange={setCurrentSlide}
            onLogin={handleLogin}
            onSignUp={handleSignUp}
            isEntering={!carouselReady}
          />
        </Animated.View>

        {/* MainApp with entrance animation - rendered on top during transition */}
        {showMainApp && (
          <Animated.View
            style={[
              styles.mainAppContainer,
              {
                opacity: mainAppOpacity,
                transform: [
                  { translateY: mainAppTranslateY },
                  { scale: mainAppScale },
                ],
              },
            ]}
          >
            <MainApp onLogout={handleLogout} />
          </Animated.View>
        )}

        {/* Splash overlay - fades out to reveal carousel */}
        {!splashFinished && (
          <Animated.View style={[styles.splashContainer, { opacity: splashOpacity }]}>
            <LottieView
              source={require('./assets/animations/opening.json')}
              autoPlay
              loop={false}
              speed={1.3}
              onAnimationFinish={handleSplashFinish}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
  mainAppContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
});