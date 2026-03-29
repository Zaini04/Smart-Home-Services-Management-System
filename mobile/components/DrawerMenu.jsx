import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  TouchableWithoutFeedback, Platform, StatusBar, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../src/context/AuthContext';
import { Colors } from '../src/theme/colors';

const DRAWER_WIDTH = 290;

export default function DrawerMenu({ isOpen, onClose, role = 'resident' }) {
  const router = useRouter();
  const { user, logoutUser } = useAuth();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isOpen]);

  const navigate = (path) => {
    onClose();
    setTimeout(() => router.push(path), 250);
  };

  const handleLogout = async () => {
    onClose();
    await logoutUser();
    setTimeout(() => router.replace('/(auth)/login'), 300);
  };

  const residentLinks = [
    { icon: 'home', label: 'Home', path: '/(resident)/home' },
    { icon: 'paper-plane', label: 'Post a Job', path: '/(resident)/post-job' },
    { icon: 'calendar', label: 'My Bookings', path: '/(resident)/my-bookings' },
    { icon: 'chatbubbles', label: 'Messages', path: '/(resident)/chat-inbox' },
    { icon: 'notifications', label: 'Notifications', path: '/(resident)/notifications' },
    { icon: 'person', label: 'Edit Profile', path: '/(resident)/edit-profile' },
  ];

  const providerLinks = [
    { icon: 'home', label: 'Dashboard', path: '/(provider)/dashboard' },
    { icon: 'search', label: 'Find Jobs', path: '/(provider)/available-jobs' },
    { icon: 'briefcase', label: 'My Jobs', path: '/(provider)/my-jobs' },
    { icon: 'document-text', label: 'My Offers', path: '/(provider)/my-offers' },
    { icon: 'wallet', label: 'Wallet', path: '/(provider)/wallet' },
    { icon: 'cash', label: 'Earnings', path: '/(provider)/earnings' },
    { icon: 'chatbubbles', label: 'Messages', path: '/(provider)/chat-inbox' },
    { icon: 'person', label: 'Edit Profile', path: '/(provider)/edit-profile' },
  ];

  const links = role === 'provider' ? providerLinks : residentLinks;

  if (!isOpen) return null;

  return (
    <View style={styles.wrapper}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Drawer Panel */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.drawerHeader}>
          <View style={styles.drawerAvatar}>
            <Text style={styles.drawerAvatarText}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.drawerName} numberOfLines={1}>{user?.full_name || 'User'}</Text>
          <Text style={styles.drawerEmail} numberOfLines={1}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {role === 'provider' ? 'Service Provider' : 'Resident'}
            </Text>
          </View>
        </LinearGradient>

        {/* Nav Links */}
        <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
          {links.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.navItem}
              onPress={() => navigate(item.path)}
              activeOpacity={0.6}
            >
              <View style={styles.navIconBox}>
                <Ionicons name={item.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.navLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.textLight} />
            </TouchableOpacity>
          ))}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Logout */}
          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout} activeOpacity={0.6}>
            <View style={[styles.navIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            </View>
            <Text style={[styles.navLabel, { color: '#DC2626' }]}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={styles.version}>ServiceHub v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: DRAWER_WIDTH,
    backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 20,
  },
  drawerHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 24,
    paddingHorizontal: 20, alignItems: 'flex-start',
  },
  drawerAvatar: {
    width: 54, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  drawerAvatarText: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  drawerName: { fontSize: 17, fontWeight: '700', color: '#FFF', marginBottom: 2 },
  drawerEmail: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  roleBadge: {
    marginTop: 8, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3,
  },
  roleText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  navList: { flex: 1, paddingTop: 8 },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 20,
  },
  navIconBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },
  navLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 8, marginHorizontal: 20 },
  logoutItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 20 },
  version: { fontSize: 11, color: Colors.textLight, textAlign: 'center', paddingBottom: 20 },
});
