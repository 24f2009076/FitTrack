import { router } from "expo-router";

import * as ImagePicker from "expo-image-picker";

import {
    Image,
    Pressable,
    Text,
    View,
} from "react-native";

import { useOnboarding } from "@/context/OnboardingContext";

import { icons } from "@/constants/icons";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);


export default function ProfilePicScreen() {

    const { data, updateData } = useOnboarding();


    async function pickImage() {

        const result =
            await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });


        if (!result.canceled) {

            const imageUri =
                result.assets[0].uri;

            updateData({
                profileImage: imageUri,
            });
        }
    }


    function removeImage() {

        updateData({
            profileImage: null,
        });
    }


    function handleFinish() {

        /*
            BACKEND LATER

            Eventually this is where we'll send:

            {
                level: data.level,
                goal: data.goal,
                height: Number(data.height),
                weight: Number(data.weight),
                profileImage: data.profileImage
            }

            For now we're only testing the
            frontend onboarding flow.
        */

        console.log(
            "Onboarding completed:",
            data
        );


        router.replace("/(tabs)");
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

                </View>

            </View>

        </SafeAreaView>
    );
}