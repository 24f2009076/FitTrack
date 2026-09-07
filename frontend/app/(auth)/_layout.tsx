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
    </Stack>
  );
}