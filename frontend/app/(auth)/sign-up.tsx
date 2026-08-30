import { icons } from '@/constants/icons';
import { router } from "expo-router";
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { signup } from "@/services/authService";

const SafeAreaView = styled(RNSafeAreaView);

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { saveSession } = useAuth();



    async function handleSignUp() {

        if (!email.trim() || !password || !confirmPassword) {
            setError("Please fill in all required fields.");
            return;
        }


        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }


        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }


        try {

            setLoading(true);
            setError("");


            const response = await signup({
                email: email.trim(),
                password,
            });


            await saveSession({
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
                userId: response.user_id,
                email: response.email,
            });


            router.replace("/(onboarding)/level");


        } catch (error) {

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Something went wrong while creating your account."
                );
            }

        } finally {

            setLoading(false);

        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="home-navbar px-5">
                <Pressable onPress={() => router.back()} className="size-6 items-center absolute">
                    <Image source={icons.backPrimary} className="size-6 items-center absolute left-3" />
                </Pressable>
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold"> Sign Up </Text>
                </View>
            </View>

            <View className="flex-1 items-center px-5">

                <View className="home-card w-full mt-5 px-5 py-5 border border-solid border-muted-foreground rounded-2xl">
                    <View className="flex-col justify-between mb-4 gap-2">
                        <Text className="text-3xl font-sans-bold">Create Account</Text>
                        <Text className="text-foreground/70 text-lg">Start you fitness journey today!</Text>
                    </View>


                    <View className="flex-col gap-1">
                        <Text className="text-lg font-sans-bold text-foreground">Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholder="John@Doe.com"
                            placeholderTextColor="#9CA3AF"
                            className="w-full rounded-lg border border-solid border-primary px-0 pl-3 pr-3 py-3 text-lg font-sans-bold text-muted-foreground"
                        />
                    </View>

                    <View className="flex-col gap-1">
                        <Text className="text-lg font-sans-bold text-foreground">Password</Text>
                        <View className="relative">
                            <TextInput
                                value={password}
                                placeholder="••••••••"
                                placeholderTextColor="#9CA3AF"
                                onChangeText={setPassword}
                                className="w-full rounded-lg border border-solid border-primary px-0 pl-3 pr-12 py-3 text-lg font-sans-bold text-muted-foreground"
                                secureTextEntry={!showPassword}
                            />
                            <Pressable
                                onPress={() => setShowPassword((prev) => !prev)}
                                accessibilityRole="button"
                                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-3"
                            >
                                <Image
                                    source={showPassword ? icons.eyeAccent : icons.eyeDark}
                                    className="size-6"
                                />
                            </Pressable>
                        </View>

                    </View>

                    <View className="flex-col gap-1">
                        <Text className="text-lg font-sans-bold text-foreground"> Confirm Password</Text>
                        <View className="relative">
                            <TextInput
                                value={confirmPassword}
                                placeholder="••••••••"
                                placeholderTextColor="#9CA3AF"
                                className="w-full rounded-lg border border-solid border-primary px-0 pl-3 pr-12 py-3 text-lg font-sans-bold text-muted-foreground"
                                secureTextEntry={!showConfirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <Pressable
                                onPress={() => setShowConfirmPassword((prev) => !prev)}
                                accessibilityRole="button"
                                accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-3"
                            >
                                <Image
                                    source={showConfirmPassword ? icons.eyeAccent : icons.eyeDark}
                                    className="size-6"
                                />
                            </Pressable>
                        </View>

                    </View>

                    {error ? (
                        <View className="mt-4 rounded-lg border border-red-400 bg-muter px-3 py-2">
                            <Text className="text-sm font-sans-medium text-red-600">{error}</Text>
                        </View>
                    ) : null}

                    <Pressable className="bg-accent rounded-lg px-3 py-3 mt-7 items-center" onPress={handleSignUp} disabled={loading}>
                        <Text className="text-2xl font-sans-bold text-white">{loading ? "Signing up..." : "Sign Up"}</Text>
                    </Pressable>

                    <View className="flex-row justify-center items-end gap-0.5">
                        <Text className="text-foreground/70 text-lg mt-5 text-center ">
                            Already have an account?{" "}
                        </Text>
                        <Pressable className="py-1" onPress={() => router.push("/(auth)/sign-in")}>
                            <Text className="text-accent font-sans-bold">Log In</Text>
                        </Pressable>
                    </View>
                </View>

            </View>
        </SafeAreaView>
    )
}

export default SignUp;