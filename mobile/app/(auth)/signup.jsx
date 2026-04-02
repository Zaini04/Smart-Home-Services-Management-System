import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { signUp, verifyEmailOTP } from '../../src/api/authEndPoints';
import { Colors } from '../../src/theme/colors';

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps }) => (
  <View style={stepStyles.container}>
    {Array.from({ length: totalSteps }, (_, i) => (
      <React.Fragment key={i}>
        <View style={[
          stepStyles.dot,
          i + 1 <= currentStep ? stepStyles.dotActive : stepStyles.dotInactive,
        ]}>
          {i + 1 < currentStep ? (
            <Ionicons name="checkmark" size={14} color="#FFF" />
          ) : (
            <Text style={[
              stepStyles.dotText,
              i + 1 <= currentStep && { color: '#FFF' },
            ]}>
              {i + 1}
            </Text>
          )}
        </View>
        {i < totalSteps - 1 && (
          <View style={[
            stepStyles.line,
            i + 1 < currentStep ? stepStyles.lineActive : stepStyles.lineInactive,
          ]} />
        )}
      </React.Fragment>
    ))}
  </View>
);

// Password strength component
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const bgColors = [Colors.danger, Colors.warning, '#EAB308', Colors.success];

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            backgroundColor: i <= strength ? bgColors[strength - 1] : Colors.border,
          }} />
        ))}
      </View>
      <Text style={{ fontSize: 11, color: strength >= 3 ? Colors.success : Colors.textSecondary, marginTop: 4 }}>
        Password strength: {labels[strength - 1] || 'Too weak'}
      </Text>
    </View>
  );
};



export default function SignupScreen() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState('resident');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Step 5 - OTP
  const [otp, setOtp] = useState('');
  const [pendingToken, setPendingToken] = useState(null); // store token after signup
  const [pendingRole, setPendingRole] = useState(null);
  const [pendingUserData, setPendingUserData] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpResending, setOtpResending] = useState(false);

  const validateStep = (s) => {
    switch (s) {
      case 1: return role !== '';
      case 2: return name && email && phone;
      case 3: return password && confirm && password === confirm && password.length >= 8;
      case 4: return address && city && agreed;
      default: return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!agreed) { setError('Please agree to terms'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await signUp({ full_name: name, email, phone, password, role, city, address });
      if (res.status === 201) {
        // Store user data, advance to OTP step
        setPendingUserData(res.data.data);
        setPendingToken(res.data.data.accessToken);
        setPendingRole(res.data.data.role);
        setStep(5);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length < 4) { setOtpError('Please enter a valid OTP code'); return; }
    setOtpError('');
    setOtpLoading(true);
    try {
      await verifyEmailOTP({ email, otp: otp.trim() });
      await loginUser(pendingUserData, pendingToken);
      if (pendingRole === 'serviceprovider') {
        router.replace('/(provider)/complete-profile');
      } else {
        router.replace('/(resident)/home');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpResending(true);
    try {
      await signUp({ full_name: name, email, phone, password, role, city, address });
      setOtpError('');
    } catch (err) { /* silently fail */ }
    finally { setOtpResending(false); }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#EFF6FF', '#E0E7FF']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Get started with your free account</Text>

              <StepIndicator currentStep={step} totalSteps={5} />

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="close-circle" size={18} color={Colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Step 1: Role */}
              {step === 1 && (
                <View>
                  <Text style={styles.stepTitle}>Choose your account type</Text>
                  <View style={styles.roleRow}>
                    <TouchableOpacity
                      style={[styles.roleCard, role === 'resident' && styles.roleCardActive]}
                      onPress={() => setRole('resident')}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.roleIcon, role === 'resident' && styles.roleIconActive]}>
                        <Ionicons name="home-outline" size={24} color={role === 'resident' ? '#FFF' : Colors.textSecondary} />
                      </View>
                      <Text style={[styles.roleTitle, role === 'resident' && { color: '#1E40AF' }]}>Resident</Text>
                      <Text style={[styles.roleDesc, role === 'resident' && { color: '#3B82F6' }]}>Book services</Text>
                      {role === 'resident' && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={12} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.roleCard, role === 'serviceprovider' && styles.roleCardActive]}
                      onPress={() => setRole('serviceprovider')}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.roleIcon, role === 'serviceprovider' && styles.roleIconActive]}>
                        <Ionicons name="briefcase-outline" size={24} color={role === 'serviceprovider' ? '#FFF' : Colors.textSecondary} />
                      </View>
                      <Text style={[styles.roleTitle, role === 'serviceprovider' && { color: '#1E40AF' }]}>Provider</Text>
                      <Text style={[styles.roleDesc, role === 'serviceprovider' && { color: '#3B82F6' }]}>Offer services</Text>
                      {role === 'serviceprovider' && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={12} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <View>
                  <Text style={styles.stepTitle}>Personal Information</Text>
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="person-outline" size={20} color={Colors.textLight} />
                      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your full name" placeholderTextColor={Colors.textLight} />
                    </View>
                  </View>
                  
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail-outline" size={20} color={Colors.textLight} />
                      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter your email" placeholderTextColor={Colors.textLight} keyboardType="email-address" autoCapitalize="none" />
                    </View>
                  </View>
                  
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.label}>Phone</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="call-outline" size={20} color={Colors.textLight} />
                      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="03XXXXXXXXX" placeholderTextColor={Colors.textLight} keyboardType="phone-pad" />
                    </View>
                  </View>
                </View>
              )}

              {/* Step 3: Password */}
              {step === 3 && (
                <View>
                  <Text style={styles.stepTitle}>Create Password</Text>
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
                      <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        placeholder="Create a strong password"
                        placeholderTextColor={Colors.textLight}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textLight} />
                      </TouchableOpacity>
                    </View>
                    <PasswordStrength password={password} />
                  </View>
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
                      <TextInput
                        style={styles.input}
                        value={confirm}
                        onChangeText={setConfirm}
                        secureTextEntry={!showConfirm}
                        placeholder="Confirm your password"
                        placeholderTextColor={Colors.textLight}
                      />
                      <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                        <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textLight} />
                      </TouchableOpacity>
                    </View>
                    {confirm && password === confirm && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                        <Text style={{ fontSize: 12, color: Colors.success }}>Passwords match!</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Step 4: Location */}
              {step === 4 && (
                <View>
                  <Text style={styles.stepTitle}>Location Details</Text>
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.label}>Address</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="location-outline" size={20} color={Colors.textLight} />
                      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="House #123, Street 4" placeholderTextColor={Colors.textLight} />
                    </View>
                  </View>
                  
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.label}>City</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="business-outline" size={20} color={Colors.textLight} />
                      <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Enter your city" placeholderTextColor={Colors.textLight} />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setAgreed(!agreed)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                      {agreed && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>
                    <Text style={styles.checkboxText}>
                      I agree to the Terms of Service and Privacy Policy
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 5: OTP Verification */}
              {step === 5 && (
                <View>
                  <View style={styles.otpHeaderBox}>
                    <View style={styles.otpIconCircle}>
                      <Ionicons name="mail-open" size={28} color={Colors.primary} />
                    </View>
                    <Text style={styles.stepTitle}>Verify Your Email</Text>
                    <Text style={styles.otpHint}>
                      We've sent a verification code to{' '}
                      <Text style={{ fontWeight: '700', color: Colors.text }}>{email}</Text>
                    </Text>
                  </View>

                  {otpError ? (
                    <View style={styles.errorBox}>
                      <Ionicons name="close-circle" size={18} color={Colors.danger} />
                      <Text style={styles.errorText}>{otpError}</Text>
                    </View>
                  ) : null}

                  <Text style={styles.label}>Enter OTP Code</Text>
                  <TextInput
                    style={styles.otpInput}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="e.g. 123456"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="number-pad"
                    maxLength={8}
                    autoFocus
                    textAlign="center"
                  />

                  <TouchableOpacity
                    onPress={handleVerifyOTP}
                    disabled={otpLoading}
                    style={{ marginTop: 16 }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={otpLoading ? ['#9CA3AF', '#9CA3AF'] : ['#22C55E', '#059669']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={styles.nextButton}
                    >
                      {otpLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <>
                          <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                          <Text style={styles.nextText}>Verify & Continue</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendRow}
                    onPress={handleResendOTP}
                    disabled={otpResending}
                  >
                    {otpResending ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <Text style={styles.resendText}>Didn't receive code? <Text style={{ color: Colors.primary, fontWeight: '600' }}>Resend</Text></Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Navigation Buttons — hide on step 5 */}
              {step < 5 && (
                <View style={styles.navRow}>
                  {step > 1 && (
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => { setStep(step - 1); setError(''); }}
                    >
                      <Ionicons name="arrow-back" size={18} color={Colors.text} />
                      <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                  )}
                  {step < 4 ? (
                    <TouchableOpacity
                      onPress={handleNext}
                      disabled={!validateStep(step)}
                      style={{ flex: 1 }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={!validateStep(step) ? ['#D1D5DB', '#D1D5DB'] : [Colors.primary, Colors.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.nextButton}
                      >
                        <Text style={styles.nextText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handleSubmit}
                      disabled={loading || !validateStep(4)}
                      style={{ flex: 1 }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={loading || !validateStep(4) ? ['#9CA3AF', '#9CA3AF'] : ['#22C55E', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.nextButton}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                            <Text style={styles.nextText}>Create Account</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Login Link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.loginLink}>Sign in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  dot: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dotActive: { backgroundColor: Colors.primary },
  dotInactive: { backgroundColor: '#F3F4F6' },
  dotText: { fontSize: 13, fontWeight: '600', color: Colors.textLight },
  line: { width: 32, height: 3, borderRadius: 2 },
  lineActive: { backgroundColor: Colors.primary },
  lineInactive: { backgroundColor: '#E5E7EB' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoBox: {
    width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  stepTitle: { fontSize: 17, fontWeight: '600', color: Colors.text, marginBottom: 16 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: Colors.danger, flex: 1 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: Colors.border,
  },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: {
    flex: 1, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: Colors.border,
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: '#EFF6FF' },
  roleIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  roleIconActive: { backgroundColor: Colors.primary },
  roleTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  roleDesc: { fontSize: 12, color: Colors.textSecondary },
  checkBadge: {
    position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkboxText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  backButton: {
    flex: 0.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 16, borderRadius: 12, backgroundColor: '#F3F4F6',
  },
  backText: { fontSize: 15, fontWeight: '600', color: Colors.text },
  nextButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 12,
  },
  nextText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: Colors.textSecondary },
  loginLink: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  otpHeaderBox: { alignItems: 'center', marginBottom: 20 },
  otpIconCircle: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  otpHint: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18, marginTop: 6 },
  otpInput: {
    fontSize: 28, fontWeight: '700', color: Colors.text, borderWidth: 2,
    borderColor: Colors.primary, borderRadius: 16, paddingVertical: 16,
    paddingHorizontal: 24, letterSpacing: 8, backgroundColor: '#F0F7FF',
  },
  resendRow: { alignItems: 'center', marginTop: 16 },
  resendText: { fontSize: 13, color: Colors.textSecondary },
});
