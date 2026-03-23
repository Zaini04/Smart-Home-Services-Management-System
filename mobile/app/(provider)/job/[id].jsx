import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getJobDetails, submitOffer, requestInspection, sendFinalPrice,
  verifyOtp, startWork, completeWork, updatePrice, updateSchedule,
  cancelJob
} from '../../../src/api/serviceProviderEndPoints';
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

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [offerLabor, setOfferLabor] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [otp, setOtp] = useState('');
  const [finalLabor, setFinalLabor] = useState('');
  const [finalMaterial, setFinalMaterial] = useState('');

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await getJobDetails(id);
      setJob(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchJob(); }, [id]);

  const handleAction = async (action, fn, ...args) => {
    setActionLoading(action);
    try {
      await fn(...args);
      Alert.alert('Success', `${action} successful`);
      fetchJob();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || `${action} failed`);
    } finally {
      setActionLoading('');
    }
  };

  const onSendOffer = () => {
    if (!offerLabor) return Alert.alert('Validation Error', 'Enter labor estimate');
    handleAction('Send Offer', submitOffer, id, {
      laborEstimate: Number(offerLabor),
      message: offerMsg
    });
  };

  const onSendPrice = () => {
    if (!finalLabor) return Alert.alert('Validation Error', 'Enter final labor cost');
    handleAction('Send Final Price', sendFinalPrice, id, {
      laborCost: Number(finalLabor),
      materialCost: Number(finalMaterial) || 0,
      totalAmount: Number(finalLabor) + (Number(finalMaterial) || 0)
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: Colors.textSecondary }}>Job not found</Text>
      </View>
    );
  }

  const conf = statusConfig[job.status] || statusConfig.open;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 56 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJob(); }} />}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
          <Text style={styles.backText}>Job Details</Text>
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
          <Text style={styles.cardText}>{job.description}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="folder-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{job.category?.name || 'N/A'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{job.address || 'N/A'}</Text>
          </View>
        </View>

        {/* Customer Info */}
        {job.status !== 'open' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer Details</Text>
            <View style={styles.providerRow}>
              <View style={styles.providerAvatar}>
                <Ionicons name="person" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.providerName}>{job.resident?.name || 'Customer'}</Text>
                <Text style={styles.providerDetail}>{job.resident?.phone || ''}</Text>
              </View>
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => router.push(`/chat/${job._id}`)}
              >
                <Ionicons name="chatbubble" size={16} color={Colors.primary} />
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Price Info */}
        {job.finalPrice?.totalAmount > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Price Details</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.priceValue}>Rs. {job.finalPrice.totalAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceSub}>Labor Cost</Text>
              <Text style={styles.priceSub}>Rs. {job.finalPrice.laborCost.toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceSub}>Material Cost</Text>
              <Text style={styles.priceSub}>Rs. {job.finalPrice.materialCost.toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Actions based on Status */}
        <View style={styles.actionsCard}>
          
          {/* OPEN: Send Offer */}
          {job.status === 'open' && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Submit Offer</Text>
              <Text style={styles.inputLabel}>Labor Estimate (Rs.)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={offerLabor} onChangeText={setOfferLabor} placeholder="e.g. 1500" />
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput style={[styles.input, { height: 80 }]} multiline textAlignVertical="top" value={offerMsg} onChangeText={setOfferMsg} placeholder="Optional message..." />
              
              <TouchableOpacity style={styles.actionBtn} onPress={onSendOffer} disabled={!!actionLoading}>
                <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.actionGradient}>
                  <Ionicons name="paper-plane" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Send Offer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* OTP Verification */}
          {(job.status === 'offer_accepted' || job.status === 'inspection_scheduled') && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Verify Start OTP</Text>
              <Text style={styles.inputLabel}>Enter OTP from customer</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={otp} onChangeText={setOtp} placeholder="e.g. 123456" />
              
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Verify OTP', verifyOtp, id, otp)} disabled={!!actionLoading}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionGradient}>
                  <Ionicons name="key" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Verify OTP & Start</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* AWAITING PRICE */}
          {(job.status === 'inspection_pending' || (!job.finalPrice?.totalAmount && ['offer_accepted', 'inspection_scheduled'].includes(job.status))) && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Send Final Price</Text>
              <Text style={styles.inputLabel}>Final Labor Cost (Rs.)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={finalLabor} onChangeText={setFinalLabor} placeholder="e.g. 1500" />
              <Text style={styles.inputLabel}>Material Cost (Rs. - Optional)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={finalMaterial} onChangeText={setFinalMaterial} placeholder="e.g. 500" />
              
              <TouchableOpacity style={styles.actionBtn} onPress={onSendPrice} disabled={!!actionLoading}>
                <LinearGradient colors={[Colors.success, '#059669']} style={styles.actionGradient}>
                  <Ionicons name="cash" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Send Price to Customer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* START WORK */}
          {job.status === 'price_approved' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Start Work', startWork, id)} disabled={!!actionLoading}>
              <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.actionGradient}>
                <Ionicons name="play" size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Start Work Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* COMPLETE WORK */}
          {job.status === 'work_in_progress' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Complete Work', completeWork, id)} disabled={!!actionLoading}>
              <LinearGradient colors={[Colors.success, '#059669']} style={styles.actionGradient}>
                <Ionicons name="checkmark-done" size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Mark Job Completed</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  backText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statusCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, ...Shadows.small, borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.borderLight },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusBadgeText: { fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight },
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
  actionsCard: { gap: 10, marginTop: 4 },
  formCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 14, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight },
  formTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  inputLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 16, backgroundColor: '#F9FAFB' },
  actionBtn: { borderRadius: 14, overflow: 'hidden' },
  actionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});
