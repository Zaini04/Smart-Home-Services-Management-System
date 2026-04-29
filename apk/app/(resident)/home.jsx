import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Colors, Shadows } from '../../src/theme/colors';
import DrawerMenu from '../../components/DrawerMenu';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={Colors.primary} />
        }
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#111827', '#1F2937']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroBg1} />
          <View style={styles.heroBg2} />

          {/* Hamburger + Greeting Row */}
          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.hamburger} onPress={() => setDrawerOpen(true)}>
              <Ionicons name="menu" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Your Home,</Text>
            <Text style={styles.heroTitleAccent}>Perfectly Fixed.</Text>
            <Text style={styles.heroSubtitle}>
              Post your home problem, get competitive bids from verified local providers, and get the job done right.
            </Text>

            {/* CTA */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/(resident)/post-job')}
              activeOpacity={0.8}
            >
              <Ionicons name="paper-plane" size={18} color="#111827" />
              <Text style={styles.ctaText}>Book a Service</Text>
              <Ionicons name="arrow-forward" size={16} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { icon: 'people', value: '10K+', label: 'Customers', color: '#93C5FD' },
              { icon: 'shield-checkmark', value: '500+', label: 'Providers', color: '#86EFAC' },
              { icon: 'star', value: '4.9', label: 'Rating', color: '#FCD34D' },
            ].map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: `${s.color}20` }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Started</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'paper-plane', label: 'Book a Service', color: '#EAB308', path: '/(resident)/post-job' },
              { icon: 'calendar', label: 'My Bookings', color: '#8B5CF6', path: '/(resident)/my-bookings' },
              { icon: 'chatbubbles', label: 'Messages', color: '#22C55E', path: '/(resident)/chat-inbox' },
              { icon: 'notifications', label: 'Alerts', color: '#F59E0B', path: '/(resident)/notifications' },
            ].map((a, i) => (
              <TouchableOpacity
                key={i}
                style={styles.actionCard}
                onPress={() => router.push(a.path)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${a.color}15` }]}>
                  <Ionicons name={a.icon} size={24} color={a.color} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Why Home Fix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us</Text>
          {[
            { icon: 'shield-checkmark', title: 'Verified Professionals', desc: 'All providers are background checked and verified', color: '#22C55E' },
            { icon: 'wallet', title: 'Direct Secure Payments', desc: 'Pay safely after job completion with no hidden fees', color: '#3B82F6' },
            { icon: 'time', title: '24/7 Support', desc: "We're here to help any time", color: '#8B5CF6' },
            { icon: 'location', title: 'Exclusive to Multan', desc: 'Dedicated local providers who know your area', color: '#F59E0B' },
          ].map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: `${f.color}15` }]}>
                <Ionicons name={f.icon} size={22} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {[
            { step: '1', title: 'Post Your Job', desc: 'Describe what you need done', color: '#3B82F6', icon: 'create' },
            { step: '2', title: 'Get Offers', desc: 'Providers send competitive offers', color: '#8B5CF6', icon: 'document-text' },
            { step: '3', title: 'Choose & Book', desc: 'Pick the best offer for your budget', color: '#22C55E', icon: 'checkmark-circle' },
            { step: '4', title: 'Get It Done', desc: 'Service delivered at your doorstep', color: '#F59E0B', icon: 'home' },
            { step: '5', title: 'Secure Payment', desc: 'Pay only after you are satisfied', color: '#22C55E', icon: 'card' },
            { step: '6', title: 'Leave a Review', desc: 'Rate your experience to help others', color: '#A855F7', icon: 'star' },
          ].map((s, i) => (
            <View key={i} style={styles.stepCard}>
              <View style={[styles.stepBadge, { backgroundColor: s.color }]}>
                <Text style={styles.stepNumber}>{s.step}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
              <View style={[styles.stepIconBox, { backgroundColor: `${s.color}15` }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
            </View>
          ))}
        </View>

        {/* Landing Page CTA */}
        <View style={[styles.section, { marginBottom: 36 }]}>
          <LinearGradient colors={['#111827', '#1F2937']} style={styles.ctaLanding}>
            <Text style={styles.ctaLandingTitle}>Are you ready to book a service?</Text>
            <Text style={styles.ctaLandingDesc}>
              Join thousands of homeowners who solve home problems quickly and affordably through HomeFix.
            </Text>
            <TouchableOpacity style={styles.ctaLandingBtn} onPress={() => router.push('/(resident)/post-job')}>
              <Text style={styles.ctaLandingBtnText}>Book a Service</Text>
              <Ionicons name="arrow-forward" size={16} color="#111827" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Drawer */}
      <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} role="resident" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { paddingTop: 44, paddingBottom: 18, paddingHorizontal: 20, overflow: 'hidden' },
  heroBg1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', top: -40, right: -60 },
  heroBg2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 30, left: -30 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  hamburger: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatar: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  heroContent: { zIndex: 1 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  heroTitleAccent: { fontSize: 26, fontWeight: '800', color: '#FACC15', marginBottom: 8 },
  heroSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 18, marginBottom: 14 },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#EAB308', borderRadius: 14, paddingVertical: 12, marginBottom: 16,
    ...Shadows.medium,
  },
  ctaText: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statCard: { flex: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 15, fontWeight: '700' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: (width - 52) / 2, backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    alignItems: 'center', ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight,
  },
  actionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: Colors.text },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  featureIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  featureDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stepBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  stepNumber: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  stepTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  stepDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  stepIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  ctaLanding: { borderRadius: 20, padding: 20 },
  ctaLandingTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  ctaLandingDesc: { fontSize: 13, color: '#D1D5DB', lineHeight: 20, marginBottom: 16 },
  ctaLandingBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EAB308',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaLandingBtnText: { fontSize: 14, fontWeight: '700', color: '#111827' },
});
