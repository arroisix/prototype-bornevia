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
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 40 : 44;
const HEADER_BASE_HEIGHT = 68; // Title area height
const SEARCH_BAR_HEIGHT = 48;
const TOTAL_HEADER_HEIGHT = STATUS_BAR_HEIGHT + HEADER_BASE_HEIGHT + SEARCH_BAR_HEIGHT;

// Social Media Icons
const TwitterIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000000"/>
  </Svg>
);

const FacebookIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </Svg>
);

const MessengerIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.15.26.37.27.6l.05 1.88c.02.63.67 1.03 1.24.77l2.1-.92c.17-.08.36-.1.55-.06.91.25 1.88.38 2.9.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm6.07 7.56l-2.97 4.71c-.47.75-1.49.93-2.18.38l-2.36-1.77a.75.75 0 00-.9 0l-3.19 2.42c-.43.32-.99-.18-.71-.63l2.97-4.71c.47-.75 1.49-.93 2.18-.38l2.36 1.77c.27.2.65.2.9 0l3.19-2.42c.43-.32.99.18.71.63z" fill="#0084FF"/>
  </Svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="#E4405F"/>
  </Svg>
);

const WhatsAppIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
  </Svg>
);

const EmailIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#EA4335"/>
  </Svg>
);

const ChannelIcon = ({ channel, size = 20 }) => {
  switch (channel) {
    case 'Twitter': return <TwitterIcon size={size} />;
    case 'Facebook': return <FacebookIcon size={size} />;
    case 'FB Messenger': return <MessengerIcon size={size} />;
    case 'Instagram': return <InstagramIcon size={size} />;
    case 'WhatsApp': return <WhatsAppIcon size={size} />;
    case 'Email': return <EmailIcon size={size} />;
    default: return <TwitterIcon size={size} />;
  }
};

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

const TicketItem = ({ item }) => (
  <View style={styles.ticketItem}>
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
  </View>
);

export default function TicketsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
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
        renderItem={({ item }) => <TicketItem item={item} />}
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
