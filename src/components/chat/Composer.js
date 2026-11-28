import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  PlusIcon,
  ImageIcon,
  VideoIcon,
  TemplateIcon,
  SparkleIcon,
  CloseSmallIcon,
  CheckSmallIcon,
  PlayIcon,
  RetryIcon,
  AlertIcon,
} from './ChatIcons';
import { AI_COLOR } from './AIDraftSheet';
import { BRAND_SOFT } from '../../theme/brand';

const THUMB = 68;
const INPUT_MIN = 44;
const INPUT_MAX = 124;

const SendIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4 12L20 4L13 20L11 13L4 12Z" stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" />
  </Svg>
);

// Mounts with a gentle scale/slide; used for chips and thumbnails.
export const PopIn = ({ children, style, from = 8 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 140, friction: 13, useNativeDriver: true }).start();
  }, [anim]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ---------- attach menu (popover above the + button) ----------

const MENU_ITEMS = [
  { key: 'photos', label: 'Photo', desc: 'From gallery', Icon: ImageIcon, bg: '#E7F0FE', fg: '#1877F2' },
  { key: 'videos', label: 'Video', desc: 'Max 10 MB', Icon: VideoIcon, bg: '#FCE9F2', fg: '#D62976' },
  { key: 'templates', label: 'Templates', desc: 'Saved replies', Icon: TemplateIcon, bg: '#EEF0F2', fg: '#3B3F45' },
];

export const AttachMenu = ({ open, onPick, bottom }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(open);
  useEffect(() => {
    if (open) setMounted(true);
    Animated.spring(anim, { toValue: open ? 1 : 0, tension: 160, friction: 16, useNativeDriver: true }).start(() => {
      if (!open) setMounted(false);
    });
  }, [open, anim]);
  if (!mounted) return null;
  return (
    <Animated.View
      pointerEvents={open ? 'auto' : 'none'}
      style={[
        styles.menu,
        {
          bottom,
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
          ],
        },
      ]}
    >
      {MENU_ITEMS.map((item, i) => {
        const start = 0.2 + i * 0.15;
        return (
          <Animated.View
            key={item.key}
            style={{
              opacity: anim.interpolate({ inputRange: [0, start, 1], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, start, 1], outputRange: [10, 10, 0], extrapolate: 'clamp' }) },
              ],
            }}
          >
            <Pressable
              onPress={() => onPick(item.key)}
              style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: '#F5F5F5' }]}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                <item.Icon size={20} color={item.fg} />
              </View>
              <View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
};

// ---------- attachment thumbnail with upload states ----------

const AttachmentThumb = ({ item, onRemove, onRetry, color }) => {
  const barX = item.progress.interpolate({ inputRange: [0, 1], outputRange: [-THUMB + 12, 0] });
  const doneAnim = useRef(new Animated.Value(item.status === 'done' ? 1 : 0)).current;
  useEffect(() => {
    if (item.status === 'done') {
      Animated.sequence([
        Animated.spring(doneAnim, { toValue: 1, tension: 220, friction: 9, useNativeDriver: true }),
      ]).start();
    } else {
      doneAnim.setValue(0);
    }
  }, [item.status, doneAnim]);

  return (
    <PopIn style={styles.thumbWrap}>
      <View style={styles.thumb}>
        <Image source={item.source} style={styles.thumbImage} />
        {item.type === 'video' && item.status !== 'error' && (
          <View style={styles.thumbVideo}>
            <PlayIcon size={9} />
            <Text style={styles.thumbVideoText}>{item.duration}</Text>
          </View>
        )}

        {item.status === 'uploading' && (
          <View style={styles.thumbOverlay}>
            <Text style={styles.thumbPercent}>Uploading</Text>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressBar, { backgroundColor: '#FFFFFF', transform: [{ translateX: barX }] }]} />
            </View>
          </View>
        )}

        {item.status === 'error' && (
          <Pressable style={[styles.thumbOverlay, styles.thumbError]} onPress={item.retryable ? onRetry : undefined}>
            {item.retryable ? <RetryIcon size={18} /> : <AlertIcon size={18} />}
            <Text style={styles.thumbErrorText}>{item.retryable ? 'Retry' : 'Too large'}</Text>
          </Pressable>
        )}

        {item.status === 'done' && (
          <Animated.View
            style={[styles.doneBadge, { backgroundColor: color, opacity: doneAnim, transform: [{ scale: doneAnim }] }]}
          >
            <CheckSmallIcon size={10} />
          </Animated.View>
        )}
      </View>
      <TouchableOpacity accessibilityLabel="Remove attachment" style={styles.removeBtn} onPress={onRemove} hitSlop={8}>
        <CloseSmallIcon size={10} />
      </TouchableOpacity>
    </PopIn>
  );
};

// ---------- composer ----------

export default function Composer({
  theme,
  channel,
  value,
  onChangeText,
  attachments,
  onRemoveAttachment,
  onRetryAttachment,
  aiState, // null | { text }
  onEditAi,
  onClearAi,
  template, // null | { title }
  onClearTemplate,
  menuOpen,
  onToggleMenu,
  onOpenAI,
  onSend,
  bottomInset,
  onLayout,
  floating,
}) {
  const plusAnim = useRef(new Animated.Value(0)).current;
  // Height is driven by the measured content so the field is exactly 44px for one line
  // (regardless of platform/font-scale quirks) and grows up to ~5 lines.
  const [contentH, setContentH] = useState(INPUT_MIN);
  const inputH = Math.min(Math.max(contentH, INPUT_MIN), INPUT_MAX);
  const multiline = inputH > INPUT_MIN + 6;
  useEffect(() => {
    if (!value) setContentH(INPUT_MIN);
  }, [value]);
  useEffect(() => {
    Animated.spring(plusAnim, { toValue: menuOpen ? 1 : 0, tension: 180, friction: 14, useNativeDriver: true }).start();
  }, [menuOpen, plusAnim]);

  const uploading = attachments.some((a) => a.status === 'uploading');
  const failed = attachments.some((a) => a.status === 'error');
  const hasContent = value.trim().length > 0 || attachments.length > 0;
  const canSend = hasContent && !uploading && !failed;

  const aiEdited = aiState && aiState.text !== value;

  let hint = null;
  if (uploading) hint = 'Uploading attachments…';
  else if (failed) hint = 'Remove or retry failed files to send';

  return (
    <View style={[styles.container, floating && styles.floating, { paddingBottom: bottomInset }]} onLayout={onLayout}>
      {/* Context chips: AI draft applied / template used */}
      {(aiState || template) && (
        <View style={styles.chipRow}>
          {aiState && (
            <PopIn style={[styles.ctxChip, { backgroundColor: BRAND_SOFT }]}>
              <SparkleIcon size={14} color={AI_COLOR} />
              <Text style={[styles.ctxChipText, { color: AI_COLOR }]}>
                {aiEdited ? 'AI draft · edited' : 'AI draft applied'}
              </Text>
              <TouchableOpacity onPress={onEditAi} hitSlop={6}>
                <Text style={[styles.ctxChipAction, { color: AI_COLOR }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClearAi} hitSlop={6} style={[styles.ctxChipClose, { backgroundColor: AI_COLOR }]}>
                <CloseSmallIcon size={8} />
              </TouchableOpacity>
            </PopIn>
          )}
          {template && (
            <PopIn style={[styles.ctxChip, { backgroundColor: '#EEF0F2' }]}>
              <TemplateIcon size={14} color="#3B3F45" />
              <Text style={[styles.ctxChipText, { color: '#3B3F45' }]} numberOfLines={1}>
                Template · {template.title}
              </Text>
              <TouchableOpacity onPress={onClearTemplate} hitSlop={6} style={[styles.ctxChipClose, { backgroundColor: '#3B3F45' }]}>
                <CloseSmallIcon size={8} />
              </TouchableOpacity>
            </PopIn>
          )}
        </View>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
            {attachments.map((a) => (
              <AttachmentThumb
                key={a.key}
                item={a}
                color={theme.solid}
                onRemove={() => onRemoveAttachment(a.key)}
                onRetry={() => onRetryAttachment(a.key)}
              />
            ))}
          </ScrollView>
          {hint && (
            <PopIn from={4}>
              <Text style={[styles.hint, failed && { color: '#D93025' }]}>{hint}</Text>
            </PopIn>
          )}
        </View>
      )}

      {/* Input row — all controls share a 44px baseline */}
      <View style={[styles.row, { alignItems: multiline ? 'flex-end' : 'center' }]}>
        <TouchableOpacity accessibilityLabel="Add attachment" style={[styles.plusBtn, menuOpen && { backgroundColor: '#292929' }]} onPress={onToggleMenu} activeOpacity={0.8}>
          <Animated.View
            style={{ transform: [{ rotate: plusAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '135deg'] }) }] }}
          >
            <PlusIcon size={22} color={menuOpen ? '#FFFFFF' : '#292929'} />
          </Animated.View>
        </TouchableOpacity>

        <View style={[styles.inputWrap, { height: inputH, alignItems: multiline ? 'flex-end' : 'center' }]}>
          <TextInput
            style={[styles.input, { height: inputH - 2 }]}
            onContentSizeChange={(e) => setContentH(Math.ceil(e.nativeEvent.contentSize.height) + 2)}
            maxFontSizeMultiplier={1.2}
            scrollEnabled={inputH >= INPUT_MAX}
            placeholder={`Reply via ${channel}...`}
            placeholderTextColor="rgba(46, 46, 46, 0.5)"
            value={value}
            onChangeText={onChangeText}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity accessibilityLabel="Draft reply with AI" style={[styles.aiBtn, multiline && { marginBottom: 5 }]} onPress={onOpenAI} activeOpacity={0.8}>
            <SparkleIcon size={18} color={AI_COLOR} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          accessibilityLabel="Send reply"
          style={[styles.sendButton, { backgroundColor: theme.solid }, !canSend && styles.sendDisabled]}
          onPress={canSend ? onSend : undefined}
          activeOpacity={0.8}
        >
          {uploading ? <Spinner /> : <SendIcon />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Spinner = () => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(anim, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return (
    <Animated.View
      style={[styles.spinner, { transform: [{ rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46, 46, 46, 0.08)',
    backgroundColor: '#FFFFFF',
  },
  // Over a progressive-blur area: no solid fill or divider.
  floating: { backgroundColor: 'transparent', borderTopWidth: 0 },
  row: { flexDirection: 'row', gap: 8 },
  plusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrap: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EDEDED',
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 5,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
    paddingTop: 11,
    paddingBottom: 11,
    paddingHorizontal: 0,
    margin: 0,
    includeFontPadding: false,
  },
  aiBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_SOFT,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: { opacity: 0.4 },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderTopColor: '#FFFFFF',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  ctxChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: '100%',
  },
  ctxChipText: { fontSize: 12, fontWeight: '700', flexShrink: 1 },
  ctxChipAction: { fontSize: 12, fontWeight: '700', textDecorationLine: 'underline', marginLeft: 2 },
  ctxChipClose: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginLeft: 2 },
  thumbRow: { gap: 6, paddingTop: 0, paddingRight: 8, paddingBottom: 4 },
  thumbWrap: { paddingTop: 6, paddingRight: 6 },
  thumb: { width: THUMB, height: THUMB, borderRadius: 14, overflow: 'hidden', backgroundColor: '#EEE' },
  thumbImage: { width: '100%', height: '100%' },
  thumbVideo: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  thumbVideoText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  thumbPercent: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  progressTrack: {
    width: THUMB - 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressBar: { width: '100%', height: '100%', borderRadius: 2 },
  thumbError: { backgroundColor: 'rgba(217,48,37,0.78)', gap: 2 },
  thumbErrorText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  doneBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  removeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#292929',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: { fontSize: 12, color: 'rgba(93,92,93,0.8)', marginBottom: 8, marginTop: 2 },
  menu: {
    position: 'absolute',
    left: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 6,
    minWidth: 210,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 14,
    zIndex: 20,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '700', color: '#292929' },
  menuDesc: { fontSize: 12, color: 'rgba(93,92,93,0.7)', marginTop: 1 },
});
