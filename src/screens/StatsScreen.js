import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect, Line } from 'react-native-svg';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 40 : 44;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_SCROLL_DISTANCE = 60;

// Preferences Icon from Figma
const PreferencesIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 15C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21C16.6883 21 15.5756 20.1573 15.168 18.9844C15.1133 18.9936 15.0573 19 15 19H4C3.44772 19 3 18.5523 3 18C3 17.4477 3.44772 17 4 17H15C15.0573 17 15.1133 17.0054 15.168 17.0146C15.5759 15.8422 16.6886 15 18 15ZM18 17C17.4477 17 17 17.4477 17 18C17 18.5523 17.4477 19 18 19C18.5523 19 19 18.5523 19 18C19 17.4477 18.5523 17 18 17ZM12 9C13.3113 9 14.4231 9.84236 14.8311 11.0146C14.886 11.0053 14.9424 11 15 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H15C14.9423 13 14.886 12.9937 14.8311 12.9844C14.4233 14.1571 13.3116 15 12 15C10.6883 15 9.5756 14.1573 9.16797 12.9844C9.11328 12.9936 9.05733 13 9 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H9C9.05727 11 9.11333 11.0054 9.16797 11.0146C9.57585 9.8422 10.6886 9 12 9ZM12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11ZM6 3C7.3113 3 8.42308 3.84236 8.83105 5.01465C8.886 5.0053 8.94239 5 9 5H20C20.5523 5 21 5.44772 21 6C21 6.55228 20.5523 7 20 7H9C8.94234 7 8.88605 6.99375 8.83105 6.98438C8.42333 8.15712 7.31162 9 6 9C4.34315 9 3 7.65685 3 6C3 4.34315 4.34315 3 6 3ZM6 5C5.44772 5 5 5.44772 5 6C5 6.55228 5.44772 7 6 7C6.55228 7 7 6.55228 7 6C7 5.44772 6.55228 5 6 5Z"
      fill="rgba(0, 0, 0, 0.5)"
    />
  </Svg>
);

// Caret Down Icon from Figma
const CaretDownIcon = ({ color = '#0D0D0D', size = 12 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 10L12 16L7 10H17Z" fill={color} />
  </Svg>
);

const statsData = [
  { value: '32%', label: 'Tickets Received', change: '+8%', positive: true },
  { value: '35%', label: 'Tickets Closed', change: '-2%', positive: false },
  { value: '5 minutes', label: 'Avg First Response Time', change: '+12%', positive: true },
  { value: '50 replies', label: 'Avg Replies per Day', change: '-2%', positive: false },
  { value: 'Wednesday', label: 'Highest Traffic Day', change: null, positive: null },
];

const chartData = [
  { day: 'Su', value: 92 },
  { day: 'Mo', value: 124 },
  { day: 'Tu', value: 87 },
  { day: 'We', value: 110 },
  { day: 'Te', value: 77 },
  { day: 'Fr', value: 23 },
  { day: 'Sa', value: 53 },
];

const StatCard = ({ stat, isFullWidth = false }) => (
  <View style={[styles.statCard, isFullWidth && styles.statCardFull]}>
    <View style={styles.statHeader}>
      <Text style={styles.statValue}>{stat.value}</Text>
      {stat.change && (
        <View style={[styles.changeBadge, stat.positive ? styles.positiveBadge : styles.negativeBadge]}>
          <Text style={styles.changeText}>{stat.change}</Text>
        </View>
      )}
    </View>
    <Text style={styles.statLabel}>{stat.label}</Text>
  </View>
);

// Animated bar with gradient - only animates when isVisible is true
const AnimatedBar = ({ value, maxValue, chartHeight, delay, barWidth, isVisible }) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);
  const targetHeight = (value / maxValue) * chartHeight;

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      Animated.spring(animatedHeight, {
        toValue: targetHeight,
        delay: delay,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [isVisible, targetHeight]);

  return (
    <Animated.View
      style={{
        width: barWidth,
        height: animatedHeight,
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <Svg width={barWidth} height={chartHeight} style={{ position: 'absolute', bottom: 0 }}>
        <Defs>
          <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#EBB144" stopOpacity="1" />
            <Stop offset="1" stopColor="#EE4323" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={barWidth} height={chartHeight} fill="url(#barGradient)" />
      </Svg>
    </Animated.View>
  );
};

const BarChart = ({ data, isVisible }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const chartHeight = 140;
  const chartWidth = SCREEN_WIDTH - 72; // Account for padding
  const barWidth = 16;
  const gridLines = [0, 25, 50, 75, 100, 125];

  return (
    <View style={styles.chartContainer}>
      {/* Y-axis labels and grid lines */}
      <View style={styles.yAxisContainer}>
        {gridLines.reverse().map((value, index) => (
          <Text key={index} style={styles.yAxisLabel}>{value}</Text>
        ))}
      </View>

      <View style={styles.chartArea}>
        {/* Grid lines */}
        <Svg
          width={chartWidth}
          height={chartHeight}
          style={styles.gridLines}
        >
          {gridLines.map((_, index) => {
            const y = (index / (gridLines.length - 1)) * chartHeight;
            return (
              <Line
                key={index}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="rgba(0, 0, 0, 0.08)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            );
          })}
        </Svg>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barArea}>
                <AnimatedBar
                  value={item.value}
                  maxValue={maxValue > 125 ? maxValue : 125}
                  chartHeight={chartHeight}
                  delay={index * 80}
                  barWidth={barWidth}
                  isVisible={isVisible}
                />
              </View>
              <Text style={styles.barLabel}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function StatsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('Last Week');
  const [chartVisible, setChartVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const chartYPosition = useRef(0);

  // Animated values
  const periodSelectorOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const collapsedPeriodOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const headerBlur = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const screenHeight = event.nativeEvent.layoutMeasurement.height;
    // Trigger when chart is about to enter viewport
    if (!chartVisible && scrollPosition + screenHeight > chartYPosition.current + 100) {
      setChartVisible(true);
    }
  };

  const handleChartLayout = (event) => {
    chartYPosition.current = event.nativeEvent.layout.y;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Blur Header Background */}
      <Animated.View
        style={[
          styles.headerBackground,
          { opacity: headerBlur }
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Stats</Text>
            {/* Collapsed period selector */}
            <Animated.View style={[styles.collapsedPeriod, { opacity: collapsedPeriodOpacity }]}>
              <TouchableOpacity style={styles.periodSelectorSmall}>
                <Text style={styles.periodTextSmall}>{selectedPeriod}</Text>
                <CaretDownIcon color="#419AFF" size={12} />
              </TouchableOpacity>
            </Animated.View>
          </View>
          {/* Full period selector */}
          <Animated.View style={{ opacity: periodSelectorOpacity }}>
            <TouchableOpacity style={styles.periodSelector}>
              <Text style={styles.periodText}>{selectedPeriod}</Text>
              <CaretDownIcon color="#419AFF" size={16} />
            </TouchableOpacity>
          </Animated.View>
        </View>
        <TouchableOpacity style={styles.preferencesButton}>
          <PreferencesIcon />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: handleScroll }
        )}
        scrollEventThrottle={16}
      >
        {/* General Overview - now in scroll content */}
        <Text style={styles.subtitle}>General Overview</Text>

        {/* Stats Cards Grid */}
        <View style={styles.cardsGrid}>
          {statsData.slice(0, 2).map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </View>

        {/* Full Width Cards */}
        {statsData.slice(2).map((stat, index) => (
          <StatCard key={index + 2} stat={stat} isFullWidth />
        ))}

        {/* Chart Section - Tickets Volume is now a section title in content */}
        <View style={styles.chartSection} onLayout={handleChartLayout}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Tickets Volume</Text>
            <TouchableOpacity style={styles.chartSelector}>
              <Text style={styles.chartSelectorText}>Tickets Received</Text>
              <CaretDownIcon color="#000000" size={12} />
            </TouchableOpacity>
          </View>
          <BarChart data={chartData} isVisible={chartVisible} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: STATUS_BAR_HEIGHT + 80,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: STATUS_BAR_HEIGHT + 17,
    paddingBottom: 0,
    zIndex: 2,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 43,
  },
  collapsedPeriod: {
    marginLeft: 8,
  },
  periodSelectorSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(65, 154, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  periodTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#419AFF',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#419AFF',
  },
  preferencesButton: {
    padding: 4,
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBCBCB',
    borderRadius: 8,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  statCardFull: {
    flex: 1,
    width: '100%',
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
  },
  changeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  positiveBadge: {
    backgroundColor: '#50E3C2',
  },
  negativeBadge: {
    backgroundColor: '#FF414A',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  chartSection: {
    backgroundColor: '#EEF8FF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 0,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  chartTitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  chartSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 13,
    gap: 6,
  },
  chartSelectorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 192,
  },
  yAxisContainer: {
    width: 32,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingTop: 6,
    paddingBottom: 46,
  },
  yAxisLabel: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.3)',
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 12,
    left: 0,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 4,
    marginTop: 12,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barArea: {
    height: 140,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.4)',
    marginTop: 10,
    fontWeight: '600',
  },
});
