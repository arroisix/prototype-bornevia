import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  LayoutAnimation,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import BlurHeader from '../components/BlurHeader';
import ChannelIcon from '../components/ChannelIcons';
import useTeamActions from '../components/teams/useTeamActions';
import { AddMemberSheet, PersonAvatar, STATUS_COLORS } from '../components/teams/TeamSheets';
import { useTicketDetail } from '../components/TicketDetailContext';
import { PopIn } from '../components/chat/Composer';
import {
  BackArrowIcon,
  BellOffIcon,
  CheckAllIcon,
  ClockIcon,
  LogOutIcon,
  StarIcon,
  TrashIcon,
  UserPlusIcon,
  UsersIcon,
} from '../components/MenuIcons';
import { TEAM_ACTIVITY, personById } from '../data/teams';
import { BRAND } from '../theme/brand';

const TABS = ['Members', 'Queue', 'Activity'];
const CAPACITY = 10;

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

const LoadBar = ({ load, color }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: Math.min(load / CAPACITY, 1), duration: 700, delay: 250, useNativeDriver: false }).start();
  }, [load, anim]);
  const barColor = load >= 8 ? '#D93025' : load >= 5 ? '#F5B041' : color;
  return (
    <View style={styles.loadTrack}>
      <Animated.View
        style={[styles.loadFill, { backgroundColor: barColor, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
      />
    </View>
  );
};

const ACTIVITY_ICONS = { resolved: CheckAllIcon, reply: UsersIcon, assign: ClockIcon, member: UserPlusIcon, escalate: StarIcon };

export default function TeamDetailScreen({ teamId, openAddMember, progress, onClose }) {
  const insets = useSafeAreaInsets();
  const { teams, setTeams, tickets, openTicket, showToast } = useTicketDetail();
  const team = teams.find((t) => t.id === teamId);
  const { menuFor, dialogs } = useTeamActions();
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(!!openAddMember);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [tabW, setTabW] = useState(0);
  const tabAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const addRef = useRef(null);

  useEffect(() => {
    Animated.spring(tabAnim, { toValue: tab, tension: 140, friction: 16, useNativeDriver: true }).start();
  }, [tab, tabAnim]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (addOpen) addRef.current?.close();
      else onClose();
      return true;
    });
    return () => sub.remove();
  }, [addOpen, onClose]);

  // Team deleted from the ⋯ menu → leave the screen.
  useEffect(() => {
    if (!team) onClose();
  }, [team, onClose]);

  const queue = useMemo(
    () => (team ? tickets.filter((t) => team.channels.includes(t.channel)).slice(0, 8) : []),
    [team, tickets],
  );
  if (!team) return <View style={styles.container} />;

  const members = team.members.map((m) => ({ ...personById(m.id), load: m.load })).filter((m) => m.name);
  const visibleMembers = members.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));
  const online = members.filter((m) => m.status === 'online').length;
  const total = members.length + (team.extraMembers || 0);
  const headerH = Math.max(insets.top, 24) + 56;

  const updateTeam = (patch) => setTeams((list) => list.map((t) => (t.id === team.id ? { ...t, ...patch } : t)));

  const addMembers = (ids) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(240, 'easeInEaseOut', 'opacity'));
    updateTeam({ members: [...team.members, ...ids.map((id) => ({ id, load: 0, isNew: true }))] });
    setTab(0);
    showToast(`${ids.length} ${ids.length === 1 ? 'member' : 'members'} added to ${team.name}`);
  };

  const removeMember = (person) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(240, 'easeInEaseOut', 'opacity'));
    const before = team.members;
    updateTeam({ members: team.members.filter((m) => m.id !== person.id) });
    showToast({ text: `${person.name} removed`, tone: 'danger', actionLabel: 'Undo', onAction: () => updateTeam({ members: before }) });
  };

  const memberMenu = (m) => [
    { key: 'msg', label: 'Send message', icon: UsersIcon, onPress: () => showToast({ text: `Chat with ${m.name.split(' ')[0]} opened`, tone: 'info' }) },
    {
      key: 'lead',
      label: m.role === 'Team Lead' ? 'Remove lead role' : 'Make team lead',
      icon: StarIcon,
      onPress: () => showToast(`${m.name.split(' ')[0]} is ${m.role === 'Team Lead' ? 'no longer' : 'now'} a team lead`),
    },
    { key: 'away', label: 'Pause assignments', hint: 'Skip in auto-assign', icon: BellOffIcon, onPress: () => showToast({ text: `Assignments paused for ${m.name.split(' ')[0]}`, tone: 'info' }) },
    { key: 'remove', label: 'Remove from team', icon: TrashIcon, destructive: true, divider: true, onPress: () => setRemoveTarget(m) },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: headerH, paddingBottom: Math.max(insets.bottom, 12) + 96 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Stagger progress={progress} index={0} style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: team.color }]}>
            <Text style={styles.heroIconText}>{team.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</Text>
          </View>
          <Text style={styles.heroName}>{team.name}</Text>
          <Text style={styles.heroDesc}>{team.description}</Text>
          <View style={styles.heroMeta}>
            <View style={[styles.onlineDot, { backgroundColor: STATUS_COLORS.online }]} />
            <Text style={styles.heroMetaText}>
              {online} online · {total} members
            </Text>
            {team.muted && (
              <View style={styles.mutedPill}>
                <BellOffIcon size={12} color="#5D5C5D" />
                <Text style={styles.mutedText}>Muted</Text>
              </View>
            )}
          </View>
          <View style={styles.channelRow}>
            {team.channels.map((c) => (
              <View key={c} style={styles.channelChip}>
                <ChannelIcon channel={c} size={14} />
              </View>
            ))}
          </View>
        </Stagger>

        {/* Stats */}
        <Stagger progress={progress} index={1} style={styles.statsRow}>
          {[
            { label: 'Open tickets', value: String(team.stats.open), delta: null },
            { label: 'First response', value: team.stats.response, delta: team.stats.responseDelta, invert: true },
            { label: 'CSAT', value: team.stats.csat, delta: team.stats.csatDelta },
          ].map((s) => {
            const good = s.delta && (s.invert ? s.delta.startsWith('-') : s.delta.startsWith('+'));
            return (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                {s.delta && <Text style={[styles.statDelta, { color: good ? '#1E9E5A' : '#D93025' }]}>{s.delta}</Text>}
              </View>
            );
          })}
        </Stagger>

        {/* Tabs */}
        <Stagger progress={progress} index={2}>
          <View style={styles.tabs} onLayout={(e) => setTabW((e.nativeEvent.layout.width - 8) / TABS.length)}>
            {tabW > 0 && (
              <Animated.View
                style={[
                  styles.tabIndicator,
                  { width: tabW, transform: [{ translateX: tabAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, tabW, tabW * 2] }) }] },
                ]}
              />
            )}
            {TABS.map((t, i) => (
              <Pressable key={t} style={styles.tab} onPress={() => setTab(i)}>
                <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>
                  {t}
                  {i === 0 ? ` ${members.length}` : i === 1 ? ` ${queue.length}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        </Stagger>

        <Stagger progress={progress} index={3} style={styles.tabBody}>
          {tab === 0 && (
            <PopIn key="members">
              <TextInput
                style={styles.search}
                placeholder="Search members"
                placeholderTextColor="rgba(46,46,46,0.45)"
                value={query}
                onChangeText={setQuery}
              />
              {visibleMembers.map((m) => (
                <PopIn key={m.id} style={[styles.memberRow, m.isNew && styles.memberNew]}>
                  <PersonAvatar person={m} size={44} />
                  <View style={styles.flex}>
                    <View style={styles.memberTop}>
                      <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
                      {m.role === 'Team Lead' && (
                        <View style={styles.leadBadge}>
                          <Text style={styles.leadText}>LEAD</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberRole}>
                      {m.role} · <Text style={{ color: STATUS_COLORS[m.status], fontWeight: '600' }}>{m.status}</Text>
                    </Text>
                    <View style={styles.loadRow}>
                      <LoadBar load={m.load} color={team.color} />
                      <Text style={styles.loadText}>
                        {m.load}/{CAPACITY}
                      </Text>
                    </View>
                  </View>
                  <ActionMenu items={memberMenu(m)} style={styles.memberMore} iconColor="#5D5C5D" accessibilityLabel={`${m.name} options`} />
                </PopIn>
              ))}
              {visibleMembers.length === 0 && <Text style={styles.empty}>No members match “{query}”</Text>}
              {team.extraMembers > 0 && !query && <Text style={styles.moreMembers}>+ {team.extraMembers} more members</Text>}
            </PopIn>
          )}

          {tab === 1 && (
            <PopIn key="queue">
              {queue.map((t) => (
                <Pressable key={t.id} onPress={() => openTicket(t)} style={({ pressed }) => [styles.queueRow, pressed && { backgroundColor: '#FFF6F4' }]}>
                  <View style={styles.queueIcon}>
                    <ChannelIcon channel={t.channel} size={20} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.queueName} numberOfLines={1}>{t.username}</Text>
                    <Text style={styles.queueMsg} numberOfLines={1}>{t.message}</Text>
                  </View>
                  <Text style={styles.queueTime}>{t.time}</Text>
                </Pressable>
              ))}
              {queue.length === 0 && <Text style={styles.empty}>No open tickets for this team 🎉</Text>}
            </PopIn>
          )}

          {tab === 2 && (
            <PopIn key="activity">
              {TEAM_ACTIVITY.map((a, i) => {
                const Icon = ACTIVITY_ICONS[a.type] || ClockIcon;
                return (
                  <View key={a.id} style={styles.activityRow}>
                    <View style={styles.timeline}>
                      <View style={[styles.activityIcon, { backgroundColor: team.color + '1A' }]}>
                        <Icon size={15} color={team.color} />
                      </View>
                      {i < TEAM_ACTIVITY.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    <View style={[styles.flex, { paddingBottom: 18 }]}>
                      <Text style={styles.activityText}>
                        <Text style={{ fontWeight: '700' }}>{a.who}</Text> {a.what}
                      </Text>
                      <Text style={styles.activityWhen}>{a.when}</Text>
                    </View>
                  </View>
                );
              })}
            </PopIn>
          )}
        </Stagger>
      </Animated.ScrollView>

      {/* Header (blurred, edge to edge) */}
      <BlurHeader height={headerH} scrollY={scrollY}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 6 }]}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} accessibilityLabel="Back" hitSlop={8}>
            <BackArrowIcon size={24} color="#000000" />
          </TouchableOpacity>
          <Animated.Text
            numberOfLines={1}
            style={[styles.headerTitle, { opacity: scrollY.interpolate({ inputRange: [80, 130], outputRange: [0, 1], extrapolate: 'clamp' }) }]}
          >
            {team.name}
          </Animated.Text>
          <ActionMenu
            style={styles.iconBtn}
            accessibilityLabel="Team options"
            items={() => menuFor(team, { onAddMember: () => setAddOpen(true), onDeleted: onClose })}
          />
        </View>
      </BlurHeader>

      {/* Bottom CTA */}
      <BlurHeader position="bottom" style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 10, paddingHorizontal: 16 }}>
        <View style={styles.ctaRow}>
          {team.left ? (
            <Pressable
              onPress={() => {
                updateTeam({ left: false });
                showToast(`You re-joined ${team.name}`);
              }}
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            >
              <LogOutIcon size={18} color="#FFFFFF" />
              <Text style={styles.ctaText}>Re-join team</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => setAddOpen(true)} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
              <UserPlusIcon size={18} color="#FFFFFF" />
              <Text style={styles.ctaText}>Add members</Text>
            </Pressable>
          )}
        </View>
      </BlurHeader>

      {addOpen && <AddMemberSheet ref={addRef} team={team} onAdd={addMembers} onClosed={() => setAddOpen(false)} />}

      <ConfirmDialog
        visible={!!removeTarget}
        title={`Remove ${removeTarget?.name?.split(' ')[0] || ''}?`}
        body={`They'll stop receiving ${team.name} tickets. Their open tickets go back to the team queue.`}
        confirmLabel="Remove"
        destructive
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          const m = removeTarget;
          setRemoveTarget(null);
          removeMember(m);
        }}
      />
      {dialogs}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#000000', textAlign: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8 },
  heroIcon: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroIconText: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  heroName: { fontSize: 26, fontWeight: '800', color: '#000000' },
  heroDesc: { fontSize: 14, color: 'rgba(93,92,93,0.85)', marginTop: 4, textAlign: 'center' },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  heroMetaText: { fontSize: 13, color: '#3B3F45', fontWeight: '600' },
  mutedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F1F1', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4 },
  mutedText: { fontSize: 11, fontWeight: '700', color: '#5D5C5D' },
  channelRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  channelChip: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 20 },
  statCard: { flex: 1, borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 16, padding: 12 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#000000' },
  statLabel: { fontSize: 12, color: 'rgba(93,92,93,0.75)', marginTop: 2 },
  statDelta: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: '#F3F3F3', borderRadius: 12, padding: 4, marginHorizontal: 16, marginTop: 20 },
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
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(41,41,41,0.55)' },
  tabTextActive: { color: '#292929' },
  tabBody: { paddingHorizontal: 16, paddingTop: 14 },
  search: {
    height: 44,
    borderWidth: 1.5,
    borderColor: '#EDEDED',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#FAFAFA',
    marginBottom: 6,
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F2' },
  memberNew: { backgroundColor: '#FFF6F4', borderRadius: 14, paddingHorizontal: 8 },
  memberTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { fontSize: 15, fontWeight: '700', color: '#292929', flexShrink: 1 },
  leadBadge: { backgroundColor: '#FDECE8', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  leadText: { fontSize: 10, fontWeight: '800', color: BRAND, letterSpacing: 0.4 },
  memberRole: { fontSize: 12, color: 'rgba(93,92,93,0.8)', marginTop: 2 },
  loadRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  loadTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#F0F0F0', overflow: 'hidden' },
  loadFill: { height: '100%', borderRadius: 3 },
  loadText: { fontSize: 11, color: 'rgba(93,92,93,0.8)', fontWeight: '600', width: 34, textAlign: 'right' },
  memberMore: { padding: 6 },
  moreMembers: { fontSize: 13, color: 'rgba(93,92,93,0.7)', textAlign: 'center', marginTop: 14 },
  empty: { fontSize: 13, color: 'rgba(93,92,93,0.75)', textAlign: 'center', marginTop: 24 },
  queueRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F2' },
  queueIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  queueName: { fontSize: 14, fontWeight: '700', color: '#292929' },
  queueMsg: { fontSize: 13, color: '#5D5C5D', marginTop: 2 },
  queueTime: { fontSize: 12, color: 'rgba(93,92,93,0.5)' },
  activityRow: { flexDirection: 'row', gap: 12 },
  timeline: { alignItems: 'center' },
  activityIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  timelineLine: { flex: 1, width: 2, backgroundColor: '#F0F0F0', marginVertical: 4 },
  activityText: { fontSize: 14, color: '#292929', lineHeight: 20, marginTop: 4 },
  activityWhen: { fontSize: 12, color: 'rgba(93,92,93,0.6)', marginTop: 2 },
  ctaRow: { flexDirection: 'row', gap: 10 },
  cta: { flex: 1, height: 50, borderRadius: 16, backgroundColor: BRAND, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  ctaText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
