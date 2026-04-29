import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyConversations } from '../../src/api/chatEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';

export default function ChatInboxScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await getMyConversations();
      setConversations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchConversations(); }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => router.push(`/chat/${item.bookingId || item._id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.chatTop}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.otherPerson?.name || item.otherUser?.name || item.otherUser?.full_name || 'User'}
          </Text>
          {item.lastMessage?.createdAt && (
            <Text style={styles.chatTime}>
              {new Date(item.lastMessage.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View style={styles.badgeRow}>
          {item.bookingDisplayId ? (
            <Text style={styles.jobBadge}>#{item.bookingDisplayId}</Text>
          ) : null}
          {item.status ? (
            <Text style={styles.statusBadge}>{String(item.status).replace(/_/g, ' ')}</Text>
          ) : null}
        </View>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {item.lastMessage?.message || 'No messages yet'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id || item.bookingId}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyText}>Messages will appear when you have active bookings</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.text },
  chatCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 10,
    ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight,
  },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: { fontSize: 15, fontWeight: '600', color: Colors.text, flex: 1 },
  chatTime: { fontSize: 11, color: Colors.textLight },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  jobBadge: { fontSize: 10, fontWeight: '700', color: '#4B5563', backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusBadge: { fontSize: 10, fontWeight: '600', color: '#1D4ED8', backgroundColor: '#DBEAFE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, textTransform: 'capitalize' },
  chatPreview: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  unreadText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
});
