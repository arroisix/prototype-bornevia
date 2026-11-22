import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from './BottomSheet';
import { MOCK_PHOTOS, MOCK_VIDEOS } from '../../data/chatMocks';
import { CloseIcon, ExpandIcon, CollapseIcon, PlayIcon, ImageIcon, VideoIcon } from './ChatIcons';

const GAP = 6;
const TILE = Math.floor((Dimensions.get('window').width - 32 - GAP * 2) / 3);

const SelectBadge = ({ index, color }) => {
  const anim = useRef(new Animated.Value(index ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: index ? 1 : 0, tension: 220, friction: 12, useNativeDriver: true }).start();
  }, [index, anim]);
  return (
    <View style={styles.badgeOuter}>
      <Animated.View
        style={[
          styles.badgeFill,
          { backgroundColor: color, opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] },
        ]}
      >
        {!!index && <Text style={styles.badgeText}>{index}</Text>}
      </Animated.View>
    </View>
  );
};

const Tile = ({ item, selectedIndex, onPress, color }) => {
  const press = useRef(new Animated.Value(0)).current;
  const selected = !!selectedIndex;
  useEffect(() => {
    Animated.spring(press, { toValue: selected ? 1 : 0, tension: 200, friction: 14, useNativeDriver: true }).start();
  }, [selected, press]);
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] });
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.tile, selected && { backgroundColor: color + '22' }]}>
        <Animated.Image source={item.source} style={[styles.tileImage, { transform: [{ scale }] }]} />
        {item.type === 'video' && (
          <View style={styles.videoMeta}>
            <PlayIcon size={10} />
            <Text style={styles.videoDuration}>{item.duration}</Text>
          </View>
        )}
        <SelectBadge index={selectedIndex} color={color} />
      </View>
    </Pressable>
  );
};

/** Mock gallery: pick photos / videos (multi-select, numbered). */
const MediaPickerSheet = forwardRef(function MediaPickerSheet({ initialTab = 'photos', color, onAttach, onClosed }, ref) {
  const sheetRef = useRef(null);
  useImperativeHandle(ref, () => ({ close: () => sheetRef.current?.close() }));
  const [tab, setTab] = useState(initialTab);
  const [selected, setSelected] = useState([]);

  const items = tab === 'photos' ? MOCK_PHOTOS : MOCK_VIDEOS;
  const toggle = (item) =>
    setSelected((prev) => (prev.find((p) => p.id === item.id) ? prev.filter((p) => p.id !== item.id) : [...prev, item]));

  const attach = () => {
    if (!selected.length) return;
    onAttach(selected);
    sheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      expandable
      halfRatio={0.6}
      onClosed={onClosed}
      header={({ expanded, setExpanded, close }) => (
        <View>
          <View style={styles.header}>
            <Text style={styles.title}>Attach media</Text>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setExpanded(!expanded)}>
              {expanded ? <CollapseIcon size={18} /> : <ExpandIcon size={18} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={close}>
              <CloseIcon size={18} />
            </TouchableOpacity>
          </View>
          <View style={styles.tabs}>
            {[
              ['photos', 'Photos', ImageIcon],
              ['videos', 'Videos', VideoIcon],
            ].map(([k, label, Icon]) => (
              <Pressable key={k} onPress={() => setTab(k)} style={[styles.tab, tab === k && { backgroundColor: '#292929' }]}>
                <Icon size={16} color={tab === k ? '#FFFFFF' : '#292929'} />
                <Text style={[styles.tabText, tab === k && { color: '#FFFFFF' }]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
      footer={
        <Pressable
          onPress={attach}
          style={({ pressed }) => [styles.attachBtn, { backgroundColor: color }, !selected.length && styles.disabled, pressed && styles.pressed]}
        >
          <Text style={styles.attachText}>
            {selected.length ? `Attach ${selected.length} ${selected.length === 1 ? 'file' : 'files'}` : 'Select files to attach'}
          </Text>
        </Pressable>
      }
    >
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const idx = selected.findIndex((s) => s.id === item.id);
          return (
            <Tile key={item.id} item={item} color={color} selectedIndex={idx >= 0 ? idx + 1 : 0} onPress={() => toggle(item)} />
          );
        })}
        {tab === 'videos' && (
          <Text style={styles.note}>Max file size 10 MB per video</Text>
        )}
      </ScrollView>
    </BottomSheet>
  );
});

export default MediaPickerSheet;

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: '#000000' },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F3F3F3',
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#292929' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: 16, paddingBottom: 16 },
  tile: { width: TILE, height: TILE, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F3F3F3' },
  tileImage: { width: '100%', height: '100%', borderRadius: 12 },
  videoMeta: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  videoDuration: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  badgeOuter: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  badgeFill: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  note: { width: '100%', fontSize: 12, color: 'rgba(93,92,93,0.7)', marginTop: 6 },
  attachBtn: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  attachText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
