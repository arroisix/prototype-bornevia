import React, { useState, useRef } from 'react';
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
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import ChannelIcon from '../components/ChannelIcons';
import { useTicketDetail } from '../components/TicketDetailContext';

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

const MoreIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={5} cy={12} r={2} fill="#000000" />
    <Circle cx={12} cy={12} r={2} fill="#000000" />
    <Circle cx={19} cy={12} r={2} fill="#000000" />
  </Svg>
);

const NewTicketIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path d="M8 1V15M1 8H15" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Generate 25 dummy tickets
const channels = ['Twitter', 'Facebook', 'FB Messenger', 'Instagram', 'WhatsApp', 'Email'];
const usernames = [
  '@michael_greek', '@internet_cool', 'Mary Thompson', 'Jane Wilson', 'Emma Thompson',
  'Nina Suryana', '@tech_guru', 'John Smith', '@social_butterfly', 'Lisa Anderson',
  '@quick_help', 'Robert Brown', '@digital_nomad', 'Sarah Connor', '@customer_first',
  'David Lee', '@happy_user', 'Michelle Obama', '@speed_racer', 'Chris Evans',
  '@feedback_king', 'Amanda White', '@loyal_customer', 'James Bond', '@support_seeker'
];
const messages = [
  '@ISPCompany, internet crawling today. Any solutions? #NeedSpeed',
  'Hey @ISPCompany, experiencing sluggish internet. Any solutions?',
  'Hi @ISPCompany, I\'ve been facing really slow internet speeds lately. Can you ple...',
  'Seriously @ISPCompany, what\'s going on with your internet?! It\'s been painfully slo...',
  'Hey there! I just tried to purchase a new internet subscription on your website, bu...',
  'Yeah! You\'re right.',
  'My connection keeps dropping every few minutes. Please help!',
  'When will the maintenance be completed? It\'s been 3 hours already.',
  'Thank you for the quick response! Really appreciate it.',
  'I need to upgrade my plan. How do I do that?',
  'The mobile app is not working properly. Getting error 404.',
  'Can someone help me reset my password? Urgent!',
  'Your service has been excellent lately. Keep it up!',
  'I was charged twice for my subscription. Please refund.',
  'How do I cancel my subscription? Can\'t find the option.',
  'The speed test shows 10mbps but I\'m paying for 100mbps!',
  'Great customer service experience today. Thanks team!',
  'My router is blinking red. What does that mean?',
  'Need technical support for setting up mesh network.',
  'Invoice not received for this month. Please resend.',
  'Website is down. Cannot access my account dashboard.',
  'Fiber installation scheduled for next week. Excited!',
  'Billing address needs to be updated. How to change?',
  'Excellent service! Recommended to all my friends.',
  'Connection timeout error when streaming. Please fix.',
];

const ticketsData = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  username: usernames[i],
  channel: channels[i % channels.length],
  message: messages[i],
  time: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
}));

const TicketItem = ({ item, onPress }) => {
  const pressAnim = useRef(new Animated.Value(0)).current;

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
      <Animated.View style={[styles.ticketItem, { backgroundColor, transform: [{ scale }] }]}>
        <View style={styles.channelIconContainer}>
          <ChannelIcon channel={item.channel} size={24} />
        </View>
        <View style={styles.content}>
          <View style={styles.bodyRow}>
            <View style={styles.middleSection}>
              <Text style={styles.sender} numberOfLines={1}>{item.username}</Text>
              <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default function TicketsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { openTicket } = useTicketDetail();
  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredTickets = ticketsData.filter(ticket =>
    ticket.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Animated.FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TicketItem item={item} onPress={openTicket} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />

      {/* Fixed Header - solid white background */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tickets</Text>
          <View style={styles.headerRight}>
            <Animated.View style={{ opacity: searchIconOpacity, marginRight: 12 }}>
              <TouchableOpacity>
                <SearchIcon size={24} />
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity>
              <MoreIcon />
            </TouchableOpacity>
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
      </View>

      {/* New Ticket Button */}
      <Animated.View
        style={[
          styles.newTicketButtonContainer,
          { transform: [{ translateY: buttonTranslateY }], opacity: buttonOpacity }
        ]}
      >
        <TouchableOpacity style={styles.newTicketButton}>
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
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    paddingTop: STATUS_BAR_HEIGHT,
  },
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
