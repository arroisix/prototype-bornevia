import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Pressable,
  LayoutAnimation,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import ChannelIcon from '../components/ChannelIcons';
import { useTicketDetail } from '../components/TicketDetailContext';
import ActionMenu from '../components/ActionMenu';
import BlurHeader from '../components/BlurHeader';
import { TAB_BAR_HEIGHT } from '../components/NavigationBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PopIn } from '../components/chat/Composer';
import { CheckAllIcon, DownloadIcon, RefreshIcon } from '../components/MenuIcons';
import { ProgressiveBlurContainer } from '../components/ProgressiveBlur';

const CHANNEL_FILTERS = ['All channels', 'Email', 'WhatsApp', 'Facebook', 'FB Messenger', 'Instagram', 'Twitter'];
const SORTS = ['Newest first', 'Oldest first', 'Name A–Z'];

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 40 : 44;
const HEADER_BASE_HEIGHT = 68; // Title area height
const SEARCH_BAR_HEIGHT = 48;
const TOTAL_HEADER_HEIGHT = STATUS_BAR_HEIGHT + HEADER_BASE_HEIGHT + SEARCH_BAR_HEIGHT;

const SearchIcon = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} stroke="rgba(46, 46, 46, 0.5)" strokeWidth={2} />
    <Path d="M16 16L20 20" stroke="rgba(46, 46, 46, 0.5)" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const NewTicketIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path d="M8 1V15M1 8H15" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);



const TicketItem = ({ item, onPress, highlight }) => {
  const pressAnim = useRef(new Animated.Value(0)).current;
  // Newly created ticket: slide in, then a soft brand-colour flash that fades out.
  const flash = useRef(new Animated.Value(highlight ? 1 : 0)).current;
  const enter = useRef(new Animated.Value(highlight ? 0 : 1)).current;
  useEffect(() => {
    if (!highlight) return;
    Animated.parallel([
      Animated.spring(enter, { toValue: 1, tension: 90, friction: 12, useNativeDriver: false }),
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(flash, { toValue: 0, duration: 1600, useNativeDriver: false }),
      ]),
    ]).start();
  }, [highlight, enter, flash]);

  const animateTo = (toValue) => {
    Animated.spring(pressAnim, {
      toValue,
      tension: 300,
      friction: 20,
      useNativeDriver: false,
    }).start();
  };

  const scale = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.98] });
  const backgroundColor = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(238, 67, 35, 0)', 'rgba(238, 67, 35, 0.05)'],
  });

  return (
    <Pressable
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      onPress={() => onPress(item)}
    >
      <Animated.View
        style={{
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
          backgroundColor: flash.interpolate({ inputRange: [0, 1], outputRange: ['rgba(238,67,35,0)', 'rgba(238,67,35,0.10)'] }),
        }}
      >
      <Animated.View style={[styles.ticketItem, { backgroundColor, transform: [{ scale }] }]}>
        <View style={styles.channelIconContainer}>
          <ChannelIcon channel={item.channel} size={24} />
        </View>
        <View style={styles.content}>
          <View style={styles.bodyRow}>
            <View style={styles.middleSection}>
              <View style={styles.senderRow}>
                <Text style={[styles.sender, styles.flexShrink]} numberOfLines={1}>{item.username}</Text>
                {item.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>
              <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default function TicketsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { openTicket, openNewTicket, tickets, setTickets, highlightId, showToast } = useTicketDetail();
  const [sort, setSort] = useState(SORTS[0]);
  const [channelFilter, setChannelFilter] = useState(CHANNEL_FILTERS[0]);
  const listRef = useRef(null);
  const insets = useSafeAreaInsets();
  const barSpace = TAB_BAR_HEIGHT + insets.bottom;
  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredTickets = tickets
    .filter(
      (ticket) =>
        (channelFilter === CHANNEL_FILTERS[0] || ticket.channel === channelFilter) &&
        (ticket.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.message.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort((a, b) => {
      if (sort === 'Oldest first') return Number(a.id) - Number(b.id);
      if (sort === 'Name A–Z') return a.username.replace('@', '').localeCompare(b.username.replace('@', ''));
      return Number(b.id) - Number(a.id);
    });

  const relayout = () => LayoutAnimation.configureNext(LayoutAnimation.create(240, 'easeInEaseOut', 'opacity'));

  const menuItems = () => [
    { section: 'Sort by' },
    ...SORTS.map((s) => ({ key: s, label: s, checked: sort === s, onPress: () => { relayout(); setSort(s); } })),
    { section: 'Channel' },
    ...CHANNEL_FILTERS.map((c) => ({ key: c, label: c, checked: channelFilter === c, onPress: () => { relayout(); setChannelFilter(c); } })),
    { section: 'Actions' },
    {
      key: 'read',
      label: 'Mark all as read',
      icon: CheckAllIcon,
      onPress: () => {
        setTickets((list) => list.map((t) => ({ ...t, isNew: false })));
        showToast(`${tickets.length} tickets marked as read`);
      },
    },
    {
      key: 'refresh',
      label: 'Refresh',
      icon: RefreshIcon,
      onPress: () => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
        showToast({ text: 'Inbox is up to date', tone: 'info' });
      },
    },
    { key: 'export', label: 'Export as CSV', icon: DownloadIcon, onPress: () => showToast({ text: `Exported ${filteredTickets.length} tickets to Downloads`, actionLabel: 'Open', onAction: () => {} }) },
  ];

  // Search bar collapses (height shrinks) when scrolling
  const searchBarHeight = scrollY.interpolate({
    inputRange: [0, SEARCH_BAR_HEIGHT],
    outputRange: [SEARCH_BAR_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, SEARCH_BAR_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const searchIconOpacity = scrollY.interpolate({
    inputRange: [0, SEARCH_BAR_HEIGHT / 2, SEARCH_BAR_HEIGHT],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const buttonTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  const buttonOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Tickets List */}
      <ProgressiveBlurContainer top={TOTAL_HEADER_HEIGHT + 8} bottom={barSpace + 16}>
      <Animated.FlatList
        ref={listRef}
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TicketItem item={item} onPress={openTicket} highlight={item.id === highlightId} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: barSpace + 90 }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
      </ProgressiveBlurContainer>

      {/* Fixed header — frosted blur, edge to edge under the status bar */}
      <BlurHeader style={styles.headerWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tickets</Text>
          <View style={styles.headerRight}>
            <Animated.View style={{ opacity: searchIconOpacity, marginRight: 12 }}>
              <TouchableOpacity>
                <SearchIcon size={24} />
              </TouchableOpacity>
            </Animated.View>
            <ActionMenu items={menuItems} accessibilityLabel="Ticket list options" />
          </View>
        </View>

        {/* Search Bar - collapses on scroll */}
        <Animated.View style={[styles.searchContainer, { height: searchBarHeight, opacity: searchBarOpacity }]}>
          <View style={styles.searchBar}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ticket..."
              placeholderTextColor="rgba(46, 46, 46, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </Animated.View>
        {channelFilter !== CHANNEL_FILTERS[0] && (
          <PopIn style={styles.filterRow}>
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => {
                relayout();
                setChannelFilter(CHANNEL_FILTERS[0]);
              }}
            >
              <ChannelIcon channel={channelFilter} size={14} />
              <Text style={styles.filterChipText}>
                {channelFilter} · {filteredTickets.length}
              </Text>
              <Text style={styles.filterChipX}>✕</Text>
            </TouchableOpacity>
          </PopIn>
        )}
      </BlurHeader>

      {/* New Ticket Button */}
      <Animated.View
        style={[
          styles.newTicketButtonContainer,
          { bottom: barSpace + 14 },
          { transform: [{ translateY: buttonTranslateY }], opacity: buttonOpacity }
        ]}
      >
        <TouchableOpacity style={styles.newTicketButton} onPress={openNewTicket} activeOpacity={0.85}>
          <NewTicketIcon />
          <Text style={styles.newTicketText}>New Ticket</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: STATUS_BAR_HEIGHT,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDECE8',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#EE4323' },
  filterChipX: { fontSize: 11, fontWeight: '800', color: '#EE4323' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 43,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 234, 234, 0.2)',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    padding: 0,
    margin: 0,
  },
  listContent: {
    paddingTop: TOTAL_HEADER_HEIGHT,
    paddingBottom: 80,
  },
  ticketItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 46, 46, 0.1)',
    gap: 12,
  },
  channelIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 22,
  },
  middleSection: {
    flex: 1,
    gap: 3,
  },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flexShrink: { flexShrink: 1 },
  newBadge: { backgroundColor: '#EE4323', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  newBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  sender: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292929',
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    color: '#5D5C5D',
    lineHeight: 24,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: 'rgba(93, 92, 93, 0.5)',
  },
  newTicketButtonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  newTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EE4323',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    gap: 12,
  },
  newTicketText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
