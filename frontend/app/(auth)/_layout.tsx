import '@/global.css';
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack 
      initialRouteName="welcome"
      screenOptions={{
        headerShown: false,
      }}
    >

      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}