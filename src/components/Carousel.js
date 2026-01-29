import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Animated, TouchableOpacity, Platform, Image, NativeModules } from 'react-native';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 40 : 44;
const BOTTOM_NAV_HEIGHT = 32;

// Native module for navigation bar control
const { NavigationBarModule } = NativeModules;

// Logo image
const logoImage = require('../../assets/images/logo_bornevia.png');

const slides = [
  {
    id: 1,
    title: "Introducing Bornevia",
    description: "Manage all customer's Email, Facebook, Twitter, SMS, and Live chats in single inbox",
    buttonText: "Next",
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    descriptionColor: 'rgba(0, 0, 0, 0.9)',
    buttonColor: '#EE4323',
    buttonTextColor: '#FFFFFF',
    animationPath: require('../../assets/animations/carousel/1.json'),
    showLogo: true,
    isLastSlide: false,
    isLightBackground: true,
  },
  {
    id: 2,
    title: "Collect Insights and Improve",
    description: "Track response time, bottlenecks, and agent metrics to improve your customer service",
    buttonText: "Next",
    backgroundColor: '#EE4323',
    textColor: '#FFFFFF',
    descriptionColor: 'rgba(255, 255, 255, 0.9)',
    buttonColor: '#FFFFFF',
    buttonTextColor: '#EE4323',
    animationPath: require('../../assets/animations/carousel/2.json'),
    showLogo: false,
    isLastSlide: false,
    isLightBackground: false,
  },
  {
    id: 3,
    title: "Manage Support as a Team",
    description: "Add, remove, or change team member and channel easily",
    buttonText: "Login",
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    descriptionColor: 'rgba(0, 0, 0, 0.9)',
    buttonColor: '#EE4323',
    buttonTextColor: '#FFFFFF',
    animationPath: require('../../assets/animations/carousel/3.json'),
    showLogo: false,
    isLastSlide: true,
    isLightBackground: true,
  }
];

export default function Carousel({ onSlideChange, onLogin, onSignUp, isEntering = false }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const translateX = useRef(new Animated.Value(0)).current;
  const colorTransition = useRef(new Animated.Value(0)).current;
  const lottieRefs = useRef([]);
  const currentSlideRef = useRef(0);

  const [fromSlide, setFromSlide] = useState(0);
  const [toSlide, setToSlide] = useState(0);

  // Separate entrance animation (native driver only)
  const entranceScale = useRef(new Animated.Value(isEntering ? 0.9 : 1)).current;
  const entranceOpacity = useRef(new Animated.Value(isEntering ? 0 : 1)).current;
  const entranceTranslateY = useRef(new Animated.Value(isEntering ? 30 : 0)).current;

  // Update ref when state changes
  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  // Entrance animation - triggers when splash finishes
  useEffect(() => {
    if (!isEntering) {
      Animated.parallel([
        Animated.spring(entranceScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(entranceTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        // Fast opacity to ensure carousel is visible before splash fades
        Animated.timing(entranceOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isEntering]);

  // Notify parent and update navigation bar
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentSlide);
    }
    // Update navigation bar icon color
    if (NavigationBarModule) {
      NavigationBarModule.setLightNavigationBar(slides[currentSlide].isLightBackground);
    }
  }, [currentSlide, onSlideChange]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      const nextIndex = (currentSlideRef.current + 1) % slides.length;
      animateToSlide(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Play animation when slide becomes active
  useEffect(() => {
    if (lottieRefs.current[currentSlide]) {
      lottieRefs.current[currentSlide].reset();
      lottieRefs.current[currentSlide].play();
    }
  }, [currentSlide]);

  const animateToSlide = useCallback((toIndex) => {
    const fromIndex = currentSlideRef.current;

    setFromSlide(fromIndex);
    setToSlide(toIndex);
    colorTransition.setValue(0);

    Animated.spring(translateX, {
      toValue: -toIndex * SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();

    Animated.timing(colorTransition, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setFromSlide(toIndex);
    });

    setCurrentSlide(toIndex);
    currentSlideRef.current = toIndex;
  }, [translateX, colorTransition]);

  const goToSlide = (index) => {
    if (index === currentSlideRef.current) return;
    setIsAutoPlaying(false);
    animateToSlide(index);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    const nextIndex = (currentSlideRef.current + 1) % slides.length;
    animateToSlide(nextIndex);
  };

  const handleButtonPress = () => {
    const slide = slides[currentSlideRef.current];
    if (slide.isLastSlide) {
      if (onLogin) onLogin();
    } else {
      goToNext();
    }
  };

  const handleSignUpPress = () => {
    if (onSignUp) onSignUp();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        setIsAutoPlaying(false);
        translateX.setOffset(-currentSlideRef.current * SCREEN_WIDTH);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();

        const swipeDistance = gestureState.dx;
        const current = currentSlideRef.current;

        if (Math.abs(swipeDistance) > SWIPE_THRESHOLD || Math.abs(gestureState.vx) > 0.5) {
          if (swipeDistance < 0 || gestureState.vx < -0.5) {
            const nextIndex = Math.min(current + 1, slides.length - 1);
            animateToSlide(nextIndex);
          } else {
            const prevIndex = Math.max(current - 1, 0);
            animateToSlide(prevIndex);
          }
        } else {
          animateToSlide(current);
        }

        setTimeout(() => setIsAutoPlaying(true), 10000);
      },
    })
  ).current;

  // Interpolate colors
  const backgroundColor = colorTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [slides[fromSlide].backgroundColor, slides[toSlide].backgroundColor],
  });

  const textColor = colorTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [slides[fromSlide].textColor, slides[toSlide].textColor],
  });

  const descriptionColor = colorTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [slides[fromSlide].descriptionColor, slides[toSlide].descriptionColor],
  });

  const buttonColor = colorTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [slides[fromSlide].buttonColor, slides[toSlide].buttonColor],
  });

  const buttonTextColor = colorTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [slides[fromSlide].buttonTextColor, slides[toSlide].buttonTextColor],
  });

  // Dot colors based on background
  const isRedBg = slides[currentSlide].backgroundColor === '#EE4323';
  const activeDotColor = isRedBg ? '#FFFFFF' : '#EE4323';
  const inactiveDotColor = isRedBg ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)';

  const currentSlideData = slides[currentSlide];

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {/* Sign Up button - top right corner for last slide, slides in from right */}
      <Animated.View
        style={[
          styles.signUpTopRight,
          {
            transform: [{
              translateX: translateX.interpolate({
                inputRange: [-SCREEN_WIDTH * 2, -SCREEN_WIDTH * 1.5, -SCREEN_WIDTH],
                outputRange: [0, SCREEN_WIDTH * 0.5, SCREEN_WIDTH],
                extrapolate: 'clamp',
              })
            }],
            opacity: translateX.interpolate({
              inputRange: [-SCREEN_WIDTH * 2, -SCREEN_WIDTH * 1.8],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            })
          }
        ]}
      >
        <TouchableOpacity
          onPress={handleSignUpPress}
          activeOpacity={0.7}
        >
          <Animated.Text style={[styles.signUpText, { color: buttonColor }]}>Sign Up</Animated.Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Top Section - Fixed height for logo area */}
      <Animated.View
        style={[
          styles.topSection,
          {
            overflow: 'hidden',
            opacity: entranceOpacity,
            transform: [
              { translateY: entranceTranslateY },
            ],
          }
        ]}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{
                translateX: translateX.interpolate({
                  inputRange: [-SCREEN_WIDTH * 2, -SCREEN_WIDTH, 0],
                  outputRange: [-SCREEN_WIDTH, -SCREEN_WIDTH, 0],
                  extrapolate: 'clamp',
                })
              }]
            }
          ]}
        >
          <Image
            source={logoImage}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>

      {/* Animation Container - This slides (push in/out) */}
      <Animated.View
        style={[
          styles.animationWrapper,
          {
            opacity: entranceOpacity,
            transform: [
              { scale: entranceScale },
              { translateY: entranceTranslateY },
            ],
          }
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.animationTrack,
            {
              width: SCREEN_WIDTH * slides.length,
              transform: [{ translateX }],
            },
          ]}
        >
          {slides.map((slide, index) => (
            <View key={slide.id} style={styles.animationSlide}>
              <LottieView
                ref={ref => lottieRefs.current[index] = ref}
                source={slide.animationPath}
                autoPlay={false}
                loop={false}
                style={styles.lottie}
              />
            </View>
          ))}
        </Animated.View>
      </Animated.View>

      {/* Bottom Content - Fixed position with fixed heights */}
      <Animated.View
        style={[
          styles.bottomContent,
          {
            opacity: entranceOpacity,
            transform: [
              { translateY: entranceTranslateY },
            ],
          }
        ]}
      >
        {/* Dots - Fixed position */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentSlide ? activeDotColor : inactiveDotColor,
                    width: index === currentSlide ? 24 : 8,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Title - Fixed height container */}
        <View style={styles.titleContainer}>
          <Animated.Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
            {currentSlideData.title}
          </Animated.Text>
        </View>

        {/* Description - Fixed height container */}
        <View style={styles.descriptionContainer}>
          <Animated.Text style={[styles.description, { color: descriptionColor }]} numberOfLines={3}>
            {currentSlideData.description}
          </Animated.Text>
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={handleButtonPress}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.button, { backgroundColor: buttonColor }]}>
            <Animated.Text style={[styles.buttonText, { color: buttonTextColor }]}>
              {currentSlideData.buttonText}
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Navigation Space */}
      <View style={styles.bottomNav} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  signUpTopRight: {
    position: 'absolute',
    top: STATUS_BAR_HEIGHT + 16,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '600',
  },
  topSection: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: STATUS_BAR_HEIGHT,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 162,
    height: 42,
  },
  animationWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  animationTrack: {
    flex: 1,
    flexDirection: 'row',
  },
  animationSlide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 33,
  },
  lottie: {
    width: SCREEN_WIDTH - 66,
    height: SCREEN_WIDTH - 66,
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  bottomContent: {
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    height: 24,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  titleContainer: {
    height: 70,
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 29,
  },
  descriptionContainer: {
    height: 80,
    justifyContent: 'flex-start',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 19,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomNav: {
    height: BOTTOM_NAV_HEIGHT,
  },
});
