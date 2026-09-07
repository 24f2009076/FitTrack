import '@/global.css';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from 'react';

import {
  AuthProvider,
  useAuth,
} from '@/context/AuthContext';
import { OnboardingProvider } from '@/context/OnboardingContext';

export default function RootLayout() {


  const [ fontsLoaded ] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) { return null };

  return (
    <AuthProvider>
      <OnboardingProvider>
        <RootNavigator />
      </OnboardingProvider>
    </AuthProvider>
  );
}


function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >

      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected> 

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      
    </Stack>
  )
}
