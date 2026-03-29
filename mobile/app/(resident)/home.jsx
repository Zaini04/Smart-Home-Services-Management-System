import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Dimensions, TextInput,
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
          colors={['#1E3A8A', '#2563EB', '#4F46E5']}
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
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroBadgeText}>Trusted by 10,000+ homeowners</Text>
            </View>

            <Text style={styles.greeting}>Hello, {user?.full_name?.split(' ')[0] || 'there'} 👋</Text>
            <Text style={styles.heroTitle}>One Place for All</Text>
            <Text style={styles.heroTitleAccent}>Home Services</Text>
            <Text style={styles.heroSubtitle}>
              Find verified professionals for any home service. Transparent pricing, secure payments.
            </Text>

            {/* CTA */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/(resident)/post-job')}
              activeOpacity={0.8}
            >
              <Ionicons name="paper-plane" size={18} color={Colors.primary} />
              <Text style={styles.ctaText}>Post a Job</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { icon: 'people', value: '10K+', label: 'Customers', color: '#60A5FA' },
              { icon: 'shield-checkmark', value: '500+', label: 'Providers', color: '#34D399' },
              { icon: 'star', value: '4.9', label: 'Rating', color: '#FBBF24' },
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
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'paper-plane', label: 'Post Job', color: '#3B82F6', path: '/(resident)/post-job' },
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

        {/* Why ServiceHub */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why ServiceHub?</Text>
          {[
            { icon: 'shield-checkmark', title: 'Verified Providers', desc: 'All background checked & certified', color: '#22C55E' },
            { icon: 'lock-closed', title: 'Secure Payments', desc: 'Transactions protected at all times', color: '#3B82F6' },
            { icon: 'time', title: '24/7 Support', desc: "We're here to help any time", color: '#8B5CF6' },
            { icon: 'location', title: 'Near You', desc: 'Professionals in your area', color: '#F59E0B' },
          ].map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: `${f.color}15` }]}>
                <Ionicons name={f.icon} size={22} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.borderLight} />
            </View>
          ))}
        </View>

        {/* How It Works */}
        <View style={[styles.section, { marginBottom: 36 }]}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {[
            { step: '1', title: 'Post Your Job', desc: 'Describe what you need done', color: '#3B82F6', icon: 'create' },
            { step: '2', title: 'Get Offers', desc: 'Providers send competitive offers', color: '#8B5CF6', icon: 'document-text' },
            { step: '3', title: 'Choose & Book', desc: 'Pick the best offer for your budget', color: '#22C55E', icon: 'checkmark-circle' },
            { step: '4', title: 'Get It Done', desc: 'Service delivered at your doorstep', color: '#F59E0B', icon: 'home' },
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
      </ScrollView>

      {/* Drawer */}
      <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} role="resident" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
  heroBg1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', top: -40, right: -60 },
  heroBg2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 30, left: -30 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  hamburger: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatar: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  heroContent: { zIndex: 1 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginBottom: 12,
  },
  heroBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  heroBadgeText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  greeting: { fontSize: 18, color: 'rgba(255,255,255,0.85)', fontWeight: '500', marginBottom: 4 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#FFF' },
  heroTitleAccent: { fontSize: 30, fontWeight: '800', color: '#67E8F9', marginBottom: 10 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20, marginBottom: 20 },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 14, marginBottom: 20,
    ...Shadows.medium,
  },
  ctaText: { fontSize: 15, fontWeight: '700', color: Colors.primary, flex: 1, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 15, fontWeight: '700' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: (width - 52) / 2, backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    alignItems: 'center', ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight,
  },
  actionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: Colors.text },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF',
    borderRadius: 16, padding: 16, marginBottom: 10, ...Shadows.small,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  featureIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  featureDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  stepCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF',
    borderRadius: 16, padding: 16, marginBottom: 10, ...Shadows.small,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  stepBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  stepNumber: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  stepTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  stepDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  stepIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
});
