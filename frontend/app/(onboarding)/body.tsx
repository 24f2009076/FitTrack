// app/(onboarding)/body.tsx

import { router } from "expo-router";

import {
    Image,
    Pressable,
    Text,
    TextInput,
    View
} from "react-native";

import { icons } from "@/constants/icons";
import { useOnboarding } from "@/context/OnboardingContext";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);


export default function BodyScreen() {

    const { data, updateData } = useOnboarding();


    const height = Number(data.height);
    const weight = Number(data.weight);


    const validHeight =
        data.height.trim() !== "" &&
        !isNaN(height) &&
        height >= 100 &&
        height <= 250;

    const validWeight =
        data.weight.trim() !== "" &&
        !isNaN(weight) &&
        weight >= 25 &&
        weight <= 300;

    const canContinue =
        validHeight && validWeight;


    function handleContinue() {

        if (!canContinue) {
            return;
        }

        router.push("/(onboarding)/profile-pic");
    }


    return (
        <SafeAreaView className="flex-1 bg-background">

            <View className="home-navbar px-5">
                <Pressable onPress={() => router.back()} className="size-6 items-center absolute">
                    <Image source={icons.backPrimary} className="size-6 items-center absolute left-3" />
                </Pressable>
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold"> Step 3 of 4 </Text>
                </View>
            </View>


            <View
                className="flex-1 px-5"
            >

                <View className="flex-1">

                    {/* Progress */}

                    <View className="flex-row items-center gap-2">

                        {[1, 2, 3, 4].map((step) => (
                            <View
                                key={step}
                                className={`h-1.5 flex-1 rounded-full ${step <= 3
                                        ? "bg-accent"
                                        : "bg-muted"
                                    }`}
                            />
                        ))}

                    </View>


                    {/* Header */}

                    <Text className="mt-5 font-sans-bold text-3xl text-foreground">
                        Tell us a little about you
                    </Text>

                    <Text className="mt-3 font-sans-regular text-base leading-6 text-foreground/60">
                        We'll use this to make your progress tracking more meaningful.
                    </Text>


                    {/* Inputs */}

                    <View className="mt-10 gap-6">

                        {/* Height */}

                        <View>

                            <Text className="mb-2 font-sans-semibold text-sm text-foreground">
                                Height
                            </Text>

                            <View
                                className={`flex-row items-center rounded-2xl border bg-card px-5 ${data.height && !validHeight
                                        ? "border-destructive"
                                        : "border-foreground/10"
                                    }`}
                            >

                                <TextInput
                                    value={data.height}
                                    onChangeText={(value) =>
                                        updateData({
                                            height: value.replace(
                                                /[^0-9.]/g,
                                                ""
                                            ),
                                        })
                                    }
                                    placeholder="178"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="decimal-pad"
                                    maxLength={6}
                                    className="flex-1 py-5 font-sans-semibold text-2xl text-foreground"
                                />

                                <Text className="font-sans-medium text-base text-foreground/50">
                                    cm
                                </Text>

                            </View>


                            {data.height && !validHeight ? (
                                <Text className="mt-2 font-sans-regular text-xs text-destructive">
                                    Enter a height between 100 and 250 cm.
                                </Text>
                            ) : null}

                        </View>


                        {/* Weight */}

                        <View>

                            <Text className="mb-2 font-sans-semibold text-sm text-foreground">
                                Weight
                            </Text>

                            <View
                                className={`flex-row items-center rounded-2xl border bg-card px-5 ${data.weight && !validWeight
                                        ? "border-destructive"
                                        : "border-foreground/10"
                                    }`}
                            >

                                <TextInput
                                    value={data.weight}
                                    onChangeText={(value) =>
                                        updateData({
                                            weight: value.replace(
                                                /[^0-9.]/g,
                                                ""
                                            ),
                                        })
                                    }
                                    placeholder="72.5"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="decimal-pad"
                                    maxLength={6}
                                    className="flex-1 py-5 font-sans-semibold text-2xl text-foreground"
                                />

                                <Text className="font-sans-medium text-base text-foreground/50">
                                    kg
                                </Text>

                            </View>


                            {data.weight && !validWeight ? (
                                <Text className="mt-2 font-sans-regular text-xs text-destructive">
                                    Enter a weight between 25 and 300 kg.
                                </Text>
                            ) : null}

                        </View>

                    </View>


                    {/* Reassurance */}

                    <View className="mt-6 rounded-2xl bg-muted p-4">

                        <Text className="font-sans-regular text-sm leading-5 text-foreground/60">
                            You can update your height and weight anytime from your profile.
                        </Text>

                    </View>


                    {/* Bottom buttons */}

                    <View className="mt-auto gap-3">

                        <Pressable
                            onPress={handleContinue}
                            disabled={!canContinue}
                            className={`rounded-2xl p-4 ${canContinue
                                    ? "bg-primary"
                                    : "bg-primary/30"
                                }`}
                        >

                            <Text className="text-center font-sans-semibold text-base text-background">
                                Continue
                            </Text>

                        </Pressable>
                    </View>

                </View>

            </View>

        </SafeAreaView>
    );
}