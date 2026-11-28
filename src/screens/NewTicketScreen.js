import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChannelIcon, { getChannelTheme } from '../components/ChannelIcons';
import MediaPickerSheet from '../components/chat/MediaPickerSheet';
import useKeyboardInset from '../components/chat/useKeyboardInset';
import { PopIn } from '../components/chat/Composer';
import { CloseIcon, CloseSmallIcon, CheckSmallIcon, ImageIcon, PlayIcon } from '../components/chat/ChatIcons';
import { BRAND, BRAND_SOFT } from '../theme/brand';
import { usePredictiveBack } from '../components/predictiveBack';

const CHANNELS = ['Email', 'WhatsApp', 'Facebook', 'FB Messenger', 'Instagram', 'Twitter'];
const PRIORITIES = [
  { key: 'Low', color: '#6B7280' },
  { key: 'Medium', color: '#1877F2' },
  { key: 'High', color: '#EE6A23' },
  { key: 'Urgent', color: '#D93025' },
];
const CATEGORIES = ['Internet', 'Billing', 'Account', 'Technical', 'Other'];
const ASSIGNEES = [
  { key: 'You', initials: 'ME', color: BRAND },
  { key: 'Anna', initials: 'AN', color: '#1877F2' },
  { key: 'Budi', initials: 'BU', color: '#1DA851' },
  { key: 'Citra', initials: 'CI', color: '#D62976' },
  { key: 'Unassigned', initials: '—', color: '#9CA3AF' },
];
const SUBJECT_MAX = 80;

const initials = (name) =>
  name
    .replace('@', '')
    .split(/[\s_.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

// ---------- small animated helpers ----------

const Section = ({ index, progress, children, style }) => {
  const start = Math.min(0.2 + index * 0.07, 0.75);
  const end = Math.min(start + 0.25, 1);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({ inputRange: [0, start, end], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
          transform: [
            {
              translateY: progress.interpolate({ inputRange: [0, start, end], outputRange: [18, 18, 0], extrapolate: 'clamp' }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Shakes horizontally whenever `trigger` changes (used for validation errors).
const Shake = ({ trigger, children }) => {
  const x = useRef(new Animated.Value(0)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!trigger) return;
    x.setValue(0);
    Animated.sequence(
      [10, -8, 6, -4, 0].map((v) => Animated.timing(x, { toValue: v, duration: 55, useNativeDriver: true })),
    ).start();
  }, [trigger, x]);
  return <Animated.View style={{ transform: [{ translateX: x }] }}>{children}</Animated.View>;
};

const FieldError = ({ text }) =>
  text ? (
    <PopIn from={-4}>
      <Text style={styles.errorText}>{text}</Text>
    </PopIn>
  ) : null;

const Chip = ({ label, selected, onPress, color = BRAND, soft = BRAND_SOFT, icon, dot }) => {
  const anim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: selected ? 1 : 0, tension: 220, friction: 16, useNativeDriver: false }).start();
  }, [selected, anim]);
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.chip,
            {
              backgroundColor: anim.interpolate({ inputRange: [0, 1], outputRange: ['#FFFFFF', soft] }),
              borderColor: anim.interpolate({ inputRange: [0, 1], outputRange: ['#E5E5E5', color] }),
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          {icon}
          {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
          <Text style={[styles.chipText, selected && { color, fontWeight: '700' }]}>{label}</Text>
          {selected && (
            <PopIn from={0}>
              <View style={[styles.chipCheck, { backgroundColor: color }]}>
                <CheckSmallIcon size={9} />
              </View>
            </PopIn>
          )}
        </Animated.View>
      )}
    </Pressable>
  );
};

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

// Success state: check pops in with an expanding ring.
const SuccessOverlay = ({ ticketNumber }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(anim, { toValue: 1, tension: 90, friction: 8, useNativeDriver: true }),
      Animated.timing(ring, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [anim, ring]);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.successWrap, { opacity: anim.interpolate({ inputRange: [0, 0.3], outputRange: [0, 1], extrapolate: 'clamp' }) }]}>
      <View style={styles.successCenter}>
        <Animated.View
          style={[
            styles.successRing,
            { opacity: ring.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.45, 0.08, 0] }), transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] }) }] },
          ]}
        />
        <Animated.View style={[styles.successCircle, { transform: [{ scale: anim }] }]}>
          <CheckSmallIcon size={44} />
        </Animated.View>
      </View>
      <Animated.View
        style={{
          alignItems: 'center',
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        }}
      >
        <Text style={styles.successTitle}>Ticket created</Text>
        <Text style={styles.successSub}>{ticketNumber} has been added to your queue</Text>
      </Animated.View>
    </Animated.View>
  );
};

// Discard confirmation dialog.
const DiscardDialog = ({ onKeep, onDiscard }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 140, friction: 14, useNativeDriver: true }).start();
  }, [anim]);
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.dialogBackdrop, { opacity: anim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onKeep} />
      </Animated.View>
      <View style={styles.dialogCenter} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.dialog,
            { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] },
          ]}
        >
          <Text style={styles.dialogTitle}>Discard this ticket?</Text>
          <Text style={styles.dialogBody}>The details you entered will be lost.</Text>
          <View style={styles.dialogActions}>
            <Pressable onPress={onKeep} style={({ pressed }) => [styles.dialogBtn, styles.dialogBtnGhost, pressed && styles.pressed]}>
              <Text style={styles.dialogBtnGhostText}>Keep editing</Text>
            </Pressable>
            <Pressable onPress={onDiscard} style={({ pressed }) => [styles.dialogBtn, { backgroundColor: '#D93025' }, pressed && styles.pressed]}>
              <Text style={styles.dialogBtnText}>Discard</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

// ---------- screen ----------

export default function NewTicketScreen({ progress, tickets, nextNumber, onClose, onCreated }) {
  const insets = useSafeAreaInsets();
  const keyboardInset = useKeyboardInset();
  const scrollRef = useRef(null);

  const [customer, setCustomer] = useState(''); // typed text
  const [selectedCustomer, setSelectedCustomer] = useState(null); // { name, channel }
  const [customerFocused, setCustomerFocused] = useState(false);
  const [channel, setChannel] = useState(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Internet');
  const [assignee, setAssignee] = useState('You');
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});
  const [shakeKey, setShakeKey] = useState(0);
  const [phase, setPhase] = useState('editing'); // editing | creating | success
  const [showDiscard, setShowDiscard] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const mediaRef = useRef(null);

  // Back only dismisses the discard dialog: keep the page still during the gesture.
  usePredictiveBack(showDiscard, {});

  const customerName = selectedCustomer ? selectedCustomer.name : customer.trim();
  const dirty = !!(customerName || subject || description || attachments.length);
  const ticketNumber = `#${1000 + nextNumber}`;

  const suggestions = useMemo(() => {
    if (selectedCustomer || !customer.trim()) return [];
    const q = customer.trim().toLowerCase();
    const seen = new Set();
    return tickets
      .filter((t) => t.username.toLowerCase().includes(q) && !seen.has(t.username) && seen.add(t.username))
      .slice(0, 4);
  }, [customer, selectedCustomer, tickets]);

  const requestClose = () => {
    if (phase !== 'editing') return;
    Keyboard.dismiss();
    if (dirty) setShowDiscard(true);
    else onClose();
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (mediaOpen) mediaRef.current?.close();
      else if (showDiscard) setShowDiscard(false);
      else requestClose();
      return true;
    });
    return () => sub.remove();
  });

  const pickCustomer = (t) => {
    setSelectedCustomer({ name: t.username, channel: t.channel });
    setChannel(t.channel);
    setCustomer('');
    setErrors((e) => ({ ...e, customer: null, channel: null }));
    Keyboard.dismiss();
  };

  const validate = () => {
    const e = {};
    if (!customerName) e.customer = 'Add a customer name, handle or email';
    if (!channel) e.channel = 'Choose the channel to reply on';
    if (!subject.trim()) e.subject = 'Subject is required';
    if (description.trim().length < 10) e.description = 'Describe the issue (at least 10 characters)';
    return e;
  };

  const create = () => {
    if (phase !== 'editing') return;
    Keyboard.dismiss();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setShakeKey((k) => k + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setPhase('creating');
    setTimeout(() => {
      setPhase('success');
      const now = new Date();
      const ticket = {
        id: String(nextNumber),
        username: customerName,
        channel,
        subject: subject.trim(),
        message: description.trim(),
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        priority,
        category,
        assignee,
        attachments,
        isNew: true,
      };
      setTimeout(() => onCreated(ticket), 1300);
    }, 1100);
  };

  const channelTheme = channel ? getChannelTheme(channel) : null;
  const err = (k) => (errors[k] ? styles.inputError : null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 6 }]}>
        <TouchableOpacity accessibilityLabel="Close new ticket" style={styles.headerBtn} onPress={requestClose}>
          <CloseIcon size={20} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>New Ticket</Text>
          <Text style={styles.headerSub}>{ticketNumber} · Draft</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Customer */}
        <Section index={0} progress={progress} style={styles.section}>
          <Text style={styles.label}>Customer</Text>
          <Shake trigger={errors.customer ? shakeKey : 0}>
            {selectedCustomer ? (
              <PopIn style={styles.customerCard}>
                <View style={[styles.avatar, { backgroundColor: getChannelTheme(selectedCustomer.channel).soft }]}>
                  <Text style={[styles.avatarText, { color: getChannelTheme(selectedCustomer.channel).solid }]}>
                    {initials(selectedCustomer.name)}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                  <Text style={styles.customerMeta}>Existing customer · {selectedCustomer.channel}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                  <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
              </PopIn>
            ) : (
              <TextInput
                style={[styles.input, customerFocused && styles.inputFocused, err('customer')]}
                placeholder="Name, @handle, email or phone"
                placeholderTextColor="rgba(46,46,46,0.45)"
                value={customer}
                onChangeText={(t) => {
                  setCustomer(t);
                  if (errors.customer) setErrors((e) => ({ ...e, customer: null }));
                }}
                onFocus={() => setCustomerFocused(true)}
                onBlur={() => setCustomerFocused(false)}
              />
            )}
          </Shake>
          {suggestions.length > 0 && (
            <PopIn style={styles.suggestions}>
              {suggestions.map((t) => (
                <Pressable key={t.id} onPress={() => pickCustomer(t)} style={({ pressed }) => [styles.suggestion, pressed && { backgroundColor: '#F7F7F7' }]}>
                  <ChannelIcon channel={t.channel} size={18} />
                  <Text style={styles.suggestionText} numberOfLines={1}>{t.username}</Text>
                  <Text style={styles.suggestionMeta}>{t.channel}</Text>
                </Pressable>
              ))}
            </PopIn>
          )}
          {!selectedCustomer && !!customer.trim() && suggestions.length === 0 && (
            <Text style={styles.helper}>New customer “{customer.trim()}” will be created</Text>
          )}
          <FieldError text={errors.customer} />
        </Section>

        {/* Channel */}
        <Section index={1} progress={progress} style={styles.section}>
          <Text style={styles.label}>Channel</Text>
          <Shake trigger={errors.channel ? shakeKey : 0}>
            <View style={styles.chipWrap}>
              {CHANNELS.map((c) => {
                const t = getChannelTheme(c);
                return (
                  <Chip
                    key={c}
                    label={c}
                    selected={channel === c}
                    color={t.solid}
                    soft={t.soft}
                    icon={<ChannelIcon channel={c} size={16} />}
                    onPress={() => {
                      setChannel(c);
                      setErrors((e) => ({ ...e, channel: null }));
                    }}
                  />
                );
              })}
            </View>
          </Shake>
          <FieldError text={errors.channel} />
        </Section>

        {/* Subject */}
        <Section index={2} progress={progress} style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Subject</Text>
            <Text style={[styles.counter, subject.length >= SUBJECT_MAX && { color: '#D93025' }]}>
              {subject.length}/{SUBJECT_MAX}
            </Text>
          </View>
          <Shake trigger={errors.subject ? shakeKey : 0}>
            <TextInput
              style={[styles.input, err('subject')]}
              placeholder="e.g. Slow internet since this morning"
              placeholderTextColor="rgba(46,46,46,0.45)"
              value={subject}
              maxLength={SUBJECT_MAX}
              onChangeText={(t) => {
                setSubject(t);
                if (errors.subject) setErrors((e) => ({ ...e, subject: null }));
              }}
            />
          </Shake>
          <FieldError text={errors.subject} />
        </Section>

        {/* Description */}
        <Section index={3} progress={progress} style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <Shake trigger={errors.description ? shakeKey : 0}>
            <TextInput
              style={[styles.input, styles.textArea, err('description')]}
              placeholder="What's the customer's issue? Add any details that help."
              placeholderTextColor="rgba(46,46,46,0.45)"
              value={description}
              multiline
              textAlignVertical="top"
              onFocus={() => setTimeout(() => scrollRef.current?.scrollTo({ y: 260, animated: true }), 250)}
              onChangeText={(t) => {
                setDescription(t);
                if (errors.description) setErrors((e) => ({ ...e, description: null }));
              }}
            />
          </Shake>
          <FieldError text={errors.description} />
        </Section>

        {/* Priority */}
        <Section index={4} progress={progress} style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipWrap}>
            {PRIORITIES.map((p) => (
              <Chip
                key={p.key}
                label={p.key}
                dot={p.color}
                selected={priority === p.key}
                color={p.color}
                soft={p.color + '1A'}
                onPress={() => setPriority(p.key)}
              />
            ))}
          </View>
        </Section>

        {/* Category */}
        <Section index={5} progress={progress} style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </Section>

        {/* Assignee */}
        <Section index={6} progress={progress} style={styles.section}>
          <Text style={styles.label}>Assign to</Text>
          <View style={styles.assigneeRow}>
            {ASSIGNEES.map((a) => {
              const active = assignee === a.key;
              return (
                <Pressable key={a.key} onPress={() => setAssignee(a.key)} style={styles.assignee}>
                  <View style={[styles.assigneeRing, active && { borderColor: a.color }]}>
                    <View style={[styles.assigneeAvatar, { backgroundColor: a.color + (active ? 'FF' : '26') }]}>
                      <Text style={[styles.assigneeInitials, { color: active ? '#FFFFFF' : a.color }]}>{a.initials}</Text>
                    </View>
                  </View>
                  <Text style={[styles.assigneeName, active && { color: '#292929', fontWeight: '700' }]}>{a.key}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Attachments */}
        <Section index={7} progress={progress} style={styles.section}>
          <Text style={styles.label}>Attachments</Text>
          <View style={styles.attachRow}>
            {attachments.map((a) => (
              <PopIn key={a.id} style={styles.thumbWrap}>
                <View style={styles.thumb}>
                  <Image source={a.source} style={styles.thumbImage} />
                  {a.type === 'video' && (
                    <View style={styles.thumbPlay}>
                      <PlayIcon size={12} />
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  accessibilityLabel="Remove attachment"
                  style={styles.thumbRemove}
                  onPress={() => setAttachments((l) => l.filter((x) => x.id !== a.id))}
                >
                  <CloseSmallIcon size={9} />
                </TouchableOpacity>
              </PopIn>
            ))}
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setMediaOpen(true);
              }}
              style={({ pressed }) => [styles.addAttach, pressed && styles.pressed]}
            >
              <ImageIcon size={20} color={BRAND} />
              <Text style={styles.addAttachText}>Add</Text>
            </Pressable>
          </View>
        </Section>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: keyboardInset ? 12 : Math.max(insets.bottom, 12), marginBottom: keyboardInset }]}>
        {channelTheme && phase === 'editing' && (
          <Text style={styles.footerHint} numberOfLines={1}>
            Replies will be sent via {channel}
          </Text>
        )}
        <Pressable onPress={create} style={({ pressed }) => [styles.createBtn, pressed && styles.pressed, phase === 'creating' && { opacity: 0.85 }]}>
          {phase === 'creating' ? <Spinner /> : null}
          <Text style={styles.createText}>{phase === 'creating' ? 'Creating ticket…' : 'Create ticket'}</Text>
        </Pressable>
      </View>

      {phase === 'success' && <SuccessOverlay ticketNumber={ticketNumber} />}

      {showDiscard && (
        <DiscardDialog
          onKeep={() => setShowDiscard(false)}
          onDiscard={() => {
            setShowDiscard(false);
            onClose();
          }}
        />
      )}

      {mediaOpen && (
        <MediaPickerSheet
          ref={mediaRef}
          initialTab="photos"
          color={BRAND}
          onAttach={(items) => setAttachments((l) => [...l, ...items.filter((i) => !l.find((x) => x.id === i.id))])}
          onClosed={() => setMediaOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,46,46,0.08)',
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  headerSpacer: { width: 40, height: 40 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000000' },
  headerSub: { fontSize: 12, color: 'rgba(93,92,93,0.7)', marginTop: 2 },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 22 },
  label: { fontSize: 14, fontWeight: '700', color: '#292929', marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  counter: { fontSize: 12, color: 'rgba(93,92,93,0.6)' },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000000',
    backgroundColor: '#FAFAFA',
  },
  inputFocused: { borderColor: BRAND, backgroundColor: '#FFFFFF' },
  inputError: { borderColor: '#D93025', backgroundColor: '#FFF6F5' },
  textArea: { minHeight: 120 },
  errorText: { color: '#D93025', fontSize: 12, fontWeight: '600', marginTop: 6 },
  helper: { color: 'rgba(93,92,93,0.75)', fontSize: 12, marginTop: 6 },
  suggestions: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  suggestionText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#292929' },
  suggestionMeta: { fontSize: 12, color: 'rgba(93,92,93,0.7)' },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 14,
    padding: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700' },
  customerName: { fontSize: 15, fontWeight: '700', color: '#292929' },
  customerMeta: { fontSize: 12, color: 'rgba(93,92,93,0.7)', marginTop: 2 },
  changeLink: { fontSize: 13, fontWeight: '700', color: BRAND },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: '#3B3F45' },
  chipCheck: { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  assigneeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  assignee: { alignItems: 'center', gap: 6, width: 60 },
  assigneeRing: { padding: 2, borderRadius: 26, borderWidth: 2, borderColor: 'transparent' },
  assigneeAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  assigneeInitials: { fontSize: 13, fontWeight: '800' },
  assigneeName: { fontSize: 12, color: 'rgba(93,92,93,0.8)' },
  attachRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  thumbWrap: { paddingTop: 6, paddingRight: 6 },
  thumb: { width: 68, height: 68, borderRadius: 14, overflow: 'hidden', backgroundColor: '#EEE' },
  thumbImage: { width: '100%', height: '100%' },
  thumbPlay: {
    position: 'absolute',
    left: 22,
    top: 22,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbRemove: {
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
  addAttach: {
    marginTop: 6,
    width: 68,
    height: 68,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#F3B3A5',
    backgroundColor: '#FFF8F6',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  addAttachText: { fontSize: 12, fontWeight: '700', color: BRAND },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46,46,46,0.08)',
    backgroundColor: '#FFFFFF',
  },
  footerHint: { fontSize: 12, color: 'rgba(93,92,93,0.75)', textAlign: 'center', marginBottom: 8 },
  createBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: BRAND,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  createText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderTopColor: '#FFFFFF',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  successWrap: { backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', gap: 28 },
  successCenter: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center' },
  successRing: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: BRAND },
  successCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: BRAND, justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#000000' },
  successSub: { fontSize: 14, color: 'rgba(93,92,93,0.8)', marginTop: 6 },
  dialogBackdrop: { backgroundColor: 'rgba(0,0,0,0.4)' },
  dialogCenter: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', padding: 32 },
  dialog: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 22, padding: 22 },
  dialogTitle: { fontSize: 18, fontWeight: '800', color: '#000000' },
  dialogBody: { fontSize: 14, color: '#5D5C5D', marginTop: 6, lineHeight: 20 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  dialogBtn: { flex: 1, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  dialogBtnGhost: { borderWidth: 1, borderColor: '#E5E5E5' },
  dialogBtnGhostText: { fontSize: 15, fontWeight: '700', color: '#292929' },
  dialogBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
