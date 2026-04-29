import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getMyNotifications, markNotificationsAsRead } from '../../src/api/notificationEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';

const typeConfig = {
  offer: { icon: 'document-text', color: '#3B82F6', bg: '#EFF6FF' },
  booking: { icon: 'calendar', color: '#8B5CF6', bg: '#F3E8FF' },
  payment: { icon: 'wallet', color: '#22C55E', bg: '#DCFCE7' },
  status: { icon: 'information-circle', color: '#F59E0B', bg: '#FEF3C7' },
  review: { icon: 'star', color: '#F59E0B', bg: '#FFFBEB' },
  system: { icon: 'megaphone', color: '#6366F1', bg: '#EEF2FF' },
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyNotifications();
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Mark all as read when page opens
    markNotificationsAsRead().catch(() => {});
  }, []);

  const getTimeDiff = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const renderItem = ({ item }) => {
    const conf = typeConfig[item.type] || typeConfig.system;
    return (
      <View style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}>
        <View style={[styles.notifIcon, { backgroundColor: conf.bg }]}>
          <Ionicons name={conf.icon} size={22} color={conf.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.notifTitle}>{item.title || 'Notification'}</Text>
          <Text style={styles.notifMessage} numberOfLines={3}>{item.message}</Text>
          <Text style={styles.notifTime}>{getTimeDiff(item.createdAt)}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerSubtitle}>Stay updated on your bookings</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchNotifications(); }}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="notifications-off-outline" size={48} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No Notifications Yet</Text>
              <Text style={styles.emptyText}>You'll see important updates about your bookings here.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    marginBottom: 10, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight,
  },
  notifCardUnread: {
    borderLeftWidth: 3, borderLeftColor: Colors.primary, backgroundColor: '#F0F7FF',
  },
  notifIcon: {
    width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  notifMessage: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  notifTime: { fontSize: 11, color: Colors.textLight, marginTop: 6 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 4,
  },
  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 28, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  emptyText: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40,
  },
});
