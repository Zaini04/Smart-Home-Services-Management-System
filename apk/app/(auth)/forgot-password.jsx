import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { forgotPassword, resetPassword } from '../../src/api/authEndPoints';
import { Colors } from '../../src/theme/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  // Step 1: email, Step 2: OTP + new password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState(''); // token from email
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPassword({ email: email.trim().toLowerCase() });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await forgotPassword({ email: email.trim().toLowerCase() });
      setError('');
    } catch { /* silent */ }
    finally { setResending(false); }
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim()) { setError('Please enter the reset token from your email'); return; }
    if (!newPassword || newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(resetToken.trim(), { newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Check the token and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={52} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Password Reset!</Text>
          <Text style={styles.successText}>
            Your password has been changed successfully. You can now login with your new password.
          </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} activeOpacity={0.8}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              <Ionicons name="log-in-outline" size={20} color="#FFF" />
              <Text style={styles.btnText}>Go to Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconBox}>
            <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.iconGradient}>
              <Ionicons name={step === 1 ? 'lock-closed' : 'mail-open'} size={28} color="#FFF" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>
            {step === 1 ? 'Forgot Password?' : 'Check Your Email'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "No worries! Enter your email and we'll send you a password reset link."
              : `Check your email for a reset link. Open it, copy the token from the URL, and paste it below.`}
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="close-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            {/* STEP 1: Email */}
            {step === 1 && (
              <>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={Colors.textLight} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity onPress={handleSendOTP} disabled={loading} activeOpacity={0.8}>
                  <LinearGradient
                    colors={loading ? ['#9CA3AF', '#9CA3AF'] : [Colors.primary, Colors.secondary]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.btn}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="send" size={18} color="#FFF" />
                        <Text style={styles.btnText}>Send Reset Code</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 2: OTP + New Password */}
            {step === 2 && (
              <>
                <Text style={styles.label}>Reset Token (from email)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="key-outline" size={20} color={Colors.textLight} />
                  <TextInput
                    style={styles.input}
                    value={resetToken}
                    onChangeText={setResetToken}
                    placeholder="Paste reset token here"
                    placeholderTextColor={Colors.textLight}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <Text style={[styles.label, { marginTop: 16 }]}>New Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={Colors.textLight}
                    secureTextEntry={!showPw}
                  />
                  <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textLight} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { marginTop: 12 }]}>Confirm New Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat password"
                    placeholderTextColor={Colors.textLight}
                    secureTextEntry
                  />
                </View>
                {confirmPassword && newPassword === confirmPassword && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={{ fontSize: 12, color: Colors.success }}>Passwords match</Text>
                  </View>
                )}

                <TouchableOpacity onPress={handleResetPassword} disabled={loading} activeOpacity={0.8} style={{ marginTop: 20 }}>
                  <LinearGradient
                    colors={loading ? ['#9CA3AF', '#9CA3AF'] : ['#22C55E', '#059669']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.btn}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="shield-checkmark" size={18} color="#FFF" />
                        <Text style={styles.btnText}>Reset Password</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resendRow} onPress={handleResend} disabled={resending}>
                  {resending ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.resendText}>
                      Didn't get it?{' '}
                      <Text style={{ color: Colors.primary, fontWeight: '600' }}>Resend Code</Text>
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/(auth)/login')}>
            <Ionicons name="arrow-back" size={14} color={Colors.primary} />
            <Text style={styles.loginLinkText}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1, padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 50,
    justifyContent: 'center',
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderLight, marginBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, elevation: 2,
  },
  iconBox: { alignItems: 'center', marginBottom: 20 },
  iconGradient: {
    width: 68, height: 68, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 20, paddingHorizontal: 10, marginBottom: 24,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: Colors.danger, flex: 1 },
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    marginBottom: 20,
  },
  label: { fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 14, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.border, marginBottom: 4,
  },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  otpInput: {
    fontSize: 28, fontWeight: '700', color: Colors.text,
    borderWidth: 2, borderColor: Colors.primary, borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 24, letterSpacing: 8,
    backgroundColor: '#F0F7FF', marginBottom: 4,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 16,
  },
  btnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  resendRow: { alignItems: 'center', marginTop: 16 },
  resendText: { fontSize: 13, color: Colors.textSecondary },
  loginLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  loginLinkText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  // Success
  successCard: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  successIcon: {
    width: 96, height: 96, borderRadius: 28, backgroundColor: Colors.successLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  successTitle: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  successText: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 20, marginBottom: 32, paddingHorizontal: 10,
  },
});
