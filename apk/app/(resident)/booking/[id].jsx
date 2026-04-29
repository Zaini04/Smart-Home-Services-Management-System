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
import { useSocket } from '../../../src/context/SocketContext';
import GlassContainer from '../../../src/components/GlassContainer';
import OTPInput from '../../../src/components/OTPInput';
import { FadeInView, SlideDownView } from '../../../src/theme/animations';

const statusConfig = {
  open: { color: '#3B82F6', bg: '#EFF6FF', label: 'Open', icon: 'time', step: 1 },
  posted: { color: '#3B82F6', bg: '#EFF6FF', label: 'Waiting for Offers', icon: 'time', step: 1 },
  offers_received: { color: '#8B5CF6', bg: '#F3E8FF', label: 'Offers Received', icon: 'list', step: 2 },
  offer_accepted: { color: '#8B5CF6', bg: '#F3E8FF', label: 'Offer Accepted', icon: 'checkmark-circle', step: 3 },
  provider_selected: { color: '#8B5CF6', bg: '#F3E8FF', label: 'Provider Selected', icon: 'person', step: 3 },
  inspection_requested: { color: '#F59E0B', bg: '#FEF3C7', label: 'Inspection Requested', icon: 'search', step: 3 },
  inspection_approved: { color: '#10B981', bg: '#D1FAE5', label: 'Inspection Approved', icon: 'checkmark-done', step: 3 },
  inspection_pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Inspection Pending', icon: 'time', step: 3 },
  inspection_scheduled: { color: '#F97316', bg: '#FFF7ED', label: 'Inspection Scheduled', icon: 'calendar', step: 3 },
  awaiting_price_approval: { color: '#D97706', bg: '#FFFBEB', label: 'Awaiting Price Approval', icon: 'time', step: 4 },
  price_approved: { color: '#14B8A6', bg: '#F0FDFA', label: 'Price Approved', icon: 'checkmark-circle', step: 5 },
  work_in_progress: { color: '#6366F1', bg: '#EEF2FF', label: 'Work in Progress', icon: 'construct', step: 6 },
  completed: { color: '#22C55E', bg: '#DCFCE7', label: 'Completed', icon: 'checkmark-done-circle', step: 7 },
  cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled', icon: 'close-circle', step: 0 },
};

const lifecycleSteps = [
  { step: 1, label: 'Posted' },
  { step: 2, label: 'Offers' },
  { step: 3, label: 'Inspection' },
  { step: 4, label: 'Pricing' },
  { step: 5, label: 'Approved' },
  { step: 6, label: 'Working' },
  { step: 7, label: 'Done' },
];

const ProgressBar = ({ currentStep, cancelled }) => {
  if (cancelled) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: '#FEF2F2', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FCA5A5' }}>
        <Ionicons name="close-circle" size={20} color="#EF4444" />
        <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 14 }}>Booking Cancelled</Text>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
        {lifecycleSteps.map((s, i) => {
          const done = currentStep > s.step;
          const active = currentStep === s.step;
          return (
            <View key={s.step} style={{ alignItems: 'center', width: 64, marginRight: i === lifecycleSteps.length - 1 ? 0 : 4 }}>
               <View style={[{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, backgroundColor: done ? '#3B82F6' : '#FFF', borderColor: done || active ? '#3B82F6' : '#D1D5DB' }, active && { shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 }]}>
                 {done ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#3B82F6' : '#9CA3AF' }}>{s.step}</Text>}
               </View>
               <Text style={{ fontSize: 10, marginTop: 4, fontWeight: '500', color: active ? '#2563EB' : done ? '#4B5563' : '#9CA3AF' }}>{s.label}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterFee, setCounterFee] = useState('');
  const [counterMsg, setCounterMsg] = useState('');
  
  const [completeOtp, setCompleteOtp] = useState('');

  const fetchData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [bookRes, offersRes] = await Promise.all([
        getBookingDetails(id),
        getBookingOffers(id).catch(() => ({ data: { data: [] } })),
      ]);
      const bookingPayload = bookRes.data.data.booking || bookRes.data.data;
      setBooking(bookingPayload);
      setOffers(offersRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const { socket } = useSocket();

  useEffect(() => { 
    fetchData(); 
  }, [id]);

  useEffect(() => {
    if (socket && booking?._id) {
      socket.emit('join_booking', booking._id);
      socket.on('data_updated', () => {
        fetchData(true);
      });

      return () => {
        socket.off('data_updated');
      };
    }
  }, [socket, booking?._id]);

  const handleAction = async (action, fn, ...args) => {
    setActionLoading(action);
    try {
      // Let React paint loading state on the pressed button before network call starts.
      await new Promise((resolve) => setTimeout(resolve, 40));
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
  const getId = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return value._id || value.id || value.userId || null;
  };
  const selectedProvider = booking.selectedProvider || {};
  const selectedProviderUser =
    selectedProvider?.userId && typeof selectedProvider.userId === 'object'
      ? selectedProvider.userId
      : selectedProvider?.user && typeof selectedProvider.user === 'object'
        ? selectedProvider.user
        : null;
  const selectedProviderId = getId(selectedProvider) || getId(selectedProvider?.userId);
  const acceptedOffer = offers.find((offer) => {
    const offerProviderId = getId(offer?.provider) || getId(offer?.provider?.userId);
    return selectedProviderId && offerProviderId && String(offerProviderId) === String(selectedProviderId);
  });
  const providerName =
    selectedProvider?.name ||
    selectedProvider?.full_name ||
    selectedProvider?.providerName ||
    selectedProviderUser?.name ||
    selectedProviderUser?.full_name ||
    selectedProviderUser?.first_name ||
    booking?.selectedOffer?.provider?.name ||
    booking?.selectedOffer?.provider?.full_name ||
    booking?.selectedOffer?.provider?.userId?.name ||
    booking?.selectedOffer?.provider?.userId?.full_name ||
    acceptedOffer?.provider?.name ||
    acceptedOffer?.provider?.full_name ||
    acceptedOffer?.provider?.userId?.name ||
    acceptedOffer?.provider?.userId?.full_name ||
    'Provider';
  const providerPhone =
    selectedProvider?.phone ||
    selectedProviderUser?.phone ||
    acceptedOffer?.provider?.phone ||
    acceptedOffer?.provider?.userId?.phone ||
    '';
  const isActionBusy = (key) => actionLoading === key;
  const renderActionContent = ({ action, icon, label, iconColor = '#FFF', textStyle, spinnerColor = '#FFF' }) => {
    if (isActionBusy(action)) return <ActivityIndicator color={spinnerColor} size="small" />;
    return (
      <>
        {icon ? <Ionicons name={icon} size={18} color={iconColor} /> : null}
        <Text style={[styles.actionBtnText, textStyle]}>{label}</Text>
      </>
    );
  };

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

        {/* Progress Bar */}
        <ProgressBar 
          currentStep={conf.step || 1} 
          cancelled={booking.status === 'cancelled'} 
        />

        {/* Description */}
        <FadeInView delay={200}>
          <GlassContainer style={[styles.card, styles.descriptionCard]}>
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
          </GlassContainer>
        </FadeInView>

        {/* Provider Info */}
        {booking.selectedProvider && (
          <FadeInView delay={300}>
            <GlassContainer style={styles.card}>
              <Text style={styles.cardTitle}>Assigned Provider</Text>
              <View style={styles.providerRow}>
                <View style={styles.providerAvatar}>
                  <Ionicons name="person" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.providerName}>
                    {providerName}
                  </Text>
                  <Text style={styles.providerDetail}>
                    {providerPhone}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={() => router.push(`/chat/${booking._id}`)}
                >
                  <Ionicons name="chatbubble" size={16} color={Colors.primary} />
                  <Text style={styles.chatBtnText}>Chat</Text>
                </TouchableOpacity>
              </View>
            </GlassContainer>
          </FadeInView>
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
        {booking.otp?.start?.code && !booking.otp?.start?.verified && ['offer_accepted', 'inspection_scheduled', 'inspection_approved', 'awaiting_price_approval', 'price_approved'].includes(booking.status) && (
          <GlassContainer style={[styles.card, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <Text style={styles.cardTitle}>Start OTP</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#D97706', textAlign: 'center', marginTop: 8 }}>
              {booking.otp.start.code}
            </Text>
            <Text style={{ fontSize: 12, color: '#92400E', textAlign: 'center', marginTop: 4 }}>
              Share this with the provider when they arrive to start the work.
            </Text>
          </GlassContainer>
        )}

        {/* Offers */}
        {['open', 'posted', 'offers_received'].includes(booking.status) && offers.length > 0 && (
          <GlassContainer style={styles.card}>
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
          </GlassContainer>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsCard}>

          {/* INSPECTION REQUESTED */}
          {booking.status === 'inspection_requested' && (
            <GlassContainer style={[styles.card, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              {booking.inspection?.status === 'counter_offered' ? (
                <>
                  <Text style={styles.cardTitle}>Counter Offer Sent</Text>
                  <Text style={{ fontSize: 13, color: '#92400E', marginBottom: 4 }}>
                    Waiting for provider to respond to your counter fee of Rs. {(booking.inspection?.counterFee || 0).toLocaleString()}.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.cardTitle}>Inspection Requested</Text>
                  <Text style={{ fontSize: 13, color: '#92400E', marginBottom: 4 }}>
                    Fee: Rs. {(booking.inspection?.fee || 0).toLocaleString()}
                  </Text>
                  {booking.inspection?.scheduledDate && (
                    <Text style={{ fontSize: 13, color: '#92400E', marginBottom: 4 }}>
                      Date: {new Date(booking.inspection.scheduledDate).toLocaleDateString()} {booking.inspection.scheduledTime && `at ${booking.inspection.scheduledTime}`}
                    </Text>
                  )}
                  {booking.inspection?.message && (
                    <Text style={{ fontSize: 13, color: '#92400E', marginBottom: 12 }}>{booking.inspection.message}</Text>
                  )}

                  {!showCounterModal ? (
                    <View style={{ gap: 8, marginTop: 8 }}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleAction('Approve inspection', respondToInspection, id, { action: 'approve' })}
                        disabled={!!actionLoading}
                      >
                        <LinearGradient colors={[Colors.success, '#059669']} style={styles.actionGradient}>
                          {renderActionContent({ action: 'Approve inspection', label: 'Approve Inspection', icon: 'checkmark' })}
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => setShowCounterModal(true)}
                        disabled={!!actionLoading}
                      >
                        <View style={[styles.actionGradient, { backgroundColor: '#FDE68A' }]}>
                          <Ionicons name="git-compare" size={18} color="#92400E" />
                          <Text style={[styles.actionBtnText, { color: '#92400E' }]}>Counter Fee</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleAction('Reject inspection', respondToInspection, id, { action: 'reject' })}
                        disabled={!!actionLoading}
                      >
                        <View style={[styles.actionGradient, { backgroundColor: Colors.dangerLight }]}>
                          {renderActionContent({ action: 'Reject inspection', label: 'Reject', icon: 'close', iconColor: Colors.danger, textStyle: { color: Colors.danger }, spinnerColor: Colors.danger })}
                        </View>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ marginTop: 12 }}>
                      <TextInput
                        style={[styles.input, { backgroundColor: '#FFF' }]}
                        placeholder="Your Counter Fee (Rs.)"
                        value={counterFee}
                        onChangeText={setCounterFee}
                        keyboardType="numeric"
                      />
                      <TextInput
                        style={[styles.input, { backgroundColor: '#FFF', height: 80, textAlignVertical: 'top', marginTop: 8 }]}
                        placeholder="Message (Optional)"
                        value={counterMsg}
                        onChangeText={setCounterMsg}
                        multiline
                      />
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                        <TouchableOpacity
                          style={[styles.actionBtn, { flex: 1, backgroundColor: Colors.textSecondary, paddingVertical: 12 }]}
                          onPress={() => setShowCounterModal(false)}
                        >
                          <Text style={[styles.actionBtnText, { textAlign: 'center' }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, { flex: 1, backgroundColor: Colors.primary, paddingVertical: 12 }]}
                          onPress={() => handleAction('Send Counter', respondToInspection, id, { action: 'counter', counterFee, counterMessage: counterMsg })}
                          disabled={!counterFee || !!actionLoading}
                        >
                          {isActionBusy('Send Counter') ? (
                            <ActivityIndicator color="#FFF" size="small" />
                          ) : (
                            <Text style={[styles.actionBtnText, { textAlign: 'center' }]}>Send</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
            </GlassContainer>
          )}

          {/* INSPECTION APPROVED */}
          {booking.status === 'inspection_approved' && (
            <GlassContainer style={[styles.card, { backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' }]}>
              <Text style={styles.cardTitle}>Inspection Approved</Text>
              <Text style={{ fontSize: 13, color: '#065F46', marginBottom: 4 }}>
                Agreed Fee: Rs. {(booking.inspection?.agreedFee || 0).toLocaleString()}
              </Text>
              {booking.inspection?.scheduledDate && (
                <Text style={{ fontSize: 13, color: '#065F46' }}>
                  Worker will visit on: {new Date(booking.inspection.scheduledDate).toLocaleDateString()} {booking.inspection.scheduledTime && `at ${booking.inspection.scheduledTime}`}
                </Text>
              )}
            </GlassContainer>
          )}

          {/* SCHEDULE UPDATE pending */}
          {booking.status === 'work_in_progress' && booking.schedule?.approvedByResident === false && (
            <GlassContainer style={[styles.card, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Text style={styles.cardTitle}>Schedule Update Requested</Text>
              <Text style={{ fontSize: 13, color: '#1D4ED8', marginBottom: 6 }}>
                The provider requested a schedule extension:
              </Text>
              {booking.schedule?.scheduledStartDate && (
                <Text style={{ fontSize: 13, color: '#1D4ED8', fontWeight: '600', marginBottom: 2 }}>
                  New Start: {new Date(booking.schedule.scheduledStartDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </Text>
              )}
              {booking.schedule?.estimatedDuration?.value && (
                <Text style={{ fontSize: 13, color: '#1D4ED8', fontWeight: '600', marginBottom: 12 }}>
                  New Duration: {booking.schedule.estimatedDuration.value} {booking.schedule.estimatedDuration.unit}
                </Text>
              )}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleAction('Approve schedule', approveScheduleUpdate, id)}
                disabled={!!actionLoading}
              >
                <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.actionGradient}>
                  {renderActionContent({ action: 'Approve schedule', label: 'Approve Schedule', icon: 'calendar' })}
                </LinearGradient>
              </TouchableOpacity>
            </GlassContainer>
          )}

          {/* AWAITING PRICE APPROVAL */}
          {booking.status === 'awaiting_price_approval' && (
            <GlassContainer style={[styles.card, { backgroundColor: '#EEF2FF', borderColor: '#C3DAFE' }]}>
              <Text style={styles.cardTitle}>Final Price & Schedule Proposed</Text>
              <Text style={{ fontSize: 14, color: '#1E40AF', marginBottom: 6, fontWeight: '600' }}>
                Labor Cost: Rs. {(booking.finalPrice?.laborCost || 0).toLocaleString()}
              </Text>
              {booking.schedule?.scheduledStartDate && (
                <Text style={{ fontSize: 13, color: '#1E40AF', marginBottom: 4 }}>
                  Start: {new Date(booking.schedule.scheduledStartDate).toLocaleDateString()}
                </Text>
              )}
              {booking.schedule?.estimatedDuration?.value && (
                <Text style={{ fontSize: 13, color: '#1E40AF', marginBottom: 12 }}>
                  Est. Duration: {booking.schedule.estimatedDuration.value} {booking.schedule.estimatedDuration.unit}
                </Text>
              )}
              <View style={{ gap: 8 }}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleAction('Approve price', approveFinalPrice, id)}
                  disabled={!!actionLoading}
                >
                  <LinearGradient colors={[Colors.success, '#059669']} style={styles.actionGradient}>
                    {renderActionContent({ action: 'Approve price', label: 'Approve Proposal', icon: 'checkmark' })}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleAction('Reject price', rejectFinalPrice, id, { reason: 'Too expensive' })}
                  disabled={!!actionLoading}
                >
                  <View style={[styles.actionGradient, { backgroundColor: Colors.dangerLight }]}>
                    {renderActionContent({ action: 'Reject price', label: 'Reject & Cancel', icon: 'close', iconColor: Colors.danger, textStyle: { color: Colors.danger }, spinnerColor: Colors.danger })}
                  </View>
                </TouchableOpacity>
              </View>
            </GlassContainer>
          )}

          {/* EVENT: PENDING PRICE REVISION DURING WORK */}
          {booking.status === 'work_in_progress' && booking.priceRevisions?.length > 0 && booking.priceRevisions[booking.priceRevisions.length - 1].status === 'pending' && (
            <GlassContainer style={[styles.card, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
              <Text style={styles.cardTitle}>Price Revision Requested</Text>
              <Text style={{ fontSize: 14, color: '#991B1B', fontWeight: '600', marginBottom: 4 }}>
                New Labor Cost: Rs. {booking.priceRevisions[booking.priceRevisions.length - 1].laborCost.toLocaleString()}
              </Text>
              {booking.priceRevisions[booking.priceRevisions.length - 1].reason && (
                <Text style={{ fontSize: 13, color: '#991B1B', marginBottom: 12 }}>
                  Reason: {booking.priceRevisions[booking.priceRevisions.length - 1].reason}
                </Text>
              )}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.actionBtn, { flex: 1, backgroundColor: Colors.success, paddingVertical: 12 }]}
                  onPress={() => handleAction('Approve revision', approvePriceRevision, id, booking.priceRevisions[booking.priceRevisions.length - 1]._id, { approve: true })}
                  disabled={!!actionLoading}
                >
                  {isActionBusy('Approve revision') ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={[styles.actionBtnText, { textAlign: 'center' }]}>Approve</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { flex: 1, backgroundColor: Colors.danger, paddingVertical: 12 }]}
                  onPress={() => handleAction('Reject revision', approvePriceRevision, id, booking.priceRevisions[booking.priceRevisions.length - 1]._id, { approve: false })}
                  disabled={!!actionLoading}
                >
                  {isActionBusy('Reject revision') ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={[styles.actionBtnText, { textAlign: 'center' }]}>Reject</Text>
                  )}
                </TouchableOpacity>
              </View>
            </GlassContainer>
          )}

          {/* WORK IN PROGRESS: Confirm Payment & Enter OTP */}
          {booking.status === 'work_in_progress' && (
            <GlassContainer style={[styles.card, { backgroundColor: '#EEF2FF', borderColor: '#C3DAFE' }]}>
              <Text style={styles.cardTitle}>Complete Job & Confirm Payment</Text>
              <Text style={{ fontSize: 13, color: '#1E40AF', marginBottom: 16 }}>
                Work is done? Enter the 4-digit Complete OTP from the worker to confirm and pay Rs. {(booking.finalPrice?.totalAmount || 0).toLocaleString()}.
              </Text>
              
              <Text style={styles.inputLabel}>Complete OTP</Text>
              <OTPInput 
                value={completeOtp} 
                onChangeText={setCompleteOtp} 
                length={4} 
              />
              
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  if (completeOtp.length !== 4) return Alert.alert('Validation Error', 'Enter 4-digit Complete OTP');
                  handleAction('Confirm payment', confirmPayment, id, { otp: completeOtp, paymentMethod: 'cash' });
                }}
                disabled={!!actionLoading}
              >
                <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.actionGradient}>
                  {renderActionContent({ action: 'Confirm payment', label: 'Confirm Payment', icon: 'wallet' })}
                </LinearGradient>
              </TouchableOpacity>
            </GlassContainer>
          )}

          {/* COMPLETED */}
          {booking.status === 'completed' && (
            <GlassContainer style={[styles.card, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Ionicons name="checkmark-circle" size={28} color="#16A34A" />
                <Text style={[styles.cardTitle, { color: '#166534', marginBottom: 0 }]}>Job Completed!</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#15803D', marginBottom: 16 }}>
                This job has been successfully completed and paid (Rs. {(booking.finalPrice?.totalAmount || 0).toLocaleString()}).
              </Text>
              {!booking.review && (
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
            </GlassContainer>
          )}

          {/* CANCEL BOOKING */}
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
                {renderActionContent({ action: 'Cancel', label: 'Cancel Booking', icon: 'close-circle', iconColor: Colors.danger, textStyle: { color: Colors.danger }, spinnerColor: Colors.danger })}
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
  card: { padding: 18, marginBottom: 14, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  descriptionCard: { backgroundColor: '#EAF3FF', borderColor: '#93C5FD' },
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
  inputLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: '#F0F7FF',
  },
});
