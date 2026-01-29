import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform, Image, PixelRatio } from 'react-native';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 40 : 44;
const BOTTOM_NAV_HEIGHT = 24;

// Responsive scaling based on screen height (base: 800px)
const BASE_HEIGHT = 800;
const scale = (size) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Font family
const FONT_FAMILY = 'RobotoFlex-Variable';

// Logo image
const logoImage = require('../../assets/images/logo_bornevia.png');

export default function CarouselSlide({ slide, isActive, width, onNext, currentIndex, totalSlides, onDotPress }) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    if (slide.animationPath) {
      setAnimationData(slide.animationPath);
    }
  }, [slide.animationPath]);

  const handleButtonPress = () => {
    if (slide.isLastSlide) {
      console.log('Login pressed');
    } else {
      onNext();
    }
  };

  const handleSignUpPress = () => {
    console.log('Sign Up pressed');
  };

  // Determine dot colors based on background
  const isRedBg = slide.backgroundColor === '#EE4323';
  const activeDotColor = isRedBg ? '#FFFFFF' : '#EE4323';
  const inactiveDotColor = isRedBg ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)';

  return (
    <View style={[styles.slide, { width, backgroundColor: slide.backgroundColor }]}>
      {/* Sign Up button - top right corner for last slide */}
      {slide.isLastSlide && (
        <TouchableOpacity
          onPress={handleSignUpPress}
          style={styles.signUpTopRight}
          activeOpacity={0.7}
        >
          <Text style={[styles.signUpText, { color: slide.buttonColor }]}>Sign Up</Text>
        </TouchableOpacity>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Top Section - Logo (only slide 1) */}
        <View style={styles.topSection}>
          {slide.showLogo && (
            <View style={styles.logoContainer}>
              <Image
                source={logoImage}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        {/* Middle Section - Animation */}
        <View style={styles.middleSection}>
          <View style={styles.imageContainer}>
            {animationData && isActive ? (
              <LottieView
                source={animationData}
                autoPlay
                loop
                style={styles.lottie}
              />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: slide.backgroundColor }]} />
            )}
          </View>

          {/* Dots/Indicators - Below animation */}
          <View style={styles.dotsContainer}>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onDotPress(index)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: index === currentIndex ? activeDotColor : inactiveDotColor,
                      width: index === currentIndex ? 24 : 8,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Section - Text and Button */}
        <View style={styles.bottomSection}>
          <Text style={[styles.title, { color: slide.textColor }]}>
            {slide.title}
          </Text>
          <Text style={[styles.description, { color: slide.descriptionColor }]}>
            {slide.description}
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: slide.buttonColor }]}
            onPress={handleButtonPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: slide.buttonTextColor }]}>
              {slide.buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation Space */}
      <View style={styles.bottomNav} />
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
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
    fontSize: moderateScale(16),
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: STATUS_BAR_HEIGHT,
  },
  topSection: {
    height: scale(80),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 162,
    height: 42,
  },
  middleSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 24,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    backgroundColor: 'yellow',
  },
  title: {
    fontSize: 24,
    fontFamily: FONT_FAMILY,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    width: '100%',
    paddingVertical: scale(16),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: moderateScale(18),
    fontFamily: FONT_FAMILY,
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomNav: {
    height: BOTTOM_NAV_HEIGHT,
  },
});
