import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomSheet from './BottomSheet';
import FormattedText from './FormattedText';
import { generateDraft, improveDraft, IMPROVE_ACTIONS } from './aiDraft';
import {
  SparkleIcon,
  ExpandIcon,
  CollapseIcon,
  CloseIcon,
  BoldIcon,
  ItalicIcon,
  BulletListIcon,
  NumberListIcon,
  ClearFormatIcon,
  UndoIcon,
  RetryIcon,
  ArrowUpIcon,
  CheckSmallIcon,
} from './ChatIcons';

import { BRAND, BRAND_SOFT, BRAND_TINT, BRAND_LINE, BRAND_SKELETON } from '../../theme/brand';

// AI features use the Bornevia brand colour.
export const AI_COLOR = BRAND;
const AI_SOFT = BRAND_SOFT;

// ---------- small animated pieces ----------

const Shimmer = ({ widths = ['92%', '100%', '84%', '96%', '60%'] }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-220, 420] });
  return (
    <View style={{ gap: 10 }}>
      {widths.map((w, i) => (
        <View key={i} style={[styles.skeletonLine, { width: w }]}>
          <Animated.View style={[styles.shimmerBar, { transform: [{ translateX }, { skewX: '-20deg' }] }]} />
        </View>
      ))}
    </View>
  );
};

const PulsingSparkle = ({ size = 20 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return (
    <Animated.View
      style={{
        transform: [
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) },
          { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '20deg'] }) },
        ],
      }}
    >
      <SparkleIcon size={size} color={AI_COLOR} />
    </Animated.View>
  );
};

const FadeSwap = ({ swapKey, children, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [swapKey, anim]);
  return (
    <Animated.View
      style={[
        style,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ---------- formatting helpers ----------

const wrapSelection = (text, sel, marker) => {
  const { start, end } = sel;
  if (start === end) {
    return text.slice(0, start) + marker + marker + text.slice(end);
  }
  const selected = text.slice(start, end);
  if (selected.startsWith(marker) && selected.endsWith(marker)) {
    return text.slice(0, start) + selected.slice(marker.length, -marker.length) + text.slice(end);
  }
  return text.slice(0, start) + marker + selected + marker + text.slice(end);
};

const toggleList = (text, sel, numbered) => {
  const lineStart = text.lastIndexOf('\n', Math.max(sel.start - 1, 0)) + (sel.start === 0 ? 0 : 1);
  const startIdx = sel.start === 0 ? 0 : lineStart;
  let endIdx = text.indexOf('\n', sel.end);
  if (endIdx === -1) endIdx = text.length;
  const block = text.slice(startIdx, endIdx);
  const lines = block.split('\n');
  const isList = lines.every((l) => (numbered ? /^\d+\.\s/.test(l) : /^[-•]\s/.test(l)));
  const next = lines
    .map((l, i) => {
      const clean = l.replace(/^(\d+\.\s|[-•]\s)/, '');
      if (isList) return clean;
      return numbered ? `${i + 1}. ${clean}` : `- ${clean}`;
    })
    .join('\n');
  return text.slice(0, startIdx) + next + text.slice(endIdx);
};

const clearFormatting = (text) =>
  text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^(\d+\.\s|[-•]\s)/gm, '');

// ---------- main ----------

const AIDraftSheet = forwardRef(function AIDraftSheet(
  { ticket, messages, theme, initialText, onApply, onClosed },
  ref,
) {
  const sheetRef = useRef(null);
  useImperativeHandle(ref, () => ({ close: () => sheetRef.current?.close() }));

  const [phase, setPhase] = useState(initialText ? 'ready' : 'generating'); // generating | streaming | improving | ready | applied
  const [stepLabel, setStepLabel] = useState('Reading conversation…');
  const [text, setText] = useState(initialText || '');
  const [streamed, setStreamed] = useState('');
  const [history, setHistory] = useState([]);
  const [version, setVersion] = useState(1);
  const [tab, setTab] = useState('edit');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [instruction, setInstruction] = useState('');
  const timers = useRef([]);

  const tabAnim = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(0);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t) || clearInterval(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const stream = useCallback((full) => {
    setPhase('streaming');
    setStreamed('');
    let i = 0;
    const id = setInterval(() => {
      i += Math.max(2, Math.round(full.length / 45));
      if (i >= full.length) {
        clearInterval(id);
        setStreamed(full);
        setText(full);
        setPhase('ready');
      } else {
        setStreamed(full.slice(0, i));
      }
    }, 28);
    timers.current.push(id);
  }, []);

  const runGenerate = useCallback(() => {
    clearTimers();
    setPhase('generating');
    setStepLabel('Reading conversation…');
    timers.current.push(setTimeout(() => setStepLabel('Drafting reply…'), 700));
    timers.current.push(setTimeout(() => stream(generateDraft(ticket, messages)), 1400));
  }, [messages, stream, ticket]);

  useEffect(() => {
    if (!initialText) runGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runImprove = (action, label, custom = '') => {
    if (phase !== 'ready' || !text.trim()) return;
    clearTimers();
    setHistory((h) => [...h, text]);
    setVersion((v) => v + 1);
    setStepLabel(label);
    setPhase('improving');
    setTab('edit');
    timers.current.push(setTimeout(() => stream(improveDraft(text, action, ticket, custom)), 1100));
  };

  const regenerate = () => {
    if (phase !== 'ready') return;
    setHistory((h) => [...h, text]);
    setVersion((v) => v + 1);
    runGenerate();
  };

  const undo = () => {
    if (!history.length || phase !== 'ready') return;
    setText(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setVersion((v) => Math.max(1, v - 1));
  };

  const apply = () => {
    if (phase !== 'ready' || !text.trim()) return;
    setPhase('applied');
    timers.current.push(
      setTimeout(() => {
        onApply(text.trim());
        sheetRef.current?.close();
      }, 450),
    );
  };

  useEffect(() => {
    Animated.spring(tabAnim, { toValue: tab === 'edit' ? 0 : 1, tension: 120, friction: 14, useNativeDriver: true }).start();
  }, [tab, tabAnim]);

  const busy = phase === 'generating' || phase === 'streaming' || phase === 'improving';
  const canEdit = phase === 'ready';

  const format = (kind) => {
    if (!canEdit) return;
    if (kind === 'bold') setText((t) => wrapSelection(t, selection, '**'));
    if (kind === 'italic') setText((t) => wrapSelection(t, selection, '_'));
    if (kind === 'bullets') setText((t) => toggleList(t, selection, false));
    if (kind === 'numbers') setText((t) => toggleList(t, selection, true));
    if (kind === 'clear') setText((t) => clearFormatting(t));
  };

  const renderHeader = ({ expanded, setExpanded, close }) => (
    <View style={styles.header}>
      <View style={styles.headerIcon}>
        {busy ? <PulsingSparkle size={18} /> : <SparkleIcon size={18} color={AI_COLOR} />}
      </View>
      <View style={styles.flex}>
        <Text style={styles.title}>AI reply draft</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          Based on {messages.length} messages · {ticket.channel}
        </Text>
      </View>
      <TouchableOpacity accessibilityLabel={expanded ? "Collapse" : "Expand to full page"} style={styles.headerBtn} onPress={() => setExpanded(!expanded)} hitSlop={6}>
        {expanded ? <CollapseIcon size={18} /> : <ExpandIcon size={18} />}
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerBtn} onPress={close} hitSlop={6}>
        <CloseIcon size={18} />
      </TouchableOpacity>
    </View>
  );

  const renderBody = ({ setExpanded }) => (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.bodyContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Edit / Preview tabs */}
      <View style={styles.tabs} onLayout={(e) => setTabWidth((e.nativeEvent.layout.width - 8) / 2)}>
        {tabWidth > 0 && (
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: tabWidth,
                transform: [{ translateX: tabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, tabWidth] }) }],
              },
            ]}
          />
        )}
        {['edit', 'preview'].map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => !busy && setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'edit' ? 'Edit' : 'Preview'}</Text>
          </Pressable>
        ))}
      </View>

      {/* Draft area */}
      <View style={[styles.draftCard, phase === 'applied' && { borderColor: '#1E9E5A' }]}>
        {phase === 'generating' && (
          <FadeSwap swapKey="gen">
            <View style={styles.statusRow}>
              <PulsingSparkle size={14} />
              <Text style={styles.statusText}>{stepLabel}</Text>
            </View>
            <Shimmer />
          </FadeSwap>
        )}

        {phase === 'improving' && (
          <FadeSwap swapKey="imp">
            <View style={styles.statusRow}>
              <PulsingSparkle size={14} />
              <Text style={styles.statusText}>{stepLabel}</Text>
            </View>
            <View>
              <Text style={[styles.draftText, styles.dimmed]}>{clearFormatting(text)}</Text>
              <View style={[StyleSheet.absoluteFill, styles.improveOverlay]}>
                <Shimmer widths={['100%', '90%', '100%', '70%']} />
              </View>
            </View>
          </FadeSwap>
        )}

        {phase === 'streaming' && (
          <View>
            <View style={styles.statusRow}>
              <PulsingSparkle size={14} />
              <Text style={styles.statusText}>Writing…</Text>
            </View>
            <Text style={styles.draftText}>
              {streamed}
              <Text style={styles.caretChar}>▍</Text>
            </Text>
          </View>
        )}

        {(phase === 'ready' || phase === 'applied') && tab === 'edit' && (
          <FadeSwap swapKey={`edit-${version}`}>
            <View style={styles.toolbar}>
              {[
                ['bold', BoldIcon],
                ['italic', ItalicIcon],
                ['bullets', BulletListIcon],
                ['numbers', NumberListIcon],
                ['clear', ClearFormatIcon],
              ].map(([k, Icon]) => (
                <TouchableOpacity key={k} style={styles.toolBtn} onPress={() => format(k)}>
                  <Icon size={17} />
                </TouchableOpacity>
              ))}
              <View style={styles.flex} />
              {history.length > 0 && (
                <TouchableOpacity style={styles.undoBtn} onPress={undo}>
                  <UndoIcon size={14} />
                  <Text style={styles.undoText}>Undo</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.editor}
              value={text}
              onChangeText={setText}
              onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
              onFocus={() => setExpanded(true)}
              multiline
              editable={canEdit}
              textAlignVertical="top"
              placeholder="Write your reply…"
              placeholderTextColor="rgba(46,46,46,0.4)"
            />
            <Text style={styles.hint}>Tip: select text, then tap B or I to format · v{version}</Text>
          </FadeSwap>
        )}

        {(phase === 'ready' || phase === 'applied') && tab === 'preview' && (
          <FadeSwap swapKey="preview">
            <Text style={styles.previewLabel}>How it looks on {ticket.channel}</Text>
            <View style={styles.previewRow}>
              <View style={[styles.previewBubble, { backgroundColor: theme.solid }]}>
                <FormattedText text={text || ' '} style={[styles.previewText, { color: theme.onSolid }]} />
              </View>
            </View>
          </FadeSwap>
        )}
      </View>

      {/* Improve with AI */}
      <Text style={styles.sectionLabel}>Improve with AI</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {IMPROVE_ACTIONS.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => runImprove(a.id, a.busy)}
            style={({ pressed }) => [styles.chip, !canEdit && styles.disabled, pressed && styles.pressed]}
          >
            <Text style={styles.chipText}>{a.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.instructionRow, !canEdit && styles.disabled]}>
        <SparkleIcon size={16} color={AI_COLOR} />
        <TextInput
          style={styles.instructionInput}
          placeholder="Tell AI what to change…"
          placeholderTextColor="rgba(46,46,46,0.45)"
          value={instruction}
          onChangeText={setInstruction}
          onFocus={() => setExpanded(true)}
          editable={canEdit}
          onSubmitEditing={() => {
            if (instruction.trim()) {
              runImprove('custom', 'Applying your instruction…', instruction.trim());
              setInstruction('');
            }
          }}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.instructionSend, !instruction.trim() && styles.disabled]}
          onPress={() => {
            if (instruction.trim()) {
              runImprove('custom', 'Applying your instruction…', instruction.trim());
              setInstruction('');
            }
          }}
        >
          <ArrowUpIcon size={14} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderFooter = () => (
    <View style={styles.footerRow}>
      <Pressable
        onPress={regenerate}
        style={({ pressed }) => [styles.secondaryBtn, !canEdit && styles.disabled, pressed && styles.pressed]}
      >
        <RetryIcon size={16} color="#292929" />
        <Text style={styles.secondaryText}>Regenerate</Text>
      </Pressable>
      <Pressable
        onPress={apply}
        style={({ pressed }) => [
          styles.primaryBtn,
          phase === 'applied' && { backgroundColor: '#1E9E5A' },
          !(canEdit || phase === 'applied') && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        {phase === 'applied' ? <CheckSmallIcon size={16} /> : <SparkleIcon size={16} color="#FFFFFF" />}
        <Text style={styles.primaryText}>{phase === 'applied' ? 'Applied' : 'Use this reply'}</Text>
      </Pressable>
    </View>
  );

  return (
    <BottomSheet
      ref={sheetRef}
      expandable
      halfRatio={0.62}
      onClosed={onClosed}
      header={renderHeader}
      footer={renderFooter}
    >
      {renderBody}
    </BottomSheet>
  );
});

export default AIDraftSheet;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 10 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AI_SOFT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#000000' },
  subtitle: { fontSize: 12, color: 'rgba(93,92,93,0.75)', marginTop: 1 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyContent: { paddingHorizontal: 16, paddingBottom: 20 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(41,41,41,0.55)' },
  tabTextActive: { color: '#292929' },
  draftCard: {
    borderWidth: 1.5,
    borderColor: BRAND_LINE,
    backgroundColor: BRAND_TINT,
    borderRadius: 16,
    padding: 14,
    minHeight: 170,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  statusText: { fontSize: 13, fontWeight: '600', color: AI_COLOR },
  skeletonLine: { height: 12, borderRadius: 6, backgroundColor: BRAND_SKELETON, overflow: 'hidden' },
  shimmerBar: { width: 120, height: '100%', backgroundColor: 'rgba(255,255,255,0.75)' },
  draftText: { fontSize: 15, lineHeight: 23, color: '#292929' },
  dimmed: { opacity: 0.25 },
  improveOverlay: { justifyContent: 'flex-start', paddingTop: 4 },
  caretChar: { color: AI_COLOR },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238,67,35,0.12)',
  },
  toolBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BRAND_LINE,
  },
  undoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F3F3F3' },
  undoText: { fontSize: 12, fontWeight: '600', color: '#292929' },
  editor: {
    fontSize: 15,
    lineHeight: 23,
    color: '#292929',
    minHeight: 120,
    padding: 0,
    paddingTop: 4,
  },
  hint: { fontSize: 11, color: 'rgba(93,92,93,0.6)', marginTop: 8 },
  previewLabel: { fontSize: 12, color: 'rgba(93,92,93,0.7)', marginBottom: 10 },
  previewRow: { alignItems: 'flex-end' },
  previewBubble: { maxWidth: '88%', borderRadius: 18, borderBottomRightRadius: 6, paddingHorizontal: 14, paddingVertical: 10 },
  previewText: { fontSize: 14, lineHeight: 21 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#292929', marginTop: 18, marginBottom: 8 },
  chips: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: AI_SOFT,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: AI_COLOR },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 5,
    height: 44,
  },
  instructionInput: { flex: 1, fontSize: 14, color: '#000000', padding: 0 },
  instructionSend: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AI_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDEDED',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  secondaryText: { fontSize: 15, fontWeight: '700', color: '#292929' },
  primaryBtn: {
    flex: 1.4,
    height: 50,
    borderRadius: 14,
    backgroundColor: AI_COLOR,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
