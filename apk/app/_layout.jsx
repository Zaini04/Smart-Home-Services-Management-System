import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SocketProvider } from '../src/context/SocketContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutNav() {
  const { user, loading, logoutInProgress, loginInProgress, completeLoginTransition } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Navigate to appropriate tab based on role
      if (user.role === 'serviceprovider') {
        router.replace('/(provider)/dashboard');
      } else {
        router.replace('/(resident)/home');
      }
    }
  }, [user, loading, segments]);

  useEffect(() => {
    if (user && segments[0] !== '(auth)' && loginInProgress) {
      completeLoginTransition();
    }
  }, [user, segments, loginInProgress, completeLoginTransition]);

  if (loading) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(resident)" />
        <Stack.Screen name="(provider)" />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      </Stack>
      <Toast
        position="top"
        topOffset={58}
        visibilityTime={2800}
        autoHide
        swipeable
      />
      {logoutInProgress || loginInProgress ? (
        <View style={styles.logoutOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.logoutOverlayText}>
            {logoutInProgress ? 'Signing out...' : 'Signing in...'}
          </Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  logoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 99999,
  },
  logoutOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <RootLayoutNav />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
