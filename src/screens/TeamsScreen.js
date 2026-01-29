import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 40 : 44;

// Avatar colors from Figma
const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#87CEEB', '#F0E68C', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'
];

// Mock data based on Figma design
const teamsData = [
  {
    id: '1',
    name: 'Social Media',
    members: [
      { name: 'Andrew', color: AVATAR_COLORS[0] },
      { name: 'Susan', color: AVATAR_COLORS[1] },
      { name: 'James', color: AVATAR_COLORS[2] },
    ],
    extra: '+8 others',
  },
  {
    id: '2',
    name: 'Sales Team',
    members: [
      { name: 'Margareteh', color: AVATAR_COLORS[3] },
      { name: 'Bianca', color: AVATAR_COLORS[4] },
      { name: 'Steve', color: AVATAR_COLORS[5] },
    ],
    extra: '+12 others',
  },
  {
    id: '3',
    name: 'Technical Team',
    members: [
      { name: 'David', color: AVATAR_COLORS[6] },
      { name: 'Michael', color: AVATAR_COLORS[7] },
      { name: 'Kowalski', color: AVATAR_COLORS[8] },
    ],
    extra: '+12 others',
  },
  {
    id: '4',
    name: 'Marketing',
    members: [
      { name: 'Nina', color: AVATAR_COLORS[9] },
      { name: 'Ali', color: AVATAR_COLORS[10] },
      { name: 'Mina', color: AVATAR_COLORS[11] },
    ],
    extra: '+12 others',
  },
  {
    id: '5',
    name: 'Customer Service',
    members: [
      { name: 'David', color: AVATAR_COLORS[0] },
      { name: 'Michael', color: AVATAR_COLORS[1] },
      { name: 'Kowalski', color: AVATAR_COLORS[2] },
    ],
    extra: '+12 others',
  },
];

// Plus Icon from Figma
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

// More Icon from Figma
const MoreIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 12C8 13.1046 7.10457 14 6 14C4.89543 14 4 13.1046 4 12C4 10.8954 4.89543 10 6 10C7.10457 10 8 10.8954 8 12ZM14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12ZM18 14C19.1046 14 20 13.1046 20 12C20 10.8954 19.1046 10 18 10C16.8954 10 16 10.8954 16 12C16 13.1046 16.8954 14 18 14Z"
      fill="#000000"
    />
  </Svg>
);

const getInitials = (name) => {
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const Avatar = ({ name, color, style }) => (
  <View style={[styles.avatar, { backgroundColor: color }, style]}>
    <Text style={styles.avatarText}>{getInitials(name)}</Text>
  </View>
);

const TeamItem = ({ item }) => {
  const memberNames = item.members.map(m => m.name).join(', ');
  const membersText = `${memberNames}, ${item.extra}`;

  return (
    <TouchableOpacity style={styles.teamItem} activeOpacity={0.7}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{item.name}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreIcon />
        </TouchableOpacity>
      </View>

      <View style={styles.teamMembers}>
        <View style={styles.avatarsContainer}>
          {item.members.map((member, index) => (
            <Avatar
              key={index}
              name={member.name}
              color={member.color}
              style={index > 0 ? styles.avatarOverlap : null}
            />
          ))}
          <View style={[styles.avatar, styles.avatarMore, styles.avatarOverlap]}>
            <Text style={styles.avatarMoreText}>{item.extra.replace(' others', '')}</Text>
          </View>
        </View>
        <Text style={styles.membersText}>{membersText}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function TeamsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teams</Text>
        <TouchableOpacity style={styles.addButton}>
          <PlusIcon />
        </TouchableOpacity>
      </View>

      {/* Teams List */}
      <FlatList
        data={teamsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TeamItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: STATUS_BAR_HEIGHT + 17,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 43,
  },
  addButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  teamItem: {
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  moreButton: {
    padding: 4,
  },
  teamMembers: {
    gap: 8,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avatarMore: {
    backgroundColor: '#E8E8E8',
  },
  avatarMoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
  },
  membersText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
  },
});
