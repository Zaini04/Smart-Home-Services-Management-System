import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { verifyEmailOTP } from '../../src/api/authEndPoints';
import { Colors } from '../../src/theme/colors';
import { useAuth } from '../../src/context/AuthContext';
import Toast from 'react-native-toast-message';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { loginUser } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    if (!otp.trim() || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await verifyEmailOTP({ email, otp: otp.trim() });
      if (res.status === 200) {
        const userData = res.data.data;
        await loginUser(userData, userData.accessToken);
        setSuccess(true);
        setTimeout(() => {
          if (userData.role === 'serviceprovider') {
            router.replace('/(provider)/complete-profile');
          } else {
            router.replace('/(resident)/home');
          }
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#F8FAFC', '#EFF6FF', '#E0E7FF']} style={styles.gradient}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Email Verified!</Text>
            <Text style={styles.successText}>Your email has been verified successfully. Redirecting to login...</Text>
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#EFF6FF', '#E0E7FF']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoBox}>
                <Ionicons name="shield-checkmark" size={28} color="#FFF" />
              </View>
              <Text style={styles.brandName}>Home Fix</Text>
            </View>

            <View style={styles.card}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={18} color={Colors.text} />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>

              <View style={styles.iconBox}>
                <Ionicons name="key" size={32} color={Colors.primary} />
              </View>

              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                Enter the OTP sent to your email address to verify your account.
              </Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="close-circle" size={18} color={Colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>One-Time Password (OTP)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="key-outline" size={20} color={Colors.textLight} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your OTP code"
                    placeholderTextColor={Colors.textLight}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={8}
                  />
                </View>
              </View>

              <TouchableOpacity onPress={handleVerify} disabled={loading} activeOpacity={0.8}>
                <LinearGradient
                  colors={loading ? ['#9CA3AF', '#9CA3AF'] : [Colors.primary, Colors.secondary]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Verify OTP</Text>
                      <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: {
    flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 40,
  },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  brandName: { fontSize: 20, fontWeight: '700', color: Colors.text, marginTop: 12 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backBtnText: { fontSize: 14, fontWeight: '500', color: Colors.text },
  iconBox: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
    marginTop: 8, marginBottom: 24, lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: Colors.danger, flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.border, backgroundColor: '#FFFFFF',
  },
  input: { flex: 1, fontSize: 18, color: Colors.text, letterSpacing: 4, fontWeight: '700' },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  successContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  },
  successIcon: {
    width: 96, height: 96, borderRadius: 28, backgroundColor: Colors.successLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  successTitle: {
    fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 12, textAlign: 'center',
  },
  successText: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22,
  },
});
