import React, { useEffect, useState } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { getProviderStatus } from '../../src/api/serviceProviderEndPoints';
import { Colors } from '../../src/theme/colors';

export default function ProviderLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      if (!user?._id) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const res = await getProviderStatus(user._id);
        if (mounted) {
          setStatus(res.data.data.status);
          const currentScreen = segments[segments.length - 1];
          
          if (res.data.data.status === 'incomplete') {
            if (currentScreen !== 'complete-profile') {
              router.replace('/(provider)/complete-profile');
            }
          } else if (res.data.data.status === 'pending') {
            if (currentScreen !== 'kyc-status') {
              router.replace('/(provider)/kyc-status');
            }
          } else if (res.data.data.status === 'approved') {
            if (currentScreen === 'complete-profile' || currentScreen === 'kyc-status') {
              router.replace('/(provider)/dashboard');
            }
          }
        }
      } catch (err) {
        console.error('Failed to get provider status', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkStatus();
    return () => { mounted = false; };
  }, [user, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Hide tab bar for KYC flow screens
  if (status === 'incomplete' || status === 'pending') {
    return (
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
        <Tabs.Screen name="complete-profile" />
        <Tabs.Screen name="kyc-status" />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />,
      }} />
      <Tabs.Screen name="available-jobs" options={{
        title: 'Find Jobs',
        tabBarIcon: ({ color }) => <Ionicons name="search" size={22} color={color} />,
      }} />
      <Tabs.Screen name="my-jobs" options={{
        title: 'My Jobs',
        tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={22} color={color} />,
      }} />
      <Tabs.Screen name="chat-inbox" options={{
        title: 'Chat',
        tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={22} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} />,
      }} />
      
      {/* Hidden Screens */}
      <Tabs.Screen name="complete-profile" options={{ href: null }} />
      <Tabs.Screen name="kyc-status" options={{ href: null }} />
      <Tabs.Screen name="job/[id]" options={{ href: null, headerShown: true, title: 'Job Details' }} />
      <Tabs.Screen name="wallet" options={{ href: null, headerShown: true, title: 'Wallet' }} />
      <Tabs.Screen name="earnings" options={{ href: null, headerShown: true, title: 'Earnings' }} />
      <Tabs.Screen name="edit-profile" options={{ href: null, headerShown: true, title: 'Edit Profile' }} />
      <Tabs.Screen name="my-offers" options={{ href: null, headerShown: true, title: 'My Offers' }} />
      <Tabs.Screen name="chat/[id]" options={{ href: null, headerShown: true, title: 'Chat' }} />
    </Tabs>
  );
}
