import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, RefreshControl, Linking, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getJobDetails, sendOrUpdateOffer, requestInspection, completeInspection,
  sendFinalPrice, verifyStartOTP, startWork, completeWork,
  updatePriceDuringWork, updateSchedule, providerCancelJob,
  respondToCounterFee,
} from '../../../src/api/serviceProviderEndPoints';
import { Colors, Shadows } from '../../../src/theme/colors';
import { useSocket } from '../../../src/context/SocketContext';
import GlassContainer from '../../../src/components/GlassContainer';
import OTPInput from '../../../src/components/OTPInput';
import { FadeInView } from '../../../src/theme/animations';
import { calculateCommission } from '../../../src/utils/commissionCalc';

const statusConfig = {
  open: { color: '#3B82F6', bg: '#EFF6FF', label: 'Open', icon: 'time', step: 1 },
  provider_selected: { color: '#059669', bg: '#D1FAE5', label: 'Assigned', icon: 'star', step: 3 },
  inspection_requested: { color: '#D97706', bg: '#FEF3C7', label: 'Inspection Requested', icon: 'time', step: 3 },
  inspection_approved: { color: '#EA580C', bg: '#FFEDD5', label: 'Inspection Approved', icon: 'checkmark-circle', step: 3 },
  offer_accepted: { color: '#8B5CF6', bg: '#F3E8FF', label: 'Offer Accepted', icon: 'checkmark-circle', step: 3 },
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

const CommissionPreview = ({ laborCost, completedJobs = 0 }) => {
  const labor = Number(laborCost) || 0;
  if (labor <= 0) return null;
  const comm = calculateCommission(labor, completedJobs);
  const earning = labor - comm.finalCommission;

  return (
    <View style={{ backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Labor</Text>
        <Text style={{ fontSize: 13, color: Colors.text }}>Rs. {labor.toLocaleString()}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
          Commission ({comm.ratePercent})
          {comm.isNewProvider && <Text style={{ color: Colors.success }}> 50% off!</Text>}
        </Text>
        <Text style={{ fontSize: 13, color: Colors.danger }}>- Rs. {comm.finalCommission.toLocaleString()}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#BBF7D0' }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#166534' }}>Your Earning</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#166534' }}>Rs. {earning.toLocaleString()}</Text>
      </View>
    </View>
  );
};

const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatLocalTime24 = (date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const formatLocalTime12 = (date) => {
  const rawHour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, '0');
  const period = rawHour >= 12 ? 'PM' : 'AM';
  const hour12 = rawHour % 12 === 0 ? 12 : rawHour % 12;
  return `${String(hour12).padStart(2, '0')}:${minute} ${period}`;
};


const parseLocalDateString = (value) => {
  if (!value) return null;
  const parts = String(value).split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const parseDisplayTimeIntoDate = (timeValue, baseDate = new Date()) => {
  if (!timeValue) return null;
  const match = String(timeValue).match(/\d+/g);
  if (!match || match.length < 2) return null;
  let h = parseInt(match[0], 10);
  const m = parseInt(match[1], 10);
  const text = String(timeValue).toLowerCase();
  const isPM = text.includes('pm');
  const isAM = text.includes('am');
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  const d = new Date(baseDate);
  d.setHours(h, Number.isNaN(m) ? 0 : m, 0, 0);
  return d;
};

const normalizeTimeTo24 = (timeValue) => {
  if (/^\d{2}:\d{2}$/.test(String(timeValue || '').trim())) return String(timeValue).trim();
  const parsed = parseDisplayTimeIntoDate(timeValue);
  if (!parsed) return null;
  return formatLocalTime24(parsed);
};

const combineLocalDateAndTimeToISO = (dateValue, timeValue) => {
  const datePart = parseLocalDateString(dateValue);
  if (!datePart) return null;
  const timePart = parseDisplayTimeIntoDate(timeValue, datePart);
  if (!timePart) return null;
  return timePart.toISOString();
};

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const pickerVisibleRef = useRef(false);
  const schedulingDraftRef = useRef(false);

  // Form states
  const [offerLabor, setOfferLabor] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [otp, setOtp] = useState('');
  const [finalLabor, setFinalLabor] = useState('');

  const fetchJob = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await getJobDetails(id);
      setJob(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const { socket } = useSocket();

  useEffect(() => { 
    fetchJob(); 
  }, [id]);

  useEffect(() => {
    if (socket && job?._id) {
      socket.emit('join_booking', job._id);
      const onDataUpdated = () => {
        if (pickerVisibleRef.current || schedulingDraftRef.current || actionLoading) return;
        fetchJob(true);
      };
      socket.on('data_updated', onDataUpdated);

      return () => {
        socket.off('data_updated', onDataUpdated);
      };
    }
  }, [socket, job?._id, actionLoading]);

  const handleAction = async (action, fn, ...args) => {
    setActionLoading(action);
    try {
      // Ensure pressed button visibly switches to loading before API execution.
      await new Promise((resolve) => setTimeout(resolve, 40));
      await fn(...args);
      Alert.alert('Success', `${action} successful`);
      fetchJob();
    } catch (err) {
      const apiError = err.response?.data;
      const conflict = apiError?.extra?.conflict || apiError?.conflict;
      if (conflict) {
        Alert.alert(
          'Schedule Conflict',
          apiError.message || 'You have another booking at this time.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'View Conflict', 
              onPress: () => router.push(`/(provider)/job/${conflict.bookingId || conflict._id}`) 
            }
          ]
        );
      } else {
        Alert.alert('Error', apiError?.message || `${action} failed`);
      }
    } finally {
      setActionLoading('');
    }
  };
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

  // Inspection form states
  const [inspFee, setInspFee] = useState('');
  const [inspMsg, setInspMsg] = useState('');
  const [inspDate, setInspDate] = useState('');
  const [inspTime, setInspTime] = useState('');

  const [updatePriceLabor, setUpdatePriceLabor] = useState('');
  const [updatePriceMaterial, setUpdatePriceMaterial] = useState('');
  const [updatePriceMsg, setUpdatePriceMsg] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDuration, setScheduleDuration] = useState('2');
  const [scheduleUnit, setScheduleUnit] = useState('hours');

  const [updateScheduleDate, setUpdateScheduleDate] = useState('');
  const [updateScheduleTime, setUpdateScheduleTime] = useState('');
  const [updateScheduleDuration, setUpdateScheduleDuration] = useState('');
  const [updateScheduleUnit, setUpdateScheduleUnit] = useState('hours');

  const [cancelReason, setCancelReason] = useState('');
  const [counterReFee, setCounterReFee] = useState('');

  // Native Picker config
  const [pickerConfig, setPickerConfig] = useState({ visible: false, mode: 'date', field: '' });
  const [tempDate, setTempDate] = useState(new Date());
  const [pickerNonce, setPickerNonce] = useState(0);

  useEffect(() => {
    pickerVisibleRef.current = pickerConfig.visible;
  }, [pickerConfig.visible]);

  useEffect(() => {
    schedulingDraftRef.current = Boolean(
      inspDate || inspTime ||
      scheduleDate || scheduleTime ||
      updateScheduleDate || updateScheduleTime
    );
  }, [inspDate, inspTime, scheduleDate, scheduleTime, updateScheduleDate, updateScheduleTime]);

  const getPickerFieldValues = (field) => {
    if (field === 'inspDate' || field === 'inspTime') return { dateValue: inspDate, timeValue: inspTime };
    if (field === 'scheduleDate' || field === 'scheduleTime') return { dateValue: scheduleDate, timeValue: scheduleTime };
    if (field === 'updateScheduleDate' || field === 'updateScheduleTime') return { dateValue: updateScheduleDate, timeValue: updateScheduleTime };
    return { dateValue: '', timeValue: '' };
  };

  const openPicker = (field, mode) => {
    const { dateValue, timeValue } = getPickerFieldValues(field);
    let nextDate = new Date();

    const parsedDate = parseLocalDateString(dateValue);
    if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
      nextDate = parsedDate;
    }

    // Preserve already-selected time when opening date picker and preserve selected date when opening time picker.
    const parsedTime = parseDisplayTimeIntoDate(timeValue, nextDate);
    if (parsedTime && !Number.isNaN(parsedTime.getTime())) {
      nextDate = parsedTime;
    }

    if (mode === 'date' && parsedDate && !Number.isNaN(parsedDate.getTime())) {
      nextDate = parsedDate;
      const withTime = parseDisplayTimeIntoDate(timeValue, nextDate);
      if (withTime && !Number.isNaN(withTime.getTime())) nextDate = withTime;
    }

    if (mode === 'time') {
      const baseDate = (parsedDate && !Number.isNaN(parsedDate.getTime())) ? parsedDate : new Date();
      const withSelectedTime = parseDisplayTimeIntoDate(timeValue, baseDate);
      nextDate = withSelectedTime && !Number.isNaN(withSelectedTime.getTime()) ? withSelectedTime : baseDate;
    }

    setTempDate(nextDate);
    setPickerNonce((prev) => prev + 1);
    setPickerConfig({ visible: true, mode, field });
  };

  const onPickerChange = (event, selectedDate, field, mode) => {
    if (Platform.OS === 'android') {
      if (event?.type === 'dismissed') {
        setPickerConfig((prev) => ({ ...prev, visible: false }));
        return;
      }
      if (event?.type !== 'set' || !selectedDate) return;
    }
    if (!selectedDate) return;

    setTempDate(selectedDate);
    if (mode === 'date') {
      const dateStr = formatLocalDate(selectedDate);
      if (field === 'inspDate') setInspDate(dateStr);
      if (field === 'scheduleDate') setScheduleDate(dateStr);
      if (field === 'updateScheduleDate') setUpdateScheduleDate(dateStr);
    } else {
      const timeStr = formatLocalTime12(selectedDate);
      if (field === 'inspTime') setInspTime(timeStr);
      if (field === 'scheduleTime') setScheduleTime(timeStr);
      if (field === 'updateScheduleTime') setUpdateScheduleTime(timeStr);
    }

    if (Platform.OS === 'android') {
      setPickerConfig((prev) => ({ ...prev, visible: false }));
    }
  };

  const onSendOffer = () => {
    if (!offerLabor) return Alert.alert('Validation Error', 'Enter labor estimate');
    handleAction('Send Offer', sendOrUpdateOffer, id, {
      laborEstimate: Number(offerLabor),
      message: offerMsg,
    });
  };

  const onVerifyOTP = () => {
    if (!otp) return Alert.alert('Validation Error', 'Enter OTP');
    handleAction('Verify OTP', verifyStartOTP, id, { otp });
  };

  const onRequestInspection = () => {
    if (!inspFee) return Alert.alert('Validation Error', 'Enter inspection fee');
    if (!inspDate || !inspTime) return Alert.alert('Validation Error', 'Enter inspection expected date and time');
    
    const formattedTime = normalizeTimeTo24(inspTime);
    if (!parseLocalDateString(inspDate) || !formattedTime) {
      return Alert.alert('Validation Error', 'Please select inspection date and time from picker.');
    }

    handleAction('Request Inspection', requestInspection, id, {
      fee: Number(inspFee),
      message: inspMsg,
      scheduledDate: inspDate,
      scheduledTime: formattedTime,
    });
  };

  const onSendPrice = () => {
    if (!finalLabor) return Alert.alert('Validation Error', 'Enter final labor cost');
    if (!scheduleDate || !scheduleTime || !scheduleDuration) return Alert.alert('Validation Error', 'Enter schedule start date, time and duration');
    const isoStart = combineLocalDateAndTimeToISO(scheduleDate, scheduleTime);
    if (!isoStart) {
      return Alert.alert('Validation Error', 'Please select schedule date and time from picker.');
    }

    const data = {
      laborCost: Number(finalLabor),
      totalAmount: Number(finalLabor),
      scheduledStartDate: isoStart,
      estimatedDurationValue: Number(scheduleDuration) || 2,
      estimatedDurationUnit: scheduleUnit || 'hours',
    };
    handleAction('Send Final Price', sendFinalPrice, id, data);
  };

  const onCompleteInspectionPrice = () => {
    if (!finalLabor) return Alert.alert('Validation Error', 'Enter final labor cost');
    if (!scheduleDate || !scheduleTime || !scheduleDuration) return Alert.alert('Validation Error', 'Enter schedule start date, time and duration');
    const isoStart = combineLocalDateAndTimeToISO(scheduleDate, scheduleTime);
    if (!isoStart) {
      return Alert.alert('Validation Error', 'Please select schedule date and time from picker.');
    }

    const data = {
      laborCost: Number(finalLabor),
      totalAmount: Number(finalLabor),
      scheduledStartDate: isoStart,
      estimatedDurationValue: Number(scheduleDuration) || 2,
      estimatedDurationUnit: scheduleUnit || 'hours',
    };
    handleAction('Complete Inspection', completeInspection, id, data);
  };

  const onUpdatePrice = () => {
    if (!updatePriceLabor) return Alert.alert('Validation Error', 'Enter updated labor cost');
    handleAction('Update Price', updatePriceDuringWork, id, {
      laborCost: Number(updatePriceLabor),
      reason: updatePriceMsg,
    });
  };

  const onUpdateSchedule = () => {
    if (!updateScheduleDate || !updateScheduleTime) {
      return Alert.alert('Validation Error', 'Select new start date and time');
    }
    
    const isoStart = combineLocalDateAndTimeToISO(updateScheduleDate, updateScheduleTime);
    if (!isoStart) return Alert.alert('Validation Error', 'Please select updated date and time from picker.');
    const resolvedDuration =
      Number(updateScheduleDuration) ||
      Number(job?.schedule?.estimatedDuration?.value) ||
      Number(scheduleDuration) ||
      2;

    handleAction('Update Schedule', updateSchedule, id, { 
      scheduledStartDate: isoStart,
      estimatedDurationValue: resolvedDuration,
      estimatedDurationUnit: updateScheduleUnit || 'hours',
    });
  };

  const onCancelJob = () => {
    Alert.alert('Cancel Job', 'Are you sure?', [
      { text: 'No' },
      {
        text: 'Yes', style: 'destructive',
        onPress: () => handleAction('Cancel Job', providerCancelJob, id, { reason: cancelReason || 'Provider cancelled' }),
      },
    ]);
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

        {/* Progress Bar */}
        <ProgressBar 
          currentStep={conf.step || 1} 
          cancelled={job.status === 'cancelled'} 
        />

        {/* Description + Location */}
        <FadeInView delay={200}>
          <GlassContainer style={[styles.card, styles.descriptionCard]}>
            <Text style={styles.cardTitle}>Job Description</Text>
            <Text style={styles.cardText}>{job.description}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="folder-outline" size={14} color={Colors.textLight} />
              <Text style={styles.metaText}>{job.category?.name || 'N/A'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textLight} />
              <Text style={[styles.metaText, { flex: 1 }]}>{job.address || 'N/A'}</Text>
            </View>
            {/* Get Directions Button */}
            <TouchableOpacity
              style={styles.directionsBtn}
              onPress={() => {
                const addr = encodeURIComponent(job.address || '');
                const lat = job.lat;
                const lng = job.lng;
                let url;
                if (lat && lng) {
                  url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                } else {
                  url = `https://www.google.com/maps/search/?api=1&query=${addr}`;
                }
                Linking.openURL(url).catch(() =>
                  Alert.alert('Error', 'Could not open Google Maps')
                );
              }}
            >
              <Ionicons name="navigate" size={16} color="#FFF" />
              <Text style={styles.directionsBtnText}>Get Directions</Text>
            </TouchableOpacity>
          </GlassContainer>
        </FadeInView>

        {/* Customer Info */}
        {job.status !== 'open' && (
          <FadeInView delay={300}>
            <GlassContainer style={styles.card}>
              <Text style={styles.cardTitle}>Customer Details</Text>
              <View style={styles.providerRow}>
                <View style={styles.providerAvatar}>
                  <Ionicons name="person" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.providerName}>
                    {job.resident?.full_name || job.resident?.name || 'Customer'}
                  </Text>
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
            </GlassContainer>
          </FadeInView>
        )}

        {/* Price Info */}
        {job.finalPrice?.totalAmount > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Price Details</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.priceValue}>Rs. {(job.finalPrice?.totalAmount || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceSub}>Labor Cost</Text>
              <Text style={styles.priceSub}>Rs. {(job.finalPrice?.laborCost || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceSub}>Material Cost</Text>
              <Text style={styles.priceSub}>Rs. {(job.finalPrice?.materialCost || 0).toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Actions based on Status */}
        <View style={styles.actionsCard}>
          
          {/* OPEN: Send Offer */}
          {job.status === 'open' && (
            <GlassContainer style={styles.formCard}>
              <Text style={styles.formTitle}>Submit Offer</Text>
              <Text style={styles.inputLabel}>Labor Estimate (Rs.)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={offerLabor} onChangeText={setOfferLabor} placeholder="e.g. 1500" />
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput style={[styles.input, { height: 80 }]} multiline textAlignVertical="top" value={offerMsg} onChangeText={setOfferMsg} placeholder="Optional message..." />
              
              <TouchableOpacity style={styles.actionBtn} onPress={onSendOffer} disabled={!!actionLoading}>
                <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.actionGradient}>
                  {renderActionContent({ action: 'Send Offer', label: 'Send Offer', icon: 'paper-plane' })}
                </LinearGradient>
              </TouchableOpacity>
            </GlassContainer>
          )}

          {/* OTP Verification */}
          {job.status === 'price_approved' && !job.otp?.start?.verified && (
            <GlassContainer style={styles.formCard}>
              <Text style={styles.formTitle}>Verify Start OTP</Text>
              <Text style={styles.inputLabel}>Enter 4-digit OTP from customer</Text>
              <OTPInput 
                value={otp} 
                onChangeText={setOtp} 
                length={4} 
              />
              <TouchableOpacity style={styles.actionBtn} onPress={onVerifyOTP} disabled={!!actionLoading}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionGradient}>
                  {renderActionContent({ action: 'Verify OTP', label: 'Verify OTP to Start Work', icon: 'key' })}
                </LinearGradient>
              </TouchableOpacity>
            </GlassContainer>
          )}

          {/* Request Inspection (when offer accepted or selected) */}
          {(job.status === 'provider_selected' || job.status === 'offer_accepted') && (!job.inspection?.requested || job.inspection?.status === 'rejected') && (
            <GlassContainer style={styles.formCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <View style={{ width: 40, height: 40, backgroundColor: '#FEF3C7', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="search" size={20} color="#D97706" />
                </View>
                <View>
                  <Text style={[styles.formTitle, { marginBottom: 2 }]}>Request Inspection</Text>
                  <Text style={{ fontSize: 13, color: '#D97706' }}>Set a time to visit and inspect.</Text>
                </View>
              </View>

              {job.inspection?.status === 'rejected' && (
                <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 10, marginBottom: 16 }}>
                  <Text style={{ color: '#991B1B', fontSize: 13, fontWeight: '500' }}>
                    Resident rejected the previous inspection request. You can propose again or just send the final price.
                  </Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Inspection Fee (Rs.)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={inspFee} onChangeText={setInspFee} placeholder="e.g. 500" />
              
              <Text style={styles.inputLabel}>Date to Visit *</Text>
              <TouchableOpacity onPress={() => openPicker('inspDate', 'date')} style={styles.pickerBtn}>
                 <Text style={[styles.pickerBtnText, !inspDate && styles.pickerBtnPlaceholder]}>{inspDate || 'Select Date'}</Text>
              </TouchableOpacity>
              {!!inspDate && (
                <TouchableOpacity style={styles.clearPickerBtn} onPress={() => setInspDate('')}>
                  <Text style={styles.clearPickerBtnText}>Clear Date</Text>
                </TouchableOpacity>
              )}
              
              <Text style={styles.inputLabel}>Time *</Text>
              <TouchableOpacity onPress={() => openPicker('inspTime', 'time')} style={styles.pickerBtn}>
                 <Text style={[styles.pickerBtnText, !inspTime && styles.pickerBtnPlaceholder]}>{inspTime || 'Select Time'}</Text>
              </TouchableOpacity>
              {!!inspTime && (
                <TouchableOpacity style={styles.clearPickerBtn} onPress={() => setInspTime('')}>
                  <Text style={styles.clearPickerBtnText}>Clear Time</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.inputLabel}>Reason (optional)</Text>
              <TextInput style={[styles.input, { height: 70 }]} multiline textAlignVertical="top" value={inspMsg} onChangeText={setInspMsg} placeholder="Why do you need to inspect?" />
              <TouchableOpacity style={styles.actionBtn} onPress={onRequestInspection} disabled={!!actionLoading}>
                <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionGradient}>
                  {renderActionContent({ action: 'Request Inspection', label: 'Request Inspection', icon: 'search' })}
                </LinearGradient>
              </TouchableOpacity>
            </GlassContainer>
          )}

          {/* Inspection Requested / Counter Offered */}
          {job.status === 'inspection_requested' && (
            <View style={[styles.formCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <Ionicons name="time" size={32} color="#F59E0B" style={{ alignSelf: 'center', marginBottom: 10 }} />
              <Text style={[styles.formTitle, { textAlign: 'center', color: '#D97706' }]}>Waiting for Resident</Text>
              <Text style={{ textAlign: 'center', fontSize: 13, color: '#B45309', marginBottom: 14 }}>
                {job.inspection?.status === 'counter_offered'
                  ? `Resident countered with Rs. ${job.inspection.counterFee}. Accept or re-propose.`
                  : `Inspection fee: Rs. ${(job.inspection?.fee || 0).toLocaleString()}. Waiting for approval.`}
              </Text>

              {job.inspection?.status === 'counter_offered' && (
                <>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { flex: 1, backgroundColor: Colors.success, paddingVertical: 12, alignItems: 'center', borderRadius: 10 }]}
                      onPress={() => handleAction('Accept Counter', respondToCounterFee, id, { action: 'accept', fee: job.inspection.counterFee })}
                      disabled={!!actionLoading}
                    >
                      {isActionBusy('Accept Counter') ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={{ color: '#FFF', fontWeight: '600' }}>Accept Rs. {job.inspection.counterFee}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.inputLabel, { marginTop: 10 }]}>Re-propose Fee (Rs.)</Text>
                  <TextInput
                    style={[styles.input, { marginBottom: 10 }]}
                    keyboardType="numeric"
                    value={counterReFee}
                    onChangeText={setCounterReFee}
                    placeholder="Enter new fee"
                  />
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.primary, paddingVertical: 12, alignItems: 'center', borderRadius: 10 }]}
                    onPress={() => {
                      if (!counterReFee) {
                        Alert.alert('Validation Error', 'Enter a fee to re-propose');
                        return;
                      }
                      handleAction('Re-propose', respondToCounterFee, id, { action: 're_propose', fee: Number(counterReFee) });
                    }}
                    disabled={!!actionLoading}
                  >
                    {isActionBusy('Re-propose') ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={{ color: '#FFF', fontWeight: '600' }}>Re-propose</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* AWAITING PRICE / INSPECTION APPROVED */}
          {(['inspection_pending', 'inspection_approved'].includes(job.status) || (!job.finalPrice?.totalAmount && ['offer_accepted', 'inspection_scheduled', 'provider_selected'].includes(job.status))) && (
            <GlassContainer style={styles.formCard}>
              <Text style={styles.formTitle}>{job.status === 'inspection_approved' ? 'Complete Inspection & Send Price' : 'Send Final Price & Schedule'}</Text>
              <Text style={styles.inputLabel}>Final Labor Cost (Rs.)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={finalLabor} onChangeText={setFinalLabor} placeholder="e.g. 1500" />
              
              <Text style={styles.inputLabel}>Schedule Start Date *</Text>
              <TouchableOpacity onPress={() => openPicker('scheduleDate', 'date')} style={styles.pickerBtn}>
                 <Text style={[styles.pickerBtnText, !scheduleDate && styles.pickerBtnPlaceholder]}>{scheduleDate || 'Select Start Date'}</Text>
              </TouchableOpacity>
              {!!scheduleDate && (
                <TouchableOpacity style={styles.clearPickerBtn} onPress={() => setScheduleDate('')}>
                  <Text style={styles.clearPickerBtnText}>Clear Date</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.inputLabel}>Schedule Start Time *</Text>
              <TouchableOpacity onPress={() => openPicker('scheduleTime', 'time')} style={styles.pickerBtn}>
                 <Text style={[styles.pickerBtnText, !scheduleTime && styles.pickerBtnPlaceholder]}>{scheduleTime || 'Select Start Time'}</Text>
              </TouchableOpacity>
              {!!scheduleTime && (
                <TouchableOpacity style={styles.clearPickerBtn} onPress={() => setScheduleTime('')}>
                  <Text style={styles.clearPickerBtnText}>Clear Time</Text>
                </TouchableOpacity>
              )}

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Estimate</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={scheduleDuration} onChangeText={setScheduleDuration} placeholder="2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <View style={styles.unitToggle}>
                    <TouchableOpacity
                      style={[styles.unitBtn, scheduleUnit === 'hours' && styles.unitBtnActive]}
                      onPress={() => setScheduleUnit('hours')}
                    >
                      <Text style={[styles.unitBtnText, scheduleUnit === 'hours' && styles.unitBtnTextActive]}>Hours</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.unitBtn, scheduleUnit === 'days' && styles.unitBtnActive]}
                      onPress={() => setScheduleUnit('days')}
                    >
                      <Text style={[styles.unitBtnText, scheduleUnit === 'days' && styles.unitBtnTextActive]}>Days</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <CommissionPreview laborCost={finalLabor} completedJobs={job?.provider?.completedJobs || 0} />

              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={job.status === 'inspection_approved' ? onCompleteInspectionPrice : onSendPrice} 
                disabled={!!actionLoading}
              >
                <LinearGradient colors={[Colors.success, '#059669']} style={styles.actionGradient}>
                  {renderActionContent({ action: job.status === 'inspection_approved' ? 'Complete Inspection' : 'Send Final Price', label: 'Send Price to Customer', icon: 'cash' })}
                </LinearGradient>
              </TouchableOpacity>
            </GlassContainer>
          )}

          {/* AWAITING RESIDENT APPROVAL FOR FINAL PRICE */}
          {job.status === 'awaiting_price_approval' && (
            <View style={[styles.formCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <Ionicons name="time" size={32} color="#F59E0B" style={{ alignSelf: 'center', marginBottom: 10 }} />
              <Text style={[styles.formTitle, { textAlign: 'center', color: '#D97706' }]}>Waiting for Resident Approval</Text>
              <Text style={{ textAlign: 'center', fontSize: 13, color: '#B45309' }}>
                Price & schedule sent. Resident will review shortly.
              </Text>
            </View>
          )}

          {/* START WORK */}
          {job.status === 'price_approved' && job.otp?.start?.verified && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Start Work', startWork, id)} disabled={!!actionLoading}>
              <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.actionGradient}>
                {renderActionContent({ action: 'Start Work', label: 'Start Work Now', icon: 'play' })}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* COMPLETE WORK */}
          {job.status === 'work_in_progress' && (
            <>
              {job.otp?.complete?.code && (
                <View style={[styles.formCard, { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' }]}>
                  <Text style={[styles.formTitle, { color: '#115E59' }]}>Job Complete Signal</Text>
                  <Text style={{ fontSize: 13, color: '#0F766E', marginBottom: 12 }}>
                    If you are done with the work, show this OTP to the Resident to collect payment.
                  </Text>
                  <View style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#99F6E4', alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: 8, color: '#0D9488' }}>
                      {job.otp.complete.code}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Complete Work', completeWork, id)} disabled={!!actionLoading}>
                <LinearGradient colors={[Colors.success, '#059669']} style={styles.actionGradient}>
                  {renderActionContent({ action: 'Complete Work', label: 'Mark Job Completed', icon: 'checkmark-done' })}
                </LinearGradient>
              </TouchableOpacity>

              {/* Update Price During Work */}
              {job.priceRevisions?.length > 0 && job.priceRevisions[job.priceRevisions.length - 1].status === 'pending' ? (
                <View style={[styles.formCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                  <Text style={[styles.formTitle, { color: '#D97706' }]}>Price Revision Pending</Text>
                  <Text style={{ fontSize: 13, color: '#B45309' }}>Awaiting resident approval for Rs. {job.priceRevisions[job.priceRevisions.length - 1].laborCost}.</Text>
                </View>
              ) : (
                <GlassContainer style={styles.formCard}>
                  <Text style={styles.formTitle}>Request Price Revision</Text>
                  <Text style={styles.inputLabel}>New Labor Cost (Rs.)</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={updatePriceLabor} onChangeText={setUpdatePriceLabor} placeholder="e.g. 2000" />
                  <Text style={styles.inputLabel}>Reason</Text>
                  <TextInput style={[styles.input, { height: 60 }]} multiline textAlignVertical="top" value={updatePriceMsg} onChangeText={setUpdatePriceMsg} placeholder="Explain why price increased..." />
                  <TouchableOpacity style={styles.actionBtn} onPress={onUpdatePrice} disabled={!!actionLoading}>
                    <LinearGradient colors={['#F97316', '#EA580C']} style={styles.actionGradient}>
                      {renderActionContent({ action: 'Update Price', label: 'Request Price Revision', icon: 'cash' })}
                    </LinearGradient>
                  </TouchableOpacity>
                </GlassContainer>
              )}

              {/* Update Schedule During Work */}
              {job.schedule?.approvedByResident === false ? (
                <View style={[styles.formCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                  <Text style={[styles.formTitle, { color: '#D97706' }]}>Schedule Update Pending</Text>
                  <Text style={{ fontSize: 13, color: '#B45309' }}>Awaiting resident approval for schedule change.</Text>
                </View>
              ) : (
                <GlassContainer style={styles.formCard}>
                  <Text style={styles.formTitle}>Request Schedule Change</Text>
                  <Text style={styles.inputLabel}>New Start Date *</Text>
                  <TouchableOpacity onPress={() => openPicker('updateScheduleDate', 'date')} style={styles.pickerBtn}>
                     <Text style={[styles.pickerBtnText, !updateScheduleDate && styles.pickerBtnPlaceholder]}>{updateScheduleDate || 'Select New Date'}</Text>
                  </TouchableOpacity>
                  {!!updateScheduleDate && (
                    <TouchableOpacity style={styles.clearPickerBtn} onPress={() => setUpdateScheduleDate('')}>
                      <Text style={styles.clearPickerBtnText}>Clear Date</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.inputLabel}>New Start Time *</Text>
                  <TouchableOpacity onPress={() => openPicker('updateScheduleTime', 'time')} style={styles.pickerBtn}>
                     <Text style={[styles.pickerBtnText, !updateScheduleTime && styles.pickerBtnPlaceholder]}>{updateScheduleTime || 'Select New Time'}</Text>
                  </TouchableOpacity>
                  {!!updateScheduleTime && (
                    <TouchableOpacity style={styles.clearPickerBtn} onPress={() => setUpdateScheduleTime('')}>
                      <Text style={styles.clearPickerBtnText}>Clear Time</Text>
                    </TouchableOpacity>
                  )}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Duration</Text>
                      <TextInput style={styles.input} keyboardType="numeric" value={updateScheduleDuration} onChangeText={setUpdateScheduleDuration} placeholder="2" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Unit</Text>
                      <View style={styles.unitToggle}>
                        <TouchableOpacity
                          style={[styles.unitBtn, updateScheduleUnit === 'hours' && styles.unitBtnActive]}
                          onPress={() => setUpdateScheduleUnit('hours')}
                        >
                          <Text style={[styles.unitBtnText, updateScheduleUnit === 'hours' && styles.unitBtnTextActive]}>Hours</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.unitBtn, updateScheduleUnit === 'days' && styles.unitBtnActive]}
                          onPress={() => setUpdateScheduleUnit('days')}
                        >
                          <Text style={[styles.unitBtnText, updateScheduleUnit === 'days' && styles.unitBtnTextActive]}>Days</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.actionBtn} onPress={onUpdateSchedule} disabled={!!actionLoading}>
                    <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionGradient}>
                      {renderActionContent({ action: 'Update Schedule', label: 'Request Schedule Extension', icon: 'calendar' })}
                    </LinearGradient>
                  </TouchableOpacity>
                </GlassContainer>
              )}
            </>
          )}

          {/* JOB COMPLETED */}
          {job.status === 'completed' && (
            <GlassContainer style={[styles.formCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Ionicons name="checkmark-circle" size={28} color="#16A34A" />
                <Text style={[styles.formTitle, { color: '#166534', marginBottom: 0 }]}>Job Completed Successfully</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#15803D', marginBottom: 16 }}>
                You have successfully completed this job and earned Rs. {((job.finalPrice?.totalAmount || 0) - (job.commission?.amount || 0)).toLocaleString()}.
              </Text>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(provider)/wallet')} disabled={!!actionLoading}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.actionGradient}>
                  <Ionicons name="wallet" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>View Wallet</Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassContainer>
          )}

          {/* Cancel Job */}
          {!['completed', 'cancelled'].includes(job.status) && (
            <TouchableOpacity style={styles.actionBtn} onPress={onCancelJob} disabled={!!actionLoading}>
              <View style={[styles.actionGradient, { backgroundColor: Colors.dangerLight }]}>
                {renderActionContent({ action: 'Cancel Job', label: 'Cancel Job', icon: 'close-circle', iconColor: Colors.danger, textStyle: { color: Colors.danger }, spinnerColor: Colors.danger })}
              </View>
            </TouchableOpacity>
          )}

        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {pickerConfig.visible && (
        <DateTimePicker
          key={`${pickerConfig.field}-${pickerConfig.mode}-${pickerNonce}`}
          value={tempDate}
          mode={pickerConfig.mode}
          is24Hour={false}
          display="default"
          onChange={(event, selectedDate) => onPickerChange(event, selectedDate, pickerConfig.field, pickerConfig.mode)}
        />
      )}
      {Platform.OS === 'ios' && pickerConfig.visible && (
         <TouchableOpacity 
            style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderColor: '#EEE' }}
            onPress={() => setPickerConfig({ ...pickerConfig, visible: false })}
         >
             <Text style={{ textAlign: 'center', color: Colors.primary, fontWeight: '700', fontSize: 16 }}>Done</Text>
         </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  directionsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 16, marginTop: 14, alignSelf: 'flex-start',
  },
  directionsBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  backText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statusCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, ...Shadows.small, borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.borderLight },
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
  actionsCard: { gap: 10, marginTop: 4 },
  formCard: { padding: 18, marginBottom: 14, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  formTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  inputLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#93C5FD', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 16, backgroundColor: '#F0F7FF' },
  pickerBtn: { borderWidth: 1, borderColor: '#93C5FD', borderRadius: 12, padding: 16, marginBottom: 16, backgroundColor: '#F0F7FF', justifyContent: 'center' },
  pickerBtnText: { fontSize: 14, color: Colors.text },
  pickerBtnPlaceholder: { color: Colors.textLight },
  clearPickerBtn: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#EEF2FF' },
  clearPickerBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  unitToggle: { flexDirection: 'row', borderWidth: 1, borderColor: '#93C5FD', borderRadius: 12, overflow: 'hidden', marginBottom: 16, backgroundColor: '#F0F7FF' },
  unitBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  unitBtnActive: { backgroundColor: Colors.primary },
  unitBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  unitBtnTextActive: { color: '#FFF' },
  actionBtn: { borderRadius: 14, overflow: 'hidden' },
  actionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});
