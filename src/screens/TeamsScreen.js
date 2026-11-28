import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionMenu from '../components/ActionMenu';
import useTeamActions from '../components/teams/useTeamActions';
import { CreateTeamSheet, PersonAvatar } from '../components/teams/TeamSheets';
import { useTicketDetail } from '../components/TicketDetailContext';
import { BellOffIcon, PinIcon } from '../components/MenuIcons';
import { personById } from '../data/teams';
import BlurHeader from '../components/BlurHeader';
import useLargeTitle from '../components/useLargeTitle';
import { TAB_BAR_HEIGHT } from '../components/NavigationBar';
import { ProgressiveBlurContainer } from '../components/ProgressiveBlur';

const PlusIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.25 1.11111C11.25 0.497462 10.6904 0 10 0C9.30964 0 8.75 0.497462 8.75 1.11111V8.75H1.11111C0.497462 8.75 0 9.30964 0 10C0 10.6904 0.497462 11.25 1.11111 11.25H8.75V18.8889C8.75 19.5025 9.30964 20 10 20C10.6904 20 11.25 19.5025 11.25 18.8889V11.25H18.8889C19.5025 11.25 20 10.6904 20 10C20 9.30964 19.5025 8.75 18.8889 8.75H11.25V1.11111Z"
      fill="#EE4323"
    />
  </Svg>
);

const TeamCard = ({ team, onOpen, menuItems }) => {
  const press = useRef(new Animated.Value(0)).current;
  const spring = (v) => Animated.spring(press, { toValue: v, tension: 300, friction: 20, useNativeDriver: true }).start();
  const members = team.members.map((m) => personById(m.id)).filter(Boolean);
  const total = members.length + (team.extraMembers || 0);
  const names = members.slice(0, 3).map((m) => m.name.split(' ')[0]).join(', ');

  return (
    <Pressable onPress={() => onOpen(team)} onPressIn={() => spring(1)} onPressOut={() => spring(0)}>
      <Animated.View
        style={[
          styles.card,
          team.left && styles.cardLeft,
          { transform: [{ scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.98] }) }] },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.teamDot, { backgroundColor: team.color }]} />
          <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
          {team.pinned && <PinIcon size={14} color="#EE4323" />}
          {team.muted && <BellOffIcon size={14} color="rgba(0,0,0,0.45)" />}
          <View style={styles.flex} />
          <ActionMenu items={menuItems} style={styles.moreButton} accessibilityLabel={`${team.name} options`} />
        </View>

        <View style={styles.avatarsRow}>
          {members.slice(0, 4).map((m, i) => (
            <View key={m.id} style={[styles.avatarWrap, i > 0 && styles.avatarOverlap]}>
              <PersonAvatar person={m} size={32} showStatus={false} />
            </View>
          ))}
          {total > 4 && (
            <View style={[styles.avatarMore, styles.avatarOverlap]}>
              <Text style={styles.avatarMoreText}>+{total - 4}</Text>
            </View>
          )}
          <View style={styles.flex} />
          <View style={[styles.openPill, { backgroundColor: team.color + '18' }]}>
            <Text style={[styles.openPillText, { color: team.color }]}>{team.stats.open} open</Text>
          </View>
        </View>
        <Text style={styles.membersText} numberOfLines={1}>
          {team.left ? 'You left this team' : `${names} and ${total - Math.min(3, members.length)} others`}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export default function TeamsScreen() {
  const insets = useSafeAreaInsets();
  const { teams, setTeams, openTeam, showToast, presentSheet } = useTicketDetail();
  const { menuFor, dialogs } = useTeamActions();
  const scrollY = useRef(new Animated.Value(0)).current;
  const largeTitle = useLargeTitle(scrollY);

  const sorted = [...teams].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const headerH = Math.max(insets.top, 24) + 76;

  const createTeam = ({ name, color, memberIds }) => {
    const team = {
      id: `t${Date.now()}`,
      name,
      color,
      description: 'New team',
      channels: ['Email'],
      members: memberIds.map((id) => ({ id, load: 0 })),
      extraMembers: 0,
      stats: { open: 0, response: '—', csat: '—', responseDelta: null, csatDelta: null },
    };
    LayoutAnimation.configureNext(LayoutAnimation.create(260, 'easeInEaseOut', 'opacity'));
    setTeams((list) => [team, ...list]);
    showToast({ text: `${name} created`, actionLabel: 'View', onAction: () => openTeam(team) });
  };

  return (
    <View style={styles.container}>
      <ProgressiveBlurContainer top={headerH + 20} bottom={TAB_BAR_HEIGHT + insets.bottom} bottomFlat>
      <Animated.FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TeamCard
            team={item}
            onOpen={openTeam}
            menuItems={() => menuFor(item, { onOpen: openTeam, onAddMember: (t) => openTeam({ ...t, addMember: true }) })}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingTop: headerH + 8, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      />
      </ProgressiveBlurContainer>

      {/* Blurred header: content scrolls underneath, edge to edge */}
      <BlurHeader scrollY={scrollY}>
        <Animated.View style={[styles.header, { paddingTop: largeTitle.padTop(Math.max(insets.top, 24)) }]}>
          <Animated.Text style={[styles.headerTitle, largeTitle.titleStyle]}>Teams</Animated.Text>
          <TouchableOpacity style={styles.addButton} onPress={() => presentSheet(<CreateTeamSheet onCreate={createTeam} />)} accessibilityLabel="Create team" hitSlop={10}>
            <PlusIcon />
          </TouchableOpacity>
        </Animated.View>
      </BlurHeader>

      {dialogs}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 36, fontWeight: '700', color: '#000000', lineHeight: 43 },
  addButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
  card: {
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  cardLeft: { opacity: 0.55 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  teamDot: { width: 10, height: 10, borderRadius: 5 },
  teamName: { fontSize: 20, fontWeight: '700', color: '#000000', flexShrink: 1 },
  moreButton: { padding: 4 },
  avatarsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarWrap: { borderWidth: 2, borderColor: '#FFFFFF', borderRadius: 18 },
  avatarOverlap: { marginLeft: -10 },
  avatarMore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFEFEF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMoreText: { fontSize: 11, fontWeight: '700', color: '#666666' },
  openPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  openPillText: { fontSize: 12, fontWeight: '700' },
  membersText: { fontSize: 13, color: 'rgba(0, 0, 0, 0.6)' },
});
