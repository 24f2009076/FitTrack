import { Stack } from "expo-router";

export default function OnboardingLayout() {
    return (
        <Stack
            initialRouteName="level"
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="level" />
            <Stack.Screen name="goal" />
            <Stack.Screen name="body" />
            <Stack.Screen name="profile-pic" />
        </Stack>
    );
};
