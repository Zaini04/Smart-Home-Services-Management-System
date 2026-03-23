import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getBookingDetails, getBookingOffers, acceptOffer,
  approveFinalPrice, rejectFinalPrice, confirmPayment,
  cancelBooking, respondToInspection, approvePriceRevision, approveScheduleUpdate,
} from '../../../src/api/residentEndPoints';
import { Colors, Shadows } from '../../../src/theme/colors';

const statusConfig = {
  open: { color: '#3B82F6', bg: '#EFF6FF', label: 'Open', icon: 'time' },
  offer_accepted: { color: '#8B5CF6', bg: '#F3E8FF', label: 'Offer Accepted', icon: 'checkmark-circle' },
  inspection_pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Inspection Pending', icon: 'time' },
  inspection_scheduled: { color: '#F97316', bg: '#FFF7ED', label: 'Inspection Scheduled', icon: 'calendar' },
  awaiting_price_approval: { color: '#D97706', bg: '#FFFBEB', label: 'Awaiting Price Approval', icon: 'time' },
  price_approved: { color: '#14B8A6', bg: '#F0FDFA', label: 'Price Approved', icon: 'checkmark-circle' },
  work_in_progress: { color: '#6366F1', bg: '#EEF2FF', label: 'Work in Progress', icon: 'construct' },
  completed: { color: '#22C55E', bg: '#DCFCE7', label: 'Completed', icon: 'checkmark-done-circle' },
  cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled', icon: 'close-circle' },
};

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookRes, offersRes] = await Promise.all([
        getBookingDetails(id),
        getBookingOffers(id).catch(() => ({ data: { data: [] } })),
      ]);
      setBooking(bookRes.data.data);
      setOffers(offersRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAction = async (action, fn, ...args) => {
    setActionLoading(action);
    try {
      await fn(...args);
      Alert.alert('Success', `${action} successful`);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || `${action} failed`);
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: Colors.textSecondary }}>Booking not found</Text>
      </View>
    );
  }

  const conf = statusConfig[booking.status] || statusConfig.open;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 56 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Back Button & Title */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
          <Text style={styles.backText}>Booking Details</Text>
        </TouchableOpacity>

        {/* Status Card */}
        <View style={[styles.statusCard, { borderLeftColor: conf.color }]}>
          <View style={[styles.statusBadge, { backgroundColor: conf.bg }]}>
            <Ionicons name={conf.icon} size={16} color={conf.color} />
            <Text style={[styles.statusBadgeText, { color: conf.color }]}>{conf.label}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Description</Text>
          <Text style={styles.cardText}>{booking.description}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="folder-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{booking.category?.name || 'N/A'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{booking.address || 'N/A'}</Text>
          </View>
        </View>

        {/* Provider Info */}
        {booking.selectedProvider && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Assigned Provider</Text>
            <View style={styles.providerRow}>
              <View style={styles.providerAvatar}>
                <Ionicons name="person" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.providerName}>{booking.selectedProvider?.name || 'Provider'}</Text>
                <Text style={styles.providerDetail}>{booking.selectedProvider?.phone || ''}</Text>
              </View>
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => router.push(`/chat/${booking._id}`)}
              >
                <Ionicons name="chatbubble" size={16} color={Colors.primary} />
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Price Info */}
        {booking.finalPrice?.totalAmount > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Price Details</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.priceValue}>Rs. {booking.finalPrice.totalAmount.toLocaleString()}</Text>
            </View>
            {booking.finalPrice?.laborCost > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceSub}>Labor Cost</Text>
                <Text style={styles.priceSub}>Rs. {booking.finalPrice.laborCost.toLocaleString()}</Text>
              </View>
            )}
            {booking.finalPrice?.materialCost > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceSub}>Material Cost</Text>
                <Text style={styles.priceSub}>Rs. {booking.finalPrice.materialCost.toLocaleString()}</Text>
              </View>
            )}
          </View>
        )}

        {/* OTP */}
        {booking.otp && (booking.status === 'offer_accepted' || booking.status === 'inspection_scheduled') && (
          <View style={[styles.card, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <Text style={styles.cardTitle}>Start OTP</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#D97706', textAlign: 'center', marginTop: 8 }}>
              {booking.otp}
            </Text>
            <Text style={{ fontSize: 12, color: '#92400E', textAlign: 'center', marginTop: 4 }}>
              Share this with the provider when they arrive
            </Text>
          </View>
        )}

        {/* Offers (if open) */}
        {booking.status === 'open' && offers.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Offers ({offers.length})</Text>
            {offers.map((offer) => (
              <View key={offer._id} style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <View style={styles.providerAvatar}>
                    <Ionicons name="person" size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offerName}>{offer.provider?.name || 'Provider'}</Text>
                    <Text style={styles.offerEstimate}>
                      Est. Rs. {(offer.laborEstimate || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
                {offer.message && <Text style={styles.offerMessage}>{offer.message}</Text>}
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAction('Accept offer', acceptOffer, offer._id)}
                  disabled={actionLoading === 'Accept offer'}
                >
                  {actionLoading === 'Accept offer' ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                      <Text style={styles.acceptBtnText}>Accept</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          {booking.status === 'awaiting_price_approval' && (
            <>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleAction('Approve price', approveFinalPrice, id)}
                disabled={!!actionLoading}
              >
                <LinearGradient colors={[Colors.success, '#059669']} style={styles.actionGradient}>
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Approve Price</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleAction('Reject price', rejectFinalPrice, id, { reason: 'Too expensive' })}
                disabled={!!actionLoading}
              >
                <View style={[styles.actionGradient, { backgroundColor: Colors.dangerLight }]}>
                  <Ionicons name="close" size={18} color={Colors.danger} />
                  <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Reject</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {booking.status === 'price_approved' && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleAction('Confirm payment', confirmPayment, id, { method: 'cash' })}
              disabled={!!actionLoading}
            >
              <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.actionGradient}>
                <Ionicons name="wallet" size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Confirm Payment</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {booking.status === 'completed' && !booking.review && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push(`/(resident)/review/${id}`)}
            >
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionGradient}>
                <Ionicons name="star" size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Write Review</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {!['completed', 'cancelled'].includes(booking.status) && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                Alert.alert('Cancel Booking', 'Are you sure?', [
                  { text: 'No' },
                  { text: 'Yes', onPress: () => handleAction('Cancel', cancelBooking, id, { reason: 'Changed mind' }), style: 'destructive' },
                ]);
              }}
              disabled={!!actionLoading}
            >
              <View style={[styles.actionGradient, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="close-circle" size={18} color={Colors.danger} />
                <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Cancel Booking</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  backText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statusCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14,
    ...Shadows.small, borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.borderLight,
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusBadgeText: { fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14,
    ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  cardText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  providerAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  providerName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  providerDetail: { fontSize: 12, color: Colors.textSecondary },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  chatBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  priceValue: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  priceSub: { fontSize: 13, color: Colors.textSecondary },
  offerCard: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 14, marginBottom: 10 },
  offerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  offerName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  offerEstimate: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  offerMessage: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  acceptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.success, borderRadius: 10, paddingVertical: 10 },
  acceptBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  actionsCard: { gap: 10, marginTop: 4 },
  actionBtn: { borderRadius: 14, overflow: 'hidden' },
  actionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});
