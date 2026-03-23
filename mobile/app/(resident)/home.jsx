import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Dimensions, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { getCategories, getServices } from '../../src/api/residentEndPoints';
import { Colors, Shadows } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

const StatCard = ({ icon, value, label, color }) => (
  <View style={[homeStyles.statCard, { backgroundColor: `${color}15` }]}>
    <View style={[homeStyles.statIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={18} color="#FFF" />
    </View>
    <Text style={[homeStyles.statValue, { color }]}>{value}</Text>
    <Text style={homeStyles.statLabel}>{label}</Text>
  </View>
);

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const categoryIcons = {
    'Electrician': 'flash',
    'Plumber': 'water',
    'Carpenter': 'hammer',
    'Painter': 'color-palette',
    'Cleaner': 'sparkles',
    'AC Repair': 'snow',
    'Mechanic': 'build',
  };

  return (
    <View style={homeStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCategories(); }} />
        }
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#1E3A8A', '#2563EB', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={homeStyles.hero}
        >
          <View style={homeStyles.heroBg1} />
          <View style={homeStyles.heroBg2} />

          <View style={homeStyles.heroContent}>
            <View style={homeStyles.heroBadge}>
              <View style={homeStyles.heroBadgeDot} />
              <Text style={homeStyles.heroBadgeText}>Trusted by 10,000+ homeowners</Text>
            </View>

            <Text style={homeStyles.heroTitle}>One Place for All</Text>
            <Text style={homeStyles.heroTitleAccent}>Home Services</Text>
            <Text style={homeStyles.heroSubtitle}>
              Find verified professionals for any home service. Transparent pricing, secure payments.
            </Text>

            {/* Search Bar */}
            <View style={homeStyles.searchBar}>
              <Ionicons name="search" size={20} color={Colors.textLight} />
              <TextInput
                style={homeStyles.searchInput}
                placeholder="What service do you need?"
                placeholderTextColor={Colors.textLight}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={homeStyles.ctaButton}
              onPress={() => router.push('/(resident)/post-job')}
              activeOpacity={0.8}
            >
              <Text style={homeStyles.ctaText}>Book a Service</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={homeStyles.statsRow}>
            <StatCard icon="people" value="10K+" label="Customers" color="#3B82F6" />
            <StatCard icon="shield-checkmark" value="500+" label="Providers" color="#22C55E" />
            <StatCard icon="star" value="4.9" label="Rating" color="#F59E0B" />
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={homeStyles.section}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>Service Categories</Text>
            <Text style={homeStyles.sectionSubtitle}>What do you need help with?</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 40 }} />
          ) : categories.length === 0 ? (
            <View style={homeStyles.emptyState}>
              <Ionicons name="grid-outline" size={48} color={Colors.textMuted} />
              <Text style={homeStyles.emptyText}>No categories available</Text>
              <TouchableOpacity onPress={fetchCategories}>
                <Text style={homeStyles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={homeStyles.categoryGrid}>
              {categories
                .filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()))
                .map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={homeStyles.categoryCard}
                  onPress={() => router.push('/(resident)/post-job')}
                  activeOpacity={0.7}
                >
                  <View style={homeStyles.categoryIconBox}>
                    <Ionicons
                      name={categoryIcons[cat.name] || 'construct'}
                      size={24}
                      color={Colors.primary}
                    />
                  </View>
                  <Text style={homeStyles.categoryName} numberOfLines={2}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Features */}
        <View style={homeStyles.section}>
          <Text style={homeStyles.sectionTitle}>Why ServiceHub?</Text>
          {[
            { icon: 'shield-checkmark', title: 'Verified Providers', desc: 'All background checked', color: '#22C55E' },
            { icon: 'lock-closed', title: 'Secure Payments', desc: 'Your transactions are protected', color: '#3B82F6' },
            { icon: 'time', title: '24/7 Support', desc: "We're here to help anytime", color: '#8B5CF6' },
          ].map((f, i) => (
            <View key={i} style={homeStyles.featureCard}>
              <View style={[homeStyles.featureIcon, { backgroundColor: `${f.color}15` }]}>
                <Ionicons name={f.icon} size={22} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={homeStyles.featureTitle}>{f.title}</Text>
                <Text style={homeStyles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* How It Works */}
        <View style={[homeStyles.section, { marginBottom: 32 }]}>
          <Text style={homeStyles.sectionTitle}>How It Works</Text>
          {[
            { step: '1', title: 'Post Your Job', desc: 'Describe what you need', color: '#3B82F6' },
            { step: '2', title: 'Get Offers', desc: 'Providers will send offers', color: '#8B5CF6' },
            { step: '3', title: 'Choose & Book', desc: 'Pick the best offer', color: '#22C55E' },
            { step: '4', title: 'Get It Done', desc: 'Service at your doorstep', color: '#F59E0B' },
          ].map((s, i) => (
            <View key={i} style={homeStyles.stepCard}>
              <View style={[homeStyles.stepBadge, { backgroundColor: s.color }]}>
                <Text style={homeStyles.stepNumber}>{s.step}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={homeStyles.stepTitle}>{s.title}</Text>
                <Text style={homeStyles.stepDesc}>{s.desc}</Text>
              </View>
              {i < 3 && <View style={homeStyles.stepLine} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const homeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
  heroBg1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', top: -40, right: -60 },
  heroBg2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 30, left: -30 },
  heroContent: { zIndex: 1 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginBottom: 16,
  },
  heroBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  heroBadgeText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  heroTitleAccent: { fontSize: 32, fontWeight: '800', color: '#67E8F9', marginBottom: 10 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 14, ...Shadows.medium,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 14, marginBottom: 6,
    ...Shadows.medium,
  },
  ctaText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 20, zIndex: 1 },
  statCard: {
    flex: 1, borderRadius: 14, padding: 12, alignItems: 'center',
  },
  statIcon: {
    width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: Colors.textSecondary },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, marginTop: 12 },
  retryText: { fontSize: 14, color: Colors.primary, fontWeight: '600', marginTop: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: {
    width: (width - 52) / 3, backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    alignItems: 'center', ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight,
  },
  categoryIconBox: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  categoryName: { fontSize: 12, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF',
    borderRadius: 16, padding: 16, marginBottom: 10, ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight,
  },
  featureIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  featureDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  stepCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 10,
    ...Shadows.small, borderWidth: 1, borderColor: Colors.borderLight,
  },
  stepBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepNumber: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  stepTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  stepDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  stepLine: {
    position: 'absolute', left: 37, top: 52, width: 2, height: 10,
    backgroundColor: Colors.border,
  },
});
