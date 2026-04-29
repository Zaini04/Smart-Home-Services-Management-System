import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { getMyNotifications, markNotificationsAsRead } from '../../src/api/notificationEndPoints';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '../../src/theme/animations';

export default function ProviderNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res?.data?.data || []);
    } catch (e) {
      console.log('Error fetching notifications', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRead = async (_id, isRead) => {
    if (isRead) return;
    try {
      await markNotificationsAsRead();
      fetchData();
    } catch(e) {
      console.log(e);
    }
  };

  const renderItem = ({ item, index }) => (
    <FadeInView delay={index * 50}>
      <TouchableOpacity 
        style={[styles.card, !item.isRead && styles.unreadCard]} 
        onPress={() => onRead(item._id, item.isRead)}
        activeOpacity={0.8}
      >
        <View style={styles.iconBox}>
          <Ionicons name="notifications" size={20} color={!item.isRead ? Colors.primary : Colors.textLight} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title || 'Notification'}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </FadeInView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Notifications</Text>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(i) => i._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No notifications yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1, shadowColor: Colors.text, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  unreadCard: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  message: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8, lineHeight: 20 },
  date: { fontSize: 12, color: Colors.textLight },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, alignSelf: 'center', marginLeft: 8 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary }
});
