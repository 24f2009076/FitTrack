import { router } from "expo-router";

import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

import {
    Image,
    Pressable,
    Text,
    TextInput,
    View
} from "react-native";

import { useOnboarding } from "@/context/OnboardingContext";

import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, uploadProfileImage } from "@/services/profileService";
import { styled } from "nativewind";
import React, { useState } from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const levelMap = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
} as const;


const goalMap = {
    build_muscle: "Build Muscle",
    gain_strength: "Improve Strength",
    lose_fat: "Lose Weight",
    general_fitness: "General Fitness",
} as const;


export default function ProfilePicScreen() {

    const { session } = useAuth();


    const {
        data,
        updateData,
        resetOnboarding
    } = useOnboarding();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function pickImage() {

        const result =
            await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
        
        if(result.canceled) return;

        const selectedImage = result.assets[0];

        const context = ImageManipulator.manipulate(
            selectedImage.uri
        )

        const renderedImage = await context.renderAsync();

        const jpegImage = await renderedImage.saveAsync({
            format: SaveFormat.JPEG,
            compress: 0.8,
        })

        updateData({
            profileImage: jpegImage.uri,
        })
    }


    function removeImage() {

        updateData({
            profileImage: null,
        });
    }


    async function handleFinish() {

        if (!data.goal || !data.level || !data.username.trim()) {
            setError("Please complete all required fields before finishing.");
            return;
        }

        if (!session?.accessToken) {
            setError("Authentication token not found.");
            return;
        }

        try {

            setLoading(true);
            setError('');

            let profilePicUrl : string | null = null;

            if (data.profileImage) {

                const uploadResult = 
                    await uploadProfileImage(
                        data.profileImage,
                        session.userId
                    );
                
                profilePicUrl = uploadResult.publicUrl;
            }

            const payload = {
                username: data.username.trim(),

                level: levelMap[data.level],

                goal: goalMap[data.goal],

                height_cm: Number(data.height),

                weight_kg: Number(data.weight),

                profile_pic_url: profilePicUrl,
            };

            await updateProfile(payload, session?.accessToken);

            resetOnboarding();

            router.replace("/(tabs)");
        } catch (error) {

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
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
                    <Text className="text-2xl font-sans-bold"> Step 4 of 4 </Text>
                </View>
            </View>

            <View className="flex-1 px-5">


                {/* Progress */}

                <View className="flex-row items-center gap-2">

                    {[1, 2, 3, 4].map((step) => (
                        <View
                            key={step}
                            className="h-1.5 flex-1 rounded-full bg-accent"
                        />
                    ))}

                </View>


                {/* Header */}

                <Text className="mt-5 font-sans-bold text-3xl text-foreground">
                    Make FitTrack yours
                </Text>

                <View className="mt-8">
                    <Text className="mb-2 font-sans-semibold text-sm text-foreground">
                        Username
                    </Text>

                    <TextInput
                        value={data.username}
                        onChangeText={(value) =>
                            updateData({
                                username: value,
                            })
                        }
                        placeholder="Choose a username"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="rounded-2xl border border-foreground/10 bg-card px-5 py-4 font-sans-semibold text-base text-foreground"
                    />
                </View>

                <Text className="mt-3 font-sans-regular text-base leading-6 text-foreground/60">
                    Add a profile photo to make your fitness journey a little more personal.
                </Text>


                {/* Profile Image */}

                <View className="mt-12 items-center">

                    <Pressable
                        onPress={pickImage}
                        className="items-center"
                    >

                        {data.profileImage ? (

                            <Image
                                source={{
                                    uri: data.profileImage,
                                }}
                                className="h-40 w-40 rounded-full"
                            />

                        ) : (

                            <View className="h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-foreground/20 bg-muted">

                                <Text className="text-6xl">
                                    👤
                                </Text>

                            </View>

                        )}

                    </Pressable>


                    {/* Pick / Change photo */}

                    <Pressable
                        onPress={pickImage}
                        className="mt-6 rounded-xl bg-muted px-6 py-3"
                    >

                        <Text className="font-sans-semibold text-sm text-foreground">
                            {data.profileImage
                                ? "Change Photo"
                                : "Add Profile Photo"}
                        </Text>

                    </Pressable>


                    {/* Remove selected photo */}

                    {data.profileImage ? (

                        <Pressable
                            onPress={removeImage}
                            className="mt-3 p-2"
                        >

                            <Text className="font-sans-medium text-sm text-destructive">
                                Remove Photo
                            </Text>

                        </Pressable>

                    ) : (

                        <Text className="mt-4 font-sans-regular text-sm text-foreground/50">
                            Optional. You can always add one later.
                        </Text>

                    )}

                </View>


                {/* Summary */}

                <View className="mt-10 rounded-2xl bg-muted p-5">

                    <Text className="font-sans-semibold text-base text-foreground">
                        You're almost ready 🎉
                    </Text>

                    <Text className="mt-2 font-sans-regular text-sm leading-5 text-foreground/60">
                        Your preferences are set. You can change them anytime from your profile.
                    </Text>

                </View>


                {/* Bottom actions */}

                <View className="mt-auto gap-3">

                    <Pressable
                        onPress={handleFinish}
                        className="rounded-2xl bg-primary p-4"
                    >

                        <Text className="text-center font-sans-semibold text-base text-background">
                            Finish Setup
                        </Text>

                    </Pressable>
                    {error ? (
                        <Text className="text-center text-sm text-destructive">
                            {error}
                        </Text>
                    ) : null}

                </View>

            </View>

        </SafeAreaView>
    );
}