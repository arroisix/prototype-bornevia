import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChannelIcon from '../components/ChannelIcons';

const ACCENT = '#EE4323';

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M15 5L8 12L15 19" stroke="#000000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MoreIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={5} cy={12} r={2} fill="#000000" />
    <Circle cx={12} cy={12} r={2} fill="#000000" />
    <Circle cx={19} cy={12} r={2} fill="#000000" />
  </Svg>
);

const SendIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4 12L20 4L13 20L11 13L4 12Z" stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" />
  </Svg>
);

const getInitials = (name) =>
  name
    .replace('@', '')
    .split(/[\s_]+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

const buildConversation = (ticket) => {
  const firstName = ticket.username.replace('@', '').split(/[\s_]+/)[0];
  return [
    { id: 'c1', from: 'customer', text: ticket.message, time: ticket.time },
    {
      id: 'a1',
      from: 'agent',
      text: `Hi ${firstName}, thanks for reaching out! We're looking into this right now and will update you shortly.`,
      time: ticket.time,
    },
  ];
};

// Fades + lifts a block in, delayed by `index` to create a subtle stagger.
const FadeInUp = ({ progress, index, children, style }) => {
  const start = Math.min(0.15 + index * 0.12, 0.7);
  const opacity = progress.interpolate({
    inputRange: [0, start, Math.min(start + 0.3, 1)],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  const translateY = progress.interpolate({
    inputRange: [0, start, Math.min(start + 0.3, 1)],
    outputRange: [14, 14, 0],
    extrapolate: 'clamp',
  });
  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>
  );
};

// New reply bubble pops in gently.
const AnimatedBubble = ({ children, animate }) => {
  const anim = useRef(new Animated.Value(animate ? 0 : 1)).current;
  useEffect(() => {
    if (animate) {
      Animated.spring(anim, { toValue: 1, tension: 120, friction: 14, useNativeDriver: true }).start();
    }
  }, [anim, animate]);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
};

const InfoRow = ({ label, value, last }) => (
  <View style={[styles.infoRow, last && styles.infoRowLast]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default function TicketDetailScreen({ ticket, progress, onClose }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState(() => buildConversation(ticket));
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('Open');

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const sendReply = () => {
    const text = reply.trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages((prev) => [...prev, { id: `r${prev.length}`, from: 'agent', text, time, isNew: true }]);
    setReply('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const ticketNumber = `#${String(1000 + Number(ticket.id)).padStart(4, '0')}`;
  const isResolved = status === 'Resolved';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 24) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.iconButton} hitSlop={8}>
          <BackIcon />
        </TouchableOpacity>
        <FadeInUp progress={progress} index={0} style={styles.headerCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(ticket.username)}</Text>
            <View style={styles.avatarBadge}>
              <ChannelIcon channel={ticket.channel} size={12} />
            </View>
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerName} numberOfLines={1}>{ticket.username}</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {ticket.channel} · {ticketNumber}
            </Text>
          </View>
        </FadeInUp>
        <TouchableOpacity style={styles.iconButton} hitSlop={8}>
          <MoreIcon />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status chips */}
          <FadeInUp progress={progress} index={1} style={styles.chipRow}>
            <View style={[styles.chip, isResolved ? styles.chipResolved : styles.chipOpen]}>
              <View style={[styles.chipDot, { backgroundColor: isResolved ? '#1E9E5A' : ACCENT }]} />
              <Text style={[styles.chipText, { color: isResolved ? '#1E9E5A' : ACCENT }]}>{status}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipTextMuted}>High priority</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipTextMuted}>Internet</Text>
            </View>
          </FadeInUp>

          {/* Conversation */}
          <FadeInUp progress={progress} index={2}>
            <Text style={styles.dateSeparator}>Today</Text>
          </FadeInUp>
          {messages.map((m, i) => {
            const isAgent = m.from === 'agent';
            const bubble = (
              <View style={[styles.bubbleRow, isAgent && styles.bubbleRowRight]}>
                <View style={[styles.bubble, isAgent ? styles.bubbleAgent : styles.bubbleCustomer]}>
                  <Text style={[styles.bubbleText, isAgent && styles.bubbleTextAgent]}>{m.text}</Text>
                  <Text style={[styles.bubbleTime, isAgent && styles.bubbleTimeAgent]}>{m.time}</Text>
                </View>
              </View>
            );
            return m.isNew ? (
              <AnimatedBubble key={m.id} animate>{bubble}</AnimatedBubble>
            ) : (
              <FadeInUp key={m.id} progress={progress} index={3 + i}>{bubble}</FadeInUp>
            );
          })}

          {/* Ticket details */}
          <FadeInUp progress={progress} index={5} style={styles.card}>
            <Text style={styles.cardTitle}>Ticket details</Text>
            <InfoRow label="Ticket ID" value={ticketNumber} />
            <InfoRow label="Channel" value={ticket.channel} />
            <InfoRow label="Assignee" value="You" />
            <InfoRow label="Created" value={`Today, ${ticket.time}`} last />
          </FadeInUp>

          <FadeInUp progress={progress} index={6}>
            <Pressable
              onPress={() => setStatus(isResolved ? 'Open' : 'Resolved')}
              style={({ pressed }) => [styles.resolveButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.resolveText}>{isResolved ? 'Reopen ticket' : 'Mark as resolved'}</Text>
            </Pressable>
          </FadeInUp>
        </ScrollView>

        {/* Reply bar */}
        <View style={[styles.replyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={styles.replyInput}
            placeholder="Type a reply..."
            placeholderTextColor="rgba(46, 46, 46, 0.5)"
            value={reply}
            onChangeText={setReply}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !reply.trim() && styles.sendButtonDisabled]}
            onPress={sendReply}
            activeOpacity={0.8}
          >
            <SendIcon />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 46, 46, 0.08)',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDE8E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: ACCENT,
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  headerTextWrap: { flex: 1 },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#292929',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(93, 92, 93, 0.7)',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  chipOpen: { backgroundColor: 'rgba(238, 67, 35, 0.1)' },
  chipResolved: { backgroundColor: 'rgba(30, 158, 90, 0.1)' },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 12, fontWeight: '700' },
  chipTextMuted: { fontSize: 12, fontWeight: '500', color: '#5D5C5D' },
  dateSeparator: {
    alignSelf: 'center',
    fontSize: 12,
    color: 'rgba(93, 92, 93, 0.6)',
    marginBottom: 12,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleCustomer: {
    backgroundColor: '#F3F3F3',
    borderBottomLeftRadius: 6,
  },
  bubbleAgent: {
    backgroundColor: ACCENT,
    borderBottomRightRadius: 6,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#292929',
  },
  bubbleTextAgent: { color: '#FFFFFF' },
  bubbleTime: {
    fontSize: 11,
    color: 'rgba(93, 92, 93, 0.6)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeAgent: { color: 'rgba(255, 255, 255, 0.75)' },
  card: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292929',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 46, 46, 0.06)',
  },
  infoRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  infoLabel: { fontSize: 14, color: '#5D5C5D' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#292929' },
  resolveButton: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resolveText: { fontSize: 15, fontWeight: '700', color: '#292929' },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46, 46, 46, 0.08)',
    backgroundColor: '#FFFFFF',
  },
  replyInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EDEDED',
    backgroundColor: 'rgba(234, 234, 234, 0.2)',
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 14,
    color: '#000000',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
});
