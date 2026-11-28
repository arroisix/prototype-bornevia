import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Dimensions, Easing, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionMenu from '../components/ActionMenu';
import BlurHeader from '../components/BlurHeader';
import ChannelIcon, { getChannelTheme } from '../components/ChannelIcons';
import { PersonAvatar } from '../components/teams/TeamSheets';
import { SparkleIcon } from '../components/chat/ChatIcons';
import { useTicketDetail } from '../components/TicketDetailContext';
import { BackArrowIcon, CalendarIcon, ChevronDownIcon, DownloadIcon, LinkIcon, ShareIcon } from '../components/MenuIcons';
import { INSIGHTS, PERIODS, TOP_AGENTS, getBreakdown, getSeries } from '../data/reports';
import { personById } from '../data/teams';
import { BRAND, BRAND_SOFT } from '../theme/brand';
import { ProgressiveBlurContainer } from '../components/ProgressiveBlur';

const { width: W } = Dimensions.get('window');
const CHART_W = W - 64;
const CHART_H = 170;

const Stagger = ({ progress, index, children, style }) => {
  const start = Math.min(0.2 + index * 0.08, 0.75);
  const end = Math.min(start + 0.25, 1);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({ inputRange: [0, start, end], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
          transform: [{ translateY: progress.interpolate({ inputRange: [0, start, end], outputRange: [16, 16, 0], extrapolate: 'clamp' }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Smooth line chart with a left→right reveal and tap-to-inspect points.
const LineChart = ({ series, unit }) => {
  const reveal = useRef(new Animated.Value(0)).current;
  const [selected, setSelected] = useState(null);
  const max = Math.max(...series.map((s) => s.value)) * 1.15;
  const step = CHART_W / (series.length - 1);
  const pts = series.map((s, i) => [i * step, CHART_H - (s.value / max) * CHART_H]);

  const line = pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
  }, '');
  const area = `${line} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;

  useEffect(() => {
    reveal.setValue(0);
    setSelected(null);
    Animated.timing(reveal, { toValue: 1, duration: 900, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [series, reveal]);

  const sel = selected != null ? pts[selected] : null;

  return (
    <View>
      <View style={{ width: CHART_W, height: CHART_H + 8 }}>
        <Animated.View style={{ width: reveal.interpolate({ inputRange: [0, 1], outputRange: [0, CHART_W + 8] }), height: CHART_H + 8, overflow: 'hidden' }}>
          <Svg width={CHART_W + 8} height={CHART_H + 8}>
            <Defs>
              <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={BRAND} stopOpacity="0.28" />
                <Stop offset="1" stopColor={BRAND} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            {[0, 0.33, 0.66, 1].map((g) => (
              <Line key={g} x1="0" x2={CHART_W} y1={g * CHART_H + 1} y2={g * CHART_H + 1} stroke="rgba(0,0,0,0.06)" strokeDasharray="4,4" />
            ))}
            <Path d={area} fill="url(#area)" />
            <Path d={line} stroke={BRAND} strokeWidth={3} fill="none" strokeLinecap="round" />
            {sel && <Line x1={sel[0]} x2={sel[0]} y1={0} y2={CHART_H} stroke="rgba(238,67,35,0.35)" strokeWidth={1.5} />}
            {pts.map(([x, y], i) => (
              <Circle key={i} cx={Math.max(x, 4)} cy={y} r={selected === i ? 6 : 3.5} fill="#FFFFFF" stroke={BRAND} strokeWidth={selected === i ? 3 : 2} />
            ))}
          </Svg>
        </Animated.View>
        {/* Tap targets */}
        <View style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}>
          {series.map((s, i) => (
            <Pressable key={i} style={{ flex: 1 }} onPress={() => setSelected(selected === i ? null : i)} />
          ))}
        </View>
        {sel && (
          <View
            pointerEvents="none"
            style={[styles.tooltip, { left: Math.min(Math.max(sel[0] - 50, 0), CHART_W - 100), top: Math.max(sel[1] - 52, 0) }]}
          >
            <Text style={styles.tooltipValue}>
              {series[selected].value} {unit}
            </Text>
            <Text style={styles.tooltipLabel}>{series[selected].label}</Text>
          </View>
        )}
      </View>
      <View style={styles.xLabels}>
        {series.map((s, i) => (
          <Text key={i} style={[styles.xLabel, selected === i && { color: BRAND, fontWeight: '800' }]}>
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const BreakdownBar = ({ row, index }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: row.share, duration: 700, delay: 300 + index * 70, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [row.share, index, anim]);
  const color = getChannelTheme(row.channel).solid;
  return (
    <View style={styles.breakRow}>
      <View style={styles.breakIcon}>
        <ChannelIcon channel={row.channel} size={16} />
      </View>
      <View style={styles.flex}>
        <View style={styles.breakTop}>
          <Text style={styles.breakName}>{row.channel}</Text>
          <Text style={styles.breakValue}>{row.display}</Text>
        </View>
        <View style={styles.breakTrack}>
          <Animated.View
            style={[styles.breakFill, { backgroundColor: color, width: anim.interpolate({ inputRange: [0, 0.4], outputRange: ['0%', '100%'], extrapolate: 'clamp' }) }]}
          />
        </View>
      </View>
    </View>
  );
};

// Export button: idle → exporting (progress fill) → done (check) → idle.
const ExportButton = ({ onDone }) => {
  const [state, setState] = useState('idle');
  const fill = useRef(new Animated.Value(0)).current;
  const start = () => {
    if (state !== 'idle') return;
    setState('exporting');
    fill.setValue(0);
    Animated.timing(fill, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start(() => {
      setState('done');
      onDone();
      setTimeout(() => setState('idle'), 2200);
    });
  };
  return (
    <Pressable onPress={start} style={({ pressed }) => [styles.exportBtn, state === 'done' && { backgroundColor: '#1E9E5A' }, pressed && styles.pressed]}>
      {state === 'exporting' && (
        <Animated.View style={[styles.exportFill, { width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      )}
      <DownloadIcon size={18} color="#FFFFFF" />
      <Text style={styles.exportText}>
        {state === 'idle' ? 'Export report' : state === 'exporting' ? 'Preparing PDF…' : 'Saved to Downloads'}
      </Text>
    </Pressable>
  );
};

export default function ReportDetailScreen({ report, progress, onClose }) {
  const insets = useSafeAreaInsets();
  const { showToast } = useTicketDetail();
  const [period, setPeriod] = useState(report.period || 'Last Week');
  const [compare, setCompare] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const series = useMemo(() => getSeries(report.key === 'traffic' ? 'received' : report.key, period), [report.key, period]);
  const breakdown = useMemo(() => getBreakdown(report.key), [report.key]);
  const unit = report.key === 'response' ? 'min' : report.key === 'replies' ? 'replies' : 'tickets';
  const total = series.reduce((a, s) => a + s.value, 0);
  const avg = Math.round(total / series.length);
  const peak = series.reduce((m, s) => (s.value > m.value ? s : m), series[0]);
  const headerH = Math.max(insets.top, 24) + 56;

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const menu = () => [
    { key: 'pdf', label: 'Export as PDF', icon: DownloadIcon, onPress: () => showToast({ text: `${report.label} PDF saved`, actionLabel: 'Open', onAction: () => {} }) },
    { key: 'csv', label: 'Export as CSV', icon: DownloadIcon, onPress: () => showToast(`${series.length} rows exported to CSV`) },
    { key: 'link', label: 'Copy share link', icon: LinkIcon, onPress: () => showToast({ text: 'Link copied to clipboard', tone: 'info' }) },
    { key: 'schedule', label: 'Email weekly', hint: 'Every Monday, 8:00 AM', icon: CalendarIcon, onPress: () => showToast({ text: 'Weekly report scheduled', tone: 'info' }) },
    { key: 'compare', label: 'Compare to previous', checked: compare, divider: true, onPress: () => setCompare((c) => !c) },
  ];

  const periodMenu = () => PERIODS.map((p) => ({ key: p, label: p, checked: p === period, onPress: () => setPeriod(p) }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ProgressiveBlurContainer top={headerH + 20} bottom={Math.max(insets.bottom, 12) + 80}>
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: headerH + 4, paddingBottom: Math.max(insets.bottom, 12) + 96, paddingHorizontal: 16 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Stagger progress={progress} index={0}>
          <ActionMenu items={periodMenu} style={styles.periodChip} accessibilityLabel="Change period">
            <CalendarIcon size={14} color="#419AFF" />
            <Text style={styles.periodText}>{period}</Text>
            <ChevronDownIcon size={14} color="#419AFF" />
          </ActionMenu>
          <Text style={styles.metricLabel}>{report.label}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{report.value}</Text>
            {report.change && compare && (
              <View style={[styles.badge, { backgroundColor: report.positive ? '#50E3C2' : '#FF414A' }]}>
                <Text style={styles.badgeText}>{report.change}</Text>
              </View>
            )}
          </View>
          {compare && report.change && <Text style={styles.vsText}>vs previous {period.toLowerCase().replace('last ', '')}</Text>}
        </Stagger>

        <Stagger progress={progress} index={1} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Trend</Text>
            <Text style={styles.cardHint}>Tap a point for details</Text>
          </View>
          <LineChart series={series} unit={unit} />
          <View style={styles.summaryRow}>
            {[
              ['Total', `${total}`],
              ['Average', `${avg}`],
              ['Peak', `${peak.label} · ${peak.value}`],
            ].map(([k, v]) => (
              <View key={k} style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{v}</Text>
                <Text style={styles.summaryLabel}>{k}</Text>
              </View>
            ))}
          </View>
        </Stagger>

        <Stagger progress={progress} index={2} style={styles.insight}>
          <View style={styles.insightIcon}>
            <SparkleIcon size={16} color={BRAND} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.insightTitle}>Insight</Text>
            <Text style={styles.insightText}>{INSIGHTS[report.key]}</Text>
          </View>
        </Stagger>

        <Stagger progress={progress} index={3} style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: 12 }]}>By channel</Text>
          {breakdown.map((row, i) => (
            <BreakdownBar key={row.channel} row={row} index={i} />
          ))}
        </Stagger>

        <Stagger progress={progress} index={4} style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: 6 }]}>Top agents</Text>
          {TOP_AGENTS.map((a, i) => {
            const p = personById(a.id);
            return (
              <View key={a.id} style={[styles.agentRow, i === TOP_AGENTS.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={[styles.rank, i === 0 && { color: BRAND }]}>{i + 1}</Text>
                <PersonAvatar person={p} size={36} showStatus={false} />
                <View style={styles.flex}>
                  <Text style={styles.agentName}>{p.name}</Text>
                  <Text style={styles.agentSub}>{a.sub}</Text>
                </View>
                <Text style={styles.agentValue}>{a.value}</Text>
              </View>
            );
          })}
        </Stagger>
      </Animated.ScrollView>
      </ProgressiveBlurContainer>

      <BlurHeader height={headerH} scrollY={scrollY}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 6 }]}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} accessibilityLabel="Back" hitSlop={8}>
            <BackArrowIcon size={24} color="#000000" />
          </TouchableOpacity>
          <Animated.Text
            numberOfLines={1}
            style={[styles.headerTitle, { opacity: scrollY.interpolate({ inputRange: [40, 90], outputRange: [0, 1], extrapolate: 'clamp' }) }]}
          >
            {report.label}
          </Animated.Text>
          <ActionMenu items={menu} style={styles.iconBtn} accessibilityLabel="Report options" />
        </View>
      </BlurHeader>

      <BlurHeader position="bottom" style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 10, paddingHorizontal: 16 }}>
        <View style={styles.footerRow}>
          <Pressable
            onPress={() => showToast({ text: 'Share sheet opened', tone: 'info' })}
            style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}
            accessibilityLabel="Share report"
          >
            <ShareIcon size={20} color="#292929" />
          </Pressable>
          <View style={styles.flex}>
            <ExportButton onDone={() => showToast({ text: `${report.label} report exported`, actionLabel: 'Open', onAction: () => {} })} />
          </View>
        </View>
      </BlurHeader>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#000000', textAlign: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  periodChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(65,154,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 4,
  },
  periodText: { fontSize: 13, fontWeight: '700', color: '#419AFF' },
  metricLabel: { fontSize: 15, color: 'rgba(0,0,0,0.55)', marginTop: 14 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  value: { fontSize: 40, fontWeight: '800', color: '#000000' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  vsText: { fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 2 },
  card: { borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 20, padding: 16, marginTop: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#000000' },
  cardHint: { fontSize: 11, color: 'rgba(0,0,0,0.4)' },
  xLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, width: CHART_W },
  xLabel: { fontSize: 11, color: 'rgba(0,0,0,0.4)', fontWeight: '600', minWidth: 18, textAlign: 'center' },
  tooltip: {
    position: 'absolute',
    width: 100,
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tooltipValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  tooltipLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 1 },
  summaryRow: { flexDirection: 'row', marginTop: 16, borderTopWidth: 1, borderTopColor: '#F2F2F2', paddingTop: 12 },
  summaryItem: { flex: 1 },
  summaryValue: { fontSize: 15, fontWeight: '800', color: '#000000' },
  summaryLabel: { fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 2 },
  insight: { flexDirection: 'row', gap: 12, backgroundColor: BRAND_SOFT, borderRadius: 18, padding: 14, marginTop: 18 },
  insightIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  insightTitle: { fontSize: 13, fontWeight: '800', color: BRAND },
  insightText: { fontSize: 14, color: '#3B2A26', lineHeight: 20, marginTop: 2 },
  breakRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  breakIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  breakTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breakName: { fontSize: 13, fontWeight: '600', color: '#292929' },
  breakValue: { fontSize: 13, fontWeight: '700', color: '#292929' },
  breakTrack: { height: 8, borderRadius: 4, backgroundColor: '#F2F2F2', overflow: 'hidden' },
  breakFill: { height: '100%', borderRadius: 4 },
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F4F4F4' },
  rank: { width: 16, fontSize: 14, fontWeight: '800', color: 'rgba(0,0,0,0.35)' },
  agentName: { fontSize: 14, fontWeight: '700', color: '#292929' },
  agentSub: { fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 1 },
  agentValue: { fontSize: 13, fontWeight: '700', color: '#292929' },
  footerRow: { flexDirection: 'row', gap: 10 },
  shareBtn: { width: 50, height: 50, borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  exportBtn: {
    height: 50,
    borderRadius: 16,
    backgroundColor: BRAND,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  exportFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.18)' },
  exportText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
