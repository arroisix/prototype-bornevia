import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  PanResponder,
  BackHandler,
  Keyboard,
  StatusBar,
  Dimensions,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChannelIcon, { getChannelTheme } from '../components/ChannelIcons';
import Composer, { AttachMenu } from '../components/chat/Composer';
import MessageBubble from '../components/chat/MessageBubble';
import AIDraftSheet from '../components/chat/AIDraftSheet';
import MediaPickerSheet from '../components/chat/MediaPickerSheet';
import TemplatesSheet from '../components/chat/TemplatesSheet';
import useKeyboardInset from '../components/chat/useKeyboardInset';
import { usePredictiveBack } from '../components/predictiveBack';
import BlurHeader from '../components/BlurHeader';
import { ProgressiveBlurContainer } from '../components/ProgressiveBlur';

const MAX_UPLOAD_MB = 10;
const sizeInMB = (size) => (size.includes('MB') ? parseFloat(size) : parseFloat(size) / 1024);
let attachmentSeq = 0;
const nowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

const STATUS_STYLE = {
  Open: { color: '#EE4323', bg: 'rgba(238, 67, 35, 0.1)' },
  Resolved: { color: '#1E9E5A', bg: 'rgba(30, 158, 90, 0.12)' },
  Closed: { color: '#5D5C5D', bg: 'rgba(93, 92, 93, 0.12)' },
};

// ---------- Icons ----------

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M15 5L8 12L15 19" stroke="#000000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SidebarIcon = ({ active }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={4} width={18} height={16} rx={3} stroke="#000000" strokeWidth={2} />
    <Path d="M15 4V20" stroke="#000000" strokeWidth={2} />
    {active && <Rect x={15} y={4} width={6} height={16} rx={0} fill="#000000" />}
  </Svg>
);

const CloseIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6L18 18M18 6L6 18" stroke="#000000" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const CheckIcon = ({ color = '#FFFFFF' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.5L10 17L19 7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ---------- Mock conversation ----------

const addMinutes = (time, mins) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const CONVERSATION_TEMPLATES = [
  (name) => [
    ['agent', `Hi ${name}, thanks for reaching out! Sorry to hear about the trouble. Could you share your customer ID so I can check your line?`],
    ['customer', 'Sure, it\'s CUST-20418.'],
    ['agent', 'Thanks! I can see some instability on your line since this morning. Have you tried restarting your router?'],
    ['customer', 'Yes, twice already. Still the same.'],
    ['agent', 'Got it. I\'ve just reset the connection from our side. Could you check again in about 2 minutes?'],
    ['customer', 'Okay, it\'s a bit better now but still slower than usual.'],
    ['agent', 'Understood. I\'ve escalated this to our network team and they\'ll monitor your line for the next 24 hours.'],
    ['customer', 'Alright, thanks for the help 🙏'],
  ],
  (name) => [
    ['agent', `Hello ${name}! I'm happy to help. Can you tell me a bit more about what's happening?`],
    ['customer', 'It started yesterday evening. Nothing seems to work properly.'],
    ['agent', 'Thanks for the info. Are you using WiFi or a cable connection?'],
    ['customer', 'WiFi, on both my phone and laptop.'],
    ['agent', 'Could you try connecting with a cable for a moment? That helps us narrow it down.'],
    ['customer', 'With the cable it\'s fine actually.'],
    ['agent', 'Great, that means the line is okay. It\'s likely a WiFi channel issue — I\'ll send you a quick guide to fix it.'],
    ['customer', 'Perfect, please send it over.'],
  ],
  (name) => [
    ['agent', `Hi ${name}, thank you for contacting us. Let me look into this for you.`],
    ['customer', 'Thank you. I\'ve been waiting quite a while.'],
    ['agent', 'Apologies for the wait. I\'ve pulled up your account — could you confirm the email registered with us?'],
    ['customer', 'Sure, it\'s the one ending in @mail.com.'],
    ['agent', 'Confirmed, thank you. I\'ve made the update on your account just now.'],
    ['customer', 'Nice, I can see it\'s changed. Thanks!'],
    ['agent', 'You\'re welcome! Is there anything else I can help you with today?'],
  ],
];

const buildConversation = (ticket) => {
  const name = ticket.username.replace('@', '').split(/[\s_]+/)[0];
  const template = CONVERSATION_TEMPLATES[Number(ticket.id) % CONVERSATION_TEMPLATES.length](name);
  const first = { id: 'm0', from: 'customer', text: ticket.message, time: ticket.time };
  if (ticket.isNew) {
    // Freshly created ticket: only the customer's issue (+ any attachments) so far.
    const atts = (ticket.attachments || []).map((a, i) => ({ ...a, key: `new${i}` }));
    return [{ ...first, text: ticket.subject ? `**${ticket.subject}**\n${ticket.message}` : ticket.message, attachments: atts }];
  }
  return [
    first,
    ...template.map(([from, text], i) => ({
      id: `m${i + 1}`,
      from,
      text,
      time: addMinutes(ticket.time, (i + 1) * 3),
    })),
  ];
};

const getInitials = (name) =>
  name
    .replace('@', '')
    .split(/[\s_]+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

// ---------- Animated helpers ----------

// Fades + lifts a block in, delayed by `index` to create a subtle stagger.
const FadeInUp = ({ progress, index, children, style }) => {
  const start = Math.min(0.15 + index * 0.06, 0.7);
  const end = Math.min(start + 0.3, 1);
  const opacity = progress.interpolate({
    inputRange: [0, start, end],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  const translateY = progress.interpolate({
    inputRange: [0, start, end],
    outputRange: [14, 14, 0],
    extrapolate: 'clamp',
  });
  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>
  );
};

// New reply bubble pops in gently.
const PopIn = ({ children }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 120, friction: 14, useNativeDriver: true }).start();
  }, [anim]);
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

// Status pill that cross-fades when the status changes.
const StatusPill = ({ status }) => {
  const anim = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, tension: 160, friction: 12, useNativeDriver: true }).start();
  }, [status, anim]);
  const s = STATUS_STYLE[status];
  return (
    <Animated.View
      style={[
        styles.statusPill,
        { backgroundColor: s.bg },
        {
          opacity: anim,
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
        },
      ]}
    >
      <View style={[styles.statusDot, { backgroundColor: s.color }]} />
      <Text style={[styles.statusText, { color: s.color }]}>{status}</Text>
    </Animated.View>
  );
};

const InfoRow = ({ label, value, last }) => (
  <View style={[styles.infoRow, last && styles.infoRowLast]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// ---------- Screen ----------

export default function TicketDetailScreen({ ticket, progress, onClose }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 24);
  const bottomInset = Math.max(insets.bottom, 12);
  const theme = getChannelTheme(ticket.channel);
  const keyboardInset = useKeyboardInset();

  const scrollRef = useRef(null);
  const [messages, setMessages] = useState(() => buildConversation(ticket));
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('Open');
  const [panelOpen, setPanelOpen] = useState(false);
  const panelAnim = useRef(new Animated.Value(0)).current;

  // Composer extras
  const [attachments, setAttachments] = useState([]);
  const [aiState, setAiState] = useState(null); // { text } once an AI draft is applied
  const [template, setTemplate] = useState(null); // { title } once a template is inserted
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheet, setSheet] = useState(null); // { type: 'ai' | 'photos' | 'videos' | 'templates', initialText? }
  const [composerH, setComposerH] = useState(70);
  const [headerH, setHeaderH] = useState(Math.max(insets.top, 24) + 66);
  const sheetRef = useRef(null);
  const failedOnce = useRef(new Set());

  const firstName = ticket.username.replace('@', '').split(/[\s_]+/)[0];
  const templateVars = {
    name: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    ticket: `#${String(1000 + Number(ticket.id)).padStart(4, '0')}`,
  };

  const openSheet = (type, extra = {}) => {
    Keyboard.dismiss();
    setMenuOpen(false);
    setSheet({ type, ...extra });
  };

  const updateAttachment = (key, patch) =>
    setAttachments((list) => list.map((a) => (a.key === key ? { ...a, ...patch } : a)));

  // Simulated upload: big files fail permanently, one video fails once (retryable).
  const startUpload = (att) => {
    const tooLarge = sizeInMB(att.size) > MAX_UPLOAD_MB;
    const flaky = att.id === 'v2' && !failedOnce.current.has(att.key);
    const duration = att.type === 'video' ? 1800 : 1000 + Math.random() * 600;
    att.progress.setValue(0);
    Animated.timing(att.progress, {
      toValue: tooLarge ? 0.3 : flaky ? 0.65 : 1,
      duration: tooLarge ? 500 : flaky ? duration * 0.65 : duration,
      useNativeDriver: true,
    }).start(() => {
      if (tooLarge) updateAttachment(att.key, { status: 'error', retryable: false });
      else if (flaky) {
        failedOnce.current.add(att.key);
        updateAttachment(att.key, { status: 'error', retryable: true });
      } else updateAttachment(att.key, { status: 'done' });
    });
  };

  const addAttachments = (items) => {
    const created = items.map((item) => ({
      ...item,
      key: `att${++attachmentSeq}`,
      status: 'uploading',
      retryable: false,
      progress: new Animated.Value(0),
    }));
    setAttachments((list) => [...list, ...created]);
    created.forEach(startUpload);
  };

  const retryAttachment = (key) => {
    const att = attachments.find((a) => a.key === key);
    if (!att) return;
    updateAttachment(key, { status: 'uploading' });
    startUpload(att);
  };

  const removeAttachment = (key) => setAttachments((list) => list.filter((a) => a.key !== key));

  const onChangeReply = (text) => {
    setReply(text);
    if (!text.trim()) {
      setAiState(null);
      setTemplate(null);
    }
  };

  const applyAiDraft = (text) => {
    setReply(text);
    setAiState({ text });
    setTemplate(null);
  };

  const insertTemplate = (t, body) => {
    setReply((cur) => (cur.trim() ? `${cur.trim()}\n\n${body}` : body));
    setTemplate({ title: t.title });
  };

  // Keep the latest message visible when the keyboard opens.
  useEffect(() => {
    if (keyboardInset) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, [keyboardInset]);

  const togglePanel = useCallback(
    (open) => {
      Keyboard.dismiss();
      setPanelOpen(open);
      Animated.spring(panelAnim, {
        toValue: open ? 1 : 0,
        tension: 70,
        friction: 13,
        useNativeDriver: true,
      }).start();
    },
    [panelAnim],
  );

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheet) sheetRef.current?.close();
      else if (menuOpen) setMenuOpen(false);
      else if (panelOpen) togglePanel(false);
      else onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose, panelOpen, togglePanel, sheet, menuOpen]);

  const sendReply = () => {
    const text = reply.trim();
    const files = attachments.filter((a) => a.status === 'done');
    if (!text && !files.length) return;
    const id = `r${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id,
        from: 'agent',
        text,
        time: nowTime(),
        isNew: true,
        status: 'sending',
        attachments: files,
        aiAssisted: !!aiState,
        templateTitle: template?.title,
      },
    ]);
    setTimeout(() => setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'sent' } : m))), 900);
    setReply('');
    setAttachments([]);
    setAiState(null);
    setTemplate(null);
    setMenuOpen(false);
    if (status !== 'Open') setStatus('Open');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const changeStatus = (next) => {
    setStatus(next);
    setTimeout(() => togglePanel(false), 250);
  };

  const ticketNumber = `#${String(1000 + Number(ticket.id)).padStart(4, '0')}`;
  const isOpen = status === 'Open';

  // Chat gets pushed left while the side panel slides in from the right.
  const chatTranslateX = panelAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -PANEL_WIDTH * 0.35] });
  const scrimOpacity = panelAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.25] });
  const panelTranslateX = panelAnim.interpolate({ inputRange: [0, 1], outputRange: [PANEL_WIDTH, 0] });

  // Back only closes the + menu: keep the page still during the gesture.
  usePredictiveBack(menuOpen, {});

  // Predictive back while the info panel is open: the panel slides out with the gesture.
  usePredictiveBack(panelOpen, {
    onProgress: (p) => panelAnim.setValue(1 - p * 0.4),
    onCancel: () => Animated.spring(panelAnim, { toValue: 1, tension: 70, friction: 13, useNativeDriver: true }).start(),
  });

  // Swipe right on the panel (or the dimmed chat) to close it; the panel follows the finger.
  const panelPan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, g) => g.dx > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderGrant: () => panelAnim.stopAnimation(),
        onPanResponderMove: (_, g) => panelAnim.setValue(Math.max(0, Math.min(1, 1 - g.dx / PANEL_WIDTH))),
        onPanResponderRelease: (_, g) => togglePanel(!(g.dx > PANEL_WIDTH * 0.3 || g.vx > 0.5)),
        onPanResponderTerminate: () => togglePanel(true),
      }),
    [panelAnim, togglePanel],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Chat area (pushed left when the panel opens) */}
      <Animated.View style={[styles.flex, { transform: [{ translateX: chatTranslateX }] }]}>
        {/* Edge-to-edge window: lift the chat above the keyboard ourselves */}
        <View style={[styles.flex, { paddingBottom: sheet ? 0 : keyboardInset }]}>
          <ProgressiveBlurContainer top={headerH + 12} bottom={composerH + 12}>
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, { paddingTop: headerH + 8, paddingBottom: composerH + 12 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            <FadeInUp progress={progress} index={1}>
              <Text style={styles.dateSeparator}>Today</Text>
            </FadeInUp>

            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const grouped = prev && prev.from === m.from && !prev.aiAssisted && !prev.templateTitle;
              const bubble = <MessageBubble message={m} theme={theme} grouped={grouped} />;
              return m.isNew ? (
                <PopIn key={m.id}>{bubble}</PopIn>
              ) : (
                <FadeInUp key={m.id} progress={progress} index={2 + i}>{bubble}</FadeInUp>
              );
            })}

            {!isOpen && (
              <PopIn>
                <Text style={styles.systemNote}>
                  Ticket marked as {status.toLowerCase()} · send a reply to reopen
                </Text>
              </PopIn>
            )}
          </ScrollView>
          </ProgressiveBlurContainer>

          {/* Tap-away layer + attach menu (inside this container so touches register on Android) */}
          {menuOpen && <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} />}
          <AttachMenu
            open={menuOpen}
            bottom={composerH + 8}
            onPick={(key) => openSheet(key)}
          />

          <BlurHeader position="bottom">
          <Composer
            floating
            theme={theme}
            channel={ticket.channel}
            value={reply}
            onChangeText={onChangeReply}
            attachments={attachments}
            onRemoveAttachment={removeAttachment}
            onRetryAttachment={retryAttachment}
            aiState={aiState}
            onEditAi={() => openSheet('ai', { initialText: reply })}
            onClearAi={() => {
              setAiState(null);
              setReply('');
            }}
            template={template}
            onClearTemplate={() => {
              setTemplate(null);
              setReply('');
            }}
            menuOpen={menuOpen}
            onToggleMenu={() => {
              Keyboard.dismiss();
              setMenuOpen((o) => !o);
            }}
            onOpenAI={() => openSheet('ai', aiState ? { initialText: reply } : {})}
            onSend={sendReply}
            bottomInset={keyboardInset && !sheet ? 8 : bottomInset}
            onLayout={(e) => setComposerH(e.nativeEvent.layout.height)}
          />
          </BlurHeader>
        </View>

        {/* Header — floats over the chat (edge to edge) */}
        <BlurHeader>
        <View style={[styles.header, { paddingTop: topInset + 6 }]} onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}>
          <TouchableOpacity accessibilityLabel="Back" onPress={onClose} style={styles.iconButton} hitSlop={8}>
            <BackIcon />
          </TouchableOpacity>
          <FadeInUp progress={progress} index={0} style={styles.headerCenter}>
            <View style={[styles.avatar, { backgroundColor: theme.soft }]}>
              <Text style={[styles.avatarText, { color: theme.solid }]}>{getInitials(ticket.username)}</Text>
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
            <StatusPill status={status} />
          </FadeInUp>
          <TouchableOpacity accessibilityLabel="Ticket info" onPress={() => togglePanel(!panelOpen)} style={styles.iconButton} hitSlop={8}>
            <SidebarIcon active={panelOpen} />
          </TouchableOpacity>
        </View>
        </BlurHeader>


        {/* Scrim over the chat while the panel is open */}
        <Animated.View
          pointerEvents={panelOpen ? 'auto' : 'none'}
          style={[StyleSheet.absoluteFill, styles.scrim, { opacity: scrimOpacity }]}
          {...panelPan.panHandlers}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => togglePanel(false)} />
        </Animated.View>
      </Animated.View>

      {/* Side panel: ticket details + actions */}
      <Animated.View
        pointerEvents={panelOpen ? 'auto' : 'none'}
        style={[
          styles.panel,
          { width: PANEL_WIDTH, paddingTop: topInset, paddingBottom: bottomInset, transform: [{ translateX: panelTranslateX }] },
        ]}
        {...panelPan.panHandlers}
      >
        {/* Grab handle hints that the panel can be swiped away */}
        <View pointerEvents="none" style={styles.panelGrip} />
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Ticket info</Text>
          <TouchableOpacity onPress={() => togglePanel(false)} style={styles.iconButton} hitSlop={8}>
            <CloseIcon />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={styles.panelContent} showsVerticalScrollIndicator={false}>
          <View style={styles.panelProfile}>
            <View style={[styles.avatarLarge, { backgroundColor: theme.soft }]}>
              <Text style={[styles.avatarLargeText, { color: theme.solid }]}>{getInitials(ticket.username)}</Text>
            </View>
            <Text style={styles.panelName} numberOfLines={1}>{ticket.username}</Text>
            <View style={[styles.channelTag, { backgroundColor: theme.soft }]}>
              <ChannelIcon channel={ticket.channel} size={14} />
              <Text style={[styles.channelTagText, { color: theme.solid }]}>{ticket.channel}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <InfoRow label="Ticket ID" value={ticketNumber} />
            <InfoRow label="Status" value={status} />
            <InfoRow label="Priority" value={ticket.priority || 'High'} />
            <InfoRow label="Assignee" value={ticket.assignee || 'You'} />
            <InfoRow label="Category" value={ticket.category || 'Internet'} />
            <InfoRow label="Created" value={`Today, ${ticket.time}`} />
            <InfoRow label="Messages" value={String(messages.length)} last />
          </View>
        </ScrollView>

        <View style={styles.panelActions}>
          {status === 'Resolved' || status === 'Closed' ? (
            <Pressable
              onPress={() => changeStatus('Open')}
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: '#292929' }, pressed && styles.pressed]}
            >
              <Text style={styles.primaryText}>Reopen ticket</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={() => changeStatus('Resolved')}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <CheckIcon />
                <Text style={styles.primaryText}>Mark as resolved</Text>
              </Pressable>
              <Pressable
                onPress={() => changeStatus('Closed')}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryText}>Close ticket</Text>
              </Pressable>
            </>
          )}
        </View>
      </Animated.View>

      {/* Bottom sheets */}
      {sheet?.type === 'ai' && (
        <AIDraftSheet
          ref={sheetRef}
          ticket={ticket}
          messages={messages}
          theme={theme}
          initialText={sheet.initialText}
          onApply={applyAiDraft}
          onClosed={() => setSheet(null)}
        />
      )}
      {(sheet?.type === 'photos' || sheet?.type === 'videos') && (
        <MediaPickerSheet
          ref={sheetRef}
          initialTab={sheet.type}
          color={theme.solid}
          onAttach={addAttachments}
          onClosed={() => setSheet(null)}
        />
      )}
      {sheet?.type === 'templates' && (
        <TemplatesSheet
          ref={sheetRef}
          vars={templateVars}
          color={theme.solid}
          onInsert={insertTemplate}
          onClosed={() => setSheet(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700' },
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
  headerName: { fontSize: 16, fontWeight: '700', color: '#292929' },
  headerSub: { fontSize: 12, color: 'rgba(93, 92, 93, 0.7)', marginTop: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 20 },
  dateSeparator: {
    alignSelf: 'center',
    fontSize: 12,
    color: 'rgba(93, 92, 93, 0.6)',
    marginBottom: 12,
  },
  systemNote: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(93, 92, 93, 0.8)',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 16,
    overflow: 'hidden',
  },
  scrim: { backgroundColor: '#000000' },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  panelGrip: {
    position: 'absolute',
    left: 6,
    top: '50%',
    marginTop: -22,
    width: 4,
    height: 44,
    borderRadius: 2,
    backgroundColor: '#E2E2E2',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 10,
  },
  panelTitle: { fontSize: 18, fontWeight: '700', color: '#000000' },
  panelContent: { paddingHorizontal: 20, paddingBottom: 16 },
  panelProfile: { alignItems: 'center', paddingVertical: 12, gap: 8 },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLargeText: { fontSize: 22, fontWeight: '700' },
  panelName: { fontSize: 16, fontWeight: '700', color: '#292929' },
  channelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  channelTagText: { fontSize: 12, fontWeight: '700' },
  card: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 46, 46, 0.06)',
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { fontSize: 14, color: '#5D5C5D' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#292929' },
  panelActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46, 46, 46, 0.08)',
  },
  primaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1E9E5A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  secondaryButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: { fontSize: 15, fontWeight: '700', color: '#EE4323' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
