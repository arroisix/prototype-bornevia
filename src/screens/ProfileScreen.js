import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BlurHeader from '../components/BlurHeader';
import { ProgressiveBlurContainer } from '../components/ProgressiveBlur';
import { TAB_BAR_HEIGHT } from '../components/NavigationBar';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 40 : 44;

// Icons from Figma
const BellIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M12 4C8.98373 4 6.53856 6.46243 6.53856 9.5V12.7392C6.53856 13.5763 6.05626 14.3373 5.30237 14.6898C3.12212 15.7092 3.84374 19 6.2475 19H10.5105C10.5105 19.5523 11.1774 20 12 20C12.8226 20 13.4895 19.5523 13.4895 19H17.7525C20.1563 19 20.8779 15.7092 18.6976 14.6898C17.9437 14.3373 17.4614 13.5763 17.4614 12.7392V9.5C17.4614 6.46243 15.0163 4 12 4ZM8.52454 9.5C8.52454 7.567 10.0806 6 12 6C13.9194 6 15.4755 7.567 15.4755 9.5V12.7392C15.4755 14.3547 16.4063 15.8235 17.8613 16.5038C17.9498 16.5451 17.9787 16.5904 17.9925 16.6215C18.011 16.6629 18.0204 16.7248 18.0048 16.7959C17.9892 16.867 17.9548 16.9191 17.9207 16.9488C17.8952 16.9712 17.85 17 17.7525 17H6.2475C6.14998 17 6.10483 16.9712 6.07925 16.9488C6.04522 16.9191 6.01078 16.867 5.99519 16.7959C5.9796 16.7248 5.98904 16.6629 6.00748 16.6215C6.02134 16.5904 6.05024 16.5451 6.13869 16.5038C7.59371 15.8235 8.52454 14.3547 8.52454 12.7392V9.5Z" fill="#2E2E2E" fillOpacity="0.5"/>
  </Svg>
);

const SecurityIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path opacity="0.5" d="M18 5.56641V13.7451C17.9999 14.4706 17.736 15.1712 17.2578 15.7168C16.3637 16.7368 15.2504 17.5414 14.001 18.0693L12.79 18.5811C12.2622 18.804 11.6696 18.8204 11.1299 18.6279L10.959 18.5674C9.39337 18.0092 7.99095 17.0704 6.87793 15.8359C6.31293 15.2092 6.00008 14.3955 6 13.5518V5.56641L12 4.03223L18 5.56641Z" stroke="#2E2E2E" strokeWidth="2"/>
  </Svg>
);

const SettingsIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path opacity="0.5" d="M17.334 14.4453C18.9292 14.4457 20.2227 15.7387 20.2227 17.334C20.2223 18.929 18.929 20.2223 17.334 20.2227C16.1297 20.2227 15.0977 19.485 14.6641 18.4375C14.6284 18.4414 14.5923 18.4443 14.5557 18.4443H5C4.44776 18.4443 4 17.9966 4 17.4443C4.00006 16.8921 4.4478 16.4444 5 16.4443H14.5557C14.5655 16.4443 14.5752 16.445 14.585 16.4453C14.9597 15.2846 16.0485 14.4453 17.334 14.4453ZM17.334 16.2227C16.7203 16.2227 16.2227 16.7203 16.2227 17.334C16.223 17.9088 16.6598 18.3824 17.2197 18.4395L17.334 18.4453C17.9471 18.445 18.445 17.9471 18.4453 17.334L18.4395 17.2197C18.3824 16.6598 17.9088 16.223 17.334 16.2227ZM12 9.11133C13.2039 9.11142 14.2341 9.84843 14.668 10.8955C14.7039 10.8916 14.7404 10.8887 14.7773 10.8887H19C19.552 10.8889 19.9999 11.3366 20 11.8887C20 12.4408 19.5521 12.8884 19 12.8887H14.7773C14.7675 12.8887 14.7578 12.887 14.748 12.8867C14.3736 14.0479 13.2858 14.8886 12 14.8887C10.7142 14.8886 9.62539 14.048 9.25098 12.8867C9.24155 12.887 9.23214 12.8887 9.22266 12.8887H5C4.44772 12.8887 4 12.441 4 11.8887C4.00012 11.3365 4.44779 10.8887 5 10.8887H9.22266C9.25894 10.8887 9.29479 10.8907 9.33008 10.8945C9.76404 9.8476 10.7962 9.11142 12 9.11133ZM12 10.8887C11.3865 10.8888 10.8888 11.3865 10.8887 12L10.8945 12.1143C10.9517 12.6742 11.425 13.1112 12 13.1113C12.6135 13.1112 13.1112 12.6135 13.1113 12C13.1112 11.425 12.6742 10.9517 12.1143 10.8945L12 10.8887ZM6.66602 3.77734C7.86989 3.77734 8.901 4.51461 9.33496 5.56152C9.37088 5.55761 9.40737 5.55567 9.44434 5.55566H19C19.5522 5.55572 20 6.00342 20 6.55566C19.9999 7.10786 19.5522 7.55561 19 7.55566H9.44434C9.4342 7.55566 9.42413 7.55401 9.41406 7.55371C9.03949 8.71471 7.95172 9.55469 6.66602 9.55469C5.07083 9.55434 3.77734 8.26129 3.77734 6.66602C3.7777 5.07104 5.07104 3.7777 6.66602 3.77734ZM6.66602 5.55469C6.05288 5.55504 5.55504 6.05288 5.55469 6.66602L5.56055 6.78027C5.61761 7.34015 6.09115 7.77701 6.66602 7.77734C7.27967 7.77734 7.77734 7.27967 7.77734 6.66602C7.77701 6.09115 7.34015 5.61761 6.78027 5.56055L6.66602 5.55469Z" fill="#2E2E2E"/>
  </Svg>
);

const HelpIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M9.60942 5.20637C10.3574 4.94317 11.162 4.8 12 4.8C12.838 4.8 13.6426 4.94316 14.3906 5.20637L12.7542 8.47913C12.511 8.42728 12.2587 8.4 12 8.4C11.7413 8.4 11.489 8.42728 11.2458 8.47913L9.60942 5.20637ZM9.63615 9.28475C9.51112 9.39369 9.39369 9.51112 9.28475 9.63615L6.01244 7.99999C6.53824 7.2145 7.2145 6.53824 7.99999 6.01244L9.63615 9.28475ZM8.47913 11.2458C8.42728 11.489 8.4 11.7413 8.4 12C8.4 12.2587 8.42728 12.511 8.47913 12.7542L5.20637 14.3906C4.94317 13.6426 4.8 12.838 4.8 12C4.8 11.162 4.94317 10.3574 5.20637 9.60942L8.47913 11.2458ZM9.28475 14.3638C9.39368 14.4889 9.51112 14.6063 9.63614 14.7152L7.99999 17.9876C7.2145 17.4618 6.53824 16.7855 6.01244 16L9.28475 14.3638ZM11.2458 15.5209C11.489 15.5727 11.7413 15.6 12 15.6C12.2587 15.6 12.511 15.5727 12.7542 15.5209L14.3906 18.7936C13.6426 19.0568 12.838 19.2 12 19.2C11.162 19.2 10.3574 19.0568 9.60942 18.7936L11.2458 15.5209ZM14.3639 14.7152C14.4889 14.6063 14.6063 14.4889 14.7152 14.3639L17.9876 16C17.4618 16.7855 16.7855 17.4618 16 17.9875L14.3639 14.7152ZM15.5209 12.7542C15.5727 12.511 15.6 12.2587 15.6 12C15.6 11.7413 15.5727 11.489 15.5209 11.2458L18.7936 9.60939C19.0568 10.3574 19.2 11.162 19.2 12C19.2 12.838 19.0568 13.6426 18.7936 14.3906L15.5209 12.7542ZM14.7152 9.63613L17.9875 7.99997C17.4617 7.21448 16.7855 6.53822 16 6.01243L14.3638 9.28474C14.4889 9.39368 14.6063 9.51111 14.7152 9.63613ZM12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM10.2 12C10.2 11.0059 11.0059 10.2 12 10.2C12.9941 10.2 13.8 11.0059 13.8 12C13.8 12.9941 12.9941 13.8 12 13.8C11.0059 13.8 10.2 12.9941 10.2 12Z" fill="#2E2E2E" fillOpacity="0.5"/>
  </Svg>
);

const EditIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path d="M14.1667 2.5C14.3856 2.28113 14.6454 2.10752 14.9314 1.98906C15.2173 1.87061 15.5238 1.80965 15.8333 1.80965C16.1429 1.80965 16.4493 1.87061 16.7353 1.98906C17.0213 2.10752 17.281 2.28113 17.5 2.5C17.7189 2.71887 17.8925 2.97865 18.0109 3.26461C18.1294 3.55057 18.1904 3.85706 18.1904 4.16667C18.1904 4.47628 18.1294 4.78277 18.0109 5.06873C17.8925 5.35469 17.7189 5.61446 17.5 5.83333L6.25 17.0833L1.66667 18.3333L2.91667 13.75L14.1667 2.5Z" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ChevronRightIcon = ({ size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M6 12L10 8L6 4" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const MenuItem = ({ icon: Icon, title, value, onPress, showBorder = true }) => (
  <TouchableOpacity
    style={[styles.menuItem, showBorder && styles.menuItemBorder]}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={styles.menuLeft}>
      <Icon size={24} />
      <Text style={styles.menuTitle}>{title}</Text>
    </View>
    <View style={styles.menuRight}>
      {value && <Text style={[styles.menuValue, value === 'ON' && styles.menuValueOn]}>{value}</Text>}
      <ChevronRightIcon />
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen({ onLogout }) {
  const insets = useSafeAreaInsets();
  const [headerH, setHeaderH] = useState(STATUS_BAR_HEIGHT + 92);
  const barSpace = TAB_BAR_HEIGHT + insets.bottom;
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ProgressiveBlurContainer top={headerH + 12} bottom={barSpace + 16}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerH, paddingBottom: barSpace + 40 }]}
      >
        {/* Profile Info Row */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JS</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>James Susanto</Text>
            <Text style={styles.profileEmail}>james@email.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
            <EditIcon />
          </TouchableOpacity>
        </View>

        {/* Menu Section */}
        <View style={styles.menuContainer}>
          <MenuItem
            icon={BellIcon}
            title="Notification"
            value="ON"
            showBorder={true}
          />
          <MenuItem
            icon={SecurityIcon}
            title="Privacy"
            showBorder={true}
          />
          <MenuItem
            icon={SettingsIcon}
            title="Settings"
            showBorder={true}
          />
          <MenuItem
            icon={HelpIcon}
            title="Help & Support"
            showBorder={false}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={onLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      </ProgressiveBlurContainer>

      {/* Header — floats over the content (edge to edge) */}
      <BlurHeader>
        <View style={styles.header} onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
      </BlurHeader>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: STATUS_BAR_HEIGHT + 17,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 43,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 40,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EE4323',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 29,
  },
  profileEmail: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 14,
  },
  editButton: {
    width: 20,
    height: 20,
    opacity: 0.4,
  },
  menuContainer: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#D6D6D6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 17,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 14,
  },
  menuValueOn: {
    color: '#EE4323',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EE4323',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EE4323',
  },
});
